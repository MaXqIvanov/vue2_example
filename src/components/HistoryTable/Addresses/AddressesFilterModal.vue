<template>
	<InfoModal
		:value="isModal"
		:titleModal="title"
		@input="showModal"
		@click:outside="clearHandler"
	>
		<template #body-2>
			<Widget name="balance-addresses-filter-modal">
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
					v-slot="{ computedAttrs }"
					name="status"
				>
					<KSelect
						v-model="historyStore.addressesFilterData.status"
						v-bind="computedAttrs"
						:items="addressStatusList"
						itemValue="value"
					>
						<template #selection="{ item }">
							<Widget name="balance-modal-event-quick-filter-selection">
								<WidgetItem
									v-slot="{ computedAttrs }"
									name="text"
								>
									<KText
										v-bind="computedAttrs"
									>
										{{ $t(`balance.${item}`) }}
									</KText>
								</WidgetItem>
							</Widget>
						</template>
						<template #item="{ item }">
							<Widget name="balance-modal-event-filter-item">
								<WidgetItem
									v-slot="{ computedAttrs }"
									name="title"
								>
									<KText
										v-bind="computedAttrs"
									>
										{{ $t(`balance.${item}`) }}
									</KText>
								</WidgetItem>
							</Widget>
						</template>
					</KSelect>
				</WidgetItem>
				<WidgetItem
					v-slot="{ titleFilter }"
					name="network"
					:contentVariables="filterNetworkVariables"
				>
					<EventQuickFilter
						v-if="isAddressesHistory"
						:value="addressesCryptoCurrencyValue"
						:list="allNetworkCurrency"
						:title="titleFilter"
						:isAutocomplete="true"
						nameWidget="balance-modal-event-quick-filter-modal"
						@input="eventInputHandler"
					/>
				</WidgetItem>
				<WidgetItem
					v-slot="{ computedAttrs }"
					name="countTransactions"
				>
					<KTextField
						v-model="addressesTransactionsCountTo"
						v-bind="computedAttrs"
						hideDetails
						@input="countTransactionsInputHandler"
					/>
				</widgetitem>
			</Widget>
		</template>
		<template #actions>
			<Widget name="balance-addresses-filter-actions">
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
	import { mixins } from 'vue-class-component';
	import MyRootStore from '@/store/store';
	import InfoModal from '@/views/ModalViews/InfoModal.vue';
	import CurrencyFilter from '@/components/ModalComponents/CurrencyFilter.vue';
	import EventFilter from '@/components/ModalComponents/EventFilter.vue';
	import StatusFilter from '@/components/ModalComponents/StatusFilter.vue';
	import DateRangeFilter from '@/components/ModalComponents/DateRangeFilter.vue';
	import EventQuickFilter from '@/components/ModalComponents/EventQuickFilter.vue';
	import BalanceAddressesFilter from '@/mixins/balanceAddressesFilter';
	import { AddressStatus } from '@/const';

	@Component({
		name: 'AddressesFilterModal',
		components: { EventQuickFilter, InfoModal, CurrencyFilter, EventFilter, StatusFilter, DateRangeFilter }
	})
	export default class AddressesFilterModal extends mixins(BalanceAddressesFilter) {
		protected historyStore = MyRootStore.getInstance().history;

		protected get isModal(): boolean {
			return this.historyStore.isAddressesFiltersModal;
		}

		protected get currencyValue(): number | null {
			return this.historyStore.addressesFilterData.currencyId;
		}

		protected get fromValue(): string {
			return this.historyStore.addressesFilterData.dateFrom;
		}

		protected get toValue(): string {
			return this.historyStore.addressesFilterData.dateTo;
		}

		protected get currentLocale(): string {
			return this.historyStore.currentLocale;
		}

		public showModal(value: boolean): void {
			if (!value) {
				this.historyStore.clearAddressesFilterData();
				this.historyStore.setAddresses();
			}
			this.historyStore.showAddressesFiltersModal(value);
		}

		public currencyInputHandler(value: number): void {
			this.historyStore.setAddressesFilterValue('currencyId', value);
		}

		public dateInputHandler(data: Array<string>): void {
			this.historyStore.setAddressesFilterValue('dateFrom', data[0] ?? '');
			this.historyStore.setAddressesFilterValue('dateTo', data[1] ?? '');
		}

		public clearHandler(): void {
			this.historyStore.clearAddressesFilterData();
			this.historyStore.setAddresses();
			this.historyStore.showAddressesFiltersModal(false);
			this.clearRouteQuery();
		}

		public applyHandler(): void {
			this.historyStore.setAddresses();
			this.historyStore.showAddressesFiltersModal(false);

			const transactionsFilterDataKeys = Object.keys(this.historyStore.addressesFilterData);
			transactionsFilterDataKeys.forEach((transactionFilterKey) => {
				const transactionFilter =
					this.historyStore.addressesFilterData[transactionFilterKey as keyof HISTORY.AddressesFilter];
				this.setRouteQuery(transactionFilterKey, transactionFilter);
			});
		}

		public countTransactionsInputHandler(value: number): void {
			this.historyStore.setAddressesFilterValue('transactionsCountFrom', value);
			this.historyStore.setAddressesFilterValue('transactionsCountTo', value);
		}

		protected get title(): string {
			return this.$t('balance.addressesFiltersModalTitle');
		}

		public get addressStatusList(): string[] {
			return Object.values(AddressStatus);
		}

		protected filterNetworkVariables = [
			{
				name: 'titleFilter',
				type: 'translation',
				defaultValue: 'balance.networkFilterTitle'
			}
		];

		protected variables = [
			{
				name: 'currencyTitle',
				type: 'translation',
				defaultValue: 'balance.filtersCurrencyTitle'
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
	}
</script>
