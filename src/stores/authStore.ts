import { create } from 'zustand'

export interface FieldError {
	message: string
	code?: string
}

export interface AuthState {
	// Loading states
	isSigningIn: boolean
	isSigningUp: boolean
	isVerifying: boolean
	isResettingPassword: boolean

	// Form data
	signInData: {
		email: string
		password: string
	}
	signUpData: {
		firstName: string
		lastName: string
		email: string
		password: string
		confirmPassword: string
	}

	// Errors
	globalError: string
	fieldErrors: {
		email?: FieldError
		password?: FieldError
		confirmPassword?: FieldError
		firstName?: FieldError
		lastName?: FieldError
		verificationCode?: FieldError
	}

	// Verification state
	pendingVerification: boolean
	verificationEmail: string
	verificationCode: string

	// Actions
	setSignInData: (data: Partial<AuthState['signInData']>) => void
	setSignUpData: (data: Partial<AuthState['signUpData']>) => void
	setFieldError: (field: keyof AuthState['fieldErrors'], error: FieldError | null) => void
	setGlobalError: (error: string) => void
	clearErrors: () => void
	clearFieldError: (field: keyof AuthState['fieldErrors']) => void

	// Loading actions
	setSigningIn: (loading: boolean) => void
	setSigningUp: (loading: boolean) => void
	setVerifying: (loading: boolean) => void
	setResettingPassword: (loading: boolean) => void

	// Verification actions
	setPendingVerification: (pending: boolean, email?: string) => void
	setVerificationCode: (code: string) => void

	// Reset actions
	resetSignInForm: () => void
	resetSignUpForm: () => void
	resetAuthState: () => void
}

const initialSignInData = {
	password: '',
	email: '',
}

const initialSignUpData = {
	password: '',
	lastName: '',
	firstName: '',
	email: '',
	confirmPassword: '',
}

export const useAuthStore = create<AuthState>(set => ({
	verificationEmail: '',
	verificationCode: '',
	signUpData: initialSignUpData,
	signInData: initialSignInData,

	setVerifying: loading => set({ isVerifying: loading }),
	setVerificationCode: code => set({ verificationCode: code }),

	setSignUpData: data =>
		set(state => ({
			signUpData: { ...state.signUpData, ...data },
		})),
	setSigningUp: loading => set({ isSigningUp: loading }),

	// Loading actions
	setSigningIn: loading => set({ isSigningIn: loading }),
	// Form data actions
	setSignInData: data =>
		set(state => ({
			signInData: { ...state.signInData, ...data },
		})),
	setResettingPassword: loading => set({ isResettingPassword: loading }),

	// Verification actions
	setPendingVerification: (pending, email = '') =>
		set({
			verificationEmail: email,
			verificationCode: '',
			pendingVerification: pending,
		}),

	setGlobalError: error => set({ globalError: error }),

	// Error actions
	setFieldError: (field, error) =>
		set(state => ({
			fieldErrors: {
				...state.fieldErrors,
				[field]: error,
			},
		})),

	resetSignUpForm: () =>
		set({
			verificationEmail: '',
			verificationCode: '',
			signUpData: initialSignUpData,
			pendingVerification: false,
			globalError: '',
			fieldErrors: {},
		}),

	// Reset actions
	resetSignInForm: () =>
		set({
			signInData: initialSignInData,
			globalError: '',
			fieldErrors: {},
		}),

	resetAuthState: () =>
		set({
			verificationEmail: '',
			verificationCode: '',
			signUpData: initialSignUpData,
			signInData: initialSignInData,
			pendingVerification: false,
			isVerifying: false,
			isSigningUp: false,
			isSigningIn: false,
			isResettingPassword: false,
			globalError: '',
			fieldErrors: {},
		}),

	pendingVerification: false,
	isVerifying: false,
	isSigningUp: false,
	// Initial state
	isSigningIn: false,

	isResettingPassword: false,

	globalError: '',

	fieldErrors: {},

	clearFieldError: field =>
		set(state => {
			const newErrors = { ...state.fieldErrors }
			delete newErrors[field]
			return { fieldErrors: newErrors }
		}),

	clearErrors: () => set({ globalError: '', fieldErrors: {} }),
}))
