// import { State } from 'vuex-simple';
import {
	CurrencyType,
	CurrencyTypeIconNamespace,
	DealStatuses,
	FormType,
	getTableDataXSReduceCallback,
	HISTORY_TABLE_LIMIT,
	HISTORY_TABLE_TYPE,
	NfaServiceType,
	OperationSide,
	OperationType,
	OperationTypeFilter,
	renderDateKey,
	TransactionCompletedStatus,
	TransactionStatus
} from '@/const';
import MyRootStore, { getStore } from '@/store/store';
import { Getter, State } from 'vuex-simple';
import Vue from 'vue';
import { IMap } from '@/types/common';

let instance: HistoryModule | null = null;

function getDateWithZeroUTC(value: string, dayEnd?: boolean): string {
	if (value) {
		const dateValue = new Date(value).getTime();
		const newDateValue = new Date().getTimezoneOffset() * 60 * 1000;
		const dayEndValue = dayEnd ? 24 * 60 * 60 * 1000 : 0;
		const dateWithZeroUTC = new Date(dateValue + newDateValue + dayEndValue);
		return dateWithZeroUTC.toISOString();
	}
	return '';
}

export default class HistoryModule {
	private store = getStore();
	private http = this.store.state.api.api.createHttpClient({});
	private notificationChat = getStore().state.chats.api.getChannelById('notification');
	private operationTypeListFilter = this.store.state.configs.api.getConfig('BALANCE')?.operationTypeList;

	static getInstance(): HistoryModule {
		return instance || new HistoryModule();
	}

	constructor() {
		if (instance) return instance;
		instance = this;
		this.notificationChat.addMessageListener(
			'Operation',
			(data: HISTORY.Operation) => {
				if (data.method === 'Transaction fee') {
					if (this.lastOperations.length >= 16) {
						this.lastOperations.pop();
					}

					this.lastOperations.splice(1, 0, data);
				}
			},
			'newTransactionForTable'
		);

		this.notificationChat.addMessageListener(
			'UserTransaction',
			(data: HISTORY.UserTransaction) => {
				const lastTransactionIndex = this.lastOperations.findIndex((operation: any) => operation.id === data.id);
				if (data?.transactionFee !== undefined && data?.fee === undefined) {
					data.fee = -data.transactionFee;
				}

				if (data?.status && TransactionCompletedStatus.includes(data.status)) {
					data.frozen = false;

					if (data?.fee) {
						const lastOperationFee = this.lastOperations.findIndex(
							(operation: any) => operation.operationType === OperationType.TransactionFee && operation.id === data.id
						);

						if (lastOperationFee !== -1) {
							this.lastOperations[lastOperationFee].frozen = false;
						}
					}
				} else data.frozen = true;

				if (lastTransactionIndex !== -1) {
					const newLastTransactionArray = [...this.lastOperations];
					newLastTransactionArray[lastTransactionIndex] = data;

					this.lastOperations = newLastTransactionArray;
					MyRootStore.getInstance().wallets.updateLastTransactionData(data);
				} else {
					if (this.lastOperations.length >= 16) {
						this.lastOperations.pop();
					}

					this.lastOperations = [data, ...this.lastOperations];
				}

				// refresh existed operation
				const operationsItem = this.operations.find((e: any) => e.id === data.id);
				if (operationsItem) {
					Vue.set(operationsItem, 'transactionData', { ...operationsItem.transactionData, ...data.transactionData });
				}

				const { currencyId, operationType, transactionStatusList } = this.transactionsFilterData;
				const { dateCreatedFrom, dateCreatedTo } = this.dateWithZeroUTC.transactionsFilterData;

				if (
					this.currentPage == 1 &&
					(Boolean(dateCreatedFrom) ? new Date(data.dateCreated) > new Date(dateCreatedFrom) : true) &&
					(Boolean(dateCreatedTo) ? new Date(data.dateCreated) < new Date(dateCreatedTo) : true) &&
					(transactionStatusList.length ? transactionStatusList.flat().includes(data.status) : true) &&
					(operationType && this.getOperationTypeList(operationType).length
						? this.getOperationTypeList(operationType).includes(data.operationType)
						: true) &&
					(operationType && Boolean(this.getOperationSide(operationType))
						? data.side === this.getOperationSide(operationType)
						: true) &&
					(currencyId ? data.currencyId == currencyId : true)
				) {
					const operationsIndex = this.operations.findIndex((operation: any) => operation.id === data.id);

					if (operationsIndex !== -1) {
						const newOperationsArray = [...this.operations];
						newOperationsArray[operationsIndex] = data;

						this.operations = newOperationsArray;
					} else {
						if (this.operations.length >= HISTORY_TABLE_LIMIT) {
							this.operations.pop();
						}

						this.operations = [data, ...this.operations];
					}
				}
			},
			'newTransactionForTable'
		);
	}

	@State()
	public currentPage: number = 1;

	@State()
	public totalOperations: number = HISTORY_TABLE_LIMIT;

	@State()
	public totalOperationsFrozen: number = HISTORY_TABLE_LIMIT;

	@State()
	public operations: any = [];

	@State()
	public operationsFrozen: HISTORY.Transaction[] = [];

	@State()
	public totalAddresses: number = HISTORY_TABLE_LIMIT;

	@State()
	public addresses: any = [];

	@State()
	public basicAddressList: Array<HISTORY.Address> = [];

	@State()
	public myDeals: any = [];

	@State()
	public myDealsInProcess: any = [];

	@State()
	public totalDeals: number = HISTORY_TABLE_LIMIT;

	@State()
	public lastOperations: any = [];

	@State()
	public operationsLoading: boolean = false;

	@State()
	public operationsFrozenLoading: boolean = false;

	@State()
	public lastOperationsLoading: boolean = true;

	@State()
	public addressesLoading: boolean = true;

	@State()
	public dealsLoading: boolean = true;

	@State()
	public dealsInProcessLoading: boolean = true;

	@State()
	public isAddressInfoModal: boolean = false;

	@State()
	public addressInfoModalData = {} as HISTORY.Address;

	@State()
	public isTransactionsIOModal: boolean = false;

	@State()
	public isTransactionsConversionModal: boolean = false;

	@State()
	public isTransactionsStakingModal: boolean = false;

	@State()
	public isTransactionsReferralModal: boolean = false;

	@State()
	public isTransactionsP2pModal: boolean = false;

	@State()
	public transactionsModalData = {} as HISTORY.Transaction;

	@State()
	public isTransactionsFiltersModal: boolean = false;

	@State()
	public isTransactionsFiltered: boolean = false;

	@State()
	public addressesModalData = {} as HISTORY.Transaction;

	@State()
	public isAddressesFiltersModal: boolean = false;

	@State()
	public isAddressesFiltered: boolean = false;

	@State()
	public isDownloadHistoryModal: boolean = false;

	@State()
	public currentHistory: string = 'transactions';

	@State()
	public addressesSortData: HISTORY.AddressesSort = {
		sortDesc: true,
		sort: 'dateCreated'
	};

	public setAddressesSortValue(key: keyof HISTORY.AddressesSort, value: any): void {
		Vue.set(this.addressesSortData, key, value);
	}

	@State()
	public transactionsFilterData: HISTORY.TransactionsFilter = {
		dateCreatedFrom: '',
		dateCreatedTo: '',
		currencyId: null,
		operationType: null,
		transactionStatusList: [],
		cryptoCurrencyIdList: []
	};

	@State()
	public addressesFilterData: HISTORY.AddressesFilter = {
		dateFrom: '',
		dateTo: '',
		currencyId: null,
		transactionsCountFrom: '',
		transactionsCountTo: '',
		cryptoCurrencyId: null,
		status: ''
	};

	public get dateWithZeroUTC(): COMMON.IMap<COMMON.IMap<string>> {
		return {
			transactionsFilterData: {
				dateCreatedFrom: getDateWithZeroUTC(this.transactionsFilterData.dateCreatedFrom),
				dateCreatedTo: getDateWithZeroUTC(this.transactionsFilterData.dateCreatedTo, true)
			},
			addressesFilterData: {
				dateFrom: getDateWithZeroUTC(this.addressesFilterData.dateFrom),
				dateTo: getDateWithZeroUTC(this.addressesFilterData.dateTo, true)
			}
		};
	}

	public get getOperationTypeListFilter(): Array<OperationTypeFilter> | [] {
		if (this.operationTypeListFilter) {
			return this.operationTypeListFilter;
		}
		return [];
	}

	public setAddressesFilterValue(key: keyof HISTORY.AddressesFilter, value: any): void {
		this.isAddressesFiltered = true;
		Vue.set(this.addressesFilterData, key, value);
	}

	public setTransactionsFilterValue(key: keyof HISTORY.TransactionsFilter, value: any): void {
		this.isTransactionsFiltered = true;
		Vue.set(this.transactionsFilterData, key, value);
	}

	public clearTransactionsFilterData(): void {
		this.isTransactionsFiltered = false;
		this.transactionsFilterData = {
			dateCreatedFrom: '',
			dateCreatedTo: '',
			currencyId: null,
			operationType: null,
			transactionStatusList: [],
			cryptoCurrencyIdList: []
		};
	}

	public clearAddressesFilterData(): void {
		this.isAddressesFiltered = false;
		this.addressesFilterData = {
			dateFrom: '',
			dateTo: '',
			currencyId: null,
			transactionsCountFrom: '',
			transactionsCountTo: '',
			cryptoCurrencyId: null,
			status: ''
		};
	}

	public showTransactionsFiltersModal(value: boolean): void {
		this.isTransactionsFiltersModal = value;
	}

	public showAddressesFiltersModal(value: boolean): void {
		this.isAddressesFiltersModal = value;
	}

	public setDownloadHistoryModal(value: boolean): void {
		this.isDownloadHistoryModal = value;
	}

	public async setOperations(offset: number = 0): Promise<void> {
		const { currencyId, cryptoCurrencyIdList, operationType, transactionStatusList } = this.transactionsFilterData;
		const { dateCreatedFrom, dateCreatedTo } = this.dateWithZeroUTC.transactionsFilterData;
		this.operationsLoading = true;
		const { data, type } = await this.http.readBySearchParams('	// hidden', {
			limit: HISTORY_TABLE_LIMIT,
			offset,
			dateCreatedFrom,
			dateCreatedTo,
			transactionStatusList: transactionStatusList.flat(),
			operationTypeList: this.getOperationTypeList(operationType),
			side: this.getOperationSide(operationType),
			currencyIdList: currencyId ? [currencyId] : [],
			cryptoCurrencyIdList,
			searchString: '',
			cryptoTxId: '',
			amountFrom: '',
			amountTo: '',
			feeFrom: '',
			feeTo: '',
			cryptoAddress: '',
			transactionMethodTypeList: [],
			getTotal: true
		});

		if (type === 'success') {
			this.operations = data.items;
			this.totalOperations = data.total;
		}

		this.operationsLoading = false;
	}

	public async setOperationsXS(offset: number = 0): Promise<void> {
		const { currencyId, cryptoCurrencyIdList, operationType, transactionStatusList } = this.transactionsFilterData;
		const { dateCreatedFrom, dateCreatedTo } = this.dateWithZeroUTC.transactionsFilterData;
		this.operationsLoading = true;
		const { data, type } = await this.http.readBySearchParams('	// hidden', {
			limit: HISTORY_TABLE_LIMIT,
			offset,
			dateCreatedFrom,
			dateCreatedTo,
			transactionStatusList: transactionStatusList.flat(),
			operationTypeList: this.getOperationTypeList(operationType),
			side: this.getOperationSide(operationType),
			currencyIdList: currencyId ? [currencyId] : [],
			cryptoCurrencyIdList,
			searchString: '',
			cryptoTxId: '',
			amountFrom: '',
			amountTo: '',
			feeFrom: '',
			feeTo: '',
			cryptoAddress: '',
			transactionMethodTypeList: [],
			getTotal: true
		});

		if (type === 'success') {
			this.operations = [...this.operations, ...data.items];
			this.totalOperations = data.total;
		}

		this.operationsLoading = false;
	}

	public async setOperationsFrozen(offset: number = 0): Promise<void> {
		const { currencyId, cryptoCurrencyIdList, operationType, transactionStatusList } = this.transactionsFilterData;
		const { dateCreatedFrom, dateCreatedTo } = this.dateWithZeroUTC.transactionsFilterData;
		this.operationsFrozenLoading = true;
		const { data, type } = await this.http.readBySearchParams('	// hidden, {
			limit: HISTORY_TABLE_LIMIT,
			offset,
			dateCreatedFrom,
			dateCreatedTo,
			transactionStatusList: transactionStatusList.flat(),
			operationTypeList: this.getOperationTypeList(operationType),
			side: this.getOperationSide(operationType),
			currencyIdList: currencyId ? [currencyId] : [],
			cryptoCurrencyIdList,
			searchString: '',
			cryptoTxId: '',
			amountFrom: '',
			amountTo: '',
			feeFrom: '',
			feeTo: '',
			cryptoAddress: '',
			transactionMethodTypeList: [],
			getTotal: true
		});

		if (type === 'success') {
			this.operationsFrozen = data.items;
			this.totalOperationsFrozen = data.total;
		}

		this.operationsFrozenLoading = false;
	}

	public getOperationTypeList(value: OperationTypeFilter | null): Array<OperationTypeFilter> {
		if (!value) {
			return [
				OperationTypeFilter.Transaction,
				...this.getOperationTypeListFilter.filter((elem: string | number) => Number(elem))
			];
		}
		if (value === OperationTypeFilter.Deposit || value === OperationTypeFilter.Withdrawal) {
			return [OperationTypeFilter.Transaction];
		}
		return [value];
	}

	public getOperationSide(value: OperationTypeFilter | null): OperationSide | string {
		switch (value) {
			case OperationTypeFilter.Deposit:
				return OperationSide.In;
			case OperationTypeFilter.Withdrawal:
				return OperationSide.Out;
			default:
				return '';
		}
	}

	public async setLastOperations(offset: number = 0): Promise<void> {
		this.lastOperationsLoading = true;
		const { data, type } = await this.http.readBySearchParams('	// hidden', {
			limit: 16,
			offset,
			searchString: '',
			cryptoTxId: '',
			currencyIdList: [],
			amountFrom: '',
			amountTo: '',
			feeFrom: '',
			feeTo: '',
			transactionStatusList: [],
			cryptoAddress: '',
			operationTypeList: [],
			transactionMethodTypeList: [],
			getTotal: false
		});
		if (type === 'success' && data && data.operations) {
			this.lastOperations = data.operations;
		}

		this.lastOperationsLoading = false;
	}

	// hidden area
}
