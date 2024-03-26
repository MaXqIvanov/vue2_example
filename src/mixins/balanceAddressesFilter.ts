import Component, { mixins } from 'vue-class-component';
import {
	HISTORY_TABLE_TYPE,
	BALANCE_TEXT,
	OperationTypeFilter,
	AddressesFilterData,
	TransactionsFilterData
} from '@/const';
import MyRootStore from '@/store/store';
import RouteMixin from '@/mixins/routeMixin';
@Component
export default class BalanceAddressesFilter extends mixins(RouteMixin) {
	protected appRootStore = MyRootStore.getInstance();
	protected walletsStore = this.appRootStore.wallets;
	protected historyStore = this.appRootStore.history;

	protected BALANCE_TEXT = BALANCE_TEXT;
	protected readonly tabs: Array<string> = [HISTORY_TABLE_TYPE.TRANSACTIONS, HISTORY_TABLE_TYPE.ADDRESSES];

	protected get allNetworkCurrency(): Array<WALLETS.networkCryptoCurrency> {
		return this.walletsStore.allNameNetworkCurrency;
	}

	protected get historyType(): string {
		return this.$route.params.historyType ?? this.tabs[0];
	}

	protected get isAddressesHistory(): boolean {
		return this.historyType === HISTORY_TABLE_TYPE.ADDRESSES;
	}

	protected get addressesCryptoCurrencyValue(): number | null {
		return this.historyStore.addressesFilterData.cryptoCurrencyId;
	}

	protected get addressesTransactionsCountTo(): string {
		return this.historyStore.addressesFilterData.transactionsCountTo;
	}

	protected get isTransactionHistory(): boolean {
		return this.historyType === HISTORY_TABLE_TYPE.TRANSACTIONS;
	}

	public eventInputHandler(value: OperationTypeFilter): void {
		let filterType: keyof HISTORY.AddressesFilter | keyof HISTORY.TransactionsFilter =
			TransactionsFilterData.OperationType;
		if (this.isTransactionHistory) {
			filterType = TransactionsFilterData.OperationType;
			this.historyStore.setTransactionsFilterValue(filterType, value);
			this.historyStore.setOperations();
		} else if (this.isAddressesHistory) {
			filterType = AddressesFilterData.CryptoCurrencyId;
			this.historyStore.setAddressesFilterValue(filterType, value);
			this.historyStore.setAddresses();
		}
		this.setRouteQuery(filterType, value);
	}
}
