// Componente de menu lateral compartilhado entre as páginas de aluno e admin.
// Cada página chama renderSidebar(...) depois de confirmar o login e o papel do usuário.

const LINKS_ALUNO = [
  { key: "dashboard", label: "Dashboard", href: "dashboard.html" },
  { key: "modulos", label: "Meus Módulos", href: "modulos.html" },
  { key: "correcoes", label: "Minhas Correções", href: "correcoes.html" },
  { key: "notificacoes", label: "Notificações", href: "notificacoes.html" },
  { key: "perfil", label: "Meu Perfil", href: "perfil.html" }
];

const LINKS_ADMIN = [
  { key: "visao-geral", label: "Visão Geral", href: "admin-dashboard.html" },
  { key: "alunos", label: "Alunos", href: "admin-alunos.html" },
  { key: "modulos", label: "Módulos e Conteúdos", href: "admin-modulos.html" },
  { key: "correcoes", label: "Correções", href: "admin-correcoes.html" },
  { key: "relatorios", label: "Relatórios", href: "admin-relatorios.html" },
  { key: "mensagens", label: "Mensagens", href: "admin-mensagens.html" },
  { key: "configuracoes", label: "Configurações", href: "admin-configuracoes.html" }
];

// Paleta pequena e estável: a cor do avatar é sempre a mesma pro mesmo nome.
const CORES_AVATAR = ["#E30613", "#0EA5E9", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];

function gerarIniciais(nome) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] || "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

function corParaNome(nome) {
  const soma = (nome || "").split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return CORES_AVATAR[soma % CORES_AVATAR.length];
}

/**
 * badges: objeto opcional { chaveDoLink: quantidade }, ex: { notificacoes: 3, correcoes: 5 }
 * Renderiza uma bolinha vermelha com o número ao lado do item de menu correspondente.
 */
export function renderSidebar({ containerId = "sidebar", activeKey, role, nomeUsuario, badges = {} }) {
  const links = role === "admin" ? LINKS_ADMIN : LINKS_ALUNO;
  const rotuloPapel = role === "admin" ? "Professor" : "Aluno";

  const linksHtml = links.map(l => {
    const contagem = badges[l.key] || 0;
    const badgeHtml = contagem > 0
      ? ` <span style="background:var(--red); color:white; border-radius:999px; font-size:11px; padding:1px 7px; margin-left:6px;">${contagem}</span>`
      : "";
    return `<a href="${l.href}" class="${l.key === activeKey ? "active" : ""}">${l.label}${badgeHtml}</a>`;
  }).join("");

  const iniciais = gerarIniciais(nomeUsuario);
  const cor = corParaNome(nomeUsuario || "");

  const html = `
    <div class="brand">MD English</div>
    <div style="display:flex; align-items:center; gap:10px; padding:0 20px 16px;">
      <div style="width:36px; height:36px; border-radius:50%; background:${cor}; color:white; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0;">
        ${iniciais}
      </div>
      <div style="min-width:0;">
        <div style="font-size:13px; color:white; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${nomeUsuario || ""}</div>
        <div style="font-size:11px; color:rgba(255,255,255,0.55);">${rotuloPapel}</div>
      </div>
    </div>
    <nav>${linksHtml}</nav>
    <button class="btn-sair" id="btnSairSidebar">Sair</button>
  `;

  const el = document.getElementById(containerId);
  el.innerHTML = html;
}
