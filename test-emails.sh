#!/bin/bash

# Script pour tester l'envoi d'emails Beswib
# Usage: ./test-emails.sh YOUR_EMAIL@example.com

EMAIL=${1:-"test@example.com"}
BASE_URL=${2:-"http://localhost:3000"}

echo "🧪 Test d'envoi d'emails Beswib vers: $EMAIL"
echo "📡 URL de base: $BASE_URL"
echo ""

# Test email de vérification
echo "📧 Test email de vérification..."
curl -X POST "$BASE_URL/api/emails/test" \
  -H "Content-Type: application/json" \
  -d "{
    \"template\": \"verification\",
    \"email\": \"$EMAIL\",
    \"code\": \"TEST123\",
    \"locale\": \"fr\"
  }" \
  -w "\n"

echo ""

# Test email de bienvenue
echo "👋 Test email de bienvenue..."
curl -X POST "$BASE_URL/api/emails/test" \
  -H "Content-Type: application/json" \
  -d "{
    \"template\": \"welcome\",
    \"email\": \"$EMAIL\",
    \"firstName\": \"Test User\",
    \"locale\": \"fr\"
  }" \
  -w "\n"

echo ""
echo "✅ Tests terminés ! Vérifie ta boîte email: $EMAIL"