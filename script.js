// Configuração do Firebase (substitua pelo seu firebaseConfig)
const firebaseConfig = {
    apiKey: "AIzaSyBXqicT9feP8L4GLb86pzZXwFsDAPRUagE",
    authDomain: "fifa-ranking-family.firebaseapp.com",
    databaseURL: "https://fifa-ranking-family-default-rtdb.firebaseio.com",
    projectId: "fifa-ranking-family",
    storageBucket: "fifa-ranking-family.firebasestorage.app",
    messagingSenderId: "639708879392",
    appId: "1:639708879392:web:ea5b07d32517972eaf3a45"
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Estado inicial dos dados
let historico = {
    "pedro-benjamin": [],
    "pedro-gustavo": [],
    "benjamin-gustavo": []
};

let sequencias = {
    "Pedro": { "benjamin": 0, "gustavo": 0 },
    "Benjamin": { "pedro": 0, "gustavo": 0 },
    "Gustavo": { "pedro": 0, "benjamin": 0 }
};

let jejuns = {
    "Pedro": { "benjamin": 0, "gustavo": 0 },
    "Benjamin": { "pedro": 0, "gustavo": 0 },
    "Gustavo": { "pedro": 0, "benjamin": 0 }
};

// Função para salvar no Firebase
function salvarDados() {
    database.ref('historico').set(historico);
    database.ref('sequencias').set(sequencias);
    database.ref('jejuns').set(jejuns);
    database.ref('pontos/pedro').set(document.getElementById('pontos-pedro').innerText);
    database.ref('pontos/benjamin').set(document.getElementById('pontos-benjamin').innerText);
    database.ref('pontos/gustavo').set(document.getElementById('pontos-gustavo').innerText);
    database.ref('pontos/pedro-benjamin').set(document.getElementById('pontos-pedro-benjamin').innerText);
    database.ref('pontos/benjamin-pedro').set(document.getElementById('pontos-benjamin-pedro').innerText);
    database.ref('pontos/pedro-gustavo').set(document.getElementById('pontos-pedro-gustavo').innerText);
    database.ref('pontos/gustavo-pedro').set(document.getElementById('pontos-gustavo-pedro').innerText);
    database.ref('pontos/benjamin-gustavo').set(document.getElementById('pontos-benjamin-gustavo').innerText);
    database.ref('pontos/gustavo-benjamin').set(document.getElementById('pontos-gustavo-benjamin').innerText);
}

// Carrega os dados do Firebase ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    database.ref('pontos').once('value', (snapshot) => {
        const pontos = snapshot.val() || {};
        document.getElementById('pontos-pedro').innerText = pontos.pedro || '0';
        document.getElementById('pontos-benjamin').innerText = pontos.benjamin || '0';
        document.getElementById('pontos-gustavo').innerText = pontos.gustavo || '0';
        document.getElementById('pontos-pedro-benjamin').innerText = pontos['pedro-benjamin'] || '0';
        document.getElementById('pontos-benjamin-pedro').innerText = pontos['benjamin-pedro'] || '0';
        document.getElementById('pontos-pedro-gustavo').innerText = pontos['pedro-gustavo'] || '0';
        document.getElementById('pontos-gustavo-pedro').innerText = pontos['gustavo-pedro'] || '0';
        document.getElementById('pontos-benjamin-gustavo').innerText = pontos['benjamin-gustavo'] || '0';
        document.getElementById('pontos-gustavo-benjamin').innerText = pontos['gustavo-benjamin'] || '0';
        atualizarTabelaGeral();
    });

    database.ref('historico').once('value', (snapshot) => {
        historico = snapshot.val() || historico;
    });

    database.ref('sequencias').once('value', (snapshot) => {
        sequencias = snapshot.val() || sequencias;
    });

    database.ref('jejuns').once('value', (snapshot) => {
        jejuns = snapshot.val() || jejuns;
        const confrontos = ["pedro-benjamin", "pedro-gustavo", "benjamin-gustavo"];
        confrontos.forEach(confronto => {
            const jogador1 = confronto.split("-")[0];
            const jogador2 = confronto.split("-")[1];
            document.getElementById(`sequencia-${jogador1}-${jogador2}`).innerText = `Sequência de vitórias - ${jogador1}: ${sequencias[jogador1][jogador2]}`;
            document.getElementById(`sequencia-${jogador2}-${jogador1}`).innerText = `Sequência de vitórias - ${jogador2}: ${sequencias[jogador2][jogador1]}`;
            document.getElementById(`jejum-${jogador1}-${jogador2}`).innerText = `${jogador1} não ganha de ${jogador2} há: ${jejuns[jogador1][jogador2]} partidas`;
            document.getElementById(`jejum-${jogador2}-${jogador1}`).innerText = `${jogador2} não ganha de ${jogador1} há: ${jejuns[jogador2][jogador1]} partidas`;
        });
    });

    // Verifica o estado de autenticação
    auth.onAuthStateChanged(user => {
        if (user) {
            document.getElementById('auth-status').innerText = `Logado como: ${user.email}`;
            document.getElementById('login-toggle').style.display = 'none';
            document.getElementById('logout').style.display = 'inline-block';
            document.getElementById('login-form').style.display = 'none';
            enableButtons();
        } else {
            document.getElementById('auth-status').innerText = 'Você não está logado';
            document.getElementById('login-toggle').style.display = 'inline-block';
            document.getElementById('logout').style.display = 'none';
            disableButtons();
        }
    });

    // Registrar eventos de clique
    document.getElementById('login-toggle').addEventListener('click', toggleLoginForm);
    document.getElementById('login-button').addEventListener('click', login);
    document.getElementById('logout').addEventListener('click', logout);
    document.getElementById('adicionar-resultado').addEventListener('click', mostrarModal);
    document.getElementById('resetar-pontos').addEventListener('click', resetarPontos);
    document.getElementById('pedro-ganhou-pb').addEventListener('click', () => adicionarPontosConfronto('Pedro', 'Benjamin'));
    document.getElementById('benjamin-ganhou-pb').addEventListener('click', () => adicionarPontosConfronto('Benjamin', 'Pedro'));
    document.getElementById('empate-pb').addEventListener('click', () => adicionarEmpateConfronto('pedro-benjamin'));
    document.getElementById('pedro-ganhou-pg').addEventListener('click', () => adicionarPontosConfronto('Pedro', 'Gustavo'));
    document.getElementById('gustavo-ganhou-pg').addEventListener('click', () => adicionarPontosConfronto('Gustavo', 'Pedro'));
    document.getElementById('empate-pg').addEventListener('click', () => adicionarEmpateConfronto('pedro-gustavo'));
    document.getElementById('benjamin-ganhou-bg').addEventListener('click', () => adicionarPontosConfronto('Benjamin', 'Gustavo'));
    document.getElementById('gustavo-ganhou-bg').addEventListener('click', () => adicionarPontosConfronto('Gustavo', 'Benjamin'));
    document.getElementById('empate-bg').addEventListener('click', () => adicionarEmpateConfronto('benjamin-gustavo'));
});

// Funções de autenticação
function toggleLoginForm() {
    const form = document.getElementById('login-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert('Login bem-sucedido!');
        })
        .catch(error => {
            alert('Erro ao fazer login: ' + error.message);
        });
}

function logout() {
    auth.signOut()
        .then(() => {
            alert('Logout bem-sucedido!');
        })
        .catch(error => {
            alert('Erro ao fazer logout: ' + error.message);
        });
}

function enableButtons() {
    document.getElementById('adicionar-resultado').disabled = false;
    document.getElementById('resetar-pontos').disabled = false;
    document.getElementById('pedro-ganhou-pb').disabled = false;
    document.getElementById('benjamin-ganhou-pb').disabled = false;
    document.getElementById('empate-pb').disabled = false;
    document.getElementById('pedro-ganhou-pg').disabled = false;
    document.getElementById('gustavo-ganhou-pg').disabled = false;
    document.getElementById('empate-pg').disabled = false;
    document.getElementById('benjamin-ganhou-bg').disabled = false;
    document.getElementById('gustavo-ganhou-bg').disabled = false;
    document.getElementById('empate-bg').disabled = false;
}

function disableButtons() {
    document.getElementById('adicionar-resultado').disabled = true;
    document.getElementById('resetar-pontos').disabled = true;
    document.getElementById('pedro-ganhou-pb').disabled = true;
    document.getElementById('benjamin-ganhou-pb').disabled = true;
    document.getElementById('empate-pb').disabled = true;
    document.getElementById('pedro-ganhou-pg').disabled = true;
    document.getElementById('gustavo-ganhou-pg').disabled = true;
    document.getElementById('empate-pg').disabled = true;
    document.getElementById('benjamin-ganhou-bg').disabled = true;
    document.getElementById('gustavo-ganhou-bg').disabled = true;
    document.getElementById('empate-bg').disabled = true;
}

// Função para atualizar a tabela geral com ordenação
function atualizarTabelaGeral() {
    const jogadores = [
        { nome: "Pedro", pontosId: "pontos-pedro" },
        { nome: "Benjamin", pontosId: "pontos-benjamin" },
        { nome: "Gustavo", pontosId: "pontos-gustavo" }
    ];

    jogadores.sort((a, b) => {
        const pontosA = parseInt(document.getElementById(a.pontosId).innerText);
        const pontosB = parseInt(document.getElementById(b.pontosId).innerText);
        return pontosB - pontosA;
    });

    const tbody = document.getElementById("tabela-corpo");
    tbody.innerHTML = "";
    jogadores.forEach(jogador => {
        const pontos = document.getElementById(jogador.pontosId).innerText;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${jogador.nome}</td>
            <td>${pontos}</td>
            <td><button onclick="removerPontos('${jogador.nome}')">Remover Pontos</button></td>
        `;
        tbody.appendChild(row);
    });
}

function mostrarModal() {
    if (!auth.currentUser) {
        alert("Você precisa estar logado para adicionar resultados!");
        return;
    }
    document.getElementById("modal").style.display = "block";
}

function fecharModal() {
    document.getElementById("modal").style.display = "none";
}

function animarPontos(elementId) {
    const elemento = document.getElementById(elementId);
    elemento.style.transition = "color 0.5s";
    elemento.style.color = "#ff4500";
    elemento.style.animation = "dance 0.5s ease";
    setTimeout(() => {
        elemento.style.color = "#333";
        elemento.style.animation = "none";
    }, 500);
}

function adicionarPontos() {
    if (!auth.currentUser) {
        alert("Você precisa estar logado para adicionar pontos!");
        return;
    }
    const jogador = document.getElementById("jogador").value;
    const pontos = parseInt(document.getElementById("resultado").value);
    const elementoId = `pontos-${jogador.toLowerCase()}`;
    const pontosAtuais = parseInt(document.getElementById(elementoId).innerText);

    document.getElementById(elementoId).innerText = pontosAtuais + pontos;
    animarPontos(elementoId);
    fecharModal();
    salvarDados();
    atualizarTabelaGeral();
}

function removerPontos(jogador) {
    if (!auth.currentUser) {
        alert("Você precisa estar logado para remover pontos!");
        return;
    }
    const pontos = parseInt(prompt(`Quantos pontos deseja remover de ${jogador}?`));
    if (isNaN(pontos) || pontos < 0) {
        alert("Digite um número válido!");
        return;
    }

    const elementoId = `pontos-${jogador.toLowerCase()}`;
    const pontosAtuais = parseInt(document.getElementById(elementoId).innerText);
    if (pontos > pontosAtuais) {
        alert("Não pode remover mais pontos do que o jogador tem!");
        return;
    }

    document.getElementById(elementoId).innerText = pontosAtuais - pontos;
    animarPontos(elementoId);
    salvarDados();
    atualizarTabelaGeral();
}

function atualizarAnalise(confronto, vencedor, perdedor) {
    console.log(`Atualizando análise para ${confronto}. Vencedor: ${vencedor}, Perdedor: ${perdedor}`);
    
    const chave = confronto;
    const resultado = vencedor ? `${vencedor} venceu` : "Empate";
    historico[chave].push(resultado);

    if (vencedor) {
        sequencias[vencedor][perdedor.toLowerCase()]++;
        sequencias[perdedor][vencedor.toLowerCase()] = 0;
    } else {
        sequencias[confronto.split("-")[0]][confronto.split("-")[1]] = 0;
        sequencias[confronto.split("-")[1]][confronto.split("-")[0]] = 0;
    }

    const jogador1 = confronto.split("-")[0];
    const jogador2 = confronto.split("-")[1];
    if (vencedor === jogador1) {
        jejuns[jogador2][jogador1] = historico[chave].filter(r => r !== `${jogador2} venceu`).length;
        jejuns[jogador1][jogador2] = 0;
    } else if (vencedor === jogador2) {
        jejuns[jogador1][jogador2] = historico[chave].filter(r => r !== `${jogador1} venceu`).length;
        jejuns[jogador2][jogador1] = 0;
    } else {
        jejuns[jogador1][jogador2]++;
        jejuns[jogador2][jogador1]++;
    }

    const sequencia1 = document.getElementById(`sequencia-${jogador1}-${jogador2}`);
    const sequencia2 = document.getElementById(`sequencia-${jogador2}-${jogador1}`);
    const jejum1 = document.getElementById(`jejum-${jogador1}-${jogador2}`);
    const jejum2 = document.getElementById(`jejum-${jogador2}-${jogador1}`);

    if (!sequencia1 || !sequencia2 || !jejum1 || !jejum2) {
        console.error(`Erro: Um ou mais elementos de análise não foram encontrados para ${confronto}`);
        return;
    }

    sequencia1.innerText = `Sequência de vitórias - ${jogador1}: ${sequencias[jogador1][jogador2]}`;
    sequencia2.innerText = `Sequência de vitórias - ${jogador2}: ${sequencias[jogador2][jogador1]}`;
    jejum1.innerText = `${jogador1} não ganha de ${jogador2} há: ${jejuns[jogador1][jogador2]} partidas`;
    jejum2.innerText = `${jogador2} não ganha de ${jogador1} há: ${jejuns[jogador2][jogador1]} partidas`;

    console.log(`Análise atualizada: ${jogador1} vs ${jogador2}`);
    console.log(`Sequências: ${JSON.stringify(sequencias)}`);
    console.log(`Jejuns: ${JSON.stringify(jejuns)}`);
    salvarDados();
}

function adicionarPontosConfronto(vencedor, perdedor) {
    if (!auth.currentUser) {
        alert("Você precisa estar logado para adicionar pontos!");
        return;
    }
    const elementoGeral = `pontos-${vencedor.toLowerCase()}`;
    const pontosVencedorGeral = parseInt(document.getElementById(elementoGeral).innerText);
    document.getElementById(elementoGeral).innerText = pontosVencedorGeral + 3;
    animarPontos(elementoGeral);

    const elementoConfronto = `pontos-${vencedor.toLowerCase()}-${perdedor.toLowerCase()}`;
    const pontosVencedorConfronto = parseInt(document.getElementById(elementoConfronto).innerText);
    document.getElementById(elementoConfronto).innerText = pontosVencedorConfronto + 3;
    animarPontos(elementoConfronto);

    const confronto = `${vencedor.toLowerCase()}-${perdedor.toLowerCase()}`.split("-").sort().join("-");
    atualizarAnalise(confronto, vencedor, perdedor);
    atualizarTabelaGeral();
}

function adicionarEmpateConfronto(confronto) {
    if (!auth.currentUser) {
        alert("Você precisa estar logado para adicionar empate!");
        return;
    }
    let jogador1, jogador2;
    if (confronto === "pedro-benjamin") {
        jogador1 = "pedro";
        jogador2 = "benjamin";
    } else if (confronto === "pedro-gustavo") {
        jogador1 = "pedro";
        jogador2 = "gustavo";
    } else if (confronto === "benjamin-gustavo") {
        jogador1 = "benjamin";
        jogador2 = "gustavo";
    }

    const elemento1Geral = `pontos-${jogador1}`;
    const elemento2Geral = `pontos-${jogador2}`;
    const pontosJogador1Geral = parseInt(document.getElementById(elemento1Geral).innerText);
    const pontosJogador2Geral = parseInt(document.getElementById(elemento2Geral).innerText);
    document.getElementById(elemento1Geral).innerText = pontosJogador1Geral + 1;
    document.getElementById(elemento2Geral).innerText = pontosJogador2Geral + 1;
    animarPontos(elemento1Geral);
    animarPontos(elemento2Geral);

    const elemento1Confronto = `pontos-${jogador1}-${jogador2}`;
    const elemento2Confronto = `pontos-${jogador2}-${jogador1}`;
    const pontosJogador1Confronto = parseInt(document.getElementById(elemento1Confronto).innerText);
    const pontosJogador2Confronto = parseInt(document.getElementById(elemento2Confronto).innerText);
    document.getElementById(elemento1Confronto).innerText = pontosJogador1Confronto + 1;
    document.getElementById(elemento2Confronto).innerText = pontosJogador2Confronto + 1;
    animarPontos(elemento1Confronto);
    animarPontos(elemento2Confronto);

    atualizarAnalise(confronto, null, null);
    atualizarTabelaGeral();
}

function resetarPontos() {
    if (!auth.currentUser) {
        alert("Você precisa estar logado para resetar os pontos!");
        return;
    }
    document.getElementById('pontos-pedro').innerText = '0';
    document.getElementById('pontos-benjamin').innerText = '0';
    document.getElementById('pontos-gustavo').innerText = '0';
    document.getElementById('pontos-pedro-benjamin').innerText = '0';
    document.getElementById('pontos-benjamin-pedro').innerText = '0';
    document.getElementById('pontos-pedro-gustavo').innerText = '0';
    document.getElementById('pontos-gustavo-pedro').innerText = '0';
    document.getElementById('pontos-benjamin-gustavo').innerText = '0';
    document.getElementById('pontos-gustavo-benjamin').innerText = '0';
    historico = { "pedro-benjamin": [], "pedro-gustavo": [], "benjamin-gustavo": [] };
    sequencias = { "Pedro": { "benjamin": 0, "gustavo": 0 }, "Benjamin": { "pedro": 0, "gustavo": 0 }, "Gustavo": { "pedro": 0, "benjamin": 0 } };
    jejuns = { "Pedro": { "benjamin": 0, "gustavo": 0 }, "Benjamin": { "pedro": 0, "gustavo": 0 }, "Gustavo": { "pedro": 0, "benjamin": 0 } };
    salvarDados();
    atualizarTabelaGeral();
    const confrontos = ["pedro-benjamin", "pedro-gustavo", "benjamin-gustavo"];
    confrontos.forEach(confronto => {
        const jogador1 = confronto.split("-")[0];
        const jogador2 = confronto.split("-")[1];
        document.getElementById(`sequencia-${jogador1}-${jogador2}`).innerText = `Sequência de vitórias - ${jogador1}: 0`;
        document.getElementById(`sequencia-${jogador2}-${jogador1}`).innerText = `Sequência de vitórias - ${jogador2}: 0`;
        document.getElementById(`jejum-${jogador1}-${jogador2}`).innerText = `${jogador1} não ganha de ${jogador2} há: 0 partidas`;
        document.getElementById(`jejum-${jogador2}-${jogador1}`).innerText = `${jogador2} não ganha de ${jogador1} há: 0 partidas`;
    });
    alert("Pontos resetados com sucesso!");
}