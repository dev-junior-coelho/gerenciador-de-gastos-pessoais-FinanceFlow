# 🚀 Deploy Rápido em 3 Passos

## Opção 1: Vercel (Mais Rápido ⚡)

### Passo 1: Login no Vercel
```bash
npm install -g vercel
vercel login
```

### Passo 2: Deploy
```bash
cd Gerenciador\ de\ gastos\ pessoais/
vercel
```

### Passo 3: Configurar Variáveis
- No painel do Vercel, vá para "Settings" → "Environment Variables"
- Adicione suas credenciais Firebase:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

**Pronto! 🎉 Seu app está online!**

---

## Opção 2: Netlify

```bash
npm install -g netlify-cli
netlify login
netlify deploy
```

---

## Opção 3: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## Verificar Build Local

```bash
npm run build
npm run preview
# Acesse: http://localhost:4173
```

---

## Troubleshooting

### ❌ Erro: "Cannot find module firebase"
```bash
npm install
npm run build
```

### ❌ Variáveis não funcionam
- Reinicie o build após adicionar env vars
- Verifique se estão prefixadas com `VITE_`
- Use `console.log(import.meta.env.VITE_xxx)` para debug

### ❌ App rodando mas banco não conecta
- Verifique Firestore Rules (Security Tab no Firebase Console)
- Certifique-se que autenticação está habilitada

---

## ✨ Seu app está pronto para o mundo! 🌍
