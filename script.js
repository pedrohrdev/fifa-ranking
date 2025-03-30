// Inicialização com recuperação do localStorage
let historico = JSON.parse(localStorage.getItem('historico')) || {
    "pedro-benjamin": [],
    "pedro-gustavo": [],
    "benjamin-gustavo": []
};

let sequencias = JSON.parse(localStorage.getItem('sequencias')) || {
    "Pedro": { "benjamin": 0, "gustavo": 0 },
    "Benjamin": { "pedro": 0, "gustavo": 0 },
    "Gustavo": { "pedro": 0, "benjamin": 0 }
};

let jejuns = JSON.parse(localStorage.getItem('jejuns')) || {
    "Pedro": { "benjamin": 0, "gustavo": 0 },
    "Benjamin": { "pedro": 0, "gustavo": 0 },
    "Gustavo": { "pedro": 0, "benjamin": 0 }
};

// Função para salvar no localStorage
function salvarDados() {
    localStorage.setItem('historico', JSON.stringify(historico));
    localStorage.setItem('sequencias', JSON.stringify(sequencias));
    localStorage.setItem('jejuns', JSON.stringify(jejuns));
    // Salva os pontos das tabelas
    localStorage.setItem('pontos-pedro', document.getElementById('pontos-pedro').innerText);
    localStorage.setItem('pontos-benjamin', document.getElementById('pontos-benjamin').innerText);
    localStorage.setItem('pontos-gustavo', document.getElementById('pontos-gustavo').innerText);
    localStorage.setItem('pontos-pedro-benjamin', document.getElementById('pontos-pedro-benjamin').innerText);
    localStorage.setItem('pontos-benjamin-pedro', document.getElementById('pontos-benjamin-pedro').innerText);
    localStorage.setItem('pontos-pedro-gustavo', document.getElementById('pontos-pedro-gustavo').innerText);
    localStorage.setItem('pontos-gustavo-pedro', document.getElementById('pontos-gustavo-pedro').innerText);
    localStorage.setItem('pontos-benjamin-gustavo', document.getElementById('pontos-benjamin-gustavo').innerText);
    localStorage.setItem('pontos-gustavo-benjamin', document.getElementById('pontos-gustavo-benjamin').innerText);
}

// Carrega os dados salvos ao iniciar
window.onload = function() {
    document.getElementById('pontos-pedro').innerText = localStorage.getItem('pontos-pedro') || '0';
    document.getElementById('pontos-benjamin').innerText = localStorage.getItem('pontos-benjamin') || '0';
    document.getElementById('pontos-gustavo').innerText = localStorage.getItem('pontos-gustavo') || '0';
    document.getElementById('pontos-pedro-benjamin').innerText = localStorage.getItem('pontos-pedro-benjamin') || '0';
    document.getElementById('pontos-benjamin-pedro').innerText = localStorage.getItem('pontos-benjamin-pedro') || '0';
    document.getElementById('pontos-pedro-gustavo').innerText = localStorage.getItem('pontos-pedro-gustavo') || '0';
    document.getElementById('pontos-gustavo-pedro').innerText = localStorage.getItem('pontos-gustavo-pedro') || '0';
    document.getElementById('pontos-benjamin-gustavo').innerText = localStorage.getItem('pontos-benjamin-gustavo') || '0';
    document.getElementById('pontos-gustavo-benjamin').innerText = localStorage.getItem('pontos-gustavo-benjamin') || '0';
};

// Atualiza o localStorage após cada ação
function adicionarPontos() {
    const jogador = document.getElementById("jogador").value;
    const pontos = parseInt(document.getElementById("resultado").value);
    const elementoId = `pontos-${jogador.toLowerCase()}`;
    const pontosAtuais = parseInt(document.getElementById(elementoId).innerText);

    document.getElementById(elementoId).innerText = pontosAtuais + pontos;
    animarPontos(elementoId);
    fecharModal();
    salvarDados();
}

function removerPontos(jogador) {
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
    salvarDados();
}

function adicionarEmpateConfronto(confronto) {
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
    salvarDados();
}

// Funções existentes (mostrarModal, fecharModal, animarPontos) permanecem as mesmas