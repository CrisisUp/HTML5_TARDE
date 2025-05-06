let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

const contador = document.getElementById('contador-carrinho');
const lista = document.getElementById('lista-carrinho');
const total = document.getElementById('total-carrinho');
const aside = document.getElementById('carrinho');
const audioAdicao = document.getElementById('audio-adicao');
const audioRemocao = document.getElementById('audio-remocao');
const audioAbrir = document.getElementById('audio-abrir');
const audioFechar = document.getElementById('audio-fechar');

function atualizarCarrinho() {
  lista.innerHTML = '';
  let soma = 0;

  carrinho.forEach((item, index) => {
    const li = document.createElement('li');
    li.classList.add('item-carrinho');

    const totalItem = item.preco * item.qtd;
    soma += totalItem;

    li.innerHTML = `
      <span><strong>${item.nome}</strong></span>
      <span>R$ ${item.preco.toFixed(2)} x ${item.qtd} = <strong>R$ ${totalItem.toFixed(2)}</strong></span>
      <div class="controles-qtd">
        <button aria-label="Diminuir" onclick="alterarQtd(${index}, -1)">−</button>
        <button aria-label="Aumentar" onclick="alterarQtd(${index}, 1)">+</button>
        <button aria-label="Remover" onclick="removerItem(${index})">🗑️</button>
      </div>
    `;
    lista.appendChild(li);
  });

  total.textContent = `Total: R$ ${soma.toFixed(2)}`;
  contador.textContent = carrinho.reduce((acc, item) => acc + item.qtd, 0);
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function somCliqueSimples() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(500, ctx.currentTime);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

function falar(texto) {
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = 'pt-BR';
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function alterarQtd(index, delta) {
  const item = carrinho[index];
  item.qtd += delta;

  if (item.qtd <= 0) {
    carrinho.splice(index, 1);
    audioRemocao.currentTime = 0;
    audioRemocao.play();
    somCliqueSimples();
    falar(`Você removeu ${item.nome} do carrinho.`);
  } else {
    const acao = delta > 0 ? 'aumentou' : 'diminuiu';
    somCliqueSimples();
    falar(`Você ${acao} a quantidade de ${item.nome} para ${item.qtd}.`);
  }

  atualizarCarrinho();
}

function removerItem(index) {
  const itemRemovido = carrinho[index];
  carrinho.splice(index, 1);
  audioRemocao.currentTime = 0;
  audioRemocao.play();
  falar(`Você removeu ${itemRemovido.nome} do carrinho.`);
  atualizarCarrinho();
}

document.querySelectorAll('.btn-comprar').forEach(botao => {
  botao.addEventListener('click', e => {
    const produto = e.target.closest('.produto');
    const nome = produto.dataset.nome;
    const preco = parseFloat(produto.dataset.preco);
    const existente = carrinho.find(item => item.nome === nome);

    if (existente) {
      existente.qtd += 1;
    } else {
      carrinho.push({ nome, preco, qtd: 1 });
    }

    audioAdicao.currentTime = 0;
    audioAdicao.play();
    falar(`Você adicionou ${nome} ao carrinho.`);
    produto.classList.add('animado');
    setTimeout(() => produto.classList.remove('animado'), 300);

    atualizarCarrinho();
  });
});

document.getElementById('abrir-carrinho').onclick = () => {
  aside.hidden = false;
  aside.setAttribute('aria-hidden', 'false');
  /*audioAbrir.currentTime = 0;*/
  audioAbrir.play();
  falar('Carrinho aberto.');
};

document.getElementById('fechar-carrinho').onclick = () => {
  aside.setAttribute('aria-hidden', 'true');
  /*audioFechar.currentTime = 0;*/
  audioFechar.play();
  falar('Carrinho fechado.');
  setTimeout(() => aside.hidden = true, 300);
};

document.getElementById('limpar-carrinho').onclick = () => {
  carrinho.length = 0;
  falar('Carrinho esvaziado.');
  atualizarCarrinho();
};

atualizarCarrinho();
