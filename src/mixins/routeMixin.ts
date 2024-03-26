import Vue from 'vue';
import Component from 'vue-class-component';
import MyRootStore from '@/store/store';
import { TransactionsFilterData } from '@/const';

@Component
export default class RouteMixin extends Vue {
	protected historyStore = MyRootStore.getInstance().history;
	protected routeQuery = this.$route.query;

	public setRouteQuery(key: string, value: string | null | undefined | number | number[]): void {
		const routeQuery = JSON.parse(JSON.stringify(this.$route.query));
		if (typeof value === 'object' && value !== null) {
			if (value.length) routeQuery[key] = JSON.stringify(value);
		} else if (value) {
			routeQuery[key] = String(value);
		} else {
			delete routeQuery[key];
		}
		this.$router.replace({ query: routeQuery });
	}

	public clearRouteQuery(): void {
		this.$router.replace({});
	}

	protected initAddressesFilter(): void {
		const addressesFilterKeys = Object.keys(this.routeQuery);
		addressesFilterKeys.forEach((addressFilterKey) => {
			const addressFilter =
				typeof this.historyStore.addressesFilterData[addressFilterKey as keyof HISTORY.AddressesFilter] === 'string'
					? this.routeQuery[addressFilterKey as keyof HISTORY.AddressesFilter]
					: Number(this.routeQuery[addressFilterKey as keyof HISTORY.AddressesFilter]);
			this.historyStore.setAddressesFilterValue(addressFilterKey as keyof HISTORY.AddressesFilter, addressFilter);
		});
	}

	protected initTransactionsFilter(): void {
		this.historyStore.setTransactionsFilterValue(
			TransactionsFilterData.DateCreatedFrom,
			this.routeQuery?.dateCreatedFrom || ''
		);
		this.historyStore.setTransactionsFilterValue(
			TransactionsFilterData.DateCreatedTo,
			this.routeQuery?.dateCreatedTo || ''
		);
		this.historyStore.setTransactionsFilterValue(
			TransactionsFilterData.CurrencyId,
			Number(this.routeQuery?.currencyId) || null
		);
		this.historyStore.setTransactionsFilterValue(
			TransactionsFilterData.OperationType,
			this.routeQuery?.operationType || null
		);
		this.historyStore.setTransactionsFilterValue(
			TransactionsFilterData.TransactionStatusList,
			JSON.parse((this.routeQuery?.transactionStatusList as string) || '[]')
		);
		this.historyStore.setTransactionsFilterValue(
			TransactionsFilterData.CryptoCurrencyIdList,
			JSON.parse((this.routeQuery?.cryptoCurrencyIdList as string) || '[]')
		);
	}
}
