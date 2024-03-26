<template>
	<Widget name="balance-history-table-xs">
		<template v-if="isEmptyDataTable">
			<WidgetItem
				v-slot="{ computedAttrs }"
				name="generic-table"
				class="k-xs-data-table"
				@wheel.passive="scrollListener"
				@scroll.passive="scrollListener"
			>
				<template v-for="(list, date) in xsTableData">
					<Section
						v-bind="computedAttrs"
						:key="date"
						:list="list"
						:date="date"
					/>
				</template>
			</WidgetItem>

			<WidgetItem
				v-if="renderShowMore"
				v-slot="{ computedAttrs }"
				name="show-more-btn"
			>
				<KBtn v-bind="computedAttrs" @click="$emit('loadMore')" />
			</WidgetItem>

			<WidgetItem v-slot="{ computedAttrs }" name="fab-scroll-top">
				<KBtn
					v-show="showScrollTop"
					v-bind="computedAttrs"
					@click="scrollToTopItem"
				/>
			</WidgetItem>
		</template>
		<template v-else>
			<WidgetItem v-slot="{ computedAttrs }" name="empty-screen">
				<EmptyTableScreen v-bind="computedAttrs" :type="historyType" />
			</WidgetItem>
		</template>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component } from 'vue-property-decorator';
	import MyRootStore from '@/store/store';
	import Section from '@/components/HistoryTable/Section.vue';
	import EmptyTableScreen from '@/components/HistoryTable/common/EmptyTableScreen.vue';
	import { HISTORY_TABLE_TYPE } from '@/const';

	const SCROLL_THRESHOLD = 160;

	@Component({
		components: { Section, EmptyTableScreen }
	})
	export default class HistoryTableXS extends Vue {
		protected historyStore = MyRootStore.getInstance().history;
		protected showScrollTopScrollCondition: boolean = false;

		protected get showScrollTopDataCondition(): boolean {
			return (
				(this.historyStore.operations.length !== 0 && this.isTransactionHistory) ||
				(this.historyStore.addresses.length !== 0 && this.isAddressesHistory) ||
				(this.historyStore.myDeals.length !== 0 && this.isDealsHistory)
			);
		}

		protected get showScrollTop(): boolean {
			return this.showScrollTopScrollCondition && this.showScrollTopDataCondition;
		}

		protected get xsTableData(): COMMON.IMap<any> {
			if (this.isTransactionHistory) return this.historyStore.operationsXSTable;
			if (this.isAddressesHistory) return this.historyStore.addressesXSTable;
			if (this.isDealsHistory) return this.historyStore.dealsXSTable;
			return {};
		}

		protected get isEmptyDataTable(): boolean {
			return Boolean(Object.keys(this.xsTableData).length);
		}

		protected get operationsXSTable(): any {
			return this.historyStore.operationsXSTable;
		}

		protected get currentPage(): any {
			return this.historyStore.currentPage;
		}

		protected get operationsLoading(): boolean {
			return this.historyStore.operationsLoading;
		}

		protected get totalAddresses(): any {
			return this.historyStore.totalAddresses;
		}

		protected get addressesLoading(): boolean {
			return this.historyStore.addressesLoading;
		}

		protected get dealsLoading(): boolean {
			return this.historyStore.dealsLoading;
		}

		protected get renderShowMore(): boolean {
			return (
				(this.historyStore.operations.length !== 0 &&
					this.historyStore.totalOperations !== this.historyStore.operations.length &&
					this.isTransactionHistory) ||
				(this.historyStore.addresses.length !== 0 &&
					this.historyStore.totalAddresses !== this.historyStore.addresses.length &&
					this.isAddressesHistory) ||
				(this.historyStore.myDeals.length !== 0 &&
					this.historyStore.totalDeals !== this.historyStore.myDeals.length &&
					this.isDealsHistory)
			);
		}

		protected get historyType(): string {
			return this.$route.params.historyType || '';
		}

		protected get isTransactionHistory(): boolean {
			return this.historyType === HISTORY_TABLE_TYPE.TRANSACTIONS;
		}

		protected get isAddressesHistory(): boolean {
			return this.historyType === HISTORY_TABLE_TYPE.ADDRESSES;
		}

		protected get isDealsHistory(): boolean {
			return this.historyType === HISTORY_TABLE_TYPE.DEALS;
		}

		protected scrollToTopItem(): void {
			window.scrollTo({
				top: 80,
				behavior: 'smooth'
			});
		}

		protected scrollListener(): void {
			this.showScrollTopScrollCondition = window.scrollY > SCROLL_THRESHOLD;
		}

		public beforeDestroy(): void {
			window.removeEventListener('scroll', this.scrollListener);
			window.removeEventListener('wheel', this.scrollListener);
		}

		public created(): void {
			window.addEventListener('scroll', this.scrollListener);
			window.addEventListener('wheel', this.scrollListener);
		}
	}
</script>