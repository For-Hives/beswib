/**
 * Email verification constants
 */
export const VERIFICATION_EXPIRY_MINUTES = 15
export const RESEND_COOLDOWN_MINUTES = 5
export const MAX_DAILY_ATTEMPTS = 3

/**
 * Email verification templates
 */
export const VERIFICATION_EMAIL_SUBJECT = '🔐 Verify your email address - Beswib'

export const VERIFICATION_EMAIL_TEXT_TEMPLATE = (verificationCode: string, expiryMinutes: number): string => `Hi there!

Your verification code is: ${verificationCode}

This code will expire in ${expiryMinutes} minutes.

If you didn't request this verification, please ignore this email.

Best regards,
The Beswib Team`

export const VERIFICATION_EMAIL_HTML_TEMPLATE = (verificationCode: string, expiryMinutes: number): string => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
		<h1 style="color: white; margin: 0; font-size: 24px;">🔐 Email Verification</h1>
	</div>
	
	<div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
		<p style="font-size: 16px; color: #333; margin: 0 0 20px;">Hi there!</p>
		
		<p style="font-size: 16px; color: #333; margin: 0 0 20px;">Your verification code is:</p>
		
		<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
			<h2 style="margin: 0; color: #333; font-size: 32px; letter-spacing: 4px; font-family: monospace;">${verificationCode}</h2>
		</div>
		
		<p style="font-size: 14px; color: #666; margin: 20px 0 0;">
			⏰ This code will expire in <strong>${expiryMinutes} minutes</strong>.
		</p>
		
		<p style="font-size: 14px; color: #666; margin: 20px 0 0;">
			If you didn't request this verification, please ignore this email.
		</p>
		
		<p style="font-size: 14px; color: #666; margin: 20px 0 0; text-align: center;">
			Best regards,<br>
			<strong>The Beswib Team</strong>
		</p>
	</div>
</div>`
