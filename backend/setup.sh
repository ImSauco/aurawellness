#!/bin/bash

# 🚀 Script para verificar backend
# Ejecuta este script para ver si todo está correctamente configurado

echo "=================================================="
echo "✅ BY AURA BACKEND - VERIFICACIÓN DE INSTALACIÓN"
echo "=================================================="
echo ""

# 1. Verificar Python
echo "1️⃣ Verificando Python..."
python --version
echo ""

# 2. Verificar dependencias instaladas
echo "2️⃣ Instalando dependencias..."
pip install -r requirements.txt
echo ""

# 3. Verificar estructura
echo "3️⃣ Verificando estructura de carpetas..."
ls -la
echo ""

# 4. Verificar .env
echo "4️⃣ Revisa el archivo .env antes de iniciar:"
echo "   - DATABASE_URL (PostgreSQL)"
echo "   - SECRET_KEY"
echo ""

# 5. Iniciar servidor
echo "=================================================="
echo "✨ Para iniciar el servidor ejecuta:"
echo "   python main.py"
echo ""
echo "📚 Documentación:"
echo "   - http://localhost:8000/docs"
echo "   - http://localhost:8000/redoc"
echo "=================================================="
