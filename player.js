// Player de vídeo com controles próprios (usando a YouTube IFrame API)
// e visualizador de PDF paginado (usando pdf.js), isolados aqui pra não
// inchar a lógica principal de modulo.html.

let ytApiPromise = null;
let playerAtivo = null;
let intervaloProgresso = null;

function carregarYoutubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });
  return ytApiPromise;
}

function formatarTempo(segundos) {
  if (!isFinite(segundos)) return "0:00";
  const m = Math.floor(segundos / 60);
  const s = Math.floor(segundos % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Cria um player de YouTube com controles customizados (play/pause, barra de progresso,
 * tempo e mudo) dentro do elemento com id containerId. Retorna uma função de limpeza.
 */
export async function criarPlayerCustomizado({ containerId, controlsId, youtubeId }) {
  if (intervaloProgresso) clearInterval(intervaloProgresso);
  if (playerAtivo && playerAtivo.destroy) { try { playerAtivo.destroy(); } catch {} }

  const YT = await carregarYoutubeApi();

  return new Promise((resolve) => {
    playerAtivo = new YT.Player(containerId, {
      videoId: youtubeId,
      playerVars: { controls: 0, modestbranding: 1, rel: 0, disablekb: 1 },
      events: {
        onReady: () => {
          montarControles(controlsId, playerAtivo);
          resolve(playerAtivo);
        }
      }
    });
  });
}

function montarControles(controlsId, player) {
  const controles = document.getElementById(controlsId);
  if (!controles) return;

  controles.innerHTML = `
    <button id="btnPlayPause">▶</button>
    <input type="range" id="seekBar" min="0" max="1000" value="0" />
    <span class="tempo" id="tempoAtual">0:00 / 0:00</span>
    <button id="btnMute">🔊</button>
  `;

  const btnPlayPause = document.getElementById("btnPlayPause");
  const seekBar = document.getElementById("seekBar");
  const tempoAtual = document.getElementById("tempoAtual");
  const btnMute = document.getElementById("btnMute");

  let arrastando = false;

  btnPlayPause.addEventListener("click", () => {
    const estado = player.getPlayerState();
    if (estado === 1) player.pauseVideo(); else player.playVideo();
  });

  btnMute.addEventListener("click", () => {
    if (player.isMuted()) { player.unMute(); btnMute.textContent = "🔊"; }
    else { player.mute(); btnMute.textContent = "🔇"; }
  });

  seekBar.addEventListener("mousedown", () => { arrastando = true; });
  seekBar.addEventListener("touchstart", () => { arrastando = true; });
  seekBar.addEventListener("change", () => {
    const duracao = player.getDuration() || 0;
    player.seekTo((seekBar.value / 1000) * duracao, true);
    arrastando = false;
  });

  if (intervaloProgresso) clearInterval(intervaloProgresso);
  intervaloProgresso = setInterval(() => {
    if (!player || !player.getCurrentTime) return;
    const estado = player.getPlayerState();
    btnPlayPause.textContent = estado === 1 ? "⏸" : "▶";

    if (!arrastando) {
      const atual = player.getCurrentTime() || 0;
      const duracao = player.getDuration() || 0;
      seekBar.value = duracao > 0 ? (atual / duracao) * 1000 : 0;
      tempoAtual.textContent = `${formatarTempo(atual)} / ${formatarTempo(duracao)}`;
    }
  }, 500);
}

export function pararPlayerCustomizado() {
  if (intervaloProgresso) clearInterval(intervaloProgresso);
  if (playerAtivo && playerAtivo.destroy) { try { playerAtivo.destroy(); } catch {} }
  playerAtivo = null;
}

// ---------- Visualizador de PDF paginado (pdf.js) ----------

let pdfjsCarregado = null;

function carregarPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (pdfjsCarregado) return pdfjsCarregado;

  pdfjsCarregado = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return pdfjsCarregado;
}

/**
 * Renderiza um PDF paginado dentro do elemento containerId.
 * Se falhar (ex: CORS bloqueado pelo servidor onde o PDF está hospedado),
 * chama onErro pra quem chamou decidir o que mostrar (ex: botão de abrir em nova aba).
 */
export async function renderizarPdfPaginado({ containerId, url, onErro }) {
  const container = document.getElementById(containerId);
  container.innerHTML = `<p class="small" style="color:white;">Carregando PDF...</p>`;

  try {
    const pdfjsLib = await carregarPdfJs();
    const pdf = await pdfjsLib.getDocument(url).promise;
    let paginaAtual = 1;
    const totalPaginas = pdf.numPages;
    let escala = 1.2;

    container.innerHTML = `
      <canvas id="pdfCanvas-${containerId}"></canvas>
      <div class="pdf-controls">
        <button id="pdfAnterior-${containerId}">‹</button>
        <span id="pdfPagina-${containerId}">1 / ${totalPaginas}</span>
        <button id="pdfProxima-${containerId}">›</button>
        <button id="pdfMenos-${containerId}">−</button>
        <span id="pdfZoom-${containerId}">100%</span>
        <button id="pdfMais-${containerId}">+</button>
      </div>
    `;

    async function renderizarPagina(numero) {
      const pagina = await pdf.getPage(numero);
      const viewport = pagina.getViewport({ scale: escala });
      const canvas = document.getElementById(`pdfCanvas-${containerId}`);
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await pagina.render({ canvasContext: ctx, viewport }).promise;
      document.getElementById(`pdfPagina-${containerId}`).textContent = `${numero} / ${totalPaginas}`;
      document.getElementById(`pdfZoom-${containerId}`).textContent = `${Math.round(escala / 1.2 * 100)}%`;
    }

    document.getElementById(`pdfAnterior-${containerId}`).addEventListener("click", () => {
      if (paginaAtual > 1) { paginaAtual--; renderizarPagina(paginaAtual); }
    });
    document.getElementById(`pdfProxima-${containerId}`).addEventListener("click", () => {
      if (paginaAtual < totalPaginas) { paginaAtual++; renderizarPagina(paginaAtual); }
    });
    document.getElementById(`pdfMenos-${containerId}`).addEventListener("click", () => {
      escala = Math.max(0.6, escala - 0.2); renderizarPagina(paginaAtual);
    });
    document.getElementById(`pdfMais-${containerId}`).addEventListener("click", () => {
      escala = Math.min(2.4, escala + 0.2); renderizarPagina(paginaAtual);
    });

    await renderizarPagina(1);
  } catch (erro) {
    console.error("Falha ao carregar PDF embutido:", erro);
    if (onErro) onErro(erro);
  }
}
