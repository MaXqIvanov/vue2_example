<template>
	<Widget
		v-if="isLoading || autoWithdrawalsList.length"
		key="auto-conversion-mob-table"
		name="balance-auto-conversion-table-mob"
	>
		<WidgetItem name="table">
			<template v-for="(autoWithdrawal, index) in autoWithdrawalsList">
				<Widget :key="'auto-conversion-' + index" name="balance-auto-withdrawal-table-mob-inner">
					<WidgetItem v-slot="{ computedAttrs }" name="currency">
						<KText v-bind="computedAttrs">
							{{ autoWithdrawal.currency }}
						</KText>
					</WidgetItem>
					<WidgetItem v-slot="{ computedAttrs }" name="frequency">
						<KText v-bind="computedAttrs">
							{{ $t(getFrequencyById(autoWithdrawal.frequencyKey)) }}
						</KText>
					</WidgetItem>
					<WidgetItem v-slot="{ computedAttrs }" name="amount-title">
						<KText v-bind="computedAttrs" />
					</WidgetItem>
					<WidgetItem v-slot="{ computedAttrs }" name="amount-value">
						<KText v-bind="computedAttrs">
							{{ getAmountCellValue(autoWithdrawal) }}
						</KText>
					</WidgetItem>
					<WidgetItem v-slot="{ computedAttrs }" name="address-title">
						<KText v-bind="computedAttrs" />
					</WidgetItem>
					<WidgetItem v-slot="{ computedAttrs }" name="address-value">
						<KText v-bind="computedAttrs">
							{{ autoWithdrawal.address }}
						</KText>
					</WidgetItem>

					<WidgetItem
						v-if="!autoWithdrawalSelected.length"
						v-slot="{ computedAttrs }"
						name="menu-activator"
					>
						<KMenu
							v-bind="computedAttrs"
							attach=""
							left
							offsetY
							bottom
							nudgeBottom="8"
							rounded="lg"
						>
							<template #activator="{ on, attrs }">
								<Widget name="balance-auto-table-mob-menu-activator">
									<WidgetItem v-slot="{ computedAttrs }" name="icon">
										<KIcon v-bind="{ ...attrs, ...computedAttrs }" v-on="on" />
									</WidgetItem>
								</Widget>
							</template>
							<KList>
								<KListItemGroup>
									<KListItem
										style="--list-item-color: var(--primary-lighten)"
										dense
										@click="editHandler(autoWithdrawal)"
									>
										<KListItemContent>
											<Widget name="balance-amount-input-label-body-1">
												<WidgetItem v-slot="{ computedAttrs }" name="text">
													<KText v-bind="computedAttrs" style="color:var(--tertiary-darken)">
														{{ $t('balance.editText') }}
													</KText>
												</WidgetItem>
											</Widget>
										</KListItemContent>
									</KListItem>
									<KListItem
										style="--list-item-color: var(--primary-lighten)"
										dense
										@click="selectItem(autoWithdrawal)"
									>
										<KListItemContent>
											<Widget name="balance-amount-input-label-body-1">
												<WidgetItem v-slot="{ computedAttrs }" name="text">
													<KText v-bind="computedAttrs" style="color:var(--tertiary-darken)">
														{{ $t('balance.selectText') }}
													</KText>
												</WidgetItem>
											</Widget>
										</KListItemContent>
									</KListItem>
									<KListItem
										style="--list-item-color: var(--primary-lighten)"
										dense
										@click="removeHandler(autoWithdrawal)"
									>
										<KListItemContent>
											<Widget name="balance-amount-input-label-body-1">
												<WidgetItem v-slot="{ computedAttrs }" name="text">
													<KText v-bind="computedAttrs" style="color:var(--tertiary-darken)">
														{{ $t('balance.deleteText') }}
													</KText>
												</WidgetItem>
											</Widget>
										</KListItemContent>
									</KListItem>
								</KListItemGroup>
							</KList>
						</KMenu>
					</WidgetItem>

					<WidgetItem
						v-else
						v-slot="{ computedAttrs }"
						name="checkbox"
					>
						<KSimpleCheckbox
							:value="getSelected(autoWithdrawal)"
							v-bind="computedAttrs"
							style="--checkbox-selection-controls-ripple-margin: 0; display: flex"
							@click="selectItem(autoWithdrawal)"
						/>
					</WidgetItem>
				</Widget>
			</template>
		</WidgetItem>

		<WidgetItem
			v-if="renderShowMore"
			key="conversion-table-show-more-btn"
			v-slot="{ computedAttrs }"
			name="show-more-btn"
		>
			<KBtn v-bind="computedAttrs" @click="loadMore" />
		</WidgetItem>

		<WidgetItem
			v-show="showScrollTop"
			key="conversion-table-fab-scroll-top"
			v-slot="{ computedAttrs }"
			name="fab-scroll-top"
		>
			<KBtn
				v-bind="computedAttrs"
				@click="scrollToTopItem"
			/>
		</WidgetItem>
	</Widget>

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
	import { ref, defineComponent, computed, ComputedRef, onUnmounted, onMounted } from 'vue';
	import MyRootStore from '@/store/store';
	import { headersAutoWithdrawal } from '@/config/configAutoTable';
	import { inputDecimalsMask, inputMask, useRouter, useTranslate } from '@/utils/utils';

	const SCROLL_THRESHOLD = 160;

	export default defineComponent({
		name: 'AutoWithdrawalTableMob',
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

			const getAmountCellValue = (item: any): string => {
				return item.amount ? `${item.amount} ${item.currency}` : $t('balance.totalBalanceText');
			};

			const autoWithdrawalsList = computed(() => {
				return walletsStore.autoWithdrawalsList.map((withdrawal) => {
					const currencyName = walletsStore.currencyNameById(withdrawal.currencyId);
					const amount = withdrawal.amount || withdrawal.amountFrom;
					const frequency =
						!withdrawal.frequency && withdrawal.frequency !== 0
							? frequencyList.value[4]
							: frequencyList.value[withdrawal.frequency as 0 | 1 | 2];
					return {
						...withdrawal,
						id: withdrawal.currencyId,
						currency: currencyName,
						method: withdrawal.transactionMethodName,
						frequencyKey: withdrawal.frequency,
						frequency,
						amount,
						address: withdrawal.address
					};
				});
			});
			const total = computed(() => walletsStore.autoWithdrawalsTotal);
			const isLoading = computed(() => walletsStore.autoWithdrawalsLoading);

			const headers = computed(() => {
				return headersAutoWithdrawal;
			});

			const removeHandler = (item: any): void => {
				walletsStore.deleteAutoWithdrawal([item]);
			};

			const activeWallet: ComputedRef<WALLETS.Wallet | undefined> = computed(() => {
				return walletsStore.activeWallet;
			});

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
					walletsStore.setWithdrawalFeeAmount(getFormattedValueForAmountValue(item.amount));
					walletsStore.setAutoFrequency(item.frequencyKey || 4);
					router.push({ name: 'auto-withdrawal-new' });
				}
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

			const autoWithdrawalSelected = computed(() => {
				return walletsStore.autoWithdrawalSelected;
			});

			const selectItem = (item: any): void => {
				const selectedItemIndex = walletsStore.autoWithdrawalSelected.findIndex(
					(selected) => selected.currencyId === item.currencyId
				);

				if (selectedItemIndex == -1) {
					walletsStore.autoWithdrawalSelected = [...walletsStore.autoWithdrawalSelected, item];
				} else {
					const newSelected = [...walletsStore.autoWithdrawalSelected];
					newSelected.splice(selectedItemIndex, 1);
					walletsStore.autoWithdrawalSelected = newSelected;
				}
			};

			const getSelected = computed(() => (item: any): boolean => {
				const isItemSelected = walletsStore.autoWithdrawalSelected.find(
					(selected) => selected.currencyId === item.currencyId
				);

				return Boolean(isItemSelected);
			});

			const loadMore = (): void => {
				if (!isLoading.value) {
					walletsStore.getAutoWithdrawalsMob();
				}
			};

			const scrollToTopItem = (): void => {
				window.scrollTo({
					top: 80,
					behavior: 'smooth'
				});
			};

			const renderShowMore = computed(() => {
				return autoWithdrawalsList.value.length !== 0 && total.value > autoWithdrawalsList.value.length;
			});

			const showScrollTopDataCondition = computed(() => {
				return autoWithdrawalsList.value.length !== 0;
			});

			const showScrollTopScrollCondition = ref(false);

			const showScrollTop = computed(() => {
				return showScrollTopScrollCondition.value && showScrollTopDataCondition.value;
			});

			const scrollListener = (): void => {
				showScrollTopScrollCondition.value = window.scrollY > SCROLL_THRESHOLD;
			};

			onUnmounted(() => {
				window.removeEventListener('scroll', scrollListener);
				window.removeEventListener('wheel', scrollListener);
			});

			onMounted(() => {
				window.addEventListener('scroll', scrollListener);
				window.addEventListener('wheel', scrollListener);
			});

			return {
				headers,
				walletsStore,
				autoWithdrawalsList,
				total,
				isLoading,
				removeHandler,
				editHandler,
				getFrequencyById,
				loadMore,
				scrollToTopItem,
				showScrollTop,
				renderShowMore,
				autoWithdrawalSelected,
				getAmountCellValue,
				selectItem,
				getSelected
			};
		}
	});
</script>
