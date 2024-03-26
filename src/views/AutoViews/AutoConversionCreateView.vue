<template>
	<Widget name="balance-auto-withdrawal-view">
		<WidgetItem
			v-slot="{ computedAttrs, cardStyles }"
			name="card"
			:contentVariables="cardVariables"
		>
			<KCard
				v-bind="computedAttrs"
				height="100%"
				:style="cardStyles"
			>
				<Widget name="balance-auto-withdrawal-main">
					<WidgetItem
						v-slot="{ computedAttrs, iconSize, iconName, iconStyle }"
						name="back-icon"
						:contentVariables="backBtnVariables"
					>
						<KBtn
							v-bind="computedAttrs"
							icon
							exact
							:to="{ name: 'auto-conversion' }"
						>
							<KIcon
								:name="iconName"
								:size="iconSize"
								:style="iconStyle"
							/>
						</KBtn>
					</WidgetItem>

					<WidgetItem v-slot="{ computedAttrs }" name="title">
						<KText v-bind="computedAttrs">
							{{ !isInstantConversion ? $t('balance.autoConversion') : $t('balance.convertNowText') }}
						</KText>
					</WidgetItem>

					<WidgetItem name="form">
						<Widget name="balance-auto-conversion-new">
							<WidgetItem name="crypto-select">
								<FormCurrencySelect
									v-if="wallets.length"
									ref="toCurrencySelect"
									key="balance-auto-conversion-currency-select"
									:label="$t('balance.resultCurrency')"
									:isReadonly="autoEditMode"
									:shouldAutoOpen="shouldBeAutoOpenedToCurrencySelect"
									:value="autoConversionToWallet"
									:wallets="walletsExcludeFromCurrency"
									@setWallet="setAutoConversionWallet"
								/>
							</WidgetItem>

							<WidgetItem
								v-if="!isInstantConversion"
								Key="balance-auto-conversion-radio-group"
								v-slot="{ computedAttrs }"
								name="radio-group"
							>
								<KRadioGroup
									v-model="convertType"
									v-bind="computedAttrs"
									row
									style="margin-bottom: -16px"
								>
									<KRadio value="selected" style="margin-bottom: var(--spacing-4)">
										<template #label>
											<Widget name="balance-auto-conversion-new-radio-group">
												<WidgetItem v-slot="{ computedAttrs }" name="text">
													<KText v-bind="computedAttrs">
														{{ $t('balance.convertSelected') }}
													</KText>
												</WidgetItem>
											</Widget>
										</template>
									</KRadio>
									<KRadio value="except" style="margin-bottom: var(--spacing-4)">
										<template #label>
											<Widget name="balance-auto-conversion-new-radio-group">
												<WidgetItem
													v-slot="{ computedAttrs }"
													name="text"
													style="display:flex"
												>
													<KText v-bind="computedAttrs">
														{{ $t('balance.convertExcept') }}
													</KText>
													<InfoTooltip
														nameWidget="balance-auto-conversion-tooltip"
														:text="$t('balance.convertExceptTooltip')"
													/>
												</WidgetItem>
											</Widget>
										</template>
									</KRadio>
								</KRadioGroup>
							</WidgetItem>

							<WidgetItem name="currencies-from-select">
								<FormCurrencySelect
									v-if="wallets.length && !isInstantConversion"
									key="balance-auto-conversion-currency-select"
									:multiple="true"
									:label="$t(fromCurrenciesSelectLabel)"
									:wallets="walletsExcludeToCurrency"
									:value="fromCurrencies"
									@setWallet="setAutoConversionFromCurrencies"
									@removeItem="removeFromCurrency"
									@blurHandler="blurFromCurrenciesHandler"
									@focusHandler="focusFromCurrenciesHandler"
								/>
								<FormCurrencySelect
									v-else-if="wallets.length && isInstantConversion"
									key="balance-auto-conversion-instant-currency-select"
									:label="$t(fromCurrenciesSelectLabel)"
									:shouldAutoOpen="autoConversionToWallet ? autoConversionToWallet.currencyId : false"
									:wallets="walletsExcludeToCurrency"
									:value="fromCurrencyInstant"
									@setWallet="setInstantConversionFromCurrency"
								/>
							</WidgetItem>

							<WidgetItem name="amount">
								<FormAmount
									v-if="isInstantConversion && fromCurrencyInstant"
									key="balance-auto-conversion-instant-amount"
									v-model="instantAmountValue"
									:inputDecimals="fromCurrencyInstant ? fromCurrencyInstant.currencyDecimals : false"
									:amountTitle="$t('balance.enterConversionAmount')"
									:amountLabel="$t('balance.conversionAmount')"
									:currencyTitle="fromCurrencyInstant.currencyTitle"
									:availableBalanceText="$t('balance.availableBalanceText')"
									:availableFunds="fromCurrencyInstant.availableFunds"
									:maxLimit="fromCurrencyInstant.availableFunds"
									:errorMessages="$t(instantBalanceErrors)"
									@handleCheckBlur="handleCheckInstantBalance"
									@amountChange="instantAmountHandler"
								/>
							</WidgetItem>

							<WidgetItem
								v-if="fromCurrencyInstant && autoConversionToWallet"
								key="auto-conversion-new-info-rate-key"
								name="rate"
							>
								<Widget name="balance-auto-conversion-new-info">
									<WidgetItem v-slot="{ computedAttrs }" name="title">
										<KText v-bind="computedAttrs">
											{{ $t('balance.conversionRate') }}
										</KText>
									</WidgetItem>
									<WidgetItem
										v-if="!loadingConversionRates"
										key="auto-conversion-new-info-value-key"
										v-slot="{ computedAttrs }"
										name="value"
									>
										<KText v-bind="computedAttrs">
											{{ instantConversionRateString }}
										</KText>
									</WidgetItem>
									<WidgetItem
										v-else-if="loadingConversionRates"
										key="auto-conversion-new-info-sceleton-key"
										v-slot="{ computedAttrs }"
										name="loader"
									>
										<KSkeletonLoader
											v-bind="computedAttrs"
											type="list-item@1"
											maxWidth="50%"
											style="--skeleton-loader-item-padding: 0; --skeleton-loader-list-item-height: 20px; --skeleton-loader-text-height: 20px"
										/>
									</WidgetItem>
								</Widget>
							</WidgetItem>

							<WidgetItem
								v-if="fromCurrencyInstant && autoConversionToWallet"
								key="auto-conversion-new-info-get-by-rate-key"
								name="get-by-rate"
							>
								<Widget name="balance-auto-conversion-new-info">
									<WidgetItem v-slot="{ computedAttrs }" name="title">
										<KText v-bind="computedAttrs">
											{{ $t('balance.youGetText') }}
										</KText>
									</WidgetItem>
									<WidgetItem v-slot="{ computedAttrs }" name="value">
										<KText v-bind="computedAttrs">
											{{ instantGetByRate }}
										</KText>
									</WidgetItem>
								</Widget>
							</WidgetItem>

							<WidgetItem name="buttons">
								<Widget
									key="balance-auto-withdrawal-new-buttons"
									name="balance-auto-withdrawal-new-buttons"
								>
									<WidgetItem v-slot="{ computedAttrs }" name="cancel-button">
										<KBtn
											v-bind="computedAttrs"
											exact
											:to="{ name: 'auto-conversion' }"
										>
											{{ $t('balance.toCancel') }}
										</KBtn>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="setup-auto-withdrawal">
										<KBtn
											v-bind="computedAttrs"
											:disabled="isWithdrawalDisabled"
											@click="setupAutoConversion"
										>
											{{ !isInstantConversion ? $t('balance.setUpAutoConversionBtn') : $t('balance.convertText') }}
										</KBtn>
									</WidgetItem>
								</Widget>
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="prompt">
								<KText v-bind="computedAttrs">
									{{ $t('balance.autoConversionPromt1') }}<br>{{ $t('balance.autoConversionPromt2') }}
								</KText>
							</WidgetItem>
						</Widget>
					</WidgetItem>
				</Widget>
			</KCard>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import { defineComponent, computed, onBeforeUnmount, ref, ComputedRef, watchEffect, nextTick } from 'vue';
	import MyRootStore from '@/store/store';
	import FormCurrencySelect from '@/components/FormComponents/FormCurrencySelect.vue';
	import InfoTooltip from '@/components/InfoTooltip.vue';
	import {
		useRoute,
		findTheNumberOfNumbersAfterTheDecimalPoint,
		inputMask,
		formatNumberAndFixedDecimals,
		convertExponentialToDecimal,
		inputDecimalsMask
	} from '@/utils/utils';
	import FormAmount from '@/components/FormComponents/FormAmount.vue';

	export default defineComponent({
		name: 'AutoConversionCreateView',
		components: { FormCurrencySelect, InfoTooltip, FormAmount },

		setup() {
			const walletsStore = MyRootStore.getInstance().wallets;
			const routeName = computed(() => {
				return useRoute().name;
			});

			const isInstantConversion = computed(() => routeName.value === 'auto-conversion-instant');

			const autoEditMode = computed(() => {
				return walletsStore.autoEditMode;
			});

			onBeforeUnmount(() => {
				disableAutoEditMode();
				fromCurrencyInstant.value = undefined;
				fromCurrencies.value = [];
				walletsStore.autoConversionToWallet = undefined;
			});

			const disableAutoEditMode = (): void => {
				walletsStore.setAutoEditMode(false);
			};

			const wallets: ComputedRef<WALLETS.WalletList> = computed(() => {
				return walletsStore.wallets;
			});

			const autoConversionToWallet: ComputedRef<WALLETS.Wallet | undefined> = computed(() => {
				return walletsStore.autoConversionToWallet;
			});

			const autoConversionList: ComputedRef<
				Array<{
					currenciesFrom: Array<{ id: number; title: string }>;
					currencyTo: { id: number; title: string };
				}>
			> = computed(() => {
				return walletsStore.autoConversionList;
			});

			const fromCurrencyInstant: any = computed({
				get(): any {
					return walletsStore.instantConversionFromWallet;
				},
				set(newVal: WALLETS.Wallet) {
					walletsStore.instantConversionFromWallet = newVal;
				}
			});

			const setInstantConversionFromCurrency = (wallet: WALLETS.Wallet): void => {
				fromCurrencyInstant.value = wallet;

				if (fromCurrencyInstant.value && autoConversionToWallet.value) {
					walletsStore.getAutoRates();
				}

				if (instantAmountValue.value) {
					handleCheckInstantBalance();
				}
			};

			const firstSelectCurerncy = ref(false);

			const setAutoConversionWallet = (wallet: WALLETS.Wallet): void => {
				walletsStore.setActiveConversionWallet(wallet);

				firstSelectCurerncy.value = true;

				if (fromCurrencyInstant.value && autoConversionToWallet.value) {
					walletsStore.getAutoRates();
				}
			};

			const instantConversionRate = computed(() => {
				if (autoConversionToWallet.value?.currencyTitle && fromCurrencyInstant.value?.currencyTitle) {
					return walletsStore.currencyRates?.[autoConversionToWallet.value.currencyId]?.[
						fromCurrencyInstant.value.currencyId
					];
				}
				return false;
			});

			const instantConversionRateString = computed(() => {
				if (instantConversionRate.value) {
					return `1 ${autoConversionToWallet.value?.currencyTitle || ''} ≈ ${formatNumberAndFixedDecimals(
						Number(instantConversionRate.value),
						walletsStore.currentLocale,
						fromCurrencyInstant.value.currencyDecimals
					)} ${fromCurrencyInstant.value?.currencyTitle || ''}`;
				}
				return '';
			});

			const fromCurrencies: any = computed({
				get(): any[] {
					return walletsStore.fromConversionCurrencies;
				},
				set(newVal: any[]) {
					walletsStore.fromConversionCurrencies = newVal;
				}
			});

			const setAutoConversionFromCurrencies = (wallets: WALLETS.Wallet[]): void => {
				fromCurrencies.value = [...wallets];
			};

			const removeFromCurrency = (index: number): void => {
				const newArray = [...fromCurrencies.value];
				newArray.splice(index, 1);
				fromCurrencies.value = [...newArray];
			};

			const walletsExcludeFromCurrency = computed(() => {
				if (!isInstantConversion.value) {
					if (fromCurrencies.value.length) {
						const fromCurrencyIdList = fromCurrencies.value.map((wallet: WALLETS.Wallet) => wallet.currencyId);
						return wallets.value.filter((wallet) => !fromCurrencyIdList.includes(wallet.currencyId));
					}

					return wallets.value;
				}

				return fromCurrencyInstant.value
					? wallets.value.filter((wallet) => wallet.currencyId !== fromCurrencyInstant.value?.currencyId)
					: wallets.value;
			});

			const walletsExcludeToCurrency = computed(() => {
				return autoConversionToWallet.value
					? wallets.value.filter((wallet) => wallet.currencyId !== autoConversionToWallet.value?.currencyId)
					: wallets.value;
			});

			const isWithdrawalDisabled = computed(() => {
				if (!isInstantConversion.value) {
					return !fromCurrencies.value.length;
				}

				return (
					!autoConversionToWallet.value ||
					!fromCurrencyInstant.value ||
					Boolean(instantBalanceErrors.value) ||
					!instantAmountValue.value
				);
			});

			const fromCurrenciesSelectLabel = computed(() => {
				const labels: Record<string, string> = {
					selected: !isInstantConversion.value ? 'balance.currenciesForConversion' : 'balance.currencyForConvertNow',
					except: 'balance.conversionExceptions'
				};
				return labels[convertType.value];
			});

			const convertType = ref('selected');

			const setupAutoConversion = (): void => {
				if (!isInstantConversion.value) {
					if (autoConversionToWallet.value && fromCurrencies.value.length) {
						if (convertType.value === 'selected') {
							walletsStore.setupAutoConversion({
								activeWallet: autoConversionToWallet.value,
								fromCurrencies: fromCurrencies.value
							});
						} else {
							const currenciesFiltred = wallets.value.filter(
								(wallet) =>
									!fromCurrencies.value.some(
										(fromWallet: WALLETS.Wallet) => fromWallet.currencyId === wallet.currencyId
									) && autoConversionToWallet.value?.currencyId !== wallet.currencyId
							);
							walletsStore.setupAutoConversion({
								activeWallet: autoConversionToWallet.value,
								fromCurrencies: currenciesFiltred
							});
						}
					}
				} else {
					handleCheckInstantBalance();
					if (!isWithdrawalDisabled.value && fromCurrencyInstant.value && autoConversionToWallet.value) {
						walletsStore.instantConversion({
							currencyIdFrom: fromCurrencyInstant.value.currencyId as number,
							currencyIdTo: autoConversionToWallet.value.currencyId as number,
							amount: instantAmountValue.value as number
						});
					}
				}
			};

			watchEffect(() => {
				if (Boolean(autoEditMode.value)) {
					const currentFromCurrencies = autoConversionList.value.find(
						(autoConversion) =>
							autoConversion.currencyTo.id == autoConversionToWallet.value?.currencyId ||
							autoConversion.currencyTo.title === autoConversionToWallet.value?.currencyTitle
					);
					if (currentFromCurrencies) {
						const currentFromWallets = currentFromCurrencies.currenciesFrom.map((currency) => {
							const fromWallet = wallets.value.find(
								(wallet) => currency.title === wallet.currencyTitle || currency.id == wallet.currencyId
							);
							return fromWallet;
						});
						fromCurrencies.value = currentFromWallets;
					}
				}
			});

			const getFormattedValueForAmountValue = (value: string): string => {
				let newValue = value;
				if (newValue.includes('-')) {
					newValue = newValue.replace(/-/g, '');
				}
				newValue = newValue.replace(' ', '');
				newValue = fromCurrencyInstant.value?.currencyDecimals
					? inputDecimalsMask(newValue, fromCurrencyInstant.value.currencyDecimals)
					: inputMask(newValue);
				return newValue;
			};

			const isNeedShowValueAsString = (value: string): boolean => {
				return (
					isNaN(Number(value)) ||
					value[value.length - 1] === '.' ||
					value.includes(' ') ||
					(String(value).includes('.') && String(value)[String(value).length - 1] === '0')
				);
			};

			const instantAmount = ref('');
			const instantAmountValue = computed({
				get(): any {
					if (isNeedShowValueAsString(String(instantAmount.value))) {
						return instantAmount.value;
					}

					return String(convertExponentialToDecimal(Number(instantAmount.value)));
				},
				set(newVal: any) {
					if (
						isNaN(Number(newVal)) ||
						String(newVal)[String(newVal).length - 1] === '.' ||
						(fromCurrencyInstant.value?.currencyDecimals &&
							findTheNumberOfNumbersAfterTheDecimalPoint(String(newVal)) >
								fromCurrencyInstant.value.currencyDecimals) ||
						String(newVal).includes(' ')
					) {
						instantAmount.value = newVal;
					}

					nextTick(() => {
						instantAmount.value = getFormattedValueForAmountValue(newVal);
					});
				}
			});

			const instantGetByRate = computed(() => {
				if (
					autoConversionToWallet.value?.currencyTitle &&
					instantConversionRate.value &&
					!isNaN(Number(instantAmount.value))
				) {
					const getValue =
						(Math.pow(10, 8) * Number(instantAmount.value)) / (Number(instantConversionRate.value) * Math.pow(10, 8));
					const formattedGetValue = formatNumberAndFixedDecimals(
						Number(getValue),
						walletsStore.currentLocale,
						autoConversionToWallet.value.currencyDecimals || 2
					);
					return `${formattedGetValue} ${autoConversionToWallet.value.currencyTitle}`;
				}
				return `0 ${autoConversionToWallet.value?.currencyTitle || ''}`;
			});

			const loadingConversionRates = computed(() => walletsStore.loadingConversionRates);

			const handleCheckInstantBalance = (): void => {
				nextTick(() => {
					walletsStore.appendErrors(
						walletsStore.instantConversionBalanceValidation(
							instantAmountValue.value,
							fromCurrencyInstant.value.availableFunds
						)
					);
				});
			};

			const instantBalanceErrors = computed(() => {
				return walletsStore.currentErrors['instantBalance']?.message || '';
			});

			const instantAmountHandler = (value: string): void => {
				instantAmountValue.value = value;
			};

			const shouldBeAutoOpenedToCurrencySelect = ref(true);

			const toCurrencySelect = ref(null);

			const blurFromCurrenciesHandler = (): void => {
				if (fromCurrencies.value.length) {
					setTimeout(() => {
						(toCurrencySelect.value as any)?.onWalletsChanged();
						shouldBeAutoOpenedToCurrencySelect.value = true;
					}, 100);
				}
			};

			const focusFromCurrenciesHandler = (): void => {
				shouldBeAutoOpenedToCurrencySelect.value = false;
			};

			const cardVariables = ref([
				{
					name: 'cardStyles',
					type: 'string',
					defaultValue: 'padding:var(--spacing-6)'
				}
			]);

			const backBtnVariables = ref([
				{
					name: 'iconSize',
					type: 'string',
					defaultValue: '14'
				},
				{
					name: 'iconName',
					type: 'string',
					defaultValue: '$prev--colorable'
				},
				{
					name: 'iconStyle',
					type: 'string',
					defaultValue: '--icon-color:var(--tertiary-darken)'
				}
			]);

			return {
				cardVariables,
				backBtnVariables,
				loadingConversionRates,
				instantGetByRate,
				instantConversionRateString,
				autoEditMode,
				wallets,
				autoConversionToWallet,
				convertType,
				fromCurrenciesSelectLabel,
				isWithdrawalDisabled,
				setupAutoConversion,
				setAutoConversionWallet,
				setAutoConversionFromCurrencies,
				removeFromCurrency,
				fromCurrencies,
				isInstantConversion,
				setInstantConversionFromCurrency,
				fromCurrencyInstant,
				handleCheckInstantBalance,
				instantAmountValue,
				instantBalanceErrors,
				instantAmountHandler,
				walletsExcludeToCurrency,
				walletsExcludeFromCurrency,
				blurFromCurrenciesHandler,
				toCurrencySelect,
				shouldBeAutoOpenedToCurrencySelect,
				focusFromCurrenciesHandler
			};
		}
	});
</script>
