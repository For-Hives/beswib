# PayPal Integration Documentation

## Overview

This application uses PayPal for payment processing and seller onboarding in a C2C marketplace environment. The integration includes:

- PayPal payment processing for bib purchases
- Seller onboarding flow to enable PayPal payouts
- Platform fee collection (10% commission)

## Environment Variables

Required environment variables:

```bash
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_BN_CODE=your_paypal_bn_code_here

# Base URL for callbacks
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## PayPal Sandbox Setup

1. Create a PayPal Developer account at https://developer.paypal.com/
2. Create a new application in the PayPal Developer Dashboard
3. Get your Client ID and Client Secret from the application details
4. Set up your webhook endpoints if needed

## Onboarding Flow

### For Sellers

1. User navigates to their profile page
2. In the "Seller" section, they see PayPal onboarding status
3. If not onboarded, they click "Connect PayPal Account"
4. They are redirected to PayPal for authorization
5. After authorization, they return to the callback URL
6. The application processes the onboarding completion
7. User's PayPal merchant ID is saved and verified

### Technical Flow

1. `PayPalOnboarding` component initiates onboarding
2. `onboardSeller()` service creates PayPal partner referral
3. User completes PayPal authorization
4. PayPal redirects to `/[locale]/paypal/callback`
5. `PayPalCallbackHandler` processes the callback
6. `completeOnboarding()` service fetches merchant ID
7. User model is updated with PayPal details

## Payment Flow

### For Buyers

1. User selects a bib on the marketplace
2. PayPal payment button is rendered using `@paypal/react-paypal-js`
3. User completes payment through PayPal
4. Payment is captured and processed
5. Platform fee (10%) is automatically deducted

### Technical Flow

1. `PayPalPurchaseClient` renders PayPal buttons
2. `createOrder()` service creates PayPal order with platform fees
3. PayPal processes the payment
4. `capturePayment()` service captures the order
5. Transaction is recorded in the database

## API Endpoints

### PayPal Services

- `createOrder(sellerId, amount)` - Creates a PayPal order with platform fees
- `capturePayment(orderID)` - Captures a completed PayPal order
- `onboardSeller(trackingId)` - Initiates seller onboarding
- `completeOnboarding(merchantId, trackingId)` - Completes onboarding process

### Onboarding Services

- `updateUserPaypalDetails(userId, merchantId, trackingId)` - Updates user PayPal info
- `getUserPaypalStatus(userId)` - Gets user's PayPal connection status

## Testing

### Sandbox Testing

1. Use PayPal sandbox credentials
2. Test payments with sandbox PayPal accounts
3. Test onboarding flow with sandbox seller accounts
4. Verify platform fees are correctly calculated and collected

### Demo Page

Visit `/paypal-demo` to test the PayPal integration in a controlled environment.

## Security Considerations

1. Client ID is public but Client Secret must be kept secure
2. All PayPal API calls use server-side authentication
3. Webhook signatures should be verified in production
4. Use HTTPS in production for all PayPal callbacks

## Production Deployment

1. Switch from sandbox to production PayPal endpoints
2. Update environment variables with production credentials
3. Configure production webhook endpoints
4. Update Content Security Policy to allow PayPal domains
5. Test the complete flow in production environment

## Troubleshooting

### Common Issues

1. **"PayPal account not connected"** - User needs to complete onboarding
2. **"Invalid merchant ID"** - Check if onboarding was completed successfully
3. **"Payment failed"** - Check PayPal credentials and order details
4. **"Callback not working"** - Verify NEXT_PUBLIC_BASE_URL is correct

### Debug Tips

1. Check browser console for PayPal JavaScript errors
2. Verify environment variables are properly set
3. Check PayPal Developer Dashboard for transaction logs
4. Use PayPal's webhook simulator for testing

## Migration from Stripe

This integration replaces the previous Stripe implementation:

- ✅ Removed Stripe dependencies and services
- ✅ Updated user model to use PayPal fields
- ✅ Updated all UI/UX to reference PayPal
- ✅ Updated Content Security Policy
- ✅ Updated environment variables and documentation

## Support

For PayPal API documentation, visit: https://developer.paypal.com/docs/
For PayPal integration help, contact PayPal Developer Support.
