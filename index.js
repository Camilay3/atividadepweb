const express = require('express');
const path = require('path');

const app = express();
const publicDirectory = path.join(__dirname, './public')
app.use(express.static(publicDirectory))

app.use(express.urlencoded({ extended: false }))
app.use(express.json());

app.set('view engine', 'hbs');

// Partials
const hbs = require('hbs');
hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// Definindo rotas
app.use('/', require('./routes/pages'));

app.listen(3000, () => {
    console.log("Servidor ligado");
});

const db = require('./fireconfig.js');
const fs = require('fs');
const mammoth = require('mammoth');
const file = fs.readFileSync('./src/Alimentos.docx', 'utf8');
mammoth.convertToHtml({ path: './src/Alimentos.docx' })
    .then((result) => {
        let resultados = result.value.slice(3);
        resultados = resultados.slice(0, -4);
        resultados = resultados.split('</p><p>');

        let lastType = 'Entradas';

        resultados.forEach(re => {
            let novoDocumento;
            let add = false;

            if (re.substr(0, 2) == ' -') {
                novoDocumento = {
                    nome: re.slice(3),
                    tipo: lastType,
                };
                add = true;

            } else if (re.substr(0, 2) == '- ') {
                novoDocumento = {
                    nome: re.slice(2),
                    tipo: lastType,
                };
                add = true;

            } else {
                if (re != 'Alimentos') {
                    lastType = re;
                }
                add = false;
            }

            if (add) {
                // Verifica se o documento já existe
                const colecao = db.collection('alimentos');
                colecao.where('nome', '==', novoDocumento.nome).get()
                    .then(snapshot => {
                        if (snapshot.empty) {
                            colecao.add(novoDocumento)
                                .then(ref => {
                                    console.log('Documento adicionado com ID: ', ref.id);
                                })
                                .catch(error => {
                                    console.error('Erro ao adicionar documento: ', error);
                                });
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao verificar se o documento existe: ', error);
                    });
            }
        });
    })
    .catch((error) => {
        console.error('Erro ao converter o arquivo:', error);
    });






/*
function carregarDados() {
const quantidade = document.getElementById('quantidade').value;
const filtroNome = document.getElementById('filtroNome').value.toLowerCase();
const filtroTipo = document.getElementById('filtroTipo').value.toLowerCase();


// Filtrar os dados conforme as entradas do usuário
const dadosFiltrados = dados.filter(item => {
    const nome = item.nome.toLowerCase();
    const tipo = item.tipo.toLowerCase();
    return nome.includes(filtroNome) && tipo.includes(filtroTipo);
});

// Paginação
const pagina = dadosFiltrados.slice(0, quantidade);

// Renderizar os dados na página
const dadosElement = document.getElementById('dados');
dadosElement.innerHTML = '';
}
*/