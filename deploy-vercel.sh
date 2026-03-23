#!/bin/bash

# Script de Deploy Vercel - Finance Flow

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║        🚀 DEPLOY VERCEL - FINANCE FLOW 🚀                   ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não está instalado!"
    echo "Instalando..."
    npm install -g vercel
fi

echo "✅ Vercel CLI detectado!"
echo ""

# Passo 1: Login
echo "📝 PASSO 1: LOGIN NO VERCEL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Você será redirecionado para fazer login com sua conta GitHub/GitLab/Bitbucket"
echo ""
read -p "Pressione Enter para continuar..."
echo ""

vercel login

echo ""
echo "✅ Login realizado com sucesso!"
echo ""

# Passo 2: Deploy
echo "🚀 PASSO 2: DEPLOY DO PROJETO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Responda as perguntas abaixo (pressione Enter para defaults):"
echo ""

vercel

echo ""
echo "✅ Deploy realizado!"
echo ""

# Passo 3: Informações
echo "📋 PRÓXIMOS PASSOS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Abra o painel Vercel:"
echo "   https://vercel.com/dashboard"
echo ""
echo "2️⃣  Clique no seu projeto (Gerenciador de gastos)"
echo ""
echo "3️⃣  Vá para: Settings → Environment Variables"
echo ""
echo "4️⃣  Adicione as 6 variáveis Firebase:"
echo "   • VITE_FIREBASE_API_KEY"
echo "   • VITE_FIREBASE_AUTH_DOMAIN"
echo "   • VITE_FIREBASE_PROJECT_ID"
echo "   • VITE_FIREBASE_STORAGE_BUCKET"
echo "   • VITE_FIREBASE_MESSAGING_SENDER_ID"
echo "   • VITE_FIREBASE_APP_ID"
echo ""
echo "   (Copie os valores do arquivo .env.local)"
echo ""
echo "5️⃣  Clique em 'Save'"
echo ""
echo "6️⃣  Volte para Deployments e clique em 'Redeploy'"
echo ""
echo "7️⃣  Aguarde ~30 segundos"
echo ""
echo "8️⃣  Pronto! Seu app está ONLINE! 🎉"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Você conseguiu! Seu app Finance Flow está no ar! ✨"
echo ""
