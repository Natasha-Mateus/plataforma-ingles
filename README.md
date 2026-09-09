# MD English — Fase 1 + Fase 2

Evolução do MVP original, seguindo a especificação enviada. Esta fase reorganiza tudo em torno de **Módulos** e aplica a nova identidade visual (azul-marinho + vermelho), mantendo 100% dos dados e funcionalidades que já existiam.

## O que mudou em relação ao MVP anterior

**Nada foi apagado do banco.** Só foi adicionado:
- Nova coleção `modulos` (nome, descrição, nível, ordem, disponível)
- Novo campo `moduloId` em cada documento de `conteudos`, ligando-o a um módulo
- Novo campo `conteudosConcluidos` (array) em cada `usuario`, ao lado do já existente `conteudosLiberados`
- Novo campo `tipo` em `conteudos` (por enquanto sempre `"video"`, prepara terreno pra Fase 2 com PDF/imagem/link)

Os documentos de `conteudos` criados antes desta fase não têm `moduloId` — eles aparecem automaticamente na tela **Módulos e Conteúdos > Conteúdos sem módulo atribuído**, onde dá pra atribuir um módulo a cada um com um clique.

## Estrutura de arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Login (redireciona pro dashboard certo conforme o papel) |
| `sidebar.js` | Menu lateral compartilhado entre todas as páginas |
| `dashboard.html` | Dashboard do aluno (progresso geral, atalho pra continuar) |
| `modulos.html` | "Meus Módulos" — grade de cards com progresso e status |
| `modulo.html` | Conteúdo de um módulo específico (`?id=...`) — vídeo + exercício |
| `perfil.html` | Perfil simples do aluno |
| `admin-dashboard.html` | "Visão Geral" do admin — contadores rápidos |
| `admin-alunos.html` | Cadastro e lista de alunos |
| `admin-modulos.html` | Criar módulos, cadastrar conteúdo/exercícios, liberar por aluno |

## Regras do Firestore

Continuam as mesmas do MVP anterior (qualquer usuário logado lê/escreve tudo). Como só adicionamos coleções e campos, **não é necessário mudar nada nas regras** agora:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ O aviso de segurança continua o mesmo de antes: essa regra é frouxa de propósito, pra validar rápido. Antes de crescer a base de alunos, ela precisa ser refinada.

## Como usar (fluxo do admin)

1. Faça login com a conta admin → você cai direto em **Visão Geral**.
2. Vá em **Módulos e Conteúdos** → crie um módulo (ex: "Presente Simples").
3. Clique no módulo criado → cadastre uma aula (vídeo) dentro dele.
4. Cadastre um exercício vinculado a essa aula.
5. Na tabela de liberação, marque os alunos que devem ter acesso — ou use "Liberar módulo inteiro" pra liberar de uma vez.
6. Em **Alunos**, você pode ver quantos conteúdos cada um já liberou/concluiu.

## Fase 2 — o que foi adicionado

**Novos tipos de conteúdo**, além de vídeo: PDF, imagem, link externo, texto, redação e resposta aberta. No cadastro (Módulos e Conteúdos), o campo muda conforme o tipo escolhido.

⚠️ **Importante sobre PDF e imagem:** este MVP não armazena arquivos — você cola uma **URL** de onde o arquivo já está hospedado (Google Drive com link público, Imgur, etc.). Isso evita mexer com Firebase Storage por enquanto. Se quiser upload direto de arquivo no futuro, é um passo à parte.

**Correção manual completa:**
- Aluno responde uma redação/resposta aberta → fica salvo em `respostasAbertas` com status `"aguardando"`.
- O professor vê a fila em **Correções** (admin), filtra entre "Aguardando" e "Corrigidas", escreve nota/feedback e envia.
- Ao corrigir, o conteúdo é automaticamente marcado como concluído pro aluno (mesma lógica de progresso que já existia).
- O aluno acompanha tudo em **Minhas Correções**, separado entre pendente e corrigido.

**Nova coleção:** `respostasAbertas` — { conteudoId, moduloId, userId, nomeAluno, resposta, status, nota, feedback, dataEnvio, dataCorrecao }. Não muda nada no que já existia, é só uma coleção nova.

## Fase 3 — o que foi adicionado

**Um adendo importante primeiro:** notificação por e-mail ou push (celular travado, notificação de sistema) **não foi implementada** — exigiria um servidor rodando por trás (Cloud Functions) pra disparar e-mails, o que é um projeto de infraestrutura à parte, com custo e complexidade de deploy adicionais. O que existe é notificação **dentro da própria plataforma**: um sininho com contador no menu, que avisa sobre conteúdo liberado, correção pronta e mensagens novas — funciona bem, mas só aparece quando a pessoa entra na plataforma.

**Notificações internas** — nova coleção `notificacoes`. Disparadas automaticamente quando: o admin libera um conteúdo (individual ou módulo inteiro), o admin corrige uma redação/resposta aberta, ou o admin envia uma mensagem. O aluno vê um contador no menu lateral e a lista completa em **Notificações**.

**Relatórios** — tabela em **Relatórios** (admin) com o progresso de cada aluno, módulo por módulo, e uma coluna de progresso geral. Calculado em cima dos dados que já existem, sem coleção nova.

**Mensagens** — chat simples entre professor e aluno, em **Mensagens** (admin). Nova coleção `mensagens`. ⚠️ Limitação atual: o aluno recebe o aviso da mensagem na tela de Notificações, mas ainda não tem uma tela de chat própria pra responder — só o professor tem a visão de conversa completa. Se isso for um uso real esperado (aluno responder por lá), é o próximo ajuste a fazer.

**Configurações** — por enquanto contém só um ajuste real: **liberação sequencial por módulo**. Quando ativada num módulo, ao concluir um conteúdo o próximo da sequência libera sozinho pro aluno, sem o professor precisar marcar manualmente na matriz. Os outros itens que normalmente apareceriam aqui (dados da conta, preferências gerais) não foram criados por não termos ainda uma necessidade concreta — evitei construir "configurações" genéricas sem um caso de uso real por trás.

## Resumo do que ficou de fora, de propósito

- Notificação por e-mail/push (precisa de backend)
- Tela de chat do lado do aluno (só recebe aviso, não responde pela plataforma ainda)
- Upload direto de arquivo pra PDF/imagem (usa URL externa)
- Regras de segurança do Firestore continuam permissivas — revisar antes de crescer a base de alunos

## Rodando localmente ou publicando

Sem mudança em relação ao guia anterior: `python -m http.server 8000` pra testar local, ou GitHub Pages pra publicar de vez (lembre de reautorizar o domínio no Firebase Authentication > Settings > Authorized domains, caso ainda não tenha feito).
