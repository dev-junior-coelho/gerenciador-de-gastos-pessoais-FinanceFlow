# 💰 Finance Flow - Gerenciador de Gastos Pessoais

Um aplicativo web moderno para gerenciar suas finanças pessoais com estilo!

## ✨ Características

- 📊 **Dashboard Inteligente**: Visualize seus gastos com gráficos e estatísticas
- 💳 **Múltiplas Categorias**: Organize gastos por categoria (Alimentação, Transporte, etc.)
- 📈 **Parcelamentos**: Controle gastos parcelados com visualização de progresso
- 🌙 **Modo Escuro/Claro**: Interface adaptada para seu conforto visual
- 📱 **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- 🔐 **Seguro**: Autenticação Firebase e dados privados do usuário
- ⚡ **Rápido**: Construído com React + Vite
- 🎨 **Design Profissional**: UI moderna com TailwindCSS

## 🚀 Quick Start

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar servidor local
npm run dev

# Abrirá em http://localhost:5174
```

### Build para Produção

```bash
# Compilar
npm run build

# Preview da build
npm run preview
```

## 🛠️ Stack Técnico

- **Frontend**: React 19.2 + Vite 7
- **Styling**: TailwindCSS 4 + Tailwind UI
- **Backend**: Firebase (Firestore + Authentication)
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Tipografia**: Inter + Outfit

## 📦 Dependências Principais

```json
{
  "react": "^19.2.0",
  "firebase": "^12.7.0",
  "recharts": "^3.6.0",
  "tailwindcss": "^4.1.18",
  "lucide-react": "^0.562.0"
}
```

## 🌍 Deploy

O app está pronto para deploy em múltiplas plataformas!

### 📚 Documentação de Deploy

- **[DEPLOY_INDEX.md](./DEPLOY_INDEX.md)** - Índice de documentação
- **[QUICKSTART_DEPLOY.md](./QUICKSTART_DEPLOY.md)** - Deploy em 3 passos ⚡
- **[DEPLOY.md](./DEPLOY.md)** - Guia completo com todas as plataformas
- **[GIT_DEPLOY.md](./GIT_DEPLOY.md)** - GitHub + Vercel automático
- **[CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)** - Checklist pré-deploy

### 🚀 Opções de Deploy

#### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

#### Firebase Hosting
```bash
firebase login
firebase init hosting
firebase deploy
```

## 🔐 Configuração Firebase

### Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Segurança (Firestore Rules)

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

## 📱 Funcionalidades

### Dashboard
- Saldo disponível
- Total de gastos do mês
- Eficiência financeira (%)
- Mix de gastos por categoria

### Gerenciamento de Gastos
- ➕ Adicionar novo gasto
- ✏️ Editar gasto existente
- 🗑️ Deletar gasto
- 📊 Visualizar por categoria
- 📈 Filtrar por tipo (fixo/parcelado)

### Análise
- Gráfico de pizza por categoria
- Porcentagem de gastos
- Progresso de parcelamentos
- Histórico de transações

## 🎨 Design

- **Cores Principais**: Roxo (#9333ea) e Violeta (#a855f7)
- **Tipografia**: Inter (corpo), Outfit (headlines)
- **Border Radius**: 1.5rem - 2rem (rounded cards)
- **Backdrop**: Glass-morphism com blur

## 🔧 Scripts Disponíveis

```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview da build
npm run lint       # Verificar linting
bash deploy.sh     # Deploy interativo
```

## 📊 Performance

- **Bundle Size**: ~946 kB (283 kB gzip)
- **Build Time**: ~5 segundos
- **Lighthouse Score**: A+ (perfil padrão)

## 🐛 Troubleshooting

### Erro: "Cannot find module firebase"
```bash
npm install
npm run build
```

### Variáveis de ambiente não funcionam
- Verifique se as variáveis estão prefixadas com `VITE_`
- Reinicie o servidor (`npm run dev`)
- Verifique `.env.local` foi salvo

### App não conecta ao Firebase
- Verifique Firestore Rules no Console Firebase
- Verifique se as credenciais estão corretas
- Teste a autenticação

## 📞 Suporte

Para dúvidas sobre:
- **Deploy**: Consulte `DEPLOY_INDEX.md`
- **Firebase**: [Documentação Firebase](https://firebase.google.com/docs)
- **React**: [React Documentation](https://react.dev)
- **Vite**: [Vite Documentation](https://vitejs.dev)

## 📄 Licença

Este projeto é código aberto e disponível para uso pessoal e comercial.

## 🙏 Créditos

Desenvolvido com ❤️ usando:
- React
- Vite
- Firebase
- TailwindCSS
- Recharts

---

**Versão**: 2.0.0
**Última Atualização**: 6 de Março de 2026

**Bom gerenciamento de gastos! 💰✨**
