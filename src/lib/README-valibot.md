# Validation Valibot pour l'authentification

Ce projet utilise Valibot pour la validation des formulaires d'authentification. Valibot offre une alternative moderne et performante aux validations avec expressions régulières.

## Fichiers créés

### 1. `validation-schemas.ts`

Contient les schémas de validation Valibot :

- `createEmailSchema()` - Validation email
- `createSignInPasswordSchema()` - Validation mot de passe connexion
- `createSignUpPasswordSchema()` - Validation mot de passe inscription (strict)
- `createNameSchema()` - Validation nom/prénom
- `createVerificationCodeSchema()` - Validation code de vérification
- `createSignInSchema()` - Schéma complet connexion
- `createSignUpSchema()` - Schéma complet inscription
- `analyzePasswordStrength()` - Analyse force du mot de passe

### 2. `validation-valibot.ts`

Wrappers des schémas pour compatibilité avec le code existant :

- `validateEmailValibot()`
- `validatePasswordValibot()`
- `validateNameValibot()`
- `validateVerificationCodeValibot()`
- `validateConfirmPasswordValibot()`
- `getPasswordStrengthValibot()`

### 3. `hooks/useValibot.ts`

Hook React pour utiliser facilement Valibot dans les composants :

```tsx
const { errors, validate, validateField, clearError } = useValibot(schema)
```

### 4. `components/auth/ValiboAuthExample.tsx`

Exemple d'utilisation du hook dans un composant d'authentification.

## Usage

### Validation simple d'un champ

```ts
import { validateEmailValibot } from '@/lib/validation-valibot'

const error = validateEmailValibot('test@example.com', 'fr')
if (error) {
	console.log(error.message, error.code)
}
```

### Validation avec hook

```tsx
import { useValibot } from '@/hooks/useValibot'
import { createSignInSchema } from '@/lib/validation-schemas'

function MyForm() {
	const schema = createSignInSchema('fr')
	const { errors, validate, validateField } = useValibot(schema)

	const handleSubmit = data => {
		if (validate(data)) {
			// Form valide
		}
	}
}
```

### Validation en temps réel

```tsx
const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
	const value = e.target.value
	setFormData(prev => ({ ...prev, [field]: value }))

	// Validation en temps réel
	validateField(field, value)
}
```

## Avantages de Valibot

1. **Performance** - Plus rapide que les expressions régulières
2. **Type Safety** - Validation TypeScript native
3. **Composabilité** - Schémas réutilisables et combinables
4. **Messages d'erreur** - Support multilingue intégré
5. **Validation progressive** - Validation field par field ou complète

## Migration depuis l'ancien système

Les composants `CustomSignIn` et `CustomSignUp` ont été mis à jour pour utiliser Valibot tout en gardant la même interface. Le composant `PasswordStrength` utilise également la nouvelle fonction d'analyse.

Les anciennes fonctions de validation dans `validation.ts` peuvent être progressivement remplacées par les nouvelles fonctions Valibot.
