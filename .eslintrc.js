module.exports = {
	root: true,
	env: {
		node: true
	},
	extends: [
		'plugin:vue/recommended',
		'plugin:prettier-vue/recommended',
		'@vue/typescript/recommended',
		'@vue/prettier/@typescript-eslint'
	],

	settings: {
		'prettier-vue': {
			SFCBlocks: {
				/**
				 * Use prettier to process `<template>` blocks or not
				 *
				 * If set to `false`, remember not to `extends: ['prettier/vue']`, as you need the rules from `eslint-plugin-vue` to lint `<template>` blocks
				 *
				 * @default true
				 */
				template: false,

				/**
				 * Use prettier to process `<script>` blocks or not
				 *
				 * @default true
				 */
				script: true,

				/**
				 * Use prettier to process `<style>` blocks or not
				 *
				 * @default true
				 */
				style: true,

				// Settings for how to process custom blocks
				customBlocks: {
					// Treat the `<docs>` block as a `.markdown` file
					docs: { lang: 'markdown' },

					// Treat the `<config>` block as a `.json` file
					config: { lang: 'json' },

					// Treat the `<module>` block as a `.js` file
					module: { lang: 'js' },

					// Ignore `<comments>` block (omit it or set it to `false` to ignore the block)
					comments: false

					// Other custom blocks that are not listed here will be ignored
				}
			}
		}
	},
	plugins: ['import', 'vue', 'prettier'],
	parserOptions: {
		ecmaFeatures: {
			legacyDecorators: true
		},
		parser: '@typescript-eslint/parser'
	},
	overrides: [
		{
			env: {
				jest: true
			},
			files: ['./tests/unit/**/*'],
			plugins: ['jest'],
			rules: {
				'jest/no-disabled-tests': 'warn',
				'jest/no-focused-tests': 'error',
				'jest/no-identical-title': 'error',
				'jest/prefer-to-have-length': 'warn',
				'@typescript-eslint/no-var-requires': 'off'
			}
		},
		{
			files: ['*.ts', '*.tsx', '*.vue'],
			rules: {
				'@typescript-eslint/explicit-function-return-type': ['error'],
				'@typescript-eslint/no-var-requires': 'off'
			}
		}
	],
	rules: {
		'no-console': 'warn',
		'no-debugger': 'warn',
		'comma-dangle': [
			'error',
			{
				arrays: 'never',
				objects: 'never',
				imports: 'never',
				exports: 'never',
				functions: 'never'
			}
		],
		'max-params': [
			'error',
			{
				max: 4
			}
		],
		// 'arrow-body-style': ['error', 'as-needed'],
		// note you must disable the base rule no-unused-vars as it can report incorrect errors
		'no-unused-vars': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/ban-ts-ignore': ['off'],
		'@typescript-eslint/ban-ts-comment': ['off'],
		'@typescript-eslint/interface-name-prefix': ['off', { prefixWithI: 'always' }],
		'@typescript-eslint/member-delimiter-style': ['off'],
		'@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: true, ignoreProperties: true }],
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				args: 'none'
			}
		],
		'vue/attribute-hyphenation': [
			'error',
			'never',
			{
				ignore: ['is-full-page']
			}
		],
		'vue/html-indent': ['error', 'tab'],
		'vue/max-attributes-per-line': [
			'error',
			{
				multiline: {
					allowFirstLine: false,
					max: 1
				},
				singleline: 2
			}
		],
		'vue/no-v-html': 'error',
		'vue/valid-v-slot': ['error', { allowModifiers: true }]
	}
};
