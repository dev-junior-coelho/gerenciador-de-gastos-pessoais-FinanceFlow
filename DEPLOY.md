# 🚀 Guia de Deploy - Finance Flow

## Opções de Deploy

Este projeto pode ser deployado em diversas plataformas. Abaixo estão as instruções para as mais populares.

---

## 1. **Vercel (Recomendado)** ⭐

### Passos:
1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Selecione seu repositório GitHub
4. Configure as variáveis de ambiente:
   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   ```
5. Clique em "Deploy"

**Vantagens:**
- Deploy automático a cada push
- Suporta preview environments
- Muito rápido (CDN global)
- Free tier generoso

---

## 2. **Netlify**

### Passos:
1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em "Add new site" → "Import an existing project"
3. Selecione seu repositório GitHub
4. Configure as variáveis de ambiente (iguais ao Vercel)
5. Clique em "Deploy"

**Vantagens:**
- Interface intuitiva
- Deploy automático
- Funções serverless gratuitas

---

## 3. **Firebase Hosting**

### Passos:

#### 1. Instale o Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
```

#### 2. Inicialize Firebase:
```bash
firebase init hosting
```
- Escolha seu projeto Firebase
- Build directory: `dist`
- Single-page app: `Yes`

#### 3. Build e Deploy:
```bash
npm run build
firebase deploy
```

---

## 4. **GitHub Pages**

### Passos:

#### 1. Atualize `vite.config.js`:
```javascript
export default defineConfig({
  base: '/Gerenciador-de-gastos/',  // seu repositório
  // ...
})
```

#### 2. Add GitHub Pages action em `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 5. **AWS S3 + CloudFront**

### Passos:
1. Build: `npm run build`
2. Upload `dist/` para S3 bucket
3. Configure CloudFront como CDN
4. Aponte seu domínio customizado

---

## ✅ Checklist Antes do Deploy

- [ ] Todas as variáveis de ambiente Firebase configuradas
- [ ] `npm run build` executa sem erros
- [ ] Testar em `npm run preview`
- [ ] Remover dados sensíveis de comentários/código
- [ ] Verificar `.gitignore` inclui `.env.local`
- [ ] Regras Firestore estão seguras
- [ ] Domínio customizado configurado (opcional)

---

## 📱 Variáveis de Ambiente

As seguintes variáveis são **necessárias**:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Copie `.env.example` para `.env.local` localmente e preencha com seus valores do Firebase Console.

---

## 🔐 Segurança

### Regras Firestore Recomendadas:
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/expenses/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

### Configurar autenticação Firebase:
- Habilitar "Email/Password" no Firebase Console
- Opcionalmente: Google, GitHub, etc.

---

## 📊 Performance

Depois do deploy, verifique:
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

---

## 🆘 Troubleshooting

### App não carrega após deploy
- Verifique variáveis de ambiente
- Cheque console do navegador (F12)
- Verif Firestore está acessível

### Erros de CORS
- Configure Firestore rules corretamente
- Não use credentials desnecessários

### Build muito grande
- Consider lazy loading components
- Comprimir imagens
- Usar tree-shaking

---

## 📞 Suporte

Qualquer dúvida, consulte:
- [Documentação Vite](https://vitejs.dev/)
- [Documentação Firebase](https://firebase.google.com/docs)
- [Documentação React](https://react.dev/)

**Bom deploy! 🎉**
