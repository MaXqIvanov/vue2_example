<template>
	<InfoModal
		:value="isModal"
		:titleModal="title"
		@input="showModal"
		@click:outside="clearHandler"
	>
		<template #body-2>
			<Widget name="balance-transactions-filter-modal">
				<WidgetItem
					v-slot="{ currencyTitle }"
					name="currency"
					:contentVariables="variables"
				>
					<CurrencyFilter
						:value="currencyValue"
						:title="currencyTitle"
						@input="currencyInputHandler"
					/>
				</WidgetItem>
				<WidgetItem
					v-slot="{ eventTitle }"
					name="event"
					:contentVariables="variables"
				>
					<EventFilter
						:value="eventValue"
						:title="eventTitle"
						@input="eventInputHandler"
					/>
				</WidgetItem>
				<WidgetItem
					v-if="isStatus"
					v-slot="{ statusTitle }"
					name="status"
					:contentVariables="variables"
				>
					<StatusFilter
						:value="statusValue"
						:title="statusTitle"
						@input="statusInputHandler"
					/>
				</WidgetItem>
				<WidgetItem
					v-slot="{ dateTitle }"
					name="date"
					:contentVariables="variables"
				>
					<DateRangeFilter
						:fromValue="fromValue"
						:toValue="toValue"
						:title="dateTitle"
						:locale="currentLocale"
						@input="dateInputHandler"
					/>
				</WidgetItem>
				<WidgetItem
					v-slot="{ titleFilter }"
					name="network"
					:contentVariables="filterNetworkVariables"
				>
					<EventQuickFilter
						:value="cryptoCurrencyIdList"
						:list="allNetworkCurrency"
						:title="titleFilter"
						:isAutocomplete="true"
						nameWidget="balance-modal-event-quick-filter-modal"
						@input="networkInputHandler"
					/>
				</WidgetItem>
			</Widget>
		</template>
		<template #actions>
			<Widget name="balance-transactions-filter-actions">
				<WidgetItem
					v-slot="{ computedAttrs, clear }"
					name="clear"
					:contentVariables="variables"
				>
					<KBtn
						v-bind="computedAttrs"
						@click="clearHandler"
					>
						{{ clear }}
					</KBtn>
				</WidgetItem>
				<WidgetItem
					v-slot="{ computedAttrs, apply }"
					name="apply"
					:contentVariables="variables"
				>
					<KBtn
						v-bind="computedAttrs"
						@click="applyHandler"
					>
						{{ apply }}
					</KBtn>
				</WidgetItem>
			</Widget>
		</template>
	</InfoModal>
</template>

<script lang="ts">
	import { Component } from 'vue-property-decorator';
	import MyRootStore from '@/store/store';
	import InfoModal from '@/views/ModalViews/InfoModal.vue';
	import CurrencyFilter from '@/components/ModalComponents/CurrencyFilter.vue';
	import EventFilter from '@/components/ModalComponents/EventFilter.vue';
	import StatusFilter from '@/components/ModalComponents/StatusFilter.vue';
	import DateRangeFilter from '@/components/ModalComponents/DateRangeFilter.vue';
	import { OperationTypeFilter, TransactionsFilterData } from '@/const';
	import EventQuickFilter from '@/components/ModalComponents/EventQuickFilter.vue';
	import { mixins } from 'vue-class-component';
	import RouteMixin from '@/mixins/routeMixin';

	@Component({
		name: 'TransactionsFilterModal',
		components: { EventQuickFilter, InfoModal, CurrencyFilter, EventFilter, StatusFilter, DateRangeFilter }
	})
	export default class TransactionsFilterModal extends mixins(RouteMixin) {
		protected historyStore = MyRootStore.getInstance().history;
		protected walletsStore = MyRootStore.getInstance().wallets;

		protected get isModal(): boolean {
			return this.historyStore.isTransactionsFiltersModal;
		}
		protected get isStatus(): boolean {
			return this.eventValue === OperationTypeFilter.Deposit || this.eventValue === OperationTypeFilter.Withdrawal;
		}

		protected get currencyValue(): number | null {
			return this.historyStore.transactionsFilterData.currencyId;
		}

		protected get eventValue(): OperationTypeFilter | null {
			return this.historyStore.transactionsFilterData.operationType;
		}

		protected get currentLocale(): string {
			return this.historyStore.currentLocale;
		}

		protected get statusValue(): Array<number> {
			return this.historyStore.transactionsFilterData.transactionStatusList;
		}

		protected get fromValue(): string {
			return this.historyStore.transactionsFilterData.dateCreatedFrom;
		}

		protected get cryptoCurrencyIdList(): number {
			return this.historyStore.transactionsFilterData.cryptoCurrencyIdList?.length
				? this.historyStore.transactionsFilterData.cryptoCurrencyIdList[0]
				: 0;
		}

		protected get toValue(): string {
			return this.historyStore.transactionsFilterData.dateCreatedTo;
		}

		public showModal(value: boolean): void {
			if (!value) {
				this.historyStore.clearTransactionsFilterData();
				this.historyStore.setOperations();
			}
			this.historyStore.showTransactionsFiltersModal(value);
		}

		public currencyInputHandler(value: number): void {
			this.historyStore.setTransactionsFilterValue(TransactionsFilterData.CurrencyId, value);
		}

		public eventInputHandler(value: OperationTypeFilter): void {
			this.historyStore.setTransactionsFilterValue(TransactionsFilterData.OperationType, value);
		}

		public networkInputHandler(value: number): void {
			this.historyStore.setTransactionsFilterValue(TransactionsFilterData.CryptoCurrencyIdList, [value]);
		}

		public statusInputHandler(value: Array<number>): void {
			this.historyStore.setTransactionsFilterValue(TransactionsFilterData.TransactionStatusList, value);
		}

		public dateInputHandler(data: Array<string>): void {
			this.historyStore.setTransactionsFilterValue(TransactionsFilterData.DateCreatedFrom, data[0] ?? '');
			this.historyStore.setTransactionsFilterValue(TransactionsFilterData.DateCreatedTo, data[1] ?? '');
		}

		public clearHandler(): void {
			this.historyStore.clearTransactionsFilterData();
			this.historyStore.setOperations();
			this.historyStore.showTransactionsFiltersModal(false);
			this.clearRouteQuery();
		}

		public applyHandler(): void {
			this.historyStore.setOperations();
			this.historyStore.showTransactionsFiltersModal(false);

			const transactionsFilterDataKeys = Object.keys(this.historyStore.transactionsFilterData);
			transactionsFilterDataKeys.forEach((transactionFilterKey) => {
				const transactionFilter =
					this.historyStore.transactionsFilterData[transactionFilterKey as keyof HISTORY.TransactionsFilter];
				this.setRouteQuery(transactionFilterKey, transactionFilter);
			});
		}

		protected get allNetworkCurrency(): Array<WALLETS.networkCryptoCurrency> {
			return this.walletsStore.allNameNetworkCurrency;
		}

		protected get title(): string {
			return this.$t('balance.transactionsFiltersModalTitle');
		}

		protected variables = [
			{
				name: 'currencyTitle',
				type: 'translation',
				defaultValue: 'balance.filtersCurrencyTitle'
			},
			{
				name: 'eventTitle',
				type: 'translation',
				defaultValue: 'balance.filtersEventTitle'
			},
			{
				name: 'statusTitle',
				type: 'translation',
				defaultValue: 'balance.filtersStatusTitle'
			},
			{
				name: 'dateTitle',
				type: 'translation',
				defaultValue: 'balance.filtersDateTitle'
			},
			{
				name: 'clear',
				type: 'translation',
				defaultValue: 'balance.filtersClearAction'
			},
			{
				name: 'apply',
				type: 'translation',
				defaultValue: 'balance.filtersApplyAction'
			}
		];

		protected filterNetworkVariables = [
			{
				name: 'titleFilter',
				type: 'translation',
				defaultValue: 'balance.networkFilterTitle'
			}
		];
	}
</script>
