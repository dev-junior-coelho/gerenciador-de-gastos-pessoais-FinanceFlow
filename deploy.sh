#!/bin/bash

# Deploy script para Finance Flow
# Suporta: Vercel, Netlify, Firebase Hosting

echo "🚀 Finance Flow - Deploy Manager"
echo "=================================="
echo ""
echo "Escolha uma opção:"
echo "1) Vercel (via CLI)"
echo "2) Netlify (via CLI)"
echo "3) Firebase Hosting"
echo "4) Preview Local"
echo "5) Build apenas"
echo ""
read -p "Digite a opção (1-5): " option

case $option in
  1)
    echo "📤 Preparando para Vercel..."
    if ! command -v vercel &> /dev/null; then
      echo "Instalando Vercel CLI..."
      npm install -g vercel
    fi
    vercel
    ;;
  2)
    echo "📤 Preparando para Netlify..."
    if ! command -v netlify &> /dev/null; then
      echo "Instalando Netlify CLI..."
      npm install -g netlify-cli
    fi
    netlify deploy
    ;;
  3)
    echo "📤 Preparando para Firebase..."
    if ! command -v firebase &> /dev/null; then
      echo "Instalando Firebase CLI..."
      npm install -g firebase-tools
    fi
    npm run build
    firebase deploy
    ;;
  4)
    echo "👀 Abrindo preview local..."
    npm run build
    npm run preview
    ;;
  5)
    echo "🔨 Compilando para produção..."
    npm run build
    echo "✅ Build concluído! Arquivos em: ./dist"
    ;;
  *)
    echo "❌ Opção inválida!"
    exit 1
    ;;
esac

echo ""
echo "✅ Operação concluída!"
