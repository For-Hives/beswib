#!/bin/bash

# Script pour tester tous les locales d'emails Beswib
# Usage: ./test-all-locales.sh YOUR_EMAIL@example.com

EMAIL=${1:-"test@example.com"}
BASE_URL=${2:-"http://localhost:3000"}

if [ -z "$EMAIL" ] || [ "$EMAIL" = "test@example.com" ]; then
    echo "❌ Veuillez fournir une vraie adresse email"
    echo "Usage: ./test-all-locales.sh your-email@example.com"
    exit 1
fi

LOCALES=("fr" "en" "es" "it" "de" "pt" "nl" "ko" "ro")
LOCALE_NAMES=("Français" "English" "Español" "Italiano" "Deutsch" "Português" "Nederlands" "한국어" "Română")

echo "🌍 Test de tous les locales pour les emails Beswib"
echo "📧 Destinataire: $EMAIL"
echo "📡 URL de base: $BASE_URL"
echo ""

for i in "${!LOCALES[@]}"; do
    LOCALE="${LOCALES[$i]}"
    LOCALE_NAME="${LOCALE_NAMES[$i]}"
    
    echo "🧪 Test ${LOCALE} (${LOCALE_NAME})..."
    
    # Test email de vérification
    echo "   📧 Vérification..."
    curl -s -X POST "$BASE_URL/api/emails/test" \
      -H "Content-Type: application/json" \
      -d "{
        \"template\": \"verification\",
        \"email\": \"$EMAIL\",
        \"code\": \"${LOCALE^^}123\",
        \"locale\": \"$LOCALE\"
      }" > /dev/null
    
    # Test email de bienvenue
    echo "   👋 Bienvenue..."
    curl -s -X POST "$BASE_URL/api/emails/test" \
      -H "Content-Type: application/json" \
      -d "{
        \"template\": \"welcome\",
        \"email\": \"$EMAIL\",
        \"firstName\": \"Testeur ${LOCALE_NAME}\",
        \"locale\": \"$LOCALE\"
      }" > /dev/null
    
    # Test email de confirmation de vente
    echo "   💰 Confirmation vente..."
    curl -s -X POST "$BASE_URL/api/emails/test" \
      -H "Content-Type: application/json" \
      -d "{
        \"template\": \"sale-confirmation\",
        \"email\": \"$EMAIL\",
        \"sellerName\": \"Vendeur ${LOCALE_NAME}\",
        \"buyerName\": \"Acheteur Test\",
        \"eventName\": \"Marathon Test ${LOCALE}\",
        \"bibPrice\": 150,
        \"orderId\": \"${LOCALE^^}123456\",
        \"locale\": \"$LOCALE\"
      }" > /dev/null
    
    # Test email de confirmation d'achat
    echo "   🏃‍♂️ Confirmation achat..."
    curl -s -X POST "$BASE_URL/api/emails/test" \
      -H "Content-Type: application/json" \
      -d "{
        \"template\": \"purchase-confirmation\",
        \"email\": \"$EMAIL\",
        \"buyerName\": \"Acheteur ${LOCALE_NAME}\",
        \"sellerName\": \"Vendeur Test\",
        \"eventName\": \"Marathon Test ${LOCALE}\",
        \"bibPrice\": 150,
        \"orderId\": \"${LOCALE^^}123456\",
        \"eventDistance\": \"42.2 km\",
        \"bibCategory\": \"Marathon\",
        \"locale\": \"$LOCALE\"
      }" > /dev/null
    
    echo "   ✅ Envoyé"
    echo ""
    
    # Pause pour éviter de spam
    sleep 1
done

echo "🎉 Tous les tests terminés !"
echo "📧 Vérifiez votre boîte email: $EMAIL"
echo "💡 Vous devriez avoir reçu 36 emails (9 de vérification + 9 de bienvenue + 9 de confirmation de vente + 9 de confirmation d'achat)"