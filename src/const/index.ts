import { getDateFull } from '@/utils/utils';

export enum FormType {
	DEPOSIT = 'deposit',
	WITHDRAWAL = 'withdrawal',
	STAKING = 'staking',
	EXCHANGE = 'exchange'
}

export enum MfaServiceType {
	Email = 'Email',
	TelegramBot = 'TelegramBot',
	Google = 'Google',
	SMS = 'SMS',
	Codes = 'Codes',
	Question = 'Question',
	U2F = 'U2F',
	GPA = 'GPA',
	Password = 'Password'
}

export enum FlowType {
	GET = 'get',
	BUY = 'buy',
	TRANSFER = 'transfer',
	SELL = 'sell',
	SWAP = 'swap'
}

export enum P2pDealType {
	Buy = 'buy',
	Sell = 'sell',
	Swap = 'swap'
}

export enum CurrencyType {
	Cryptocurrency = 'Cryptocurrency',
	Fiat = 'Fiat'
}

export const CurrencyTypeIconNamespace = {
	[CurrencyType.Cryptocurrency]: 'currency',
	[CurrencyType.Fiat]: 'fiat'
} as const;

export enum WalletCurrencyType {
	Cryptocurrency = 1,
	Fiat = 0
}

export const WalletCurrencyTypeIconNamespace = {
	[WalletCurrencyType.Cryptocurrency]: 'currency',
	[WalletCurrencyType.Fiat]: 'fiat'
} as const;

export enum CurrencyTypeIota {
	Fiat,
	Cryptocurrency
}

// NFA = N-factor authentication
export enum NfaServiceType {
	Email,
	TelegramBot,
	Google,
	SMS,
	Codes,
	Question,
	U2F,
	GPA,
	Password
}

export enum User2faSettings {
	SIGN_IN = 1,
	TRANSACTION = 2,
	API_KEYS = 4,
	IP_WHITE_LIST = 8,
	P2P = 16,
	RECOVER_PASSWORD = 32
}

export enum MfaSectionsIota {
	SignIn,
	Withdrawal,
	Security,
	ApiKey,
	Notifications
}

export enum ContentVariableType {
	TRANSLATION = 'translation',
	IMAGE = 'image',
	ICON = 'icon'
}

export enum TransactionStatus {
	awaitingConfirmation = 0, // 'Ожидается подтверждение'  Awaiting confirmation from remote service. Money sent
	processing = 1, // 'Обработка', Awaiting processing by remote service. Money sent
	completed = 2, // 'Завершена', OK
	cancelled = 3, // 'Отменена', Deleted (only for AwaitingConfirmation or AwaitingManualCheck)
	declined = 4, // 'Отклонена', Error
	adminCheck = 5, // 'Проверяется администратором', Need to check (error, etc.) Money in frozen
	inQueue = 7, // 'В очереди', Transaction in queue
	awaitingManualCheck = 8, // 'Подтверждение администратором', Awaiting admin for manual deposit and withdrawal. Money in frozen
	awaitingUserConfirmation = 9, // 'Ожидает подтверждения пользователем', Waiting user to send confirmation code that has been sent to his email.
	adminProcessing = 10, // 'Обработка администратором', Checking by admin
	needContactSupport = 11 // 'Свяжитесь с поддержкой', Свяжитесь со службой поддержки`
}

export const TransactionCompletedStatus = [
	TransactionStatus.completed,
	TransactionStatus.cancelled,
	TransactionStatus.declined
];

export const TransactionStatusFilter = {
	awaitingConfirmation: [0],
	processing: [1, 5, 7, 8, 10],
	completed: [2],
	cancelled: [3],
	declined: [4],
	awaitingUserConfirmation: [9],
	contactSupport: [11]
};

export enum WalletsFields {
	MinimumLimit = 'minimumLimit',
	MaximumLimit = 'maximumLimit',
	LessThanFee = 'lessThanFee',
	AvailableBalance = 'availableBalance',
	AddressIsEmpty = 'addressIsEmpty',
	AddressWrongNetwork = 'addressWrongNetwork',
	PublicKeyIsEmpty = 'publicKeyIsEmpty',
	TagIsEmpty = 'tagIsEmpty',
	TagWrong = 'tagWrong',
	CommentIsEmpty = 'commentIsEmpty'
}

export enum DealStatuses {
	Created = 'Created',
	MFASent = 'MFASent',
	FundsFreezeConfirmation = 'FundsFreezeConfirmation',
	FundsFrozen = 'FundsFrozen',
	FiatSent = 'FiatSent',
	Refused = 'Refused',
	Terminated = 'Terminated',
	Cancelled = 'Cancelled',
	Completed = 'Completed',
	TimeoutArbitrator = 'TimeoutArbitrator',
	ArbitratorRequired = 'ArbitratorRequired',
	ArbitratorEntered = 'ArbitratorEntered'
}

export const HISTORY_TABLE_LIMIT = 9;

export const HISTORY_TABLE_TYPE = {
	TRANSACTIONS: 'transactions',
	ADDRESSES: 'addresses',
	DEALS: 'deals'
};
export const renderDateKey = {
	[HISTORY_TABLE_TYPE.TRANSACTIONS]: 'dateCreated',
	[HISTORY_TABLE_TYPE.ADDRESSES]: 'dateCreated',
	[HISTORY_TABLE_TYPE.DEALS]: 'createdAt'
};

export const getTableDataXSReduceCallback =
	(dateFormatKey: string, locale: string) =>
	(acc: COMMON.IMap<any>, current: any): any => {
		const yearMonthDayKey = getDateFull(current[dateFormatKey], locale);
		acc[yearMonthDayKey] ? acc[yearMonthDayKey].push(current) : (acc[yearMonthDayKey] = [current]);
		return acc;
	};

export const CURRENT_YEAR = new Date().getFullYear();

export const statusColorVariables = [
	{
		name: 'codeStatus',
		type: 'array',
		defaultValue: [
			'var(--status-warning-darken)',
			'var(--status-warning-darken)',
			'var(--status-success-darken)',
			'var(--status-error-darken-2)',
			'var(--status-error-darken-2)',
			'var(--status-warning-darken)',
			'inherit',
			'var(--status-warning-darken)',
			'var(--status-warning-darken)',
			'var(--primary-lighten)',
			'var(--status-warning-darken)',
			'var(--primary-lighten)'
		]
	}
] as const;

export const statusTradesName = {
	[DealStatuses.Created]: 'balance.waiting',
	[DealStatuses.MFASent]: 'balance.confirmationCodeSent',
	[DealStatuses.FundsFreezeConfirmation]: 'balance.waitingForConfirmation',
	[DealStatuses.FundsFrozen]: 'balance.waitingForConfirmation',
	[DealStatuses.FiatSent]: 'balance.waitingForConfirmation',
	[DealStatuses.Completed]: 'balance.completed',
	[DealStatuses.Cancelled]: 'balance.canceled',
	[DealStatuses.Terminated]: 'balance.canceled',
	[DealStatuses.Refused]: 'balance.canceled',
	[DealStatuses.TimeoutArbitrator]: 'balance.arbitration',
	[DealStatuses.ArbitratorRequired]: 'balance.arbitration',
	[DealStatuses.ArbitratorEntered]: 'balance.arbitration',
	none: ''
} as const;

export const statusTradesColor = {
	[DealStatuses.Created]: 'var(--status-warning-darken)',
	[DealStatuses.MFASent]: 'var(--status-success-darken)',
	[DealStatuses.FundsFreezeConfirmation]: 'var(--status-success-darken)',
	[DealStatuses.FundsFrozen]: 'var(--status-success-darken)',
	[DealStatuses.FiatSent]: 'var(--status-success-darken)',
	[DealStatuses.Completed]: 'var(--status-success-darken)',
	[DealStatuses.Cancelled]: 'var(--status-error-darken)',
	[DealStatuses.Terminated]: 'var(--status-error-darken)',
	[DealStatuses.Refused]: 'var(--status-error-darken)',
	[DealStatuses.TimeoutArbitrator]: 'var(--status-error-darken)',
	[DealStatuses.ArbitratorRequired]: 'var(--status-error-darken)',
	[DealStatuses.ArbitratorEntered]: 'var(--status-error-darken)',
	none: ''
} as const;

export const positiveNegativecolorVariables = [
	{
		name: 'positive',
		type: 'string',
		defaultValue: 'var(--status-success-darken)'
	},
	{
		name: 'negative',
		type: 'string',
		defaultValue: 'var(--status-error-darken)'
	}
] as const;

export enum OperationType {
	Transaction = 2,
	Referral = 3,
	P2P = 4,
	Paramining = 6,
	Convert = 12,
	TransactionFee = 8
}

export enum OperationTypeFilter {
	Deposit = 'deposit',
	Withdrawal = 'withdrawal',
	Transaction = '2',
	Referral = '3',
	P2P = '4',
	Paramining = '6',
	Convert = '12'
}

export enum OperationSide {
	In = 0,
	Out = 1
}

export enum TransactionMethodType {
	Undefined = 0,
	GenesisPay = 1,
	AdvCash = 2,
	Code = 3,
	Manual = 4,
	Blockchain = 5,
	Admin = 6,
	CryptomatFee = 7,
	Payment = 8,
	Internal = 9
}

export enum TransactionType {
	Deposit = 0,
	Withdrawal = 1
}

export enum CodeStatus {
	Active = 0,
	Expired = 1,
	Redeemed = 2,
	Unconfirmed = 3,
	Canceled = 4,
	Merged = 5,
	Blocked = 6,
	Devided = 7
}

export enum ReferralOperationType {
	Trade = 0,
	P2P = 1,
	Paramining = 2
}

export const BALANCE_ALL_TEXT = 'balance';

export const BALANCE_TEXT = {
	allEvents: `${BALANCE_ALL_TEXT}.allEvents`,
	operationType: `${BALANCE_ALL_TEXT}.operationType-`,
	networkFilterTitle: `${BALANCE_ALL_TEXT}.networkFilterTitle`,
	max: `${BALANCE_ALL_TEXT}.max`,
	min: `${BALANCE_ALL_TEXT}.min`,
	commissionRate: `${BALANCE_ALL_TEXT}.commissionRate`
};

export const RouteName = {
	BalanceWallet: 'balance-wallets',
	BalanceCurrency: 'balance-currency',
	BalanceActiveForm: 'balance-activeForm',
	BalanceGetForm: 'balance-get-form',
	BalanceBuyForm: 'balance-buy-form',
	BalanceTransferForm: 'balance-transfer-form',
	BalanceSellForm: 'balance-sell-form',
	BalanceExchangeForm: 'balance-exchange-form',
	BalanceSellFormThirdStep: 'balance-sell-form-third-step',
	BalanceBuyFormThirdStep: 'balance-buy-form-third-step',
	BalanceBuyFormFourthStep: 'balance-buy-form-fourth-step',
	BalanceSellFormFourthStep: 'balance-sell-form-fourth-step',
	BalanceFormDoAction: 'balance-form-do-action',
	BalanceFormProcess: 'balance-form-process',
	BalanceFormSuccess: 'balance-form-success',
	BalanceFormFail: 'balance-form-fail'
};

export const MAX_AMOUNT_CHIP_IN_SELECTOR = {
	desktop: 4,
	mob: 3
};

export const DEFAULT_DECIMALS = 8;

export const STAKING_SHOW_BALANCE_VARIABLES = [
	{
		name: 'colorShowBalance',
		type: 'string',
		defaultValue: 'var(--status-success-darken)'
	},
	{
		name: 'colorHideBalance',
		type: 'string',
		defaultValue: 'var(--tertiary-darken-2)'
	}
];

export const MAX_WIDTH_TRANSFER_BALANCE = 350;
export const MAX_LENGTH_AVAILABLE_EQUIVALENT = 9;

export enum AddressesFilterData {
	DateFrom = 'dateFrom',
	DateTo = 'dateTo',
	CurrencyId = 'currencyId',
	TransactionsCountFrom = 'transactionsCountFrom',
	CryptoCurrencyId = 'cryptoCurrencyId'
}

export enum TransactionsFilterData {
	DateCreatedFrom = 'dateCreatedFrom',
	DateCreatedTo = 'dateCreatedTo',
	CurrencyId = 'currencyId',
	OperationType = 'operationType',
	TransactionStatusList = 'transactionStatusList',
	CryptoCurrencyIdList = 'cryptoCurrencyIdList'
}

export enum LocaleStorageItems {
	ActiveWallet = 'activeWallet'
}

export enum FormField {
	Question = 'Question',
	Email = 'Email',
	TelegramBot = 'TelegramBot',
	Google = 'Google',
	SMS = 'SMS',
	Codes = 'Codes',
	U2F = 'U2F',
	GPA = 'GPA',
	Password = 'Password'
}

export enum SCREENSIZE {
	XS = 'xs',
	SM = 'sm',
	MD = 'md',
	LG = 'lg',
	XL = 'xl'
}

export enum AddressStatus {
	AllStatus = 'allStatus',
	Basic = 'basic',
	Pinned = 'pinned'
}
