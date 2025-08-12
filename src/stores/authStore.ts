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
	email: '',
	password: '',
}

const initialSignUpData = {
	firstName: '',
	lastName: '',
	email: '',
	password: '',
	confirmPassword: '',
}

export const useAuthStore = create<AuthState>((set, get) => ({
	// Initial state
	isSigningIn: false,
	isSigningUp: false,
	isVerifying: false,
	isResettingPassword: false,
	
	signInData: initialSignInData,
	signUpData: initialSignUpData,
	
	globalError: '',
	fieldErrors: {},
	
	pendingVerification: false,
	verificationEmail: '',
	verificationCode: '',
	
	// Form data actions
	setSignInData: (data) =>
		set((state) => ({
			signInData: { ...state.signInData, ...data },
		})),
	
	setSignUpData: (data) =>
		set((state) => ({
			signUpData: { ...state.signUpData, ...data },
		})),
	
	// Error actions
	setFieldError: (field, error) =>
		set((state) => ({
			fieldErrors: {
				...state.fieldErrors,
				[field]: error,
			},
		})),
	
	setGlobalError: (error) => set({ globalError: error }),
	
	clearErrors: () => set({ globalError: '', fieldErrors: {} }),
	
	clearFieldError: (field) =>
		set((state) => {
			const newErrors = { ...state.fieldErrors }
			delete newErrors[field]
			return { fieldErrors: newErrors }
		}),
	
	// Loading actions
	setSigningIn: (loading) => set({ isSigningIn: loading }),
	setSigningUp: (loading) => set({ isSigningUp: loading }),
	setVerifying: (loading) => set({ isVerifying: loading }),
	setResettingPassword: (loading) => set({ isResettingPassword: loading }),
	
	// Verification actions
	setPendingVerification: (pending, email = '') =>
		set({
			pendingVerification: pending,
			verificationEmail: email,
			verificationCode: '',
		}),
	
	setVerificationCode: (code) => set({ verificationCode: code }),
	
	// Reset actions
	resetSignInForm: () =>
		set({
			signInData: initialSignInData,
			fieldErrors: {},
			globalError: '',
		}),
	
	resetSignUpForm: () =>
		set({
			signUpData: initialSignUpData,
			fieldErrors: {},
			globalError: '',
			pendingVerification: false,
			verificationEmail: '',
			verificationCode: '',
		}),
	
	resetAuthState: () =>
		set({
			isSigningIn: false,
			isSigningUp: false,
			isVerifying: false,
			isResettingPassword: false,
			signInData: initialSignInData,
			signUpData: initialSignUpData,
			globalError: '',
			fieldErrors: {},
			pendingVerification: false,
			verificationEmail: '',
			verificationCode: '',
		}),
}))