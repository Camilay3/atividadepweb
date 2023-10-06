const express = require('express');
const { firestore } = require('firebase-admin');
const router = express.Router();

// Banco de dados
const db = require('../fireconfig.js');

function tratar(str) {
    let strs = str.split(' ');
    let palavra = [];

    strs.forEach(s => {
        if (s != 'de') {
            palavra.push(`${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`)
        }
    })

    return `${palavra.join(' ')}`;
}

router.get('/', async (req, res) => {
    res.render('index');
});

router.post('/ind', async (req, res) => {
    let { quantidade, filtroNome, filtroTipo } = req.body;

    const colecao = db.collection('alimentos');
    let dados = [];
    colecao.get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log('Não há documentos na coleção.');
                return;
            }

            async function verificar() {
                const snapshot = await db.collection('alimentos').where('nome', '==', tratar(filtroNome)).get();

                if (snapshot.empty) {
                    console.log('Nenhum documento encontrado com o nome:', tratar(filtroNome));
                    return;
                }

                snapshot.forEach(doc => {
                    dados.push(doc.data());
                });
                return dados
            }

            if (filtroNome) {
                verificar().then((dados) => {
                    return res.render('index', { dados });
                });
                return
            }

            async function verificarFiltro(filtroTipo) {
                const snapshot = await db.collection('alimentos').where('tipo', '==', tratar(filtroTipo)).get();

                if (snapshot.empty) {
                    console.log('Nenhum documento encontrado com o tipo:', tratar(filtroTipo));
                    return;
                }

                snapshot.forEach(doc => {
                    if (quantidade) {
                        if (dados.length > parseInt(quantidade)-1) {
                            return dados;
                        } else {
                            dados.push(doc.data());
                        }
                    } else {
                        dados.push(doc.data());
                    }
                });
                return dados
            }

            if (filtroTipo) {
                if (tratar(filtroTipo) == 'Sobremesas') {
                    filtroTipo = 'Sobremessas'
                };
                verificarFiltro(filtroTipo).then((dados) => {
                    return res.render('index', { dados });
                });
                return
            }

            if (quantidade && parseInt(quantidade) > 0) {
                snapshot.forEach(doc => {
                    dados.push(doc.data());
                });
                quantidade--;
            };

            res.render('index', { dados });
        })
        .catch(error => {
            console.error('Erro ao obter documentos: ', error);
        });
});

module.exports = router;