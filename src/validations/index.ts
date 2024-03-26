import v8n from 'v8n';

export const SIMPLE_CRYPTO_REGEX_STRING = '^[a-zA-Z0-9:-]{8,84}$';
export const SIMPLE_MEMO_REGEX_STRING = '^[a-zA-Z0-9:-]{4,20}$';

export const minimumLimitRules = {
	fn: (field: string, ...args: unknown[]): COMMON.ValidationError[] =>
		v8n().not.empty().greaterThanOrEqual(args[0]).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		greaterThanOrEqual: 'balance.minWithdrawalLimitIsGreaterAmount'
	}
};

export const maximumLimitRules = {
	fn: (field: string, ...args: unknown[]): COMMON.ValidationError[] =>
		v8n().not.empty().lessThanOrEqual(args[0]).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		lessThanOrEqual: 'balance.maxLimitIsLessAmount'
	}
};

export const fromAmountRules = {
	fn: (field: string, ...args: unknown[]): COMMON.ValidationError[] =>
		v8n().not.empty().lessThanOrEqual(args[0]).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		lessThanOrEqual: 'balance.fromFundsLessThanFundToSend'
	}
};

export const minimumLimitShortRules = {
	fn: (field: string, ...args: unknown[]): COMMON.ValidationError[] =>
		v8n().not.empty().greaterThanOrEqual(args[0]).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		greaterThanOrEqual: 'balance.minLimitIsGreaterAmount'
	}
};

export const maximumLimitShortRules = {
	fn: (field: string, ...args: unknown[]): COMMON.ValidationError[] =>
		v8n().not.empty().lessThanOrEqual(args[0]).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		lessThanOrEqual: 'balance.maxLimitIsLessAmountNoParams'
	}
};

export const moreThanFeeRules = {
	fn: (field: string, ...args: unknown[]): COMMON.ValidationError[] =>
		v8n().not.empty().greaterThan(args[0]).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		greaterThan: 'balance.feeIsGreaterAmount'
	}
};

export const balanceRules = {
	fn: (field: string, ...args: unknown[]): COMMON.ValidationError[] =>
		v8n().not.empty().lessThanOrEqual(args[0]).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		lessThanOrEqual: 'balance.balanceExceeded'
	}
};

export const notEmtyRules = {
	fn: (field: string, ...args: unknown[]): COMMON.ValidationError[] => v8n().not.empty().testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty'
	}
};

export const QuestionRules = {
	fn: (field: string): COMMON.ValidationError[] => v8n().not.empty().length(1, 100).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		length: 'balance.wrongCodeLength'
	},
	length: 100
};

export const EmailRules = {
	fn: (field: string): COMMON.ValidationError[] => v8n().not.empty().length(1, 6).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		length: 'balance.wrongCodeLength'
	},
	length: 6
};

export const TelegramBotRules = {
	fn: (field: string): COMMON.ValidationError[] => v8n().not.empty().length(1, 6).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		length: 'balance.wrongCodeLength'
	},
	length: 6
};

export const GoogleRules = {
	fn: (field: string): COMMON.ValidationError[] => v8n().not.empty().length(1, 8).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		length: 'balance.wrongCodeLength'
	},
	length: 8
};

export const SMSRules = {
	fn: (field: string): COMMON.ValidationError[] => v8n().not.empty().length(1, 6).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		length: 'balance.wrongCodeLength'
	},
	length: 6
};

export const CodesRules = {
	fn: (field: string): COMMON.ValidationError[] => v8n().not.empty().length(1, 10).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		length: 'balance.wrongCodeLength'
	},
	length: 10
};

export const U2FRules = {
	fn: (field: string): COMMON.ValidationError[] => v8n().not.empty().length(1, 100).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		length: 'balance.wrongCodeLength'
	},
	length: 100
};

export const GPARules = {
	fn: (field: string): COMMON.ValidationError[] => v8n().not.empty().length(1, 100).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		length: 'balance.wrongCodeLength'
	},
	length: 100
};

export const PasswordRules = {
	fn: (field: string): COMMON.ValidationError[] => v8n().not.empty().length(1, 6).testAll(field),
	errors: {
		empty: 'balance.fieldIsEmpty',
		length: 'balance.wrongCodeLength'
	},
	length: 6
};
