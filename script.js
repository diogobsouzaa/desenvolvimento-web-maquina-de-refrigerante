// Variáveis globais
let valorInserido = 0;
let bebidaSelecionada = null;
const VALOR_MINIMO = 2.50; // Valor mínimo para liberar o refrigerante

// Quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Carregar bebidas da API
    carregarBebidas();
    
    // Configurar eventos de drag and drop para as moedas
    configurarDragAndDrop();
    
    // Configurar botão de reset
    document.getElementById('reset-btn').addEventListener('click', resetarMaquina);
});

// Função para carregar bebidas da API
async function carregarBebidas() {
    try {
        const response = await fetch('https://api.jsonbin.io/v3/b/68b9f743d0ea881f4071dd7f');
        const data = await response.json();
        const bebidas = data.record.bebidas;
        
        exibirBebidas(bebidas);
    } catch (error) {
        console.error('Erro ao carregar bebidas:', error);
        document.getElementById('mensagens').textContent = 'Erro ao carregar bebidas.';
    }
}

// Função para exibir as bebidas na interface
function exibirBebidas(bebidas) {
    const container = document.getElementById('bebidas');
    
    bebidas.forEach(bebida => {
        const button = document.createElement('button');
        button.className = 'bebida-btn';
        
        // Adicionar imagem se disponível
        if (bebida.imagem) {
            const img = document.createElement('img');
            img.src = bebida.imagem;
            img.alt = bebida.sabor;
            button.appendChild(img);
        }
        
        const text = document.createElement('span');
        text.textContent = `${bebida.sabor} - R$ ${bebida.preco.toFixed(2)}`;
        button.appendChild(text);
        
        button.addEventListener('click', () => {
            // Desselecionar qualquer bebida anterior
            document.querySelectorAll('.bebida-btn').forEach(btn => {
                btn.classList.remove('selecionado');
            });
            
            // Selecionar a bebida atual
            button.classList.add('selecionado');
            bebidaSelecionada = bebida;
            verificarLiberacao();
        });
        
        container.appendChild(button);
    });
}

// Função para configurar o drag and drop das moedas
function configurarDragAndDrop() {
    const moedas = document.querySelectorAll('.moeda');
    const slot = document.getElementById('slot-moedas');
    
    // Configurar eventos para cada moeda
    moedas.forEach(moeda => {
        moeda.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', moeda.getAttribute('data-valor'));
        });
    });
    
    // Eventos para o slot de moedas
    slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.classList.add('drag-over');
    });
    
    slot.addEventListener('dragleave', () => {
        slot.classList.remove('drag-over');
    });
    
    slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        
        const valorMoeda = parseFloat(e.dataTransfer.getData('text/plain'));
        adicionarMoeda(valorMoeda);
    });
}

// Função para adicionar moeda ao valor inserido
function adicionarMoeda(valor) {
    // Se acabou de fazer uma compra, resetar o valor
    if (valorInserido === 0 && document.getElementById('mensagens').textContent.includes('liberada')) {
        document.getElementById('mensagens').textContent = '';
        document.getElementById('mensagens').className = 'mensagens';
    }
    
    valorInserido += valor;
    atualizarVisor();
    verificarLiberacao();
}

// Função para atualizar o visor de valor inserido
function atualizarVisor() {
    document.getElementById('valor-inserido').textContent = `R$ ${valorInserido.toFixed(2)}`;
}

// Função para verificar se pode liberar a bebida
function verificarLiberacao() {
    const mensagemDiv = document.getElementById('mensagens');
    
    // Verificar se atingiu o valor mínimo de R$ 2,50
    if (valorInserido >= VALOR_MINIMO && bebidaSelecionada) {
        // Liberar bebida
        const troco = valorInserido - VALOR_MINIMO;
        
        mensagemDiv.textContent = `Bebida ${bebidaSelecionada.sabor} liberada!`;
        mensagemDiv.className = 'mensagens liberado';
        
        if (troco > 0) {
            mensagemDiv.innerHTML += `<br>Troco: R$ ${troco.toFixed(2)}`;
            mensagemDiv.className = 'mensagens troco';
        }
        
        // Resetar o valor inserido
        valorInserido = 0;
        atualizarVisor();
    }
}

// Função para resetar a máquina
function resetarMaquina() {
    valorInserido = 0;
    bebidaSelecionada = null;
    atualizarVisor();
    
    const mensagemDiv = document.getElementById('mensagens');
    mensagemDiv.textContent = '';
    mensagemDiv.className = 'mensagens';
    
    document.querySelectorAll('.bebida-btn').forEach(btn => {
        btn.classList.remove('selecionado');
    });
}