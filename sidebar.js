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

export function renderSidebar({ containerId = "sidebar", activeKey, role, nomeUsuario, naoLidas = 0 }) {
  const links = role === "admin" ? LINKS_ADMIN : LINKS_ALUNO;

  const linksHtml = links.map(l => {
    const badge = (l.key === "notificacoes" && naoLidas > 0)
      ? ` <span style="background:var(--red); color:white; border-radius:999px; font-size:11px; padding:1px 7px; margin-left:6px;">${naoLidas}</span>`
      : "";
    return `<a href="${l.href}" class="${l.key === activeKey ? "active" : ""}">${l.label}${badge}</a>`;
  }).join("");

  const html = `
    <div class="brand">MD English</div>
    <div class="user">${nomeUsuario || ""}</div>
    <nav>${linksHtml}</nav>
    <button class="btn-sair" id="btnSairSidebar">Sair</button>
  `;

  const el = document.getElementById(containerId);
  el.innerHTML = html;
}
