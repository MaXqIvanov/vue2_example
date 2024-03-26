export type PasswordComplexityInfo = {
	text: string;
	color: string;
	error: 0 | 100;
	warning: 0 | 100;
	success: 0 | 100;
	none?: 0 | 100;
	css?: string;
	icon?: string;
};

export type PasswordRequirements = {
	length: boolean;
	letters: boolean;
	symbol: boolean;
};

export type EncodePasswordParams = {
	identificator?: string;
	password: string;
	algorithm?: 'old' | 'base';
};

export type WhiteListMfa = {
	id: number;
	mfaList: {
		data: COMMON.IMap<string>;
		mfaServiceType: string;
	}[];
};

export as namespace SECURITY;
