import {
	AddressStatus,
	CodeStatus,
	CurrencyType,
	OperationSide,
	OperationType,
	OperationTypeFilter,
	ReferralOperationType,
	TransactionMethodType,
	TransactionStatus,
	TransactionType,
	WalletCurrencyType
} from '@/const';

export type Address = {
	active: boolean;
	address: string;
	amount: number;
	cryptoCurrencyId: number;
	cryptoTokenId: string | null;
	currencyId: number;
	currencyTitle: string;
	dateCreated: string;
	id: number;
	isUsed: boolean;
	label: string | null;
	network: string;
	publicKey: string | null;
	tag: string | null;
	tagMessage: string | null;
	transactions: any[];
	transactionsCount: number;
	currencyWhichUseAddress: any[];
	notPinned?: boolean;
};

export type Transaction = {
	id: number;
	userId: number;
	side: OperationSide;
	amount: number;
	fee: number;
	convertData?: { price: number; fromCurrencyId: number; resultCurrencyId: number };
	dateCreated: string;
	currencyId: number;
	currencyTitle: string;
	method: string;
	operationType: OperationType;
	orderId: number;
	frozen: boolean;
	transactionData: TransactionData;
	p2PTransactionData: P2PTransactionData;
	referralOperation: ReferralOperation;
	orderData: OrderData;
	transactionStatus: number;
	details?: string;
};

export type TransactionData = {
	cryptoTxId: string;
	urlTx: string;
	urlAddress: string;
	destination: string;
	destinationPublicKey: string;
	destinationTag: string;
	confirmedForUse: boolean;
	details: string;
	comment: string;
	method: string;
	transactionMethodId: number;
	transactionMethodType: TransactionMethodType;
	transactionStatus: TransactionStatus;
	transactionType: TransactionType;
	dateExpiration: string;
	code: string;
	codeStatus: CodeStatus;
	codeExparationDate: string;
	codeRecipient: string;
	codeCreator: string;
	data: string;
	uId: string;
	internal: boolean;
};

export type UserTransaction = {
	amount: number;
	codeId?: number;
	codeStatus?: number;
	confirmations: number;
	currencyId: number;
	currencyName: string;
	currencyTitle: string;
	dateCreated: number;
	destination: string;
	details?: string;
	direction: number;
	iconType: string;
	id: number;
	message: string;
	messageData: {
		amount: number;
		currencyName: string;
		side: string;
	};
	operationType: OperationTypeFilter;
	side: number;
	status: number;
	transactionData: {
		transactionStatus: number;
		transactionType: number;
		cryptoTxId?: string;
	};
	transactionFee: number;
	fee?: number;
	transactionId: number;
	transactionMethod: number;
	frozen?: boolean;
};

export type P2PTransactionData = {
	depositId: number;
	tradeId: number;
	groupChatInfo: {
		id: number;
		name: string;
		dateCreated: string;
		advertisementId: number;
	};
	tradeInfo: {
		giveCurrencyId: number;
		getCurrencyId: number;
		giveCurrencyTitle: string;
		getCurrencyTitle: string;
		paymentMethodId: number;
		paymentMethodName: string;
	};
};

export type Operation = {
	amount: number;
	convertData: number | null;
	currencyId: number;
	currencyTitle: string;
	dateCreated: string;
	fee: string;
	frozen: boolean;
	id: number;
	method: string;
	operationType: OperationType;
	orderData: OrderData;
	orderId: null | number;
	p2PTransactionData: P2PTransactionData;
	referralOperation: ReferralOperation;
	userId: null;
	transactionStatus: number;
};

export type ReferralOperation = {
	p2PDepositId: number;
	tradeId: number;
	fromUserId: number;
	type: ReferralOperationType;
};

export type OrderData = {
	orderQty: number;
	leavesQty: number;
	price: number;
	totalPrice: number;
	averagePrice: number;
	filled: number;
	orderSide: number;
	orderStatus: number;
	orderType: number;
	marketId: number;
};

export type Currencies = {
	aliases: Array<string>;
	decimals: number;
	icon: string;
	id: number;
	isEnabled: boolean;
	name: string;
	serviceFee: number;
	title: string;
	type: CurrencyType;
};

export type TransactionsFilter = {
	dateCreatedFrom: string;
	dateCreatedTo: string;
	currencyId: number | null;
	operationType: OperationTypeFilter | null;
	transactionStatusList: Array<number>;
	cryptoCurrencyIdList: Array<number>;
};

export type AddressesFilter = {
	dateFrom: string;
	dateTo: string;
	currencyId: number | null;
	transactionsCountFrom: string;
	transactionsCountTo: string;
	cryptoCurrencyId: number | null;
	status: AddressStatus | string;
};

export type AddressesSort = {
	sortDesc: boolean;
	sort: string;
};

export type CurrencyListItem = {
	id?: number | null;
	name?: string;
	title: string;
	type?: WalletCurrencyType;
};

export as namespace HISTORY;
