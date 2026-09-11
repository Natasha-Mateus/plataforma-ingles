// Funções compartilhadas entre páginas de aluno e admin: criar notificações
// e liberar automaticamente o próximo conteúdo quando um módulo está em modo sequencial.

import {
  getFirestore, doc, updateDoc, arrayUnion, addDoc, collection, getDocs, query, where
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export async function contarNaoLidas(db, userId) {
  const snap = await getDocs(query(collection(db, "notificacoes"), where("userId", "==", userId), where("lida", "==", false)));
  return snap.size;
}

export async function contarAguardandoCorrecao(db) {
  const snap = await getDocs(query(collection(db, "respostasAbertas"), where("status", "==", "aguardando")));
  return snap.size;
}


export async function criarNotificacao(db, { userId, tipo, mensagem, link }) {
  await addDoc(collection(db, "notificacoes"), {
    userId, tipo, mensagem, link: link || "", lida: false, data: new Date().toISOString()
  });
}

/**
 * Se o módulo estiver marcado como liberação sequencial, libera automaticamente
 * o próximo conteúdo (por ordem) pro aluno, e cria uma notificação avisando.
 */
export async function liberarProximoSeSequencial(db, { modulo, moduloId, conteudosDoModulo, conteudoAtualId, aluno }) {
  if (!modulo || modulo.liberacaoSequencial !== true) return null;

  const ordenado = [...conteudosDoModulo].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  const idx = ordenado.findIndex(c => c.id === conteudoAtualId);
  if (idx === -1 || idx === ordenado.length - 1) return null;

  const proximo = ordenado[idx + 1];
  const liberados = aluno.conteudosLiberados || [];
  if (liberados.includes(proximo.id)) return null;

  await updateDoc(doc(db, "usuarios", aluno.uid), { conteudosLiberados: arrayUnion(proximo.id) });
  await criarNotificacao(db, {
    userId: aluno.uid,
    tipo: "liberacao",
    mensagem: `Novo conteúdo liberado: ${proximo.titulo}`,
    link: `modulo.html?id=${moduloId}`
  });
  return proximo.id;
}
