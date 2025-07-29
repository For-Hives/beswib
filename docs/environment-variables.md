# Environment Variables

## PayPal Configuration

### Required Variables

```env
# PayPal API Credentials
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# PayPal Business Network Code (for revenue attribution)
PAYPAL_BN_CODE=your_paypal_bn_code

# PayPal API URL (use sandbox for development, live for production)
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
# For production: PAYPAL_API_URL=https://api-m.paypal.com
```

### App Configuration

```env
# Base URL for your application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# For production: NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Development vs Production

### Development (Sandbox)
```env
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
```

### Production (Live)
```env
PAYPAL_API_URL=https://api-m.paypal.com
```

## Getting PayPal Credentials

1. Go to [PayPal Developer Portal](https://developer.paypal.com/)
2. Log in to your PayPal account
3. Navigate to "Apps & Credentials"
4. Create a new app or use an existing one
5. Copy the Client ID and Client Secret
6. For BN Code, check your PayPal Partner Dashboard

## Security Notes

- Never commit `.env` files to version control
- Use different credentials for development and production
- Regularly rotate your PayPal credentials
- Monitor webhook events for security 