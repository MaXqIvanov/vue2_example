export type TranslateMeta = {
	message: string;
	options?: {
		[key: string]: string;
	};
};

export interface IMap<T> {
	[key: string]: T;
}

export type BooleanError = {
	error: boolean;
};

export type FieldsErrors = {
	[key: string]: TranslateMeta;
};

interface Rule {
	name: string;
	args: any[];
}

interface ValidationError extends Error {
	rule: Rule;
	value: any;
	cause: ValidationError[] | null;
	target?: string;
}

export type ValidationRule = {
	rule: (field: any, ...args: unknown[]) => FieldsErrors;
	field?: any;
	args?: unknown[];
};

export type User = {
	firstName: string;
	email: string;
	userName: string;
	lastName: string;
	twoFa: boolean;
	default2FaMethod: string;
	localization: string;
	language: string;
	emailConfirmed: boolean;
	ipConfirmed: boolean;
	phoneConfirmed: boolean;
	birthday: string;
	gender: string;
	verificationStatus: string;
	verificationComment: string;
	telegramStatus: string;
	timeZone: string;
	telegramBotList: [
		{
			botType: string;
			telegramStatus: string;
			claims: string[];
		}
	];
	securityCode: string;
	emailBodyType: string;
	walletId: string;
	havePassword: boolean;
};

export interface Currency {
	aliases: string | Array<string> | null;
	decimals: number;
	icon: null | string;
	id: number;
	isEnabled: boolean;
	name: string;
	serviceFee: number;
	title: string;
	type: 'Fiat' | 'Cryptocurrency';
}

export interface IEventBase {
	target: { value: string };
	clipboardData: { getData: (T: string) => string };
	preventDefault: () => void;
	which: number;
	keyCode: number;
	ctrlKey: string;
}

export as namespace COMMON;
