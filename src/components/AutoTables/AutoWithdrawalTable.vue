<template>
	<!-- height="680px" -->
	<div v-if="isLoading || autoWithdrawalsList.length">
		<KTable
			v-model="walletsStore.autoWithdrawalSelected"
			class="k-table-primary"
			itemKey="id"
			showSelect
			:headers="headers"
			:itemsPerPage="perPage"
			:items="autoWithdrawalsList"
			:paginationShowPerPage="false"
			:showPagination="false"
			:serverItemsLength="total"
			:loading="isLoading"
			loadingComponent="k-progress-linear"
			style="--special-size:20px"
			@page-count="pageCountHandler"
			@change-per-page="changePerPageHandler"
		>
			<!-- @click:row="rowClickHandler" -->
			<template #header.currencyName="{ header }">
				<KText class="k-text-k-typography-body-1-regular" style="color:var(--tertiary-darken-2)">
					{{ $t(header.text) }}
				</KText>
			</template>
			<template #header.frequency="{ header }">
				<KText class="k-text-k-typography-body-1-regular" style="color:var(--tertiary-darken-2)">
					{{ $t(header.text) }}
				</KText>
			</template>
			<template #header.amount="{ header }">
				<KText class="k-text-k-typography-body-1-regular" style="color:var(--tertiary-darken-2)">
					{{ $t(header.text) }}
				</KText>
			</template>
			<template #header.address="{ header }">
				<KText class="k-text-k-typography-body-1-regular" style="color:var(--tertiary-darken-2)">
					{{ $t(header.text) }}
				</KText>
			</template>

			<template #item.currencyName="{ item }">
				<KText class="k-text-k-typography-body-1-regular">
					{{ item.currency }}
				</KText>
			</template>
			<template #item.frequency="{ item }">
				<KText class="k-text-k-typography-body-1-regular">
					{{ $t(getFrequencyById(item.frequencyKey)) }}
				</KText>
			</template>
			<template #item.amount="{ item }">
				<KText class="k-text-k-typography-body-1-regular">
					{{ getAmountCellValue(item) }}
				</KText>
			</template>

			<template #item.address="{ item }">
				<KText class="k-text-k-typography-body-1-regular">
					{{ item.address }}
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
			<KText v-bind="computedAttrs">
				{{ $t('balance.autoWithdrawalNew') }}
			</KText>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import { ref, defineComponent, computed, ComputedRef } from 'vue';
	import MyRootStore from '@/store/store';
	import { headersAutoWithdrawal } from '@/config/configAutoTable';
	import { inputDecimalsMask, inputMask, useRouter, useTranslate } from '@/utils/utils';

	export default defineComponent({
		name: 'AutoWithdrawalTable',
		components: {},
		inheritAttrs: false,

		setup() {
			const router = useRouter();
			const walletsStore = MyRootStore.getInstance().wallets;
			const $t = useTranslate();

			const frequencyList = ref({
				0: 'balance.frequency-0',
				1: 'balance.frequency-1',
				2: 'balance.frequency-2',
				4: 'balance.frequency-3'
			});

			const autoWithdrawalsList = computed(() => {
				return walletsStore.autoWithdrawalsList.map((withdrawal) => {
					const currencyName = walletsStore.currencyNameById(withdrawal.currencyId);
					const amount = withdrawal.amount || withdrawal.amountFrom;
					const frequency =
						!withdrawal.frequency && withdrawal.frequency !== 0
							? frequencyList.value[4]
							: frequencyList.value[withdrawal.frequency as 0 | 1 | 2];
					return {
						id: withdrawal.currencyId,
						currency: currencyName,
						method: withdrawal.transactionMethodName,
						frequencyKey: withdrawal.frequency,
						frequency,
						amount,
						commet: withdrawal.details,
						tag: withdrawal.tag,
						publicKey: withdrawal.publicKey,
						address: withdrawal.address
					};
				});
			});
			const total = computed(() => walletsStore.autoWithdrawalsTotal);
			const isLoading = computed(() => walletsStore.autoWithdrawalsLoading);

			const headers = computed(() => {
				return headersAutoWithdrawal;
			});

			const rowClickHandler = (): void => {
				console.log('open row');
			};

			const removeHandler = (item: any): void => {
				walletsStore.deleteAutoWithdrawal([item]);
			};

			const activeWallet: ComputedRef<WALLETS.Wallet | undefined> = computed(() => {
				return walletsStore.activeWallet;
			});

			const getAmountCellValue = (item: any): string => {
				return item.amount ? `${item.amount} ${item.currency}` : $t('balance.totalBalanceText');
			};

			const getFormattedValueForAmountValue = (value: string | number): string => {
				let newValue = String(value);
				if (newValue.includes('-')) {
					newValue = newValue.replace(/-/g, '');
				}
				newValue = newValue.replace(' ', '');
				newValue = activeWallet.value?.currencyDecimals
					? inputDecimalsMask(newValue, activeWallet.value.currencyDecimals)
					: inputMask(newValue);
				return newValue;
			};

			const editHandler = (item: any): void => {
				const wallet = walletsStore.wallets.find((walletItem: any) => walletItem.currencyName === item.currency);
				if (wallet) {
					walletsStore.setAutoEditMode(true);
					walletsStore.setActiveWallet(wallet);
					const transport = wallet.withdrawalTransactionMethods.find(
						(transportItem: any) => transportItem.name === item.method
					);
					walletsStore.setActiveWithdrawalTransport(transport);
					walletsStore.setWithdrawalAddress(item.address);
					walletsStore.setWithdrawalTag(item.tag);
					walletsStore.setWithdrawalPublicKey(item.tag);
					walletsStore.setWithdrawalComment(item.comment);
					walletsStore.setWithdrawalFeeAmount(getFormattedValueForAmountValue(item.amount));
					walletsStore.setAutoFrequency(item.frequencyKey || 4);

					walletsStore.appendErrors(walletsStore.notEmtyAddressValidation(item.address));
					if (Boolean(walletsStore.getCryptoCurrency?.tagRegex)) {
						walletsStore.appendErrors(
							walletsStore.addressValidationByNetworkRegex(item.address, walletsStore.getCryptoCurrency?.tagRegex || '')
						);
					}
					walletsStore.appendErrors(walletsStore.notEmtyTagValidation(item.tag));
					walletsStore.appendErrors(walletsStore.notEmptyCommentValidation(item.comment));

					router.push({ name: 'auto-withdrawal-new' });
				}
			};

			const perPage = computed({
				get(): number {
					return walletsStore.autoWithdrawalPerPage;
				},
				set(newVal: number) {
					walletsStore.autoWithdrawalPerPage = newVal;
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
				walletsStore.getAutoWithdrawals(currentPage.value);
			};

			const getFrequencyById = (frequencyId: number): string => {
				switch (frequencyId) {
					case 0:
						return 'balance.frequency-0';
					case 1:
						return 'balance.frequency-1';
					case 2:
						return 'balance.frequency-2';
					default:
						return 'balance.frequency-3';
				}
			};

			return {
				headers,
				walletsStore,
				autoWithdrawalsList,
				total,
				isLoading,
				rowClickHandler,
				currentPage,
				perPage,
				pageCount,
				removeHandler,
				editHandler,
				pageCountHandler,
				changePerPageHandler,
				paginationHandler,
				getFrequencyById,
				getAmountCellValue
			};
		}
	});
</script>
