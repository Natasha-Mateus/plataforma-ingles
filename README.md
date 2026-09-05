# Plataforma de Inglês — MVP

Protótipo funcional: login, vídeo do YouTube embutido, liberação de conteúdo por aluno e exercício de múltipla escolha com correção automática.

## O que tem aqui

- `index.html` — tela de login (aluno e admin usam a mesma)
- `aluno.html` — visão do aluno: lista de aulas liberadas, vídeo embutido, exercício
- `admin.html` — painel do admin: cadastrar aula, cadastrar exercício, liberar conteúdo por aluno, cadastrar aluno
- `firebase-config.js` — onde você cola as chaves do seu projeto Firebase
- `style.css` — estilo visual

## Passo a passo para colocar no ar

### 1. Criar o projeto no Firebase
1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie um projeto novo.
2. No menu lateral, vá em **Build > Authentication** → aba "Sign-in method" → ative **Email/Password**.
3. Vá em **Build > Firestore Database** → crie o banco (modo produção ou teste, tanto faz por enquanto).
4. Nas configurações do projeto (ícone de engrenagem) → "Seus apps" → crie um app **Web** → copie o objeto `firebaseConfig`.
5. Cole esses valores dentro do arquivo `firebase-config.js`.

### 2. Regras de segurança do Firestore (importante)
No MVP, qualquer usuário logado consegue ler/escrever tudo — isso é aceitável só pra teste com poucas pessoas de confiança. Vá em **Firestore Database > Regras** e use, por enquanto:

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

⚠️ Isso **não é seguro pra produção** (um aluno logado tecnicamente conseguiria editar dados de outro aluno direto pelo console do navegador). Pra validar a ideia com seu esposo e poucos alunos de confiança, é suficiente. Antes de abrir pra mais gente, essa regra precisa ser refinada (cada aluno só edita os próprios dados, só o admin cria conteúdo).

### 3. Criar o primeiro admin e os primeiros alunos
Nesse MVP, a criação de contas (email/senha) é feita manualmente:
1. Vá em **Authentication > Users > Add user** e crie um usuário com email/senha (pode ser o do seu esposo).
2. Copie o **UID** gerado.
3. Vá em **Firestore Database > Start collection** → crie a coleção `usuarios` → documento com ID = esse UID → campos:
   - `nome`: "Nome do professor"
   - `papel`: "admin"
   - `conteudosLiberados`: [] (array vazio)
4. Repita o processo pra cada aluno, mas com `papel: "aluno"`. (A partir do segundo aluno, dá pra cadastrar o papel direto pela tela "Cadastrar aluno" dentro do `admin.html`, só a criação do login/senha que continua manual pelo Console.)

### 4. Rodar localmente
Como o app usa módulos JavaScript (`type="module"`), abrir o `index.html` direto no navegador (com `file://`) pode dar erro de CORS. O mais simples:

```bash
# dentro da pasta do projeto
python3 -m http.server 8000
```

E acessar `http://localhost:8000` no navegador.

### 5. Colocar no ar de verdade (opcional, depois do teste local)
Quando quiser que seu esposo e os alunos acessem de qualquer lugar, dá pra hospedar de graça no próprio Firebase Hosting:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## O que fica de fora do MVP (de propósito)

Conforme conversamos, ficou fora por enquanto: PDF, foto, link externo, áudio, exercício de correção manual, matriz de liberação por módulo, notificações, recuperação de senha automática. A ideia é validar o núcleo (login + vídeo + liberação + exercício automático) com poucos alunos reais antes de investir nessas camadas.
