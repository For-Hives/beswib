import reactHooksPlugin from 'eslint-plugin-react-hooks'

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import noOnlyTestsPlugin from 'eslint-plugin-no-only-tests'
import queryPlugin from '@tanstack/eslint-plugin-query'
import perfectionist from 'eslint-plugin-perfectionist'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import nextPlugin from '@next/eslint-plugin-next'
import promisePlugin from 'eslint-plugin-promise'
import tsParser from '@typescript-eslint/parser'
import * as espree from 'espree'

// Configuration commune des règles
const baseRules = {
	'react-hooks/exhaustive-deps': 'off',
	'prettier/prettier': 'error',
	'no-only-tests/no-only-tests': 'error',
	'no-console': ['error', { allow: ['warn', 'error', 'info', 'debug'] }],
	'@next/next/no-img-element': 'off',
	...nextPlugin.configs.recommended.rules,
	...nextPlugin.configs['core-web-vitals'].rules,
	'promise/always-return': 'off',
	'jsx-a11y/anchor-has-content': 'off',
	'jsx-a11y/alt-text': 'off',
}

// Configuration commune des règles perfectionist
const perfectionistRules = {
	'perfectionist/sort-objects': [
		'warn',
		{
			type: 'natural',
			order: 'desc',
		},
	],
	'perfectionist/sort-imports': [
		'error',
		{
			type: 'line-length',
			order: 'desc',
			newlinesBetween: 'always',
			internalPattern: ['@/app/.*', '@/components/.*', '@/lib/.*', '@/models/.*', '@/services/.*', '@/constants/.*'],
			groups: [
				'type',
				'react',
				'nanostores',
				['builtin', 'external'],
				'internal-type',
				'internal',
				['parent-type', 'sibling-type', 'index-type'],
				['parent', 'sibling', 'index'],
				'side-effect',
				'style',
				'object',
				'unknown',
			],
			customGroups: {
				value: {
					react: ['react', 'react-*'],
					nanostores: '@nanostores/.*',
				},
				type: {
					react: 'react',
				},
			},
		},
	],
	'perfectionist/sort-enums': [
		'error',
		{
			type: 'natural',
			order: 'desc',
		},
	],
}

// Plugins communs
const basePlugins = {
	reactHooks: reactHooksPlugin,
	perfectionist,
	'no-only-tests': noOnlyTestsPlugin,
	jsxA11y: jsxA11yPlugin,
	'@next/next': nextPlugin,
}

// Options communes du parser
const baseParserOptions = {
	sourceType: 'module',
	ecmaVersion: 'latest',
	ecmaFeatures: { jsx: true },
}

export default [
	//	perfectionist.configs['recommended-natural'],
	eslintPluginPrettierRecommended,
	...queryPlugin.configs['flat/recommended'],
	promisePlugin.configs['flat/recommended'],

	// Configuration pour JavaScript
	{
		rules: {
			...baseRules,
			...perfectionistRules,
		},
		plugins: basePlugins,
		languageOptions: {
			parserOptions: baseParserOptions,
			parser: espree,
		},
		files: ['**/*.{js,jsx,mjs,cjs}'],
	},

	// Configuration pour TypeScript
	{
		rules: {
			...baseRules,
			...perfectionistRules,
			// Règles TypeScript spécifiques
			...tsPlugin.configs.recommended.rules,
			...tsPlugin.configs['recommended-type-checked'].rules,
			'@typescript-eslint/strict-boolean-expressions': 'warn',
			'@typescript-eslint/prefer-optional-chain': 'error',
			'@typescript-eslint/prefer-nullish-coalescing': 'error',
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/no-unsafe-member-access': 'warn',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-unnecessary-type-assertion': 'error',
			'@typescript-eslint/no-explicit-any': 'warn',
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			...basePlugins,
		},
		languageOptions: {
			parserOptions: {
				...baseParserOptions,
				project: './tsconfig.json',
			},
			parser: tsParser,
		},
		files: ['**/*.{ts,tsx}'],
	},
]
