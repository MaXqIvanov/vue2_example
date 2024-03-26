<template>
	<KHeaderSubstrate>
		<Widget name="balance-wallets-header">
			<WidgetItem
				v-if="shouldShowDefaultHeader"
				key="balance-wallets-header-title"
				v-slot="{ computedAttrs }"
				name="title"
			>
				<KText v-bind="computedAttrs" />
			</WidgetItem>

			<WidgetItem
				v-if="shouldShowDefaultHeader"
				key="balance-wallets-header-subtitle"
				v-slot="{ computedAttrs }"
				name="subtitle"
			>
				<KText v-bind="computedAttrs" />
			</WidgetItem>

			<WidgetItem
				v-if="shouldShowDefaultHeader"
				key="balance-wallets-header-tabs"
				name="tabs"
			>
				<Widget name="balance-wallets-header-tabs">
					<WidgetItem
						v-slot="{ computedAttrs, hideSliderValue, enabledTabStyles, disabledTabStyles, tabsHeight, tabsGroupBackground, tabsGroupStyles }"
						name="tabs"
						:contentVariables="tabsVariables"
					>
						<KTabs
							v-bind="computedAttrs"
							centerActive
							:centered="true"
							:height="tabsHeight"
							:backgroundColor="tabsGroupBackground"
							:style="tabsGroupStyles"
							:hideSlider="getBooleanValueFromString(hideSliderValue)"
						>
							<KTab
								:to="backToObject"
								:style="
									[
										'balance-wallets',
										'balance-currency',
										'balance-activeForm',
										'balance-get-form',
										'balance-buy-form',
										'balance-transfer-form',
										'balance-sell-form'
									].includes(routeName)
										? enabledTabStyles
										: disabledTabStyles"
								@click.native="setActiveFlow"
							>
								{{ $t(`balance.dashboard`) }}
							</KTab>
							<KTab
								:to="{ name: 'balance-historyType', params: { historyType: 'transactions'} }"
								:style="routeName === 'balance-historyType' || routeName === 'balance-history' ? enabledTabStyles : disabledTabStyles"
							>
								{{ $t(`balance.history`) }}
							</KTab>
						</KTabs>
					</WidgetItem>
				</Widget>
			</WidgetItem>

			<WidgetItem
				v-if="shouldShowWalletsFormHeader"
				key="balance-wallets-header-form-header"
				name="wallets-form-header"
			>
				<Widget name="balance-wallets-header-form-header">
					<WidgetItem
						v-slot="{ computedAttrs }"
						name="currency-select"
					>
						<KMenu
							v-if="!loadingWallets"
							v-model="currencySelectMenuValue"
							v-bind="computedAttrs"
							offsetY
							attach=""
						>
							<template #activator="{ on, attrs, value }">
								<Widget name="balance-actions-currency-select-activator" v-bind="attrs">
									<WidgetItem v-slot="{ computedAttrs }" name="currency-icon">
										<KIcon
											v-bind="computedAttrs"
											:key="iconName"
											:name="iconName"
										/>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="money-text">
										<KText
											v-bind="computedAttrs"
											style="color: inherit;"
											v-on="on"
										>
											{{ mobileHeaderText }}
										</KText>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="flicking-arrow">
										<KIcon
											v-if="!value"
											v-bind="computedAttrs"
											v-on="on"
										/>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="flicking-arrow-reverse">
										<KIcon
											v-if="value"
											v-bind="computedAttrs"
											v-on="on"
										/>
									</WidgetItem>
								</Widget>
							</template>

							<Widget name="balance-actions-currency-select-list">
								<WidgetItem v-slot="{ computedAttrs }" name="list">
									<KList v-bind="computedAttrs">
										<KListItemGroup :value="selectedCurrency">
											<KListItem
												v-for="wallet in wallets"
												:key="wallet.currencyTitle"
												color="var(--primary-lighten)"
												dense
												:to="{
													name: 'balance-activeForm',
													params: { currency: wallet.currencyTitle, activeForm: activeForm }
												}"
												@click="changeHandle(wallet)"
											>
												<Widget name="balance-actions-currency-select-icon-wrapper">
													<WidgetItem v-slot="{ computedAttrs }" name="icon-wrapper">
														<KListItemIcon
															class="k-list-item-icon"
															v-bind="computedAttrs"
															:style="{ marginRight: 0 }"
														>
															<Widget name="balance-actions-currency-select-item-icon">
																<WidgetItem v-slot="{ computedAttrs }" name="currency-icon">
																	<KIcon
																		v-bind="computedAttrs"
																		:key="getWalletIconName(wallet)"
																		:name="getWalletIconName(wallet)"
																	/>
																</WidgetItem>
															</Widget>
														</KListItemIcon>
													</WidgetItem>
												</Widget>
												<Widget name="balance-actions-currency-select-item">
													<WidgetItem name="item-content">
														<KListItemContent>
															<Widget name="balance-actions-currency-select-item-content">
																<WidgetItem v-slot="{ computedAttrs }" name="currency-title">
																	<KText v-bind="computedAttrs">
																		{{ wallet.currencyTitle }}
																	</KText>
																</WidgetItem>
																<WidgetItem
																	v-slot="{ computedAttrs }"
																	name="currency-name"
																	style="width: 100%"
																>
																	<KText
																		v-bind="computedAttrs"
																		style="
																			color: var(--tertiary-darken-3);
																			text-overflow: ellipsis;
																			white-space: nowrap;
																			overflow: hidden;

																			display: inline-block;
																			max-width: 100%;
																			vertical-align: middle;
																		"
																	>
																		{{ wallet.currencyName }}
																	</KText>
																</WidgetItem>

																<WidgetItem v-slot="{ computedAttrs }" name="available-funds">
																	<KText v-bind="computedAttrs">
																		{{
																			showBalance ? formatNumberAndFixedDecimals2(wallet.availableFunds, 16) : '*****'
																		}}
																	</KText>
																</WidgetItem>
															</Widget>
														</KListItemContent>
													</WidgetItem>
												</Widget>
											</KListItem>
										</KListItemGroup>
									</KList>
								</WidgetItem>
							</Widget>
						</KMenu>

						<template v-else>
							<KSkeletonLoader
								type="card-heading"
								class="k-skeleton-loader-table-row-divider"
								:style="{
									'--skeleton-loader-card-heading-loader-heading-margin': '0px auto',
									'--skeleton-loader-container-bg-color': 'transparent'
								}"
							/>
						</template>
					</WidgetItem>

					<WidgetItem
						v-if="activeWallet"
						v-slot="{ computedAttrs }"
						key="balance-actions-card-prev-icon"
						name="prev-icon"
					>
						<Widget
							v-bind="computedAttrs"
							name="balance-actions-card-slide-prev-icon"
							@click.native="() => {
								openWalletsScreen();
								$router.push({ name: 'balance-currency', params: { currency: activeWallet && activeWallet.currencyTitle || '' } })
							}"
						/>
					</WidgetItem>
				</Widget>
			</WidgetItem>

			<WidgetItem
				v-if="shouldShowHistoryHeader"
				key="balance-wallets-header-history-header"
				name="wallets-history-header"
			>
				<Widget name="balance-wallets-header-history-header">
					<WidgetItem v-slot="{ computedAttrs }" name="back-button">
						<Widget
							v-bind="computedAttrs"
							name="balance-actions-card-slide-prev-icon"
							@click.native="$router.push({ name: 'balance-currency', params: { currency: activeWallet && activeWallet.currencyTitle || '' } })"
						/>
					</WidgetItem>

					<WidgetItem v-slot="{ computedAttrs, title }" name="title">
						<KText v-bind="computedAttrs">
							{{ title }}
						</KText>
					</WidgetItem>

					<WidgetItem
						v-slot="{ computedAttrs }"
						name="load-history"
					>
						<KIcon
							v-bind="computedAttrs"
							@click="loadRaport($t)"
						/>
					</WidgetItem>
				</Widget>
			</WidgetItem>
		</Widget>
	</KHeaderSubstrate>
</template>

<script lang="ts">
	import { computed, defineComponent, ref } from 'vue';
	import MyRootStore from '@/store/store';
	import { useRoute, formatNumberAndFixedDecimals, csvGenerator, getFullDate } from '@/utils/utils';
	import { FormType, FlowType, HISTORY_TABLE_TYPE } from '@/const';

	export default defineComponent({
		name: 'HeaderView',
		components: {},

		setup() {
			const appRootStore = MyRootStore.getInstance();
			const walletsStore = MyRootStore.getInstance().wallets;
			const historyStore = MyRootStore.getInstance().history;
			const routeName = computed(() => {
				return useRoute().name;
			});

			const activeForm = computed(() => {
				return walletsStore.activeForm;
			});

			const activeCurrency = computed(() => {
				return walletsStore.getActiveWallet?.currencyTitle;
			});

			const getBooleanValueFromString = (value: string): boolean => {
				return value === 'true';
			};

			const currentRouteIsActiveForm = computed(() => {
				return useRoute().matched.some(
					({ name }: { name: string }) =>
						name &&
						[
							'balance-currency',
							'balance-activeForm',
							'balance-get-form',
							'balance-buy-form',
							'balance-transfer-form',
							'balance-sell-form'
						].includes(name)
				);
			});

			const backToObject = computed(() => {
				if (!walletsStore.seamlessIntegrationEnabled) {
					return {
						name: 'balance-activeForm',
						params: { activeForm: activeForm.value, currency: activeCurrency.value }
					};
				}

				const newRouteName = activeForm.value === FormType.DEPOSIT ? 'balance-get-form' : 'balance-transfer-form';
				return { name: newRouteName, params: { activeForm: activeForm.value, currency: activeCurrency.value } };
			});

			const setActiveFlow = (): void => {
				const flowName = activeForm.value === FormType.DEPOSIT ? FlowType.GET : FlowType.BUY;
				walletsStore.setActiveFlow(flowName);
			};

			const currentRouteIsHistory = computed(() => {
				return useRoute().matched.some(({ name }: { name: string }) => name === 'balance-history');
			});

			const shouldShowWalletsFormHeader = computed(() => {
				return appRootStore.isScreenSizeLessMD && currentRouteIsActiveForm.value;
			});

			const shouldShowHistoryHeader = computed(() => {
				return appRootStore.isScreenSizeLessMD && currentRouteIsHistory.value;
			});

			const shouldShowDefaultHeader = computed(() => {
				return (
					!appRootStore.isScreenSizeLessMD || !(shouldShowHistoryHeader.value || shouldShowWalletsFormHeader.value)
				);
			});

			const tabsVariables = ref([
				{ name: 'hideSliderValue', type: 'string', defaultValue: 'false' },
				{
					name: 'enabledTabStyles',
					type: 'string',
					defaultValue: ''
				},
				{
					name: 'disabledTabStyles',
					type: 'string',
					defaultValue: ''
				},
				{
					name: 'tabsGroupBackground',
					type: 'string',
					defaultValue: ''
				},
				{
					name: 'tabsHeight',
					type: 'string',
					defaultValue: '40'
				},
				{
					name: 'tabsGroupStyles',
					type: 'string',
					defaultValue: ''
				}
			]);

			const activeWallet = computed(() => walletsStore.getActiveWallet);
			const availableFunds = computed(() => walletsStore.getCurrentCyrrencyAvailableFunds);
			const showBalance = computed(() => {
				return appRootStore.store.state.sharedData.showBalance;
			});
			const wallets = computed(() => walletsStore.wallets);
			const loadingWallets = computed(() => walletsStore.loadingWallets);

			const selectedCurrency = computed(() => {
				if (!activeWallet.value) return 0;
				return wallets.value.findIndex(
					(wallet: WALLETS.Wallet) => wallet.currencyTitle === activeWallet.value?.currencyTitle
				);
			});

			const changeHandle = (wallet: WALLETS.Wallet): void => {
				walletsStore.setActiveWallet(wallet);
			};

			const getWalletIconName = (wallet: WALLETS.Wallet): string => {
				return `${Boolean(wallet.currencyType) ? 'currency' : 'fiat'}.${wallet.currencyTitle}`;
			};

			const iconName = computed(() => {
				if (!activeWallet.value) return '';
				return getWalletIconName(activeWallet.value);
			});

			const formatNumberAndFixedDecimals2 = (value: number, decimals: number): string => {
				return formatNumberAndFixedDecimals(value, appRootStore.store.state.translator.currentLocale, decimals);
			};

			const mobileHeaderText = computed(() => {
				if (!activeWallet.value || availableFunds.value === null) return '';

				return `${showBalance.value ? formatNumberAndFixedDecimals2(availableFunds.value, 16) : '*****'} ${
					activeWallet.value?.currencyTitle
				}`;
			});

			const currencySelectMenuValue = ref(false);

			const openWalletsScreen = (): void => {
				currencySelectMenuValue.value = false;
			};

			const tabs = ref([
				HISTORY_TABLE_TYPE.TRANSACTIONS,
				/* 'orders', */ /* 'Trades', */ HISTORY_TABLE_TYPE.ADDRESSES
				/* HISTORY_TABLE_TYPE.DEALS */
			]);

			const historyType = computed(() => {
				return historyStore.currentHistory ?? tabs.value[0];
			});

			const isTransactionHistory = computed(() => {
				return historyType.value === HISTORY_TABLE_TYPE.TRANSACTIONS;
			});

			const isAddressesHistory = computed(() => {
				return historyType.value === HISTORY_TABLE_TYPE.ADDRESSES;
			});

			const isDealsHistory = computed(() => {
				return historyType.value === HISTORY_TABLE_TYPE.DEALS;
			});

			const getCurrencyNameById = (id: number): string => {
				return walletsStore.currencyNameById(id);
			};

			const pad = (val: number): any => {
				return val < 10 ? '0' + val : val;
			};

			const createOffset = (date: Date): string => {
				const sign = date.getTimezoneOffset() > 0 ? '-' : '+';
				const offset = Math.abs(date.getTimezoneOffset());
				const hours = pad(Math.floor(offset / 60));
				const minutes = pad(offset % 60);
				return sign + hours + ':' + minutes;
			};

			const loadOperationsRaport = async (translateFunc: any): Promise<string[]> => {
				const intermedaiteCsvData = await historyStore.loadOperationsRaport();

				const csvData = intermedaiteCsvData.map((el: any) => [
					getFullDate(el.dateCreated, appRootStore.store.state.translator.currentLocale) +
						' UTC' +
						createOffset(new Date(el.dateCreated)),
					getCurrencyNameById(el.currencyId),
					el.id,
					translateFunc(`balance.operationType-${el.operationType}`),
					el.transactionData ? el.transactionData.cryptoTxId : '',
					el.transactionData ? el.transactionData.destination : '',
					el.transactionData ? translateFunc(`balance.codeStatus-${el.transactionData.transactionStatus}`) : '',
					`${Boolean(el.side) ? '-' : '+'}${el.amount}`,
					el.currencyTitle
				]);
				csvData.unshift([
					`${translateFunc('balance.date')}:`,
					`${translateFunc('balance.currencyTitle')}:`,
					`${translateFunc('balance.id')}:`,
					`${translateFunc('balance.type')}:`,
					`${translateFunc('balance.modalTxIdTitle')}:`,
					`${translateFunc('balance.recipient')}:`,
					`${translateFunc('balance.status')}:`,
					`${translateFunc('balance.sumText')}:`,
					`${translateFunc('balance.ticker')}:`
				]);

				return csvData;
			};

			const loadAddressesRaport = async (translateFunc: any): Promise<string[]> => {
				const intermedaiteCsvData = await historyStore.loadAddressesRaport();

				const csvData = intermedaiteCsvData.map((el: any) => [
					getFullDate(el.dateCreated, appRootStore.store.state.translator.currentLocale) +
						' UTC' +
						createOffset(new Date(el.dateCreated)),
					el.network,
					el.address,
					el.tag,
					getCurrencyNameById(el.currencyId) || el.currencyTitle,
					el.transactionsCount,
					el.notPinned ? translateFunc('balance.basic') : translateFunc('balance.pinned')
				]);
				csvData.unshift([
					`${translateFunc('balance.date')}:`,
					`${translateFunc('balance.network')}:`,
					`${translateFunc('balance.address')}:`,
					`${translateFunc('balance.memo')}:`,
					`${translateFunc('balance.usedForCurrencies')}:`,
					`${translateFunc('balance.operations')}:`,
					`${translateFunc('balance.status')}:`
				]);

				return csvData;
			};

			const loadDealsRaport = async (translateFunc: any): Promise<string[]> => {
				return await [];
			};

			const csvDataGetter = computed(() => {
				switch (true) {
					case isTransactionHistory.value:
						return loadOperationsRaport;
					case isAddressesHistory.value:
						return loadAddressesRaport;
					case isDealsHistory.value:
						return loadDealsRaport;
					default:
						return async (): Promise<string[]> => [];
				}
			});

			const csvName = computed(() => {
				switch (true) {
					case isTransactionHistory.value:
						return 'Operations_list';
					case isAddressesHistory.value:
						return 'Addresses_list';
					case isDealsHistory.value:
						return 'Deals_list';
					default:
						return 'List';
				}
			});

			const loadRaport = async (translateFunc: any): Promise<void> => {
				const d = new Date();
				const time = `${`0${d.getDate()}`.slice(-2)}.${`0${d.getMonth() + 1}`.slice(-2)}.${`0${d.getFullYear()}`.slice(
					-2
				)}-${`0${d.getHours()}`.slice(-2)}:${`0${d.getMinutes()}`.slice(-2)}`;

				const csvData = await csvDataGetter.value(translateFunc);

				csvGenerator({
					dataArrayInit: csvData,
					fileName: `${csvName.value}-${time}.csv`,
					separatorInit: ';',
					addQuotes: true,
					removeAfterDownload: true
				});
			};

			return {
				loadRaport,
				openWalletsScreen,
				activeWallet,
				formatNumberAndFixedDecimals2,
				showBalance,
				changeHandle,
				getWalletIconName,
				wallets,
				selectedCurrency,
				mobileHeaderText,
				iconName,
				currencySelectMenuValue,
				loadingWallets,
				shouldShowHistoryHeader,
				shouldShowDefaultHeader,
				shouldShowWalletsFormHeader,
				getBooleanValueFromString,
				tabsVariables,
				routeName,
				activeForm,
				activeCurrency,
				backToObject,
				setActiveFlow
			};
		}
	});
</script>
