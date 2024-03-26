import { Getter, State } from 'vuex-simple';
import { getStore } from '@/store/store';
import Vue from 'vue';
import {
	FormType,
	FlowType,
	NfaServiceType,
	TransactionStatus,
	WalletsFields,
	WalletCurrencyTypeIconNamespace,
	WalletCurrencyType,
	MfaSectionsIota,
	CurrencyType,
	LocaleStorageItems,
	DealStatuses
} from '@/const';
import {
	minimumLimitRules,
	maximumLimitRules,
	balanceRules,
	notEmtyRules,
	moreThanFeeRules,
	QuestionRules,
	EmailRules,
	TelegramBotRules,
	GoogleRules,
	SMSRules,
	CodesRules,
	U2FRules,
	GPARules,
	PasswordRules,
	minimumLimitShortRules,
	maximumLimitShortRules,
	fromAmountRules
} from '@/validations';
import {
	convertExponentialToDecimal,
	encodePassword,
	findTheNumberOfNumbersAfterTheDecimalPoint,
	inputMask
} from '@/utils/utils';

import HistoryModule from '@/store/modules/historyModule';

import getRouter from '@/router/router';

const ROUND_TYPES = {
	USUAL: 0,
	TO_MORE: 1,
	TRUNC: 2
};

const $roundDecimals = ({
	number,
	maxDecimal = 0,
	roundType = ROUND_TYPES.USUAL
}: {
	number: number;
	maxDecimal: number;
	roundType?: number;
}): number => {
	// TODO: Need number check
	if (Number.isInteger(number)) {
		return number;
	}

	const numberToString = number.toString().split('.').pop() || '';

	let exp = 0;
	if (number.toString().includes('e')) {
		exp = Number(number.toString().split('e').pop());
	}
	const decimal = numberToString.length + Math.abs(exp);

	if (decimal && decimal <= maxDecimal) {
		return number;
	}
	const power = 10 ** maxDecimal;
	const poweredNumber = number * power;

	switch (roundType) {
		case ROUND_TYPES.TO_MORE:
			return Math.ceil(poweredNumber) / power;
		case ROUND_TYPES.TRUNC:
			return Math.trunc(poweredNumber) / power;

		case ROUND_TYPES.USUAL:
		default:
			return Math.round(poweredNumber) / power;
	}
};

let instance: WalletModule | null = null;

export default class WalletModule {
	private store = getStore();
	protected historyModule = HistoryModule.getInstance();
	private router = getRouter();
	private globalRouter = this.store.state.appRouter.globalRouter;
	private http = this.store.state.api.api.createHttpClient({});
	private validation = this.store.state.validation.api;
	private optimization = this.store.state.optimization.api;
	private workersService = this.store.state.workersService.api;
	private configsModule = this.store.state.configs.api;
	public storageModule = this.store.state.localeStorage.api;
	private notificationChat = this.store.state.chats.api.getChannelById('notification');
	public sharedData = this.store.state.sharedData.api;
	// private appRouter = getRouter();

	static getInstance(): WalletModule {
		return instance || new WalletModule();
	}

	constructor() {
		if (instance) return instance;
		instance = this;

		if (this.getWorker) {
			this.getWorker.onmessage = (event: { data: Record<number, boolean> }): void => {
				this.showedWallets = event.data;
			};
		}

		this.notificationChat.addMessageListener(
			'NEW_DEAL_STATUS',
			async (response: any) => {
				if (response) {
					this.tradeRecord =
						response.Status === DealStatuses.Completed ||
						response.Status === DealStatuses.Refused ||
						response.Status === DealStatuses.Cancelled
							? {
									...this.tradeRecord,
									[response.TradeId]: {
										...(this.tradeRecord[response.TradeId] || {}),
										status: response.Status,
										endedAt: Date.now()
									}
							  }
							: {
									...this.tradeRecord,
									[response.TradeId]: {
										...(this.tradeRecord[response.TradeId] || {}),
										status: response.Status
									}
							  };

					this.historyModule.updateDeal({ tradeId: response.TradeId, status: response.Status });

					if (
						this.router.currentRoute.name &&
						['balance-form-do-action', 'balance-form-process', 'balance-form-success', 'balance-form-fail'].includes(
							this.router.currentRoute.name
						)
					) {
						const paymentMethodId = this.tradeRecord[response.TradeId]?.paymentMethod?.id;
						if ((!paymentMethodId && paymentMethodId !== 0) || !this.tradeRecord[response.TradeId]?.cryptoBuyer) {
							await this.getP2PTradeById(response.TradeId);
						}
						this.goToSeamlessViewByP2PStatus(response.Status, response.TradeId);
					}
				}
			},
			'seamlessBalance'
		);
	}

	@State()
	public NfaServiceType?: any = [];

	@State()
	public confirmWithdrawalErrors?: any;

	@State()
	public activeForm!: WALLETS.FormTypeValues;

	@State()
	public activeFlow: Record<FormType.DEPOSIT | FormType.WITHDRAWAL | FormType.EXCHANGE, WALLETS.FlowTypeValues> = {
		[FormType.DEPOSIT]: FlowType.GET,
		[FormType.WITHDRAWAL]: FlowType.TRANSFER,
		[FormType.EXCHANGE]: FlowType.SWAP
	};

	@State()
	public staking: any = [];

	@State()
	public activeWallet?: WALLETS.Wallet;

	@State()
	public lastActiveTransports: WALLETS.LastActiveTransport = {};

	@State()
	public walletsData: any = {};

	@State()
	public activeTransport?: WALLETS.DepositTransactionMethod | WALLETS.WithdrawalTransactionMethod;

	@State()
	public useCommentWithdrawal: boolean = false;

	@State()
	public lastTransactionData?: WALLETS.UserTransactionDto;

	@State()
	public confirmedTransactionData?: WALLETS.UserTransactionDto;

	@State()
	public confirmWithdrawalOffer: boolean = false;

	@State()
	public confirmCancelDeal: boolean = false;

	@State()
	public confirmWithdrawalModal: boolean = false;

	@State()
	public confirmedWithdrawalModal: boolean = false;

	@State()
	public showCancelWithdrawalModal: boolean = false;

	@State()
	public withdrawalCodes: Record<string, number | string> = {};

	@State()
	public currencies?: any;

	@State()
	public markets?: any;

	@State()
	public errors: Record<number | string, COMMON.FieldsErrors> = {};

	@State() /* key: string is actually key in keof typeof NfaServiceType, though I face issue of [x: number] as key after such an iteration */
	public confirmErrors?: { [key: string]: string };

	@State()
	public walletSearch: string = '';

	@State()
	public cumulativeBalance?: any;

	@State()
	public loadingWallets: boolean = true;

	@State()
	public blockchainInProcess: boolean = false;

	@State()
	public currentFrequency: number = 0;

	@State()
	public autoEditMode: boolean = false;

	@State()
	public autoWithdrawalsList: Array<any> = [];

	@State()
	public autoWithdrawalPerPage: number = 8;

	@State()
	public autoConversionPerPage: number = 8;

	@State()
	public autoConversionList: Array<{
		currenciesFrom: Array<{ id: number; title: string }>;
		currencyTo: { id: number; title: string };
	}> = [];

	@State()
	public autoWithdrawalsTotal: number = 0;

	@State()
	public autoWithdrawalsLoading: boolean = true;

	@State()
	public autoWithdrawalSetupInProcess: boolean = false;

	@State()
	public autoConversionLoading: boolean = true;

	@State()
	public autoConversionTotal: number = 0;

	@State()
	public autoConversionToWallet?: WALLETS.Wallet;

	@State()
	public withdrawalTotalBalance: boolean = false;

	@State()
	public instantConversionFromWallet?: WALLETS.Wallet;

	@State()
	public currencyRates?: any = {};

	@State()
	public loadingConversionRates: boolean = false;

	@State()
	public fromConversionCurrencies: WALLETS.Wallet[] = [];

	@State()
	public autoConversionSelected: any[] = [];

	@State()
	public autoWithdrawalSelected: any[] = [];

	@State()
	public autoWithdrawalFromAmountRecord: any = {};

	@State()
	public currentAssetType: string = '';

	@State()
	public paymentMethodInfo: any = [];

	@State()
	public loadPaymentMethodInfo: boolean = false;

	@State()
	public secondCurrencyStepFlowMap: any = {};

	@State()
	public paymentProvidersList: Array<string> = ['p2p'];

	@State()
	public amountSeamlessStepRecord: Record<number, string | number> = {};

	@State()
	public amountToSendSeamlessStepRecord: Record<number, string | number> = {};

	public get autoWithdrawalFromAmount(): string {
		if (!this.activeTransport?.id) return '';
		return this.autoWithdrawalFromAmountRecord[this.activeTransport.id] || '';
	}
	public set autoWithdrawalFromAmount(value: string) {
		if (this.activeTransport) {
			this.autoWithdrawalFromAmountRecord = {
				...this.autoWithdrawalFromAmountRecord,
				[this.activeTransport.id]: value
			};
		}
	}

	public get amountSeamlessStep(): string | number {
		if (!this.activePaymentMethod?.paymentMethodId) return '';
		return this.amountSeamlessStepRecord[this.activePaymentMethod.paymentMethodId] || '';
	}
	public set amountSeamlessStep(value: string | number) {
		if (!this.activePaymentMethod?.paymentMethodId) return;
		this.amountSeamlessStepRecord = {
			...this.amountSeamlessStepRecord,
			[this.activePaymentMethod.paymentMethodId]: value
		};
	}

	public get amountToSendSeamlessStep(): string | number {
		if (!this.activePaymentMethod?.paymentMethodId) return '';
		return this.amountToSendSeamlessStepRecord[this.activePaymentMethod.paymentMethodId] || '';
	}
	public set amountToSendSeamlessStep(value: string | number) {
		this.amountToSendSeamlessStepRecord = {
			...this.amountToSendSeamlessStepRecord,
			[this.activePaymentMethod.paymentMethodId]: value
		};
	}

	protected debounceTimer: NodeJS.Timeout | undefined;

	public setActiveForm(type: WALLETS.FormTypeValues): void {
		this.activeForm = type;
		if (type === 'deposit') {
			this.setActiveDepositTransport(this.lastActiveDepositTransport);
		} else {
			this.setActiveWithdrawalTransport(this.lastActiveWithdrawalTransport);
		}
	}

	public updateLastTransactionData(data: HISTORY.UserTransaction): void {
		if (this.lastTransactionData) {
			this.lastTransactionData = {
				...this.lastTransactionData,
				...(data.transactionData.transactionStatus && { transactionStatus: data.transactionData.transactionStatus }),
				...(data.transactionData.cryptoTxId && {
					cryptoTransaction: {
						...this.lastTransactionData.cryptoTransaction,
						txId: data.transactionData.cryptoTxId
					}
				})
			};
		}
	}

	// hidden 	// hidden area

	public setActiveFlow(flow: WALLETS.FlowTypeValues): void {
		Vue.set(this.activeFlow, this.getActiveForm, flow);
	}

	private getExistingAddressForTransport(transportId: number): any | undefined {
		return this.activeWallet?.depositTransactionMethods.find((method) => method.id === transportId);
	}

	public setWithdrawalActiveTransportById(id: number): void {
		this.wallets.forEach((wallet: WALLETS.Wallet) => {
			const activeTransport = wallet.withdrawalTransactionMethods?.find(
				(method: WALLETS.WithdrawalTransactionMethod) => method.id === id
			);
			if (activeTransport) {
				this.activeTransport = activeTransport;
			}
		});
	}

	public async setActiveDepositTransport(transport?: WALLETS.DepositTransactionMethod): Promise<void> {
		this.activeTransport = transport;
		if (transport && !this.walletsData[transport.id]) {
			this.setWalletData(transport.id);
			Vue.set(this.walletsData, transport.id, {
				...this.walletsData[transport.id],
				tag: transport.tag,
				address: transport.address
			});
			const existingAddress = this.getExistingAddressForTransport(transport.id as number);
			const currency = this.getCryptoCurrency;
			const res =
				!existingAddress.address || currency?.addressPublicKey
					? await this.getDepositTransactionData()
					: existingAddress;
			Vue.set(this.walletsData, transport.id, { ...this.walletsData[transport.id], ...res, uri: res?.address });
		}
		transport && this.setLastActiveTransport(transport.id);
	}

	public async initWallets(): Promise<void> {
		this.setStakingList();
		this.setWallets();
		this.getCustomerMFA();

		if (this.seamlessIntegrationEnabled || this.seamlessStepsEnabled) {
			this.getPaymentMethodsInfo();
			this.seamlessP2PExchangeSwapFirst();
		}

		// this.setCurrencies();
		// this.setMarkets();
		// this.getFavoriteCurrency();
	}

	public setActiveWithdrawalTransport(transport?: WALLETS.WithdrawalTransactionMethod): void {
		this.activeTransport = transport;
		if (transport && !this.walletsData[transport.id]) {
			this.setWalletData(transport.id);
		}
		transport && this.setLastActiveTransport(transport.id);
	}

	public setLastActiveTransport(transportId?: number): void {
		const currencyId = this.activeWallet?.currencyId;
		if (!currencyId) return;

		Vue.set(this.lastActiveTransports, currencyId, {
			...this.lastActiveTransports[currencyId],
			[this.activeForm]: transportId
		});
	}

	public async cancelLastTransaction(): Promise<void> {
		if (!this.lastTransactionData?.cryptoTransaction.transactionId) {
			throw new Error(`No active transaction captured. Transaction data object value is: ${this.lastTransactionData}`);
		}
		// hidden
	}

	public async setWallets(): Promise<void> {
		this.loadingWallets = true;

		await this.store.state.sharedData.walletsResolvePromise;

		const currentRoute = this.router.currentRoute;

		const currencyTitleDefault = this.getCurrencyTitleDefault;

		switch (currentRoute.name) {
			case 'balance-form-do-action':
			case 'balance-form-process':
			case 'balance-form-success':
			case 'balance-form-fail':
				this.findAndExecSetActiveWallet(currentRoute.params.currency);
				this.setActiveForm(currentRoute.params.activeForm as WALLETS.FormTypeValues);
				this.setActiveFlow(currentRoute.params.flowType as FlowType);

				const secondCurrencyDoAction = this.sharedDataCurrencies.find(
					(item) => item.title === currentRoute.params.secondCurrency
				);
				if (secondCurrencyDoAction) {
					this.computedFiatSecondCurrency = secondCurrencyDoAction;
					this.secondCurrencyStepFlow = secondCurrencyDoAction;
				}

				this.activePaymentProvider = currentRoute.params.paymentProvider;

				await this.getP2PTradeById(currentRoute.params.transactionId);
				if (this.tradeRecord[currentRoute.params.transactionId]?.status) {
					this.goToSeamlessViewByP2PStatus(
						this.tradeRecord[currentRoute.params.transactionId].status,
						currentRoute.params.transactionId
					);
				} else {
					this.router.replace({
						name: 'balance-activeForm',
						params: { currency: currentRoute.params.currency, activeForm: currentRoute.params.activeForm }
					});
				}
				break;

			case 'balance-sell-form-fourth-step':
				this.setActiveForm(currentRoute.params.activeForm as WALLETS.FormTypeValues);
				this.findAndExecSetActiveWallet(currentRoute.params.currency);
				this.activePaymentProvider = currentRoute.params.paymentProvider;

				await this.store.state.sharedData.currencyResolvePromise;
				const getCurrencyFourth = this.sharedDataCurrencies.find(
					(item) => item.title === currentRoute.params.getCurrency
				);

				if (getCurrencyFourth?.type === 'Fiat') {
					this.setActiveFlow(FlowType.SELL);
					this.computedFiatSecondCurrency = getCurrencyFourth;
					this.secondCurrencyStepFlow = getCurrencyFourth;
				} else {
					if (this.computedFiatSecondCurrency.title) {
						this.setActiveFlow(FlowType.SELL);
						this.router.replace({
							name: currentRoute.name,
							params: {
								currency: currentRoute.params.currency,
								activeForm: currentRoute.params.activeForm,
								getCurrency: this.computedFiatSecondCurrency.title
							}
						});
					} else if (getCurrencyFourth) {
						this.computedCryptoSecondCurrency = getCurrencyFourth;
						this.setActiveFlow(FlowType.SWAP);
						this.router.replace({
							name: 'balance-exchange-form',
							params: {
								currency: currentRoute.params.currency,
								activeForm: FormType.EXCHANGE,
								secondCurrency: getCurrencyFourth.title
							}
						});
					} else {
						this.setActiveFlow(FlowType.TRANSFER);
						this.router.replace({
							name: 'balance-get-form',
							params: {
								currency: currentRoute.params.currency,
								activeForm: FormType.WITHDRAWAL
							}
						});
					}
				}
				break;

			case 'balance-buy-form-fourth-step':
				this.setActiveForm(currentRoute.params.activeForm as WALLETS.FormTypeValues);
				this.findAndExecSetActiveWallet(currentRoute.params.currency);
				this.activePaymentProvider = currentRoute.params.paymentProvider;

				await this.store.state.sharedData.currencyResolvePromise;
				const giveCurrencyFourth = this.sharedDataCurrencies.find(
					(item) => item.title === currentRoute.params.giveCurrency
				);

				if (giveCurrencyFourth?.type === 'Fiat') {
					this.setActiveFlow(FlowType.BUY);
					this.computedFiatSecondCurrency = giveCurrencyFourth;
					this.secondCurrencyStepFlow = giveCurrencyFourth;
					this.getFromRates(giveCurrencyFourth.id);
				} else {
					if (this.computedFiatSecondCurrency.title) {
						this.setActiveFlow(FlowType.BUY);
						this.router.replace({
							name: currentRoute.name,
							params: {
								currency: currentRoute.params.currency,
								activeForm: currentRoute.params.activeForm,
								giveCurrency: this.computedFiatSecondCurrency.title
							}
						});
					} else if (giveCurrencyFourth) {
						this.computedCryptoSecondCurrency = giveCurrencyFourth;
						this.setActiveFlow(FlowType.SWAP);
						this.router.replace({
							name: 'balance-exchange-form',
							params: {
								currency: currentRoute.params.currency,
								activeForm: FormType.EXCHANGE,
								secondCurrency: giveCurrencyFourth.title
							}
						});
					} else {
						this.setActiveFlow(FlowType.GET);
						this.router.replace({
							name: 'balance-get-form',
							params: {
								currency: currentRoute.params.currency,
								activeForm: FormType.DEPOSIT
							}
						});
					}
				}
				break;

			case 'balance-exchange-form':
				this.setActiveForm(currentRoute.params.activeForm as WALLETS.FormTypeValues);
				this.findAndExecSetActiveWallet(currentRoute.params.currency);

				await this.store.state.sharedData.currencyResolvePromise;
				const secondCurrency = this.sharedDataCurrencies.find(
					(item) => item.title === currentRoute.params.secondCurrency
				);
				if (secondCurrency?.type === 'Cryptocurrency') {
					this.setActiveFlow(FlowType.SWAP);
					this.computedCryptoSecondCurrency = secondCurrency;
					this.secondCurrencyStepFlow = secondCurrency;
					this.seamlessP2PExchangeSwapPreliminary();
				} else {
					if (this.computedCryptoSecondCurrency.title) {
						this.setActiveFlow(FlowType.SWAP);
						this.router.replace({
							name: currentRoute.name,
							params: {
								currency: currentRoute.params.currency,
								activeForm: currentRoute.params.activeForm,
								secondCurrency: this.computedCryptoSecondCurrency.title
							}
						});
					} else if (secondCurrency) {
						this.setActiveFlow(FlowType.BUY);
						this.computedFiatSecondCurrency = secondCurrency;
						this.router.replace({
							name: 'balance-buy-form',
							params: {
								currency: currentRoute.params.currency,
								activeForm: FormType.DEPOSIT,
								giveCurrency: secondCurrency.title
							}
						});
					} else {
						this.setActiveFlow(FlowType.GET);
						this.router.replace({
							name: 'balance-get-form',
							params: {
								currency: currentRoute.params.currency,
								activeForm: FormType.DEPOSIT
							}
						});
					}
				}
				break;

			case 'balance-buy-form':
				this.setActiveForm(currentRoute.params.activeForm as WALLETS.FormTypeValues);
				this.findAndExecSetActiveWallet(currentRoute.params.currency);

				await this.store.state.sharedData.currencyResolvePromise;
				const giveCurrency = this.sharedDataCurrencies.find((item) => item.title === currentRoute.params.giveCurrency);
				if (giveCurrency?.type === 'Fiat') {
					this.setActiveFlow(FlowType.BUY);
					this.computedFiatSecondCurrency = giveCurrency;
					this.secondCurrencyStepFlow = giveCurrency;
					this.getFromRates(giveCurrency.id);
				} else {
					if (this.computedFiatSecondCurrency.title) {
						this.setActiveFlow(FlowType.BUY);
						this.router.replace({
							name: currentRoute.name,
							params: {
								currency: currentRoute.params.currency,
								activeForm: currentRoute.params.activeForm,
								giveCurrency: this.computedFiatSecondCurrency.title
							}
						});
					} else if (giveCurrency) {
						this.computedCryptoSecondCurrency = giveCurrency;
						this.setActiveFlow(FlowType.SWAP);
						this.router.replace({
							name: 'balance-exchange-form',
							params: {
								currency: currentRoute.params.currency,
								activeForm: FormType.EXCHANGE,
								secondCurrency: giveCurrency.title
							}
						});
					} else {
						this.setActiveFlow(FlowType.GET);
						this.router.replace({
							name: 'balance-get-form',
							params: {
								currency: currentRoute.params.currency,
								activeForm: FormType.DEPOSIT
							}
						});
					}
				}
				break;

			case 'balance-sell-form':
				this.setActiveForm(currentRoute.params.activeForm as WALLETS.FormTypeValues);
				this.findAndExecSetActiveWallet(currentRoute.params.currency);

				await this.store.state.sharedData.currencyResolvePromise;
				const getCurrency = this.sharedDataCurrencies.find((item) => item.title === currentRoute.params.getCurrency);
				if (getCurrency?.type === 'Fiat') {
					this.setActiveFlow(FlowType.SELL);
					this.computedFiatSecondCurrency = getCurrency;
					this.secondCurrencyStepFlow = getCurrency;
				} else {
					if (this.computedFiatSecondCurrency.title) {
						this.setActiveFlow(FlowType.SELL);
						this.router.replace({
							name: currentRoute.name,
							params: {
								currency: currentRoute.params.currency,
								activeForm: currentRoute.params.activeForm,
								getCurrency: this.computedFiatSecondCurrency.title
							}
						});
					} else if (getCurrency) {
						this.setActiveFlow(FlowType.SWAP);
						this.computedCryptoSecondCurrency = getCurrency;
						this.router.replace({
							name: 'balance-exchange-form',
							params: {
								currency: currentRoute.params.currency,
								activeForm: FormType.EXCHANGE,
								secondCurrency: getCurrency.title
							}
						});
					} else {
						this.setActiveFlow(FlowType.TRANSFER);
						this.router.replace({
							name: 'balance-transfer-form',
							params: {
								currency: currentRoute.params.currency,
								activeForm: FormType.WITHDRAWAL
							}
						});
					}
				}
				break;

			case 'balance-get-form':
				this.setActiveForm(currentRoute.params.activeForm as WALLETS.FormTypeValues);
				this.setActiveFlow(FlowType.GET);
				this.findAndExecSetActiveWallet(currentRoute.params.currency);
				break;

			case 'balance-transfer-form':
				this.setActiveForm(currentRoute.params.activeForm as WALLETS.FormTypeValues);
				this.setActiveFlow(FlowType.TRANSFER);
				this.findAndExecSetActiveWallet(currentRoute.params.currency);
				break;

			case 'balance-activeForm':
				this.setActiveForm(currentRoute.params.activeForm as WALLETS.FormTypeValues);
				this.findAndExecSetActiveWallet(currentRoute.params.currency);

				if (this.seamlessIntegrationEnabled && !this.seamlessStepsEnabled) {
					const flowName = currentRoute.params.activeForm === FormType.DEPOSIT ? FlowType.GET : FlowType.BUY;
					this.setActiveFlow(flowName);

					const newRouteName =
						currentRoute.params.activeForm === FormType.DEPOSIT ? 'balance-get-form' : 'balance-transfer-form';
					this.router.replace({
						name: newRouteName,
						params: { currency: currentRoute.params.currency, activeForm: currentRoute.params.activeForm }
					});
				}
				break;

			case 'balance-currency':
				this.findAndExecSetActiveWallet(currentRoute.params.currency);
				this.setActiveForm(FormType.DEPOSIT);
				this.seamlessIntegrationEnabled && !this.seamlessStepsEnabled && this.setActiveFlow(FlowType.GET);

				const newRouteName =
					this.seamlessIntegrationEnabled && !this.seamlessStepsEnabled ? 'balance-get-form' : 'balance-activeForm';
				this.router.replace({
					name: newRouteName,
					params: { currency: currentRoute.params.currency, activeForm: FormType.DEPOSIT }
				});
				break;

			case 'balance-wallets':
				if (currencyTitleDefault) {
					this.findAndExecSetActiveWallet(currencyTitleDefault);

					if (!['xs', 'sm'].includes(this.store.state.appLayout.screenSize)) {
						this.setActiveForm(FormType.DEPOSIT);
						this.seamlessIntegrationEnabled && this.setActiveFlow(FlowType.GET);

						const newRouteName =
							this.seamlessIntegrationEnabled && !this.seamlessStepsEnabled ? 'balance-get-form' : 'balance-activeForm';
						this.router.replace({
							name: newRouteName,
							params: { currency: currencyTitleDefault, activeForm: FormType.DEPOSIT }
						});
					}
				}
				break;

			case 'auto-withdrawal':
			case 'auto-withdrawal-new':
			case 'auto-conversion':
			case 'auto-conversion-new':
			case 'auto-conversion-instant':
				if (currencyTitleDefault) {
					this.findAndExecSetActiveWallet(currencyTitleDefault);
					this.setActiveForm(FormType.DEPOSIT);
					this.seamlessIntegrationEnabled && !this.seamlessStepsEnabled && this.setActiveFlow(FlowType.GET);
				}
				break;

			default:
				if (currencyTitleDefault) {
					this.findAndExecSetActiveWallet(currencyTitleDefault);
				}
				break;
		}

		this.loadingWallets = false;
	}

	private getCurrencyPropById(id: number, prop: keyof WALLETS.Wallet): any {
		try {
			const wallet = this.getCurrencyById(id);
			if (wallet) return wallet[prop];
		} catch (error) {
			return id;
		}
	}

	private currencySearchCache: COMMON.IMap<WALLETS.Wallet | null> = {};

	public getCurrencyById(id: number): WALLETS.Wallet | null {
		if (this.currencySearchCache[id] !== undefined) {
			if (this.currencySearchCache[id] === null) {
				console.warn(`Wrong wallet currency id passed: ${id}`);
				return null;
			}
			return this.currencySearchCache[id];
		}

		const index = this.wallets.findIndex((item: WALLETS.Wallet) => item.currencyId === id);

		if (this.wallets[index]) {
			const result = this.wallets[index];
			this.currencySearchCache[id] = result;
			return result;
		} else {
			this.currencySearchCache[id] = null;
			console.warn(`Wrong wallet currency id passed: ${id}`);
			return null;
		}
	}

	public currencyNameById(id: number): string {
		return this.getCurrencyPropById(id, 'currencyName');
	}

	public currencyTitleById(id: number): string {
		return this.getCurrencyPropById(id, 'currencyTitle');
	}

	public currencyTypeById(id: number): WalletCurrencyType {
		return this.getCurrencyPropById(id, 'currencyType');
	}

	public currencyIconNameById(id: number): string {
		const currencyType = this.currencyTypeById(id);
		const currencyTitle = this.currencyTitleById(id);
		return `${WalletCurrencyTypeIconNamespace[currencyType]}.${currencyTitle}`;
	}

	public getCryptoCurrencyById(id: number): any {
		return this.cryptoCurrencies?.find((currency: any) => currency.id === id);
	}

	public getNetworkByTitle(title: string): string {
		return (
			this.cryptoCurrencies?.find((currency: WALLETS.CryptoCurrency): boolean => currency.title === title)?.name ||
			title
		);
	}

	public async setStakingList(): Promise<void> {
		// hidden

		if (type === 'success') {
			this.staking = data.items;
		}
	}

	public findAndExecSetActiveWallet(route: string = this.currentRouteCurrency): void {
		const activeWallet =
			this.wallets.find((wallet: WALLETS.Wallet) => wallet.currencyTitle === route) || this.wallets[0];
		// if (this.activeWallet?.currencyId !== activeWallet.currencyId) {
		this.setActiveWallet(activeWallet);
		// }
	}

	public get getCurrencyTitleDefault(): string | undefined {
		const sessionActiveWallet = sessionStorage.getItem(LocaleStorageItems.ActiveWallet);
		return sessionActiveWallet
			? this.getCurrencyById(Number(sessionActiveWallet))?.currencyTitle
			: this.wallets[0]?.currencyTitle;
	}

	public get getCurrentCyrrencyAvailableFunds(): number {
		const currentWallet = this.wallets.find((wallet) => wallet.currencyId === this.activeWallet?.currencyId);
		return currentWallet?.availableFunds || 0;
	}

	public get getCurrentCyrrencyFrozenFunds(): number {
		const currentWallet = this.wallets.find((wallet) => wallet.currencyId === this.activeWallet?.currencyId);
		return currentWallet?.frozenFunds || 0;
	}

	public setCurrencyRoute(): void {
		if (this.currentRouteCurrency !== this.activeWallet?.currencyTitle) {
			this.router.replace({
				name: 'balance-activeForm',
				params: {
					currency: this.activeWallet?.currencyTitle || this.currentRouteCurrency,
					activeForm: this.currentRouteForm || this.activeForm
				}
			});
		}
	}

	public setFormRoute(): void {
		if (!this.activeForm) {
			this.setActiveForm(/* this.currentRouteForm ||  */ FormType.DEPOSIT);
		} else if (this.currentRouteCurrency && this.currentRouteForm !== this.activeForm) {
			this.router.replace({
				name: 'balance-activeForm',
				params: { activeForm: this.activeForm, currency: this.currentRouteCurrency }
			});
		}
	}

	public goToHistory(): void {
		this.router.replace({
			name: 'balance-historyType',
			params: { historyType: 'transaction' }
		});
	}

	public goToBalance(): void {
		this.router.replace({
			name: 'balance-wallets',
			params: { activeForm: this.activeForm, currency: this.currentRouteCurrency }
		});
		this.router.replace({
			name: 'balance-activeForm',
			params: { activeForm: this.activeForm, currency: this.currentRouteCurrency }
		});

		this.historyModule.setLastOperations();
	}

	public async setWalletData(transportId: number): Promise<void> {
		const feeRate = this.getFeeRate(this.activeTransport);
		Vue.set(this.walletsData, transportId, {
			...this.walletsData[transportId],
			feeRate,
			feeFinal: feeRate.includes('%') ? 0 : feeRate ?? 0,
			minFee: this.activeTransport?.minFee,
			maxFee: this.activeTransport?.maxFee
		});
	}
	public setWithdrawalAddress(value: string): void {
		if (this.activeTransport) {
			const { id } = this.activeTransport;
			Vue.set(this.walletsData, id, {
				...this.walletsData[id],
				withdrawalAddress: value
			});
		}
	}
	public setWithdrawalPublicKey(value: string): void {
		if (this.activeTransport) {
			const { id } = this.activeTransport;
			Vue.set(this.walletsData, id, {
				...this.walletsData[id],
				withdrawalPublicKey: value
			});
		}
	}
	public setWithdrawalTag(value: string): void {
		if (this.activeTransport) {
			const { id } = this.activeTransport;
			Vue.set(this.walletsData, id, {
				...this.walletsData[id],
				withdrawalTag: value
			});
		}
	}
	public setWithdrawalComment(value: string): void {
		if (this.activeTransport) {
			const { id } = this.activeTransport;
			Vue.set(this.walletsData, id, {
				...this.walletsData[id],
				comment: value
			});
		}
	}
	public setUseCommentWithdrawal(value: boolean): void {
		this.useCommentWithdrawal = value;
	}

	public getAvailableAmount(
		amount: number | string,
		transport: WALLETS.DepositTransactionMethod | WALLETS.WithdrawalTransactionMethod | undefined
	): string {
		let res = null;
		if (transport) {
			const { absFee, percFee /* minFee, maxFee, minAmount, maxAmount */ } = transport;
			const amountAfterInterFee = (Number(amount) / (100 + Number(percFee))) * 100 - Number(absFee);
			const interFee = Number(amount) - amountAfterInterFee;
			res = interFee;
		}
		return res ? String(res) : '';
	}

	public getFeeRate(
		transport: WALLETS.DepositTransactionMethod | WALLETS.WithdrawalTransactionMethod | undefined
	): string {
		if (transport) {
			const { absFee, percFee, minFee, maxFee } = transport;
			if (absFee === 0 && percFee === 0 && minFee === 0 && maxFee === 0) {
				return '';
			}

			if (!absFee && !minFee && !maxFee) {
				return `${percFee}%`;
			}

			const correctAbsFee = absFee || 0;

			if (!percFee) {
				if (minFee && correctAbsFee <= minFee) {
					return String(minFee);
				}
				if (maxFee && correctAbsFee >= maxFee) {
					return String(maxFee);
				}
				return String(correctAbsFee);
			}

			return correctAbsFee == 0 ? `${percFee}%` : `${percFee}% + ${correctAbsFee}`;
		}
		return '';
	}

	public getFee(
		amount: number | string,
		transport: WALLETS.DepositTransactionMethod | WALLETS.WithdrawalTransactionMethod | undefined,
		decimals?: number
	): string {
		let res = null;
		if (transport) {
			const { absFee, percFee, minFee, maxFee } = transport;
			const correctAbsFee = absFee || 0;
			const amountWithoutAbsFee = Number(amount) - Number(correctAbsFee);
			res = (amountWithoutAbsFee / ((100 + Number(percFee)) / 100)) * (Number(percFee) / 100) + Number(correctAbsFee);
			if (minFee && res < Number(minFee)) {
				res = minFee;
			} else if (maxFee && res > Number(maxFee)) {
				res = maxFee;
			}
		}
		if (decimals && decimals !== 0) {
			res = $roundDecimals({
				number: Number(res),
				maxDecimal: decimals,
				roundType: ROUND_TYPES.TRUNC
			});
		}
		return res ? String(res) : '';
	}

	public async setDepositAmount(depositValue: string | number, debounceTime?: number): Promise<void> {
		if (this.activeTransport) {
			const { id } = this.activeTransport;
			const amountFee = this.getFee(depositValue, this.activeTransport, this.activeWallet?.currencyDecimals ?? 8);
			const feeFinal = this.walletsData[id].feeRate == Number(amountFee) ? '' : Number(amountFee);
			const valueWithFee = Number(depositValue) - Number(amountFee);
			Vue.set(this.walletsData, id, {
				...this.walletsData[id],
				amountValue: $roundDecimals({
					number: Number(depositValue),
					maxDecimal: this.activeWallet?.currencyDecimals ?? 8
				}),
				feeFinal: $roundDecimals({
					number: Number(feeFinal),
					maxDecimal: this.activeWallet?.currencyDecimals ?? 8
				}),
				valueWithFee: $roundDecimals({
					number: valueWithFee > 0 ? valueWithFee : 0,
					maxDecimal: this.activeWallet?.currencyDecimals ?? 8
				})
			});
		}
	}

	public getFeeValue(
		amount: number | string,
		transport: WALLETS.DepositTransactionMethod | WALLETS.WithdrawalTransactionMethod | undefined,
		decimals?: number
	): string {
		let res = null;
		if (transport) {
			const { absFee, percFee, minFee, maxFee } = transport;
			const correctAbsFee = absFee || 0;

			res = Number(amount) * (Number(percFee) / 100) + Number(correctAbsFee);
			if (minFee && res < Number(minFee)) {
				res = minFee;
			} else if (maxFee && res > Number(maxFee)) {
				res = maxFee;
			}
		}
		if (decimals && decimals !== 0) {
			res = $roundDecimals({
				number: Number(res),
				maxDecimal: decimals,
				roundType: ROUND_TYPES.TRUNC
			});
		}
		return res ? String(res) : '';
	}

	public async setDepositFeeAmount(valueWithFee: string | number, debounceTime?: number): Promise<void> {
		if (this.activeTransport) {
			const { id } = this.activeTransport;
			const amountFee = this.getFeeValue(valueWithFee, this.activeTransport, this.activeWallet?.currencyDecimals ?? 8);
			const feeFinal = this.walletsData[id].feeRate == Number(amountFee) ? '' : Number(amountFee);
			Vue.set(this.walletsData, id, {
				...this.walletsData[id],
				amountValue: $roundDecimals({
					number: Number(valueWithFee) + Number(amountFee),
					maxDecimal: this.activeWallet?.currencyDecimals ?? 8
				}),
				feeFinal: $roundDecimals({
					number: Number(feeFinal),
					maxDecimal: this.activeWallet?.currencyDecimals ?? 8
				}),
				valueWithFee: $roundDecimals({
					number: Number(valueWithFee),
					maxDecimal: this.activeWallet?.currencyDecimals ?? 8
				})
			});
		}
	}

	public async getDepositTransactionData(generateNewAddress: boolean = false): Promise<any> {
		const params = {
			currencyId: this.activeWallet?.currencyId,
			transactionMethodId: this.activeTransport?.id,
			generateNewAddress
		};

		const data =
			!generateNewAddress && this.walletsData[this.activeTransport?.id as number].uri
				? this.walletsData[this.activeTransport?.id as number]
				// hidden

		if (!data.error) {
			return data;
		}
		return null;
	}

	public async getCryptoDepositQrUri(): Promise<any> {
		if (this.activeTransport) {
			const data = this.getActiveWalletData;
			const { id } = this.activeTransport;
			const amount = this.walletsData[id].amountValue;

			const payload: any = {
				currencyId: this.activeWallet?.currencyId,
				transactionMethodId: this.activeTransport?.id,
				address: data.address,
				publicKey: data.publicKey,
				tag: data.tag
			};

			if (amount) {
				payload.amount = amount;
			}
				// hidden
			Vue.set(this.walletsData, id, { ...this.walletsData[id], ...data, ...res.data });
		}
	}

	public async generateNewAddress(): Promise<void> {
		// Maybe lodash debounce or smth here?
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
		}
		this.debounceTimer = setTimeout(async () => {
			if (this.activeTransport) {
				const { id } = this.activeTransport;
				const res = await this.getDepositTransactionData(true);
				if (res) {
					Vue.set(this.walletsData, id, { ...this.walletsData[id], ...res, uri: res.address });
				}
			}
		}, 200);
	}

	public async setWithdrawalAmount(value: string | number): Promise<void> {
		if (this.activeTransport) {
			const { id } = this.activeTransport;

			if (
				isNaN(Number(value)) ||
				String(value)[String(value).length - 1] === '.' ||
				(this.activeWallet?.currencyDecimals &&
					findTheNumberOfNumbersAfterTheDecimalPoint(String(value)) > this.activeWallet.currencyDecimals) ||
				String(value).includes(' ')
			) {
				Vue.set(this.walletsData, id, {
					...this.walletsData[id],
					amountValue: value
				});
			} else {
				const amountFee = this.getFee(value, this.activeTransport, this.activeWallet?.currencyDecimals ?? 8);
				const valueWithFee = Number(value) - Number(amountFee);

				Vue.set(this.walletsData, id, {
					...this.walletsData[id],
					amountValue: $roundDecimals({
						number: value as number,
						maxDecimal: this.activeWallet?.currencyDecimals ?? 8
					}),
					feeFinal: $roundDecimals({
						number: Number(amountFee),
						maxDecimal: this.activeWallet?.currencyDecimals ?? 8
					}),
					valueWithFee:
						valueWithFee > 0
							? $roundDecimals({
									number: valueWithFee,
									maxDecimal: this.activeWallet?.currencyDecimals ?? 8
							  })
							: ''
				});
			}
		}
	}

	public async setWithdrawalFeeAmount(value: string | number): Promise<void> {
		if (this.activeTransport) {
			const { id } = this.activeTransport;

			if (
				isNaN(Number(value)) ||
				String(value)[String(value).length - 1] === '.' ||
				(this.activeWallet?.currencyDecimals &&
					findTheNumberOfNumbersAfterTheDecimalPoint(String(value)) > this.activeWallet.currencyDecimals) ||
				String(value).includes(' ')
			) {
				Vue.set(this.walletsData, id, {
					...this.walletsData[id],
					valueWithFee: value
				});
			} else {
				const amountFee = this.getFeeValue(value, this.activeTransport, this.activeWallet?.currencyDecimals ?? 8);

				Vue.set(this.walletsData, id, {
					...this.walletsData[id],
					amountValue: $roundDecimals({
						number: Number(value) + Number(amountFee),
						maxDecimal: this.activeWallet?.currencyDecimals ?? 8
					}),
					feeFinal: $roundDecimals({
						number: Number(amountFee),
						maxDecimal: this.activeWallet?.currencyDecimals ?? 8
					}),
					valueWithFee: $roundDecimals({
						number: value as number,
						maxDecimal: this.activeWallet?.currencyDecimals ?? 8
					})
				});
			}
		}
	}

	@State()
	public depositBuyActionInProcess: boolean = false;

	@State()
	public depositWalletActivePaymentMethod: any = {};

	@State()
	public withdrawalBuyActionInProcess: boolean = false;

	@State()
	public withdrawalWalletActivePaymentMethod: any = {};

	@State()
	public withdrawalRequisites: any = {};

	@State()
	protected cryptoSecondCurrency: HISTORY.Currencies | unknown = {
		id: 0,
		type: CurrencyType.Cryptocurrency,
		currencyType: WalletCurrencyType.Cryptocurrency,
		title: ''
	};
	public get computedCryptoSecondCurrency(): Partial<HISTORY.Currencies> & { currencyType?: WalletCurrencyType } {
		if ((this.cryptoSecondCurrency as Record<string, string>).title) {
			return this.cryptoSecondCurrency as HISTORY.Currencies;
		}
		if (
			this.favoriteCurrency?.title &&
			this.favoriteCurrency.currencyType === WalletCurrencyType.Cryptocurrency &&
			(!this.activeWallet || this.favoriteCurrency.title !== this.activeWallet.currencyTitle)
		) {
			return this.favoriteCurrency;
		}
		return (
			this.sharedDataCurrencies?.filter((item) => item.type === CurrencyType.Cryptocurrency)[0] ??
			this.cryptoSecondCurrency
		);
	}
	public set computedCryptoSecondCurrency(
		newValue: Partial<HISTORY.Currencies> & { currencyType?: WalletCurrencyType }
	) {
		this.cryptoSecondCurrency = newValue;
	}

	public get getCryptoSecondCurrencyAvailableFunds(): number {
		const currentWallet = this.wallets.find((wallet) => wallet.currencyId === this.computedCryptoSecondCurrency?.id);
		return currentWallet?.availableFunds || 0;
	}

	@State()
	protected fiatSecondCurrency: HISTORY.Currencies | unknown = {
		type: CurrencyType.Fiat,
		currencyType: WalletCurrencyType.Fiat,
		title: ''
	};
	public get computedFiatSecondCurrency(): Partial<HISTORY.Currencies> & { currencyType?: WalletCurrencyType } {
		if ((this.fiatSecondCurrency as Record<string, string>).title) {
			return this.fiatSecondCurrency as HISTORY.Currencies;
		}
		if (this.favoriteCurrency?.title && this.favoriteCurrency.currencyType === WalletCurrencyType.Fiat) {
			return this.favoriteCurrency;
		}
		return this.sharedDataCurrencies?.filter((item) => item.type === CurrencyType.Fiat)[0] ?? this.fiatSecondCurrency;
	}
	public set computedFiatSecondCurrency(newValue: Partial<HISTORY.Currencies> & { currencyType?: WalletCurrencyType }) {
		this.fiatSecondCurrency = newValue;
	}

	public get secondCurrencyStepFlow(): any {
		if (this.activeWallet) {
			const { currencyId } = this.activeWallet;
			return this.secondCurrencyStepFlowMap[currencyId];
		}
		return {};
	}
	public set secondCurrencyStepFlow(secondCurrency: any) {
		if (this.activeWallet) {
			const { currencyId } = this.activeWallet;
			Vue.set(this.secondCurrencyStepFlowMap, currencyId, secondCurrency);
		}
	}

	@State()
	public activePaymentProviderMap: any = {};

	public get activePaymentProvider(): string {
		if (this.activeWallet) {
			const { currencyId } = this.activeWallet;
			return this.activePaymentProviderMap[currencyId];
		}
		return 'p2p';
	}
	public set activePaymentProvider(paymentProvider: string) {
		if (this.activeWallet) {
			const { currencyId } = this.activeWallet;
			Vue.set(this.activePaymentProviderMap, currencyId, paymentProvider);
		}
	}

	public get activePaymentMethod(): any {
		if (this.activeWallet?.currencyId || this.activeWallet?.currencyId === 0) {
			return this.activeForm === FormType.DEPOSIT
				? this.depositWalletActivePaymentMethod[this.activeWallet.currencyId]
				: this.withdrawalWalletActivePaymentMethod[this.activeWallet.currencyId];
		}
		return {};
	}

	public async depositBuyCryptoAction(): Promise<void> {
		console.log('depositBuyAction start');
		this.depositBuyActionInProcess = true;
		await new Promise((resolve) => {
			setTimeout(() => resolve(true), 2000);
		});

		this.depositBuyActionInProcess = false;
		console.log('depositBuyAction end');
	}

	public async paylamaDeposit(): Promise<void> {
		const response = await this.http.postWithJson('/Transaction/deposits/paylama', {
			currencyId: 4,
			amount: 1,
			details: ''
		});
		console.log('response', response);
	}

	protected async fiatDepositAction(): Promise<void> {
		if (this.activeTransport) {
			const { id } = this.activeTransport;

			this.depositBuyActionInProcess = true;
			if (this.activeTransport.name.includes('AdvCash')) {
				const advCashData = {
					currencyId: this.walletsData[id].currencyId,
					amount: this.walletsData[id].amount,
					details: this.walletsData[id].details
				};

				const response = await this.http.postWithJson('/Transaction/deposits/adv', advCashData);
				this.depositBuyActionInProcess = false;

				if (!response.data.error) {
					const form = document.createElement('form');
					form.style.visibility = 'hidden';
					form.method = 'POST';
						// hidden

					const successPath = `${this.domainUrl}/balance${this.router.currentRoute.path}/success`;
					const failPath = `${this.domainUrl}/balance${this.router.currentRoute.path}/fail`;

					const advCashSciData = {
						...response.data,
						ac_success_url: successPath,
						ac_fail_url: failPath
					};

					for (const key in advCashSciData) {
						const input = document.createElement('input');
						input.name = key;
						input.value = advCashSciData[key];
						form.appendChild(input);

						// can cache adv data if want
						// this.advCash[key] = advCashSciData[key];
					}

					document.body.appendChild(form);
					form.submit();
				} else {
					// err handling
				}
			} else {
				const response = await this.http.postWithJson('/Transaction/deposits/manual', {
					currencyId: this.walletsData[id].currencyId,
					amount: this.walletsData[id].amount,
					details: this.walletsData[id].details,
					transactionMethodId: id,
					data: '' // requisites string

					// data: this.showAddRequisitesForm
					// 	? this.newRequisites
					// 	: this.walletsData[id].data,
				});

				this.depositBuyActionInProcess = false;

				if (!response.data.error) {
					// success action
				} else {
					// error handling
				}
			}
		}
	}

	public setWithdrawalRequisites(value: string): void {
		if (this.activeWallet) {
			const { currencyId } = this.activeWallet;
			Vue.set(this.withdrawalRequisites, currencyId, value);
		}
	}

	public setWithdrawalBuyPaymentMethod(paymentMethod: any): void {
		if (this.activeWallet) {
			const { currencyId } = this.activeWallet;
			Vue.set(this.withdrawalWalletActivePaymentMethod, currencyId, paymentMethod);
		}
	}

	// hidden

	@State()
	public fiatSentConfirmationInProcess: boolean = false;

	public async fiatSentConfirmation(): Promise<void> {
		this.fiatSentConfirmationInProcess = true;
	// hidden
		this.fiatSentConfirmationInProcess = false;

		this.amountSeamlessStep = '';
		this.amountToSendSeamlessStep = '';
	}

	public async getFromRates(fromCurrencyId: number): Promise<void> {
			// hidden
		if (type === 'success' && Boolean(data.rates.length)) {
			const ratePayload = data.rates.reduce((acc: any, currencyPair: any) => {
				if (Boolean(currencyPair.rate)) {
					acc[currencyPair.baseCurrencyId] = 1 / currencyPair.rate;
				}
				return acc;
			}, {} as Record<number, number>);

			ratePayload[fromCurrencyId] = 1;

			if (Object.keys(ratePayload).length) {
				Vue.set(this.currencyRates, fromCurrencyId, {
					...(this.currencyRates?.[fromCurrencyId] || {}),
					...ratePayload
				});
			}
		}
	}

	public async getRates(toCurrencyId: number, fromCurrencyId: number): Promise<void> {
	// hidden
		if (type === 'success' && Boolean(data.rate)) {
			Vue.set(this.currencyRates, fromCurrencyId, {
				...(this.currencyRates?.[fromCurrencyId] || {}),
				[toCurrencyId]: data.rate
			});
		}
	}

	public get baseCurrencyForRecordId(): number | undefined {
		if (this.getActiveFlow === FlowType.SWAP) return this.activeWallet?.currencyId;
		return this.activeForm === FormType.DEPOSIT ? this.secondCurrencyStepFlow?.id : this.activeWallet?.currencyId;
	}

	public get equivalentCurrenciesRatesRecord(): Record<number, number> {
		if (!this.baseCurrencyForRecordId) return {};
		return this.currencyRates[this.baseCurrencyForRecordId] || {};
	}

	public get baseCurrencyId(): number | undefined {
		if (this.getActiveFlow === FlowType.SWAP) return this.secondCurrencyStepFlow?.id;
		return this.activeForm === FormType.DEPOSIT ? this.activeWallet?.currencyId : this.secondCurrencyStepFlow?.id;
	}

	public get equivalentCurrencyRate(): number {
		if (!this.baseCurrencyId || !this.equivalentCurrency.id) return 1;
		return this.currencyRates[this.baseCurrencyId]?.[this.equivalentCurrency.id] || 1;
	}

	public equivalentCurrency: any = {
		type: CurrencyType.Fiat,
		currencyType: WalletCurrencyType.Fiat,
		title: '',
		id: 0
	};

	public setEquivalentToInitial(): void {
		this.equivalentCurrency = {
			type: CurrencyType.Fiat,
			currencyType: WalletCurrencyType.Fiat,
			title: '',
			id: 0
		};
	}

	@State()
	public seamlessStepsRequisites: string = '';

	public async seamlessP2PWithdrawal(): Promise<void> {
		if (this.activeWallet) {
			this.fiatSentConfirmationInProcess = true;
			const paymentMethodId = this.activePaymentMethod.paymentMethodId;
			const getCurrencyId = [this.activeWallet.currencyId];
			const giveCurrencyId = [this.secondCurrencyStepFlow.id];
			const amount = isNaN(Number(this.amountSeamlessStep))
				? Number(String(this.amountSeamlessStep).replace?.(',', '.'))
				: Number(this.amountSeamlessStep);
			const amountByEquivalent = (amount / this.equivalentCurrencyRate).toFixed(
				this.secondCurrencyStepFlow.decimals || this.secondCurrencyStepFlow.currencyDecimals || 2
			);

			const { type, data } = await this.http.readBySearchParams('	// hidden', {
				type: 'buy',
				paymentMethodIds: paymentMethodId,
				giveCurrencyId,
				getCurrencyId,
				amountByEquivalent,
				availableForMyStatus: true,
				isAutoConfirmAdvertisement: true,
				myOffers: false,
				authorStatus: 'Merchant',
				profileBadges: ['lightning', 'bot']
			});

			if (type === 'success' && data.total) {
				const bestOffer = data.offersList.reduce(
					(a: any, b: any) => ((a?.exchangeRate || 0) > b.exchangeRate ? a : b),
					{}
				);
				this.seamlessP2PWithdrawalStart({ offer: bestOffer, paymentMethodId, amount: amountByEquivalent });
			} else {
				this.fiatSentConfirmationInProcess = false;
			}
		}
	}

	public async seamlessP2PWithdrawalStart({
		offer,
		paymentMethodId,
		amount
	}: {
		offer: any;
		paymentMethodId: any;
		amount: any;
	}): Promise<void> {
		const { type, data } = await this.http.postWithJson('/	// hidden', {
			advertisementId: offer.id,
			amount,
			paymentMethodId,
			exchangeRate: offer.exchangeRate,
			isCrypto: false,
			requisite: this.seamlessStepsRequisites.replace(/\s/g, '')
		});

		if (type === 'success') {
			this.lastTradeData = data;
			this.lastTradeId = data.tradeId;

			this.tradeRecord = {
				...this.tradeRecord,
				[data.tradeId]: { ...offer, ...data }
			};
			// ? после тестов - можно удалить
			// await this.getP2PTradeById(this.computedCurrentTradeId);

			// this.historyModule.myDealsInProcess = [this.tradeRecord[data.tradeId], ...this.historyModule.myDealsInProcess];

			if (data.codes.length) {
				this.setConfirmWithdrawalOfferModal(true);
			}
		}
		this.fiatSentConfirmationInProcess = false;
	}

	/**
	 * Возможно временная функция, так как бэк начал отправлять данные иным образом, чем по аналогичным кейсам
	 */
	protected validateErrorsCode(data: { Content: { Attempts: number; NfaServiceTypeList: NfaServiceType[] } }): void {
		if (data?.Content?.Attempts === 0) {
			this.setConfirmWithdrawalOfferModal(false);
			return;
		}

		const error = {
			error: {
				messageCode: 127,
				data: {
					attempts: data?.Content?.Attempts,
					nfaServiceTypeList: data?.Content?.NfaServiceTypeList.map((nfa: any) => NfaServiceType[nfa])
				}
			}
		};
		this.setConfirmWithdrawalErrors(error);
	}

	// hidden

	@Getter()
	private get seamlessWithdrawalAmountRules(): Array<COMMON.ValidationRule> {
		if (this.amountSeamlessStep) {
			const rules = [
				{
					rule: this.minLimitShortValidation.bind(this),
					field: Number(inputMask(String(this.amountSeamlessStep))),
					args: [this.activePaymentMethod?.limits?.minLimit]
				},
				{
					rule: this.maxLimitShortValidation.bind(this),
					field: Number(inputMask(String(this.amountSeamlessStep))),
					args: [this.activePaymentMethod?.limits?.maxLimit]
				}
			];

			if (this.amountToSendSeamlessStep) {
				rules.push({
					rule: this.balanceValidation.bind(this),
					field: Number(inputMask(String(this.amountToSendSeamlessStep))),
					args: [this.getCurrentCyrrencyAvailableFunds]
				});
			}

			return rules;
		}

		return [];
	}

	@Getter()
	private get amountAutoWithdrawalRules(): Array<COMMON.ValidationRule> {
		return this.getActiveWalletData.amountValue
			? [
					{
						rule: this.minLimitValidation.bind(this),
						field: this.getActiveWalletData.amountValue,
						args: [Number(this.activeTransport?.minAmount)]
					},
					{
						rule: this.maxLimitValidation.bind(this),
						field: this.getActiveWalletData.amountValue,
						args: [Number(this.activeTransport?.maxAmount)]
					},
					{
						rule: this.moreThanFeeValidation.bind(this),
						field: this.getActiveWalletData.amountValue,
						args: [Number(this.getFee(this.getActiveWalletData.amountValue, this.activeTransport))]
					}
			  ]
			: [];
	}

	@Getter()
	private get fromAmountAutoWithdrawalRules(): Array<COMMON.ValidationRule> {
		const rulesList = [];
		if (this.getActiveWalletData.amountValue && this.autoWithdrawalFromAmount) {
			rulesList.push({
				rule: this.fromAmountValidation.bind(this),
				field: this.getActiveWalletData.amountValue,
				args: [Number(this.autoWithdrawalFromAmount)]
			});
		}
		if (this.autoWithdrawalFromAmount) {
			rulesList.push(
				{
					rule: this.minLimitFromAmountValidation.bind(this),
					field: Number(this.autoWithdrawalFromAmount),
					args: [Number(this.activeTransport?.minAmount)]
				},
				{
					rule: this.moreThanFeeFromAmountValidation.bind(this),
					field: Number(this.autoWithdrawalFromAmount),
					args: [Number(this.getFee(this.autoWithdrawalFromAmount, this.activeTransport))]
				}
			);
		}

		return rulesList;
	}

	@Getter()
	public get currentLocale(): string {
		return this.store.state.translator.currentLocale;
	}

	@Getter()
	public get getP2pLink(): string {
		const secondCurrency = `${this.computedCryptoSecondCurrency?.name?.toLowerCase()}-${this.computedCryptoSecondCurrency?.title?.toLowerCase()}`;
		const baseCurrency = `${this.getActiveWallet?.currencyName?.toLowerCase()}-${this.getActiveWallet?.currencyTitle?.toLowerCase()}`;
		const paymentMethod = this.router.currentRoute.params?.paymentMethod?.toLowerCase();
		const fiatCurrency = this.computedFiatSecondCurrency?.title?.toLowerCase();
		if (this.getActiveFlow === FlowType.SWAP) {
			if (this.currentRouteForm === FormType.DEPOSIT) {
				return `${this.domainUrl}/p2p/${this.getActiveFlow}/${secondCurrency}_${baseCurrency}`;
			}
			return `${this.domainUrl}/p2p/${this.getActiveFlow}/${baseCurrency}_${secondCurrency}`;
		} else if (this.getActiveFlow === FlowType.BUY) {
			return `${this.domainUrl}/p2p/${this.getActiveFlow}/${paymentMethod}_${fiatCurrency}_${baseCurrency}`;
		}
		return `${this.domainUrl}/p2p/${this.getActiveFlow}/${baseCurrency}_${paymentMethod}_${fiatCurrency}`;
	}

	public get currentErrors(): COMMON.FieldsErrors {
		return this.errors[this.getActiveTransport?.id as number] ?? {};
	}

	public get userName(): string | undefined {
		return this.store.state.auth.authenticatedUser?.userName;
	}

	public get nfaServiceType(): Array<string> {
		return this.NfaServiceType;
	}

	public get getLastTransactionData(): WALLETS.UserTransactionDto | undefined {
		return this.lastTransactionData;
	}

	public get getConfirmedTransactionData(): WALLETS.UserTransactionDto | undefined {
		return this.confirmedTransactionData;
	}

	public get getLastTransactionMfaList(): WALLETS.MfaListItemDto[] | undefined {
		return this.lastTransactionData?.mfaList.map((e) => ({
			...e,
			section: NfaServiceType[e.mfaServiceType],
			...(NfaServiceType[e.mfaServiceType] && {
				length: this.listRulesForCodesMfa[`${NfaServiceType[e.mfaServiceType]}Rules`]?.length
			})
		}));
	}

		// hidden area

	
	

	public searchHandleInput(value: string): void {
		this.walletSearch = value;
		if (typeof this.walletSearch === 'string' || this.currentAssetType) {
			let wallets;

			if (this.currentAssetType === CurrencyType.Cryptocurrency) {
				wallets = this.walletsCrypto;
			} else if (this.currentAssetType === CurrencyType.Fiat) {
				wallets = this.walletsFiat;
			} else {
				wallets = this.wallets;
			}

			const searchInLowerCase = this.walletSearch;

			if (this.getWorker) {
				this.workersService.searchWalletByQuery(wallets, searchInLowerCase);
			} else {
				this.showedWallets = this.searchWalletsByString(wallets, searchInLowerCase);
			}
		}
	}

	/**
	 * Функция для использования при отсутсвии поддержки воркеров в браузере
	 * Желательный вариант использования с проверкой на наличие воркера
	 */
	protected searchWalletsByString(wallets: Array<WALLETS.Wallet>, string: string): any {
		if (string === '') {
			return wallets;
		}

		return wallets.reduce<Record<number, boolean>>((acc: any, wallet: WALLETS.Wallet) => {
			const intermediate =
				wallet.currencyName?.toLocaleLowerCase().includes(string.toLocaleLowerCase()) ||
				wallet.currencySymbol?.toLocaleLowerCase().includes(string.toLocaleLowerCase()) ||
				wallet.currencyTitle?.toLocaleLowerCase().includes(string.toLocaleLowerCase()) ||
				wallet.aliases?.some((alias: string) => alias.includes(string.toLocaleLowerCase()));

			if (intermediate) acc[wallet.currencyId] = intermediate;

			return acc;
		}, {});
	}

	public get getWorker(): Worker | null {
		return this.workersService.getSearchCalcWorker();
	}

	protected showedWalletsValue: Record<number, boolean> | null = null;

	public set showedWallets(value: Record<number, boolean> | null) {
		if (value && Object.keys(value).length === 0) this.showedWalletsValue = null;
		this.showedWalletsValue = value;
	}

	public get showedWallets(): Record<number, boolean> | null {
		return this.showedWalletsValue || null;
	}

	public get getStaking(): any {
		return this.staking;
	}

	public get getActiveWallet(): WALLETS.Wallet | undefined {
		return this.activeWallet;
	}

	public get getActiveTransport(): WALLETS.DepositTransactionMethod | WALLETS.WithdrawalTransactionMethod | undefined {
		return this.activeTransport;
	}

	public get lastActiveTransportId(): number | null | undefined {
		return (
			this.activeWallet?.currencyId &&
			this.activeForm &&
			this.lastActiveTransports[this.activeWallet?.currencyId]?.[this.activeForm]
		);
	}

	public get lastActiveDepositTransport(): WALLETS.DepositTransactionMethod | undefined {
		return this.activeWallet?.depositTransactionMethods?.find((method) => method.id === this.lastActiveTransportId);
	}

	public get lastActiveWithdrawalTransport(): WALLETS.WithdrawalTransactionMethod | undefined {
		return this.activeWallet?.withdrawalTransactionMethods?.find((method) => method.id === this.lastActiveTransportId);
	}

	public get getActiveWalletData(): any | undefined {
		const intermediate = Object.keys(this.walletsData).find(
			(walletId) => walletId === String(this.activeTransport?.id)
		);

		return intermediate ? this.walletsData[intermediate] : {};
	}

	public get getCryptoCurrency(): WALLETS.CryptoCurrency | undefined {
		return this.cryptoCurrencies?.find(
			(cryptoCurrency) => cryptoCurrency.id === this.activeTransport?.cryptoCurrencyId
		);
	}

	public get allNameNetworkCurrency(): Array<WALLETS.networkCryptoCurrency> {
		return this.cryptoCurrencies!.map((cryptoCurrency: WALLETS.CryptoCurrency) => ({
			value: cryptoCurrency.id,
			text: cryptoCurrency.name
		}));
	}

	public get isWithdrawalDisabled(): boolean {
		if (
			this.getActiveWallet &&
			this.getActiveTransport &&
			this.currentErrors[WalletsFields.MinimumLimit] &&
			!this.currentErrors[WalletsFields.MinimumLimit].message &&
			this.currentErrors[WalletsFields.AddressIsEmpty] &&
			!this.currentErrors[WalletsFields.AddressIsEmpty].message &&
			((this.currentErrors[WalletsFields.CommentIsEmpty] &&
				!this.currentErrors[WalletsFields.CommentIsEmpty].message) ||
				!this.useCommentWithdrawal) &&
			(this.currentErrors[WalletsFields.AddressWrongNetwork]
				? !this.currentErrors[WalletsFields.AddressWrongNetwork].message
				: true) &&
			this.currentErrors[WalletsFields.MaximumLimit] &&
			!this.currentErrors[WalletsFields.MaximumLimit].message &&
			this.currentErrors[WalletsFields.LessThanFee] &&
			!this.currentErrors[WalletsFields.LessThanFee].message &&
			this.currentErrors[WalletsFields.AvailableBalance] &&
			!this.currentErrors[WalletsFields.AvailableBalance].message
		) {
			if (this.getCryptoCurrency) {
				if (
					(this.getCryptoCurrency.addressPublicKey &&
						this.currentErrors[WalletsFields.PublicKeyIsEmpty] &&
						!this.currentErrors[WalletsFields.PublicKeyIsEmpty].message) ||
					!this.getCryptoCurrency.addressPublicKey
				) {
					return false;
				}
			}
		}
		return true;
	}

	public get isAutoWithdrawalDisabled(): boolean {
		if (
			this.getActiveWallet &&
			this.getActiveTransport &&
			(this.withdrawalTotalBalance ||
				(this.currentErrors[WalletsFields.MinimumLimit] && !this.currentErrors[WalletsFields.MinimumLimit].message)) &&
			this.currentErrors[WalletsFields.AddressIsEmpty] &&
			!this.currentErrors[WalletsFields.AddressIsEmpty].message &&
			((this.currentErrors[WalletsFields.CommentIsEmpty] &&
				!this.currentErrors[WalletsFields.CommentIsEmpty].message) ||
				!this.useCommentWithdrawal) &&
			(this.currentErrors[WalletsFields.AddressWrongNetwork]
				? !this.currentErrors[WalletsFields.AddressWrongNetwork].message
				: true) &&
			(this.withdrawalTotalBalance ||
				(this.currentErrors[WalletsFields.MaximumLimit] && !this.currentErrors[WalletsFields.MaximumLimit].message)) &&
			(this.withdrawalTotalBalance ||
				(this.currentErrors[WalletsFields.LessThanFee] && !this.currentErrors[WalletsFields.LessThanFee].message))
		) {
			if (this.getCryptoCurrency) {
				if (
					(this.getCryptoCurrency.addressPublicKey &&
						this.currentErrors[WalletsFields.PublicKeyIsEmpty] &&
						!this.currentErrors[WalletsFields.PublicKeyIsEmpty].message) ||
					!this.getCryptoCurrency.addressPublicKey
				) {
					return false;
				}
			}
		}
		return true;
	}

	public get getCryptoToken(): WALLETS.CryptoToken | undefined {
		return this.cryptoTokens?.find((cryptoToken) => cryptoToken.id === this.activeTransport?.cryptoTokenId);
	}

	public get getMarket(): any {
		const market = this.markets?.find((market: any) => market.currencyId === this.activeWallet?.currencyId);

		if (market) {
			const res = market.derivedCurrencyList.find((derivedCurrency: any) => derivedCurrency.derivedCurrencyId == 2);
			return res;
		}
		return null;
	}

	public async checkU2fToken(u2fResponse: string): Promise<string | void> {
		if (window.PublicKeyCredential) {
			const serializeableU2fData = await this.store.state.u2f.api.getCredentials(u2fResponse);

			return serializeableU2fData;
		} else {
			console.warn('Not supported PublicKeyCredential');
		}
	}

	public getCurrencyFromSharedData(currencyName: string): HISTORY.Currencies | undefined {
		const currencies: Array<HISTORY.Currencies> = this.sharedDataCurrencies;
		return currencies?.find((currency: HISTORY.Currencies) => currency.title === currencyName);
	}

	public get sharedDataCurrencies(): HISTORY.Currencies[] {
		return this.store.state.sharedData.currencies;
	}

	public get fiatP2PCurrencies(): HISTORY.Currencies[] {
		const fiatCurrencies = this.sharedDataCurrencies.reduce<HISTORY.Currencies[]>((acc, currency) => {
			if (currency.type === CurrencyType.Fiat) {
				const newItem = { ...currency, iconName: `fiat.${currency.title}` };
				acc.push(newItem);
				return acc;
			}

			return acc;
		}, []);

		return fiatCurrencies;
	}

	public get cryptoP2PCurrencies(): HISTORY.Currencies[] {
		const cryptoCurrencies = this.sharedDataCurrencies.reduce<HISTORY.Currencies[]>((acc, currency) => {
			if (currency.type === CurrencyType.Cryptocurrency && currency.id !== this.activeWallet?.currencyId) {
				const newItem = { ...currency, iconName: `currency.${currency.title}` };
				acc.push(newItem);
				return acc;
			}

			return acc;
		}, []);
		return cryptoCurrencies;
	}

	public get sharedDataPaymentMethods(): any[] {
		return this.store.state.sharedData.paymentMethods;
	}

	public get isFirstStep(): boolean {
		return (
			this.router.currentRoute.name === 'balance-activeForm' || this.router.currentRoute.name === 'balance-wallets'
		);
	}

	public get paymentMethodsMap(): Map<number, any> {
		const newMap = new Map();
		this.sharedDataPaymentMethods.forEach((method) => {
			newMap.set(method.id, method);
		});

		return newMap;
	}

	public get paymentMethodsMapByPathName(): Map<string, any> {
		const newMap = new Map();
		this.sharedDataPaymentMethods.forEach((method) => {
			newMap.set(method.pathName, method);
		});

		return newMap;
	}

	public get currentPaymentMethodInfo(): any[] {
		if (this.activeForm === FormType.DEPOSIT) {
			const curentPaymentMethod = this.paymentMethodInfo.find(
				(method: any) =>
					method.giveCurrencyId == this.activeWallet?.currencyId &&
					method.getCurrencyId == this.secondCurrencyStepFlow.id
			);

			if (!curentPaymentMethod) {
				return [];
			}

			return curentPaymentMethod.sellOffers.map((offer: any) => ({
				...offer,
				paymentMethod: this.paymentMethodsMap.get(offer.paymentMethodId)
			}));
		}

		const curentPaymentMethod = this.paymentMethodInfo.find(
			(method: any) =>
				method.getCurrencyId == this.activeWallet?.currencyId && method.giveCurrencyId == this.secondCurrencyStepFlow.id
		);

		if (!curentPaymentMethod) {
			return [];
		}

		return curentPaymentMethod.buyOffers.map((offer: any) => ({
			...offer,
			paymentMethod: this.paymentMethodsMap.get(offer.paymentMethodId)
		}));
	}

	public get computedGlobalRouter(): any {
		return this.globalRouter;
	}

	public get getAuthenticatedUserName(): any {
		return this.store.state.auth.authenticatedUser.userName;
	}

	public get isAutoViewAvailable(): boolean {
		const feature = this.configsModule.getConfig('feature');

		return feature?.balanceAutoViews === undefined || feature.balanceAutoViews === true;
	}

	public get actionForms(): undefined | WALLETS.FormTypeList {
		const feature = this.configsModule.getConfig('feature');

		return feature?.balanceForms;
	}

	public get seamlessIntegrationEnabled(): boolean {
		const feature = this.configsModule.getConfig('feature');

		return feature?.balanceSeamlessIntegration === true;
	}

	public get seamlessStepsEnabled(): boolean {
		const feature = this.configsModule.getConfig('feature');

		return feature?.balanceSeamlessSteps === true;
	}

	public get domainUrl(): boolean {
		const settings = this.store.state.settingsService.getSettings();
		return settings.DOMAIN_URL;
	}

	public getLocalStorageItems(string: string): any {
		return this.storageModule.read(string);
	}

	public setLocalStorageItem(string: string, data: any): void {
		this.storageModule.write(string, data);
	}

	private isVisibleWithdrawalTag = true;

	public get getIsVisibleWithdrawalTag(): boolean {
		const localWarningMemo = JSON.parse(this.getLocalStorageItems(`warningsHidden-${this.userName}`)) || {};
		const currentString = `warningsHidden-${this.getCryptoCurrency?.tagName?.toUpperCase().replaceAll(' ', '')}-note`;
		if (localWarningMemo[currentString]) this.isVisibleWithdrawalTag = false;
		return this.isVisibleWithdrawalTag;
	}

	public closeWarningTagNote(): void {
		const localWarningMemo = JSON.parse(this.getLocalStorageItems(`warningsHidden-${this.userName}`)) || {};
		const currentString = `warningsHidden-${this.getCryptoCurrency?.tagName?.toUpperCase().replaceAll(' ', '')}-note`;
		localWarningMemo[currentString] = true;
		this.setLocalStorageItem(`warningsHidden-${this.userName}`, JSON.stringify(localWarningMemo));
		this.isVisibleWithdrawalTag = false;
	}

	public keyDownHandler(
		e: COMMON.IEventBase,
		mfaType: keyof typeof NfaServiceType,
		controlInput?: (newValue: string | number) => void
	): any {
		this.validation.keyDownHandlerForInputsMfaCode(e, mfaType, controlInput);
	}

	public checkCanAutoSubmitMfaCodes(): boolean {
		return this.validation.checkCanAutoSubmitMfaCodes(this.withdrawalCodes);
	}

	public setShowBalance(): void {
		this.sharedData.setShowBalance();
	}

	public getListWithAutoLoading({
		listDefault,
		mutableList,
		ref,
		itemHeight,
		type = 'default',
		itemPerPage,
		setValue
	}: {
		listDefault: Array<any>;
		mutableList: Array<any>;
		ref: Vue | Element | (Vue | Element)[] | any;
		itemHeight: number;
		type: 'default' | 'search';
		itemPerPage?: number;
		setValue?: (value?: any) => void;
	}): void {
		return this.optimization.getListWithAutoLoading({
			listDefault,
			mutableList,
			ref,
			itemHeight,
			type,
			itemPerPage,
			setValue
		});
	}
}
