<template>
	<Widget
		v-if="isLoading || autoConversionList.length"
		key="auto-conversion-mob-table"
		name="balance-auto-conversion-table-mob"
	>
		<WidgetItem name="table">
			<template v-for="(autoConversion, index) in autoConversionList">
				<Widget :key="'auto-conversion-' + index" name="balance-auto-conversion-table-mob-inner">
					<WidgetItem v-slot="{ computedAttrs }" name="result-title">
						<KText v-bind="computedAttrs" />
					</WidgetItem>
					<WidgetItem v-slot="{ computedAttrs }" name="result-value">
						<KText v-bind="computedAttrs">
							{{ formatFromCurrency(autoConversion.currencyTo) }}
						</KText>
					</WidgetItem>
					<WidgetItem v-slot="{ computedAttrs }" name="from-title">
						<KText v-bind="computedAttrs" />
					</WidgetItem>
					<WidgetItem v-slot="{ computedAttrs }" name="from-value">
						<KText v-bind="computedAttrs">
							{{ formatFromIdList(autoConversion.currenciesFrom) }}
						</KText>
					</WidgetItem>

					<WidgetItem
						v-if="!autoConversionSelected.length"
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
										@click="editHandler(autoConversion)"
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
										@click="selectItem(autoConversion)"
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
										@click="removeHandler(autoConversion)"
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
							:value="getSelected(autoConversion)"
							v-bind="computedAttrs"
							style="--checkbox-selection-controls-ripple-margin: 0; display: flex"
							@click="selectItem(autoConversion)"
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
			<KText v-bind="computedAttrs" />
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import { ref, defineComponent, computed, onMounted, onUnmounted } from 'vue';
	import MyRootStore from '@/store/store';
	import { useRouter } from '@/utils/utils';

	const SCROLL_THRESHOLD = 160;

	export default defineComponent({
		name: 'AutoConversionTableMob',
		components: {},
		inheritAttrs: false,

		setup() {
			const router = useRouter();
			const walletsStore = MyRootStore.getInstance().wallets;
			const autoConversionList = computed(() => walletsStore.autoConversionList);
			const total = computed(() => walletsStore.autoConversionTotal);
			const isLoading = computed(() => walletsStore.autoConversionLoading);

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

			const autoConversionSelected = computed(() => {
				return walletsStore.autoConversionSelected;
			});

			const selectItem = (item: any): void => {
				const selectedItemIndex = walletsStore.autoConversionSelected.findIndex(
					(selected) => selected.currencyTo.id === item.currencyTo.id
				);

				if (selectedItemIndex == -1) {
					walletsStore.autoConversionSelected = [...walletsStore.autoConversionSelected, item];
				} else {
					const newSelected = [...walletsStore.autoConversionSelected];
					newSelected.splice(selectedItemIndex, 1);
					walletsStore.autoConversionSelected = newSelected;
				}
			};

			const getSelected = computed(() => (item: any): boolean => {
				const isItemSelected = walletsStore.autoConversionSelected.find(
					(selected) => selected.currencyTo.id === item.currencyTo.id
				);

				return Boolean(isItemSelected);
			});

			const loadMore = (): void => {
				if (!isLoading.value) {
					walletsStore.getAutoConversionMob();
				}
			};

			const scrollToTopItem = (): void => {
				window.scrollTo({
					top: 80,
					behavior: 'smooth'
				});
			};

			const renderShowMore = computed(() => {
				return autoConversionList.value.length !== 0 && total.value > autoConversionList.value.length;
			});

			const showScrollTopDataCondition = computed(() => {
				return autoConversionList.value.length !== 0;
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
				walletsStore,
				autoConversionList,
				total,
				isLoading,
				removeHandler,
				editHandler,
				formatFromIdList,
				formatFromCurrency,
				loadMore,
				scrollToTopItem,
				selectItem,
				showScrollTop,
				renderShowMore,
				autoConversionSelected,
				getSelected
			};
		}
	});
</script>
