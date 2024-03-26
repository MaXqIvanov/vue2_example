import * as ENUM from '@/const';
import { NfaServiceType } from '@/const';
import { WalletCurrencyType } from '@/const';

export type icons = Array<string>;

export type networkCryptoCurrency = {
	value: number | null;
	text: string;
};

export type CryptoCurrency = {
	id: number;
	name: string;
	title: string;
	uId: number | null;
	tag: boolean;
	tagName: string | null;
	tagMultiline: boolean;
	tagRegex: string | null;
	addressMultiple: boolean;
	addressPublicKey: boolean;
	addressTagOnly: boolean;
	addressRegex: string | null;
	url: string | null;
	urlTx: string | null;
	urlAddress: string | null;
	uriAmount: boolean;
};

export type CryptoToken = {
	id: number;
	name: string;
	title: string;
	address: string;
	uId: string | null;
	url: string;
	urlTx: string | null;
	urlAddress: string | null;
};

export interface WithdrawalTransactionMethod {
	id: number;
	uId: number | null;
	name: string;
	sortId: number;
	icons: Array<string>;
	transactionMethodType: number;
	minAmount: number | null;
	maxAmount: number | null;
	percFee: number | null;
	absFee: number | null;
	minFee: number | null;
	maxFee: number | null;
	rounding: number;
	decimals: number | null;
	cryptoCurrencyId: CryptoCurrency | number | null;
	cryptoTokenId: CryptoToken | number | null;
}

export interface IActiveWalletData {
	amountValue: string;
	feeFinal: number;
	feeRate: number;
	maxFee: number;
	minFee: number;
	valueWithFee: number;
	withdrawalAddress: string;
}

export interface ISaveWalletData {
	feeFinal: number;
	feeRate: number;
	maxFee: number;
	minFee: number;
}

export type WithdrawalTransactionMethodList = Array<WithdrawalTransactionMethod>;

export interface DepositTransactionMethod extends WithdrawalTransactionMethod {
	address: string | null;
	tag: string | null;
}

export type DepositTransactionMethodList = Array<DepositTransactionMethod>;

export type Wallet = {
	id: number | null;
	currencyId: number;
	currencyName: string;
	currencyTitle: string;
	currencySymbol: string;
	currencyDecimals: number | null;
	currencySortId: number | null;
	currencyType: WalletCurrencyType;
	availableFunds: number | null;
	frozenFunds: number | null;
	suspended: boolean;
	icons: icons;
	rate: number;
	weeklyChangePercent: number;
	dailyChangePercent: number;
	rateCurrencyId: number;
	depositTransactionMethods: DepositTransactionMethodList;
	withdrawalTransactionMethods: WithdrawalTransactionMethodList;
	aliases?: Array<string>;
};

type UserCryptoTransactionDto = {
	id?: number;
	transactionId: number;
	txId?: string;
	cryptoAddress?: string;
	address?: string;
	publicKey?: string;
	tag?: string;
	confirmationCount?: number;
};

type UserTransactionDto = {
	id: number;
	transactionStatus: ENUM.TransactionStatus;
	transactionType: 'deposit' | 'withdrawal';
	userId?: number;
	userName?: string;
	currencyId: number;
	currencyTitle?: string;
	amount: number;
	transactionFee: number;
	details?: string;
	transactionMethodId: number;
	codeId?: number;
	cryptoTransactionId?: number;
	cryptoTransaction: UserCryptoTransactionDto;
	paymentSystemOperationId?: string;
	dateCreated: string;
	dateConfirmed?: string;
	mfaList: MfaListItemDto[];
};

type MfaListItemDto = {
	data: COMMON.IMap<string>;
	mfaServiceType: NfaServiceType;
	section?: string;
	length?: number;
};

export type LastActiveTransport = {
	[key: number]: {
		[key in FormTypeValues]?: number;
	};
};

export type FormTypeKeys = keyof typeof ENUM.FormType;
export type FormTypeValues =
	| ENUM.FormType.DEPOSIT
	| ENUM.FormType.WITHDRAWAL
	| ENUM.FormType.STAKING
	| ENUM.FormType.EXCHANGE;
export type FormTypeList = Array<FormTypeValues>;

export type FlowTypeKeys = keyof typeof ENUM.FlowType;
export type FlowTypeValues =
	| ENUM.FlowType.GET
	| ENUM.FlowType.BUY
	| ENUM.FlowType.TRANSFER
	| ENUM.FlowType.SELL
	| ENUM.FlowType.SWAP;
export type FlowTypeList = Array<FlowTypeValues>;

export type WalletList = Array<Wallet>;

export type CurrentPaymentMethodInfo = {
	avgDiffPercent: number;
	avgPrice: number;
	commission: number;
	limits: {
		maxLimit: number;
		minLimit: number;
	};
	paymentMethod: any;
	paymentMethodId: number;
	predictTime: string;
};

export as namespace WALLETS;
