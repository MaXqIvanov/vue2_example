export type PaymentMethodsInfo = {
	currencyId: string | number;
	name: string;
	buyOffers: PaymentMethod[];
	sellOffers: PaymentMethod[];
};

export type PaymentMethod = {
	PaymentMethodID: string | number;
	limits: PaymentMethodLimits;
	commission: PaymentMethodFees;
	predictTime: Date;
	avgPrice: number;
};

export type PaymentMethodLimits = {
	minAmount: number;
	maxAmount: number;
};

export type PaymentMethodFees = {
	absFee: number;
	percFee: number;
	maxFee: number;
	minFee: number;
};

export type p2pMatchRequisite = {
	cardNumber: number | string;
	name: string;
};

export type p2pBuyMatchRequest = {
	amount?: number;
	currencyId: number;
	PaymentMethodId?: string | number;
	comment: string;
};
export interface p2pBuyMatchResponse extends p2pSellMatchResponse {
	requisite: p2pMatchRequisite[];
}

export interface p2pSellMatchRequest extends p2pBuyMatchRequest {
	requisite: p2pMatchRequisite[];
}
export type p2pSellMatchResponse = {
	tradeId: string;
	quoteCurrencyAmount: number;
	baseCurrencyAmount: number;
	exchangeRate: number;
	paymentMethod: string;
	conversationId: string;
};

export as namespace SEAMLESS;
