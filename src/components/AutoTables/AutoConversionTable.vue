<template>
	<!-- height="680px" -->
	<div v-if="isLoading || autoConversionList.length">
		<KTable
			v-model="walletsStore.autoConversionSelected"
			class="k-table-primary"
			itemKey="currencyTo.id"
			showSelect
			:headers="headers"
			:itemsPerPage="perPage"
			:items="autoConversionList"
			:paginationShowPerPage="false"
			:showPagination="false"
			:serverItemsLength="total"
			:loading="isLoading"
			loadingComponent="k-progress-linear"
			style="--special-size:20px"
			@page-count="pageCountHandler"
			@change-per-page="changePerPageHandler"
		>
			<template #header.to="{ header }">
				<KText class="k-text-k-typography-body-1-regular" style="color:var(--tertiary-darken-2)">
					{{ $t(header.text) }}
				</KText>
			</template>
			<template #header.from="{ header }">
				<KText class="k-text-k-typography-body-1-regular" style="color:var(--tertiary-darken-2)">
					{{ $t(header.text) }}
				</KText>
			</template>

			<template #item.to="{ item }">
				<KText class="k-text-k-typography-body-1-regular">
					{{ formatFromCurrency(item.currencyTo) }}
				</KText>
			</template>
			<template #item.from="{ item }">
				<KText class="k-text-k-typography-body-1-regular" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:680px">
					{{ formatFromIdList(item.currenciesFrom) }}
				</KText>
			</template>

			<template #item.remove="{ item }">
				<KIcon
					name="remove"
					@click="removeHandler(item)"
				/>
			</template>
			<template #item.edit="{ item }">
				<KIcon
					name="$edit"
					@click="editHandler(item)"
				/>
			</template>
		</KTable>
		<KPagination
			v-if="total > perPage"
			class="k-pagination-default k-pagination-secondary pagination"
			color="var(--primary-lighten-2)"
			nextIcon="pagination-next"
			prevIcon="pagination-prev"
			circle
			:itemsPerPage="perPage"
			:value="currentPage"
			totalVisible="5"
			:length="pageCount"
			@input="paginationHandler"
		/>
	</div>
	<Widget
		v-else
		key="balance-auto-conversion-view"
		name="balance-auto-conversion-view"
	>
		<WidgetItem v-slot="{ computedAttrs }" name="icon">
			<KIcon v-bind="computedAttrs" />
		</WidgetItem>
		<WidgetItem v-slot="{ computedAttrs }" name="text">
			<KText v-bind="computedAttrs" />
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import { ref, defineComponent, computed } from 'vue';
	import MyRootStore from '@/store/store';
	import { headersAutoConversion } from '@/config/configAutoTable';
	import { useRouter } from '@/utils/utils';

	export default defineComponent({
		name: 'AutoConversionTable',
		components: {},
		inheritAttrs: false,

		setup() {
			const router = useRouter();
			const walletsStore = MyRootStore.getInstance().wallets;
			const autoConversionList = computed(() => walletsStore.autoConversionList);
			const total = computed(() => walletsStore.autoConversionTotal);
			const isLoading = computed(() => walletsStore.autoConversionLoading);

			const headers = computed(() => {
				return headersAutoConversion;
			});

			const removeHandler = (item: any): void => {
				walletsStore.deleteAutoConversion(item.currenciesFrom);
			};

			const editHandler = (item: any): void => {
				const wallet = walletsStore.wallets.find(
					(walletItem: any) =>
						walletItem.currencyId == item.currencyTo.id || walletItem.currencyTitle === item.currencyTo.title
				);
				const fromWallets = item.currenciesFrom
					.map((currency: any) => {
						const fromWallet = walletsStore.wallets.find(
							(walletItem: any) => walletItem.currencyId == currency.id || walletItem.currencyTitle === currency.title
						);
						return fromWallet;
					})
					.filter((fromWallet: any) => Boolean(fromWallet));
				if (wallet && fromWallets.length) {
					walletsStore.setAutoEditMode(true);
					walletsStore.setActiveConversionWallet(wallet);
					walletsStore.fromConversionCurrencies = fromWallets;
					router.push({ name: 'auto-conversion-new' });
				}
			};

			const formatFromCurrency = (currency: { id: number; title: string }): string => {
				return currency.title;
			};

			const formatFromIdList = (currencyList: Array<{ id: number; title: string }>): string => {
				const list = currencyList.map((currency) => currency.title);
				return list.join(', ');
			};

			const perPage = computed({
				get(): number {
					return walletsStore.autoConversionPerPage;
				},
				set(newVal: number) {
					walletsStore.autoConversionPerPage = newVal;
				}
			});

			const currentPage = ref(1);

			const pageCount = ref(0);

			const pageCountHandler = (count: number): void => {
				pageCount.value = count;
			};

			const changePerPageHandler = (value: number): void => {
				perPage.value = value;
			};

			const paginationHandler = (page: number): void => {
				currentPage.value = page;
				walletsStore.getAutoConversion(currentPage.value);
			};

			return {
				headers,
				walletsStore,
				autoConversionList,
				total,
				isLoading,
				currentPage,
				perPage,
				pageCount,
				removeHandler,
				editHandler,
				formatFromIdList,
				formatFromCurrency,
				pageCountHandler,
				changePerPageHandler,
				paginationHandler
			};
		}
	});
</script>
