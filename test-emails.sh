#!/bin/bash

# Script pour tester l'envoi d'emails Beswib avec support multilingue
# Usage: ./test-emails.sh YOUR_EMAIL@example.com [LOCALE]

EMAIL=${1:-"test@example.com"}
LOCALE=${2:-"fr"}
BASE_URL=${3:-"http://localhost:3000"}

echo "🧪 Test d'envoi d'emails Beswib vers: $EMAIL"
echo "🌐 Langue: $LOCALE"
echo "📡 URL de base: $BASE_URL"
echo ""

# Test email de vérification
echo "📧 Test email de vérification ($LOCALE)..."
curl -X POST "$BASE_URL/api/emails/test" \
  -H "Content-Type: application/json" \
  -d "{
    \"template\": \"verification\",
    \"email\": \"$EMAIL\",
    \"code\": \"TEST123\",
    \"locale\": \"$LOCALE\"
  }" \
  -w "\n"

echo ""

# Test email de bienvenue
echo "👋 Test email de bienvenue ($LOCALE)..."
curl -X POST "$BASE_URL/api/emails/test" \
  -H "Content-Type: application/json" \
  -d "{
    \"template\": \"welcome\",
    \"email\": \"$EMAIL\",
    \"firstName\": \"Test User\",
    \"locale\": \"$LOCALE\"
  }" \
  -w "\n"

echo ""

# Test email de confirmation de vente
echo "💰 Test email de confirmation de vente ($LOCALE)..."
curl -X POST "$BASE_URL/api/emails/test" \
  -H "Content-Type: application/json" \
  -d "{
    \"template\": \"sale-confirmation\",
    \"email\": \"$EMAIL\",
    \"sellerName\": \"Test Seller\",
    \"buyerName\": \"Test Buyer\",
    \"eventName\": \"Test Marathon 2024\",
    \"bibPrice\": 150,
    \"orderId\": \"TEST123456\",
    \"locale\": \"$LOCALE\"
  }" \
  -w "\n"

echo ""

# Test email de confirmation d'achat
echo "🏃‍♂️ Test email de confirmation d'achat ($LOCALE)..."
curl -X POST "$BASE_URL/api/emails/test" \
  -H "Content-Type: application/json" \
  -d "{
    \"template\": \"purchase-confirmation\",
    \"email\": \"$EMAIL\",
    \"buyerName\": \"Test Buyer\",
    \"sellerName\": \"Test Seller\",
    \"eventName\": \"Test Marathon 2024\",
    \"bibPrice\": 150,
    \"orderId\": \"TEST123456\",
    \"eventDistance\": \"42.2 km\",
    \"bibCategory\": \"Marathon\",
    \"locale\": \"$LOCALE\"
  }" \
  -w "\n"

echo ""

# Test email d'alerte admin
echo "🚨 Test email d'alerte admin..."
curl -X POST "$BASE_URL/api/emails/test" \
  -H "Content-Type: application/json" \
  -d "{
    \"template\": \"sale-alert\",
    \"email\": \"$EMAIL\",
    \"sellerName\": \"Test Seller\",
    \"sellerEmail\": \"seller@example.com\",
    \"buyerName\": \"Test Buyer\",
    \"buyerEmail\": \"buyer@example.com\",
    \"eventName\": \"Test Marathon 2024\",
    \"bibPrice\": 150,
    \"orderId\": \"TEST123456\",
    \"eventDistance\": \"42.2 km\",
    \"bibCategory\": \"Marathon\",
    \"transactionId\": \"tx_test123\",
    \"paypalCaptureId\": \"CAPTURE_TEST\"
  }" \
  -w "\n"

echo ""

# Test email de notification waitlist
echo "🎯 Test email de notification waitlist ($LOCALE)..."
curl -X POST "$BASE_URL/api/emails/test" \
  -H "Content-Type: application/json" \
  -d "{
    \"template\": \"waitlist-alert\",
    \"email\": \"$EMAIL\",
    \"eventName\": \"Test Marathon 2024\",
    \"eventId\": \"test_event_123\",
    \"bibPrice\": 150,
    \"eventDate\": \"15 juin 2024\",
    \"eventLocation\": \"Paris, France\",
    \"eventDistance\": \"42.2 km\",
    \"bibCategory\": \"Marathon\",
    \"sellerName\": \"Test Seller\",
    \"timeRemaining\": \"2 semaines\",
    \"locale\": \"$LOCALE\"
  }" \
  -w "\n"

echo ""

# Test email d'approbation de dossard
echo "✅ Test email d'approbation de dossard ($LOCALE)..."
curl -X POST "$BASE_URL/api/emails/test" \
  -H "Content-Type: application/json" \
  -d "{
    \"template\": \"bib-approval\",
    \"email\": \"$EMAIL\",
    \"sellerName\": \"Test Seller\",
    \"eventName\": \"Test Marathon 2024\",
    \"eventDate\": \"15 juin 2024\",
    \"eventLocation\": \"Paris, France\",
    \"bibPrice\": 150,
    \"eventDistance\": \"42.2 km\",
    \"bibCategory\": \"Marathon\",
    \"organizerName\": \"ASO Events\",
    \"locale\": \"$LOCALE\"
  }" \
  -w "\n"

echo ""
echo "✅ Tests terminés ! Vérifie ta boîte email: $EMAIL"
echo ""
echo "💡 Langues supportées:"
echo "   • fr (Français)"
echo "   • en (English)"
echo "   • es (Español)"
echo "   • it (Italiano)"
echo "   • de (Deutsch)"
echo "   • pt (Português)"
echo "   • nl (Nederlands)"
echo "   • ko (한국어)"
echo "   • ro (Română)"
echo ""
echo "📖 Pour tester une autre langue:"
echo "   ./test-emails.sh $EMAIL en"
echo ""
echo "📧 Types d'emails testés:"
echo "   • Vérification d'email"
echo "   • Email de bienvenue"
echo "   • Confirmation de vente (vendeur)"
echo "   • Confirmation d'achat (acheteur)"
echo "   • Alerte de vente (admin)"
echo "   • Notification waitlist (disponibilité dossard)"
echo "   • Approbation de dossard (validation organisateur)"