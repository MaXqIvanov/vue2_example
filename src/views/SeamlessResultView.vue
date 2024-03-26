<template>
	<Widget name="balance-actions-card-wrapper">
		<WidgetItem
			v-slot="{ computedAttrs, styleString }"
			name="card"
			:contentVariables="cardWrapperVariables"
		>
			<KCard
				v-bind="computedAttrs"
				:style="`--sheet-outlined-border: 1px solid var(--tertiary-lighten-5); ${styleString}`"
			>
				<Widget name="balance-actions-seamless-result">
					<WidgetItem
						v-if="viewTypeIsProcess"
						key="actions-seamless-result-circular"
						v-slot="{ computedAttrs, circularSize, circularStrokeWidth }"
						name="circular"
						:contentVariables="progressCircularVariables"
					>
						<KProgressCircular
							v-bind="computedAttrs"
							indeterminate
							:size="circularSize"
							:width="circularStrokeWidth"
							style="color: inherit"
						/>
					</WidgetItem>
					<WidgetItem
						v-else
						key="actions-seamless-result-status-icon"
						v-slot="{ computedAttrs }"
						name="status-icon"
					>
						<KIcon
							v-bind="computedAttrs"
							:name="statusIcon"
							:style="{ '--icon-color': statusIconColor }"
						/>
					</WidgetItem>

					<WidgetItem
						v-if="resultViewTitle"
						key="actions-seamless-result-title"
						v-slot="{ computedAttrs }"
						name="title"
					>
						<KText v-bind="computedAttrs">
							{{ $t(resultViewTitle) }}
						</KText>
					</WidgetItem>

					<WidgetItem
						v-if="resultViewTitle"
						key="actions-seamless-result-subtitle"
						v-slot="{ computedAttrs }"
						name="subtitle"
					>
						<KText v-if="viewTypeIsProcess" v-bind="computedAttrs">
							{{ $t(resultViewSubtitle) }} {{ predictMinutes }} {{ $t('system.minute', { time: predictMinutes, $plural: 'time' }).toLowerCase() }}
						</KText>
						<KText v-else-if="viewTypeIsSuccess && isWithdrawalForm && activeFlowNotSwap" v-bind="computedAttrs">
							{{ $t('balance.youSuccessfullyWithdrawalAmountToFiat', { amount: getText }) }}
						</KText>
						<KText v-else-if="viewTypeIsSuccess && (!isWithdrawalForm || !activeFlowNotSwap)" v-bind="computedAttrs">
							{{ $t(resultViewSubtitle) }} {{ getText }}
						</KText>
						<KText v-else-if="viewTypeIsFail" v-bind="computedAttrs">
							{{ $t(resultViewSubtitle) }}
						</KText>
					</WidgetItem>

					<WidgetItem v-slot="{ computedAttrs }" name="info-block">
						<SeamlessInfoBlock
							v-bind="computedAttrs"
							:getCurrencyIcon="getCurrencyIcon"
							:giveCurrencyIcon="giveCurrencyIcon"
							:resultAction="resultAction"
							:currencyRelation="currencyRelation"
							:resultStatus="resultStatus"
							:paymentMethodTitle="paymentMethodTitle"
							:paymentMethodIcon="paymentMethodIcon"
							:paymentMethodName="paymentMethodName"
							:providerMethodIcon="providerMethodIcon"
							:providerMethodTitle="providerMethodTitle"
							:providerMethodName="providerMethodName"
							:rateInfoTitle="rateInfoTitle"
							:rateInfoText="rateInfoText"
							:getTitle="getTitle"
							:getText="getText"
							:getCurrencyProviderMethodIcon="getCurrencyProviderMethodIcon"
							:getCurrencyProviderMethodName="getCurrencyProviderMethodName"
							:giveCurrencyProviderMethodIcon="giveCurrencyProviderMethodIcon"
							:giveCurrencyProviderMethodName="giveCurrencyProviderMethodName"
							:giveTitle="giveTitle"
							:giveText="giveText"
							:idTitle="idTitle"
							:idText="String(idText)"
							:resultEndDateTitle="resultEndDateTitle"
							:resultEndDate="resultEndDate"
							:resultEndTime="resultEndTime"
							:feeTitle="feeTitle"
							:feeText="feeText"
							:viewType="viewTypeComputed"
							:activeForm="activeFormComputed"
							:flowType="flowType"
							:link="goP2PTradeChat"
						/>
					</WidgetItem>

					<WidgetItem
						v-if="showCheckActions"
						v-slot="{ computedAttrs }"
						name="download-check"
					>
						<KBtn v-bind="computedAttrs" @click="downloadCheckHandler">
							<Widget name="balance-actions-seamless-result-download-check">
								<WidgetItem v-slot="{ computedAttrs }" name="icon">
									<KIcon v-bind="computedAttrs" />
								</WidgetItem>

								<WidgetItem v-slot="{ computedAttrs }" name="text">
									<KText v-bind="computedAttrs" />
								</WidgetItem>
							</Widget>
						</KBtn>
					</WidgetItem>

					<WidgetItem
						v-if="showCheckActions"
						v-slot="{ computedAttrs }"
						name="share"
					>
						<KBtn v-bind="computedAttrs" @click="shareLinkHandler">
							<Widget name="balance-actions-seamless-result-share-btn">
								<WidgetItem v-slot="{ computedAttrs }" name="icon">
									<KIcon v-bind="computedAttrs" />
								</WidgetItem>

								<WidgetItem v-slot="{ computedAttrs }" name="text">
									<KText v-bind="computedAttrs" />
								</WidgetItem>
							</Widget>
						</KBtn>
					</WidgetItem>

					<WidgetItem
						v-if="viewTypeIsFail"
						key="actions-seamless-result-prompt"
						v-slot="{ computedAttrs }"
						name="prompt"
					>
						<Widget v-bind="computedAttrs" name="balance-actions-seamless-result-prompt">
							<WidgetItem v-slot="{ computedAttrs, name }" name="icon">
								<KIcon v-bind="computedAttrs" :name="name" />
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="text">
								<KText v-bind="computedAttrs" />
							</WidgetItem>

							<WidgetItem
								v-slot="{ computedAttrs, tooltipIconColor, tooltipText }"
								name="tooltip"
								:contentVariables="tooltipVariables"
							>
								<InfoTooltip
									v-if="tooltipText"
									v-bind="computedAttrs"
									iconName="info--colorable"
									:iconColor="tooltipIconColor"
								>
									<Widget name="balance-text-body-2-regular">
										<WidgetItem v-slot="{ computedAttrs }" name="text">
											<KText v-bind="computedAttrs">
												{{ $t(tooltipText) }}
											</KText>
										</WidgetItem>
									</Widget>
								</InfoTooltip>
							</WidgetItem>
						</Widget>
					</WidgetItem>

					<WidgetItem
						v-if="isWithdrawalForm && viewTypeIsSuccess && activeFlowNotSwap"
						key="actions-do-action-name-title"
						v-slot="{ computedAttrs }"
						name="do-action-name"
					>
						<KText v-bind="computedAttrs">
							{{ $t('balance.verifyReceiptOfPayment') }}
						</KText>
					</WidgetItem>

					<WidgetItem
						v-if="isWithdrawalForm && viewTypeIsSuccess && activeFlowNotSwap"
						key="actions-do-action-payment-method"
						name="do-action-payment-method"
					>
						<Widget name="balance-actions-do-action-payment-method">
							<WidgetItem v-slot="{ computedAttrs }" name="title">
								<KText v-bind="computedAttrs">
									{{ $t('balance.paymentMethodTitle') }}
								</KText>
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="icon">
								<KIcon v-bind="computedAttrs" :name="paymentMethodIcon" />
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="text">
								<KText v-bind="computedAttrs">
									{{ paymentMethodName }}
								</KText>
							</WidgetItem>
						</Widget>
					</WidgetItem>

					<WidgetItem
						v-if="isWithdrawalForm && viewTypeIsSuccess && activeFlowNotSwap"
						key="do-action-requisites-key"
						v-slot="{ computedAttrs, copiedText }"
						name="do-action-requisites"
						:contentVariables="copiedVariables"
					>
						<KTooltip
							key="do-action-requisites-tooltip"
							v-model="showCopyTooltip"
							v-bind="computedAttrs"
							:openOnHover="false"
							top
						>
							<template #activator="{ attrs }">
								<Widget name="balance-actions-do-action-requisites">
									<WidgetItem v-slot="{ computedAttrs }" name="title">
										<KText v-bind="computedAttrs">
											{{ $t('balance.requisitesText') }}
										</KText>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="text">
										<KText
											v-bind="{...attrs, ...computedAttrs}"
											@click="copyToClipboard(currentRequisites)"
										>
											{{ currentRequisites }}
										</KText>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="icon">
										<KIcon
											v-bind="{...attrs, ...computedAttrs}"
											@click="copyToClipboard(currentRequisites)"
										/>
									</WidgetItem>
								</Widget>
							</template>
							<Widget name="balance-text-body-1-regular">
								<WidgetItem v-slot="{ computedAttrs }" name="text">
									<KText v-bind="computedAttrs">
										{{ $t(copiedText) }}
									</KText>
								</WidgetItem>
							</Widget>
						</KTooltip>
					</WidgetItem>

					<WidgetItem
						v-if="isWithdrawalForm && viewTypeIsSuccess && activeFlowNotSwap"
						key="actions-do-action-payment-method"
						name="do-action-amount-received"
					>
						<Widget name="balance-actions-do-action-amount-received">
							<WidgetItem v-slot="{ computedAttrs }" name="title">
								<KText v-bind="computedAttrs">
									{{ $t('balance.amountReceived') }}
								</KText>
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="value">
								<KText v-bind="computedAttrs">
									{{ getText }}
								</KText>
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="icon">
								<KIcon v-bind="computedAttrs" :name="giveCurrencyIcon" />
							</WidgetItem>
						</Widget>
					</WidgetItem>

					<WidgetItem
						v-if="seamlessStepsEnabled && successLongBtnTitle"
						v-slot="{ computedAttrs }"
						key="seamless-result-primary-btn-long"
						name="primary-btn-long"
					>
						<KBtn
							v-bind="computedAttrs"
							:title="$t(successLongBtnTitle)"
							@click="primaryBtnHandler"
						/>
					</WidgetItem>

					<WidgetItem
						v-else-if="successLongBtnTitle"
						v-slot="{ computedAttrs }"
						key="seamless-result-primary-btn"
						name="primary-btn"
					>
						<KBtn v-bind="computedAttrs" @click="primaryBtnHandler" />
					</WidgetItem>

					<WidgetItem
						v-if="!seamlessStepsEnabled && true"
						v-slot="{ computedAttrs }"
						key="seamless-result-secondary-btn"
						name="secondary-btn"
					>
						<KBtn v-bind="computedAttrs" @click="secondaryBtnHandler" />
					</WidgetItem>

					<WidgetItem
						v-else-if="statusIsFiatSent && !isWithdrawalForm"
						v-slot="{ computedAttrs }"
						key="seamless-result-error-btn"
						name="error-btn"
					>
						<KBtn v-bind="computedAttrs" @click="errorBtnHandler" />
					</WidgetItem>
				</Widget>
			</KCard>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import { defineComponent, computed, toRef, onMounted, ref } from 'vue';
	import {
		formatNumberAndFixedDecimals,
		getDateWithYearLong,
		getTimeFull,
		useRouter,
		useHref,
		useTranslate,
		convertExponentialToDecimal
	} from '@/utils/utils';
	import MyRootStore from '@/store/store';
	import InfoTooltip from '@/components/InfoTooltip.vue';
	import SeamlessInfoBlock from '@/components/SeamlessInfoBlock.vue';
	import { CurrencyType, DealStatuses, FlowType, FormType, WalletCurrencyType } from '@/const';

	export default defineComponent({
		name: 'SeamlessResultView',
		components: { InfoTooltip, SeamlessInfoBlock },
		inheritAttrs: false,

		props: {
			transactionId: {
				type: String,
				default: ''
			},
			viewType: {
				type: String,
				default: ''
			},
			currency: {
				type: String,
				default: ''
			},
			activeForm: {
				type: String,
				default: ''
			},
			flowType: {
				type: String,
				default: ''
			},
			secondCurrency: {
				type: String,
				default: ''
			}
		},

		setup(props, ctx) {
			const walletsStore = MyRootStore.getInstance().wallets;
			const router = useRouter();
			const $href = useHref();
			const $t = useTranslate();

			const activeFormComputed = toRef(props, 'activeForm');
			const viewTypeComputed = toRef(props, 'viewType');

			const showCopyTooltip = ref(false);
			const copyTimeout = ref<NodeJS.Timeout | null>(null);
			const copyToClipboard = (value: string): void => {
				navigator.clipboard.writeText(value);
				if (!showCopyTooltip.value) {
					showCopyTooltip.value = true;
				}

				if (copyTimeout.value) {
					clearTimeout(copyTimeout.value);
				}
				copyTimeout.value = setTimeout(() => {
					showCopyTooltip.value = false;
				}, 1200);
			};

			const currentRequisites = computed(() => {
				return currentTrade.value?.requisite || '';
			});

			onMounted(() => {
				//
			});

			const downloadCheckHandler = (): void => {
				const dataArray = [
					[resultAction.value + currencyRelation.value, resultStatus.value],
					[idTitle.value, String(idText.value)]
				];
				if (paymentMethodName.value) {
					dataArray.push([paymentMethodTitle.value, paymentMethodName.value]);
				}
				if (providerMethodName.value) {
					dataArray.push([providerMethodTitle.value, providerMethodName.value]);
				}
				if (rateInfoText.value) {
					dataArray.push([rateInfoTitle.value, rateInfoText.value]);
				}
				if (giveText.value) {
					dataArray.push([giveTitle.value, giveText.value]);
				}
				if (getText.value) {
					dataArray.push([getTitle.value, getText.value]);
				}
				if (resultEndDate.value || resultEndTime.value) {
					dataArray.push([resultEndDateTitle.value, resultEndDate.value + resultEndTime.value]);
				}
				if (feeText.value) {
					dataArray.push([feeTitle.value, feeText.value]);
				}

				const childrenArray = dataArray.map((horizontalBlockPare, index) => {
					const block = document.createElement('div');
					block.setAttribute(
						'style',
						`display: grid; grid-area: ${index + 1} / 1 / ${
							index + 2
						} / 2; grid-template-columns: max-content max-content; justify-content: space-between`
					);

					const childrenFirst = document.createElement('div');
					childrenFirst.setAttribute('style', 'grid-area: 1 / 1 / 2 / 2');
					childrenFirst.innerHTML = horizontalBlockPare[0];

					const childrenSecond = document.createElement('div');
					childrenSecond.setAttribute('style', 'grid-area: 1 / 2 / 2 / 3');
					childrenSecond.innerHTML = horizontalBlockPare[1];

					block.appendChild(childrenFirst);
					block.appendChild(childrenSecond);
					return block;
				});

				const checkBloc = document.createElement('div');
				checkBloc.setAttribute(
					'style',
					'margin: auto; width: 365px; display: grid; padding: 24px; background: var(--card-bg-secondary); border-radius: var(--border-radius-md);'
				);
				childrenArray.forEach((children) => checkBloc.appendChild(children));

				const blob = new Blob([checkBloc.outerHTML], { type: 'text/plain' });
				const link = document.createElement('a');
				link.setAttribute('href', URL.createObjectURL(blob));
				link.setAttribute('download', 'my-text.HTML');
				link.click();
			};

			const shareLinkHandler = (): void => {
				//
			};

			const goP2PTradeChat = computed(() => {
				return `${walletsStore.domainUrl}/p2p${goP2PTradePathPiece.value}`;
			});

			const goP2PTradePathPiece = computed(() => {
				if (!currentTrade.value) return '';
				return `/chat/${idText.value}?chat=${currentTrade.value?.conversationId || null}`;
			});

			const primaryBtnHandler = (): void => {
				if (viewTypeIsFail.value) {
					window.open($href('goToP2P') + goP2PTradePathPiece.value, '_blank');
				}
				if (viewTypeIsSuccess.value) {
					router.push({
						name: 'balance-activeForm',
						params: {
							currency: activeWalletTitle.value,
							activeForm: activeFormComputed.value
						}
					});
				}
			};

			const secondaryBtnHandler = (): void => {
				//
			};

			const statusIsFiatSent = computed(() => {
				return status.value === 'FiatSent';
			});

			const errorBtnHandler = (): void => {
				if (statusIsFiatSent.value && !isWithdrawalForm.value) {
					walletsStore.setNeedConfirmCancelDeal(true);
				}
			};

			const statusIcon = computed(() => {
				return viewTypeComputed.value === 'success' ? 'balance.success-view-icon' : 'balance.attention-icon--colorable';
			});

			const statusIconColor = computed(() => {
				return viewTypeComputed.value === 'success' ? 'var(--primary-lighten)' : 'var(--status-error-darken)';
			});

			const getCurrencyIcon = computed(() => {
				return `currency.${activeWalletTitle.value}`;
			});

			const giveCurrencyIcon = computed(() => {
				return activeFlowNotSwap.value
					? `fiat.${secondCurrencyStepFlowTitle.value}`
					: `currency.${secondCurrencyStepFlowTitle.value}`;
			});

			const paymentMethodIcon = computed(() => {
				return `payment-methods.${
					currentTrade.value?.paymentMethod?.id || activePaymentMethod.value?.paymentMethodId || 1
				}`;
			});

			const paymentMethodTitle = computed(() => {
				return $t('balance.paymentMethodTitle');
			});

			const paymentMethodName = computed(() => {
				if (!activeFlowNotSwap.value) return '';
				return currentTrade.value?.paymentMethod?.name || activePaymentMethod.value?.paymentMethod?.name || '';
			});

			const activePaymentProvider = computed(() => {
				return walletsStore.activePaymentProvider;
			});

			const activeFlowNotSwap = computed(() => {
				return walletsStore.getActiveFlow !== FlowType.SWAP;
			});

			const providerMethodIcon = computed(() => {
				return `balance.${activePaymentProvider.value}-provider`;
			});

			const providerMethodTitle = computed(() => {
				return $t('balance.providerText');
			});

			const providerMethodName = computed(() => {
				if (!activeFlowNotSwap.value) return '';
				return $t('balance.p2pDealText');
			});

			const activeWallet = computed(() => {
				return walletsStore.getActiveWallet;
			});

			const activeWalletTitle = computed(() => {
				return activeWallet.value?.currencyTitle;
			});

			const secondCurrencyStepFlow = computed(() => {
				return walletsStore.secondCurrencyStepFlow;
			});

			const secondCurrencyStepFlowTitle = computed(() => {
				return secondCurrencyStepFlow.value?.title || '';
			});

			const secondCurrencyStepFlowDecimals = computed(() => {
				return secondCurrencyStepFlow.value?.decimals || 8;
			});

			const currencyRelation = computed(() => {
				return `${activeWalletTitle.value} ${$t('balance.p2pFor')} ${secondCurrencyStepFlowTitle.value}`;
			});

			const resultStatus = computed(() => {
				if (viewTypeIsProcess.value) {
					return '';
				}
				if (viewTypeIsSuccess.value) {
					return $t('balance.completed');
				}
				if (viewTypeIsFail.value) {
					return $t('balance.errorTitle');
				}

				return '';
			});

			const resultAction = computed(() => {
				if (!activeFlowNotSwap.value) return $t('balance.p2pSwap');
				if (activeFormComputed.value === FormType.DEPOSIT) {
					return $t('balance.p2pBuy');
				}
				if (activeFormComputed.value === FormType.WITHDRAWAL) {
					return $t('balance.p2pSell');
				}

				return $t('balance.p2pSwap');
			});

			const rateInfoTitle = computed(() => {
				return $t('balance.rate');
			});

			const rateInfoText = computed(() => {
				const avgPrice = formatNumberAndFixedDecimals(
					!activeFlowNotSwap.value && isWithdrawalForm.value
						? 1 / Number(currentTrade.value?.exchangeRate || activePaymentMethod.value?.avgPrice) || 1 || 1
						: currentTrade.value?.exchangeRate || activePaymentMethod.value?.avgPrice || 1,
					undefined,
					secondCurrencyStepFlowDecimals.value
				);
				return `1 ${activeWalletTitle.value} ~ ${avgPrice} ${secondCurrencyStepFlowTitle.value}`;
			});

			const getTitle = computed(() => {
				return $t('balance.ImGetting');
			});

			const currentTrade = computed(() => {
				return walletsStore.computedCurrentTrade;
			});

			const getText = computed(() => {
				let amountFormatted = '';
				let amountTitle = '';
				if (walletsStore.getActiveFlow === FlowType.SWAP) {
					if (walletsStore.getAuthenticatedUserName === currentTrade.value?.cryptoBuyer?.username) {
						amountFormatted = formatNumberAndFixedDecimals(
							currentTrade.value?.sellerCurrency?.amount || currentTrade.value?.cryptoSellerAmount || 0,
							undefined,
							currentTrade.value?.sellerCurrency?.decimals || 8
						);
						amountTitle = currentTrade.value?.sellerCurrency?.title || secondCurrencyStepFlowTitle.value;
					} else {
						amountFormatted = formatNumberAndFixedDecimals(
							currentTrade.value?.buyerCurrency?.amount || currentTrade.value?.cryptoBuyerAmount || 0,
							undefined,
							currentTrade.value?.buyerCurrency?.decimals || 8
						);
						amountTitle = currentTrade.value?.buyerCurrency?.title || activeWalletTitle.value;
					}
				} else {
					amountFormatted =
						isWithdrawalForm.value && activeFlowNotSwap.value
							? formatNumberAndFixedDecimals(
									currentTrade.value?.buyerCurrency?.amount || 0,
									undefined,
									currentTrade.value?.buyerCurrency?.decimals || 2
							  )
							: formatNumberAndFixedDecimals(
									currentTrade.value?.sellerCurrency?.amount || 0,
									undefined,
									currentTrade.value?.sellerCurrency?.decimals || 8
							  );
					amountTitle = isWithdrawalForm.value ? secondCurrencyStepFlowTitle.value : activeWalletTitle.value;
				}
				return `${amountFormatted} ${amountTitle}`;
			});

			const getCurrencyProviderMethodIcon = computed(() => {
				let id;

				if (!isWithdrawalForm.value && activeWallet.value?.currencyType === WalletCurrencyType[CurrencyType.Fiat]) {
					id = currentTrade.value?.paymentMethod?.id || activePaymentMethod.value?.paymentMethodId;
				} else if (isWithdrawalForm.value && secondCurrencyStepFlow.value.type === CurrencyType.Fiat) {
					id = currentTrade.value?.paymentMethod?.id || activePaymentMethod.value?.paymentMethodId;
				}

				if (id) return `payment-methods.${id}`;

				return '';
			});
			const getCurrencyProviderMethodName = computed(() => {
				if (!isWithdrawalForm.value && activeWallet.value?.currencyType === WalletCurrencyType[CurrencyType.Fiat]) {
					return currentTrade.value?.paymentMethod?.name || activePaymentMethod.value?.paymentMethod?.name || '';
				} else if (isWithdrawalForm.value && secondCurrencyStepFlow.value.type === CurrencyType.Fiat) {
					return currentTrade.value?.paymentMethod?.name || activePaymentMethod.value?.paymentMethod?.name || '';
				}

				return '';
			});
			const giveCurrencyProviderMethodIcon = computed(() => {
				let id;

				if (!isWithdrawalForm.value && secondCurrencyStepFlow.value.type === CurrencyType.Fiat) {
					id = currentTrade.value?.paymentMethod?.id || activePaymentMethod.value?.paymentMethodId;
				} else if (
					isWithdrawalForm.value &&
					activeWallet.value?.currencyType === WalletCurrencyType[CurrencyType.Fiat]
				) {
					id = currentTrade.value?.paymentMethod?.id || activePaymentMethod.value?.paymentMethodId;
				}

				if (id) return `payment-methods.${id}`;

				return '';
			});
			const giveCurrencyProviderMethodName = computed(() => {
				if (!isWithdrawalForm.value && secondCurrencyStepFlow.value.type === CurrencyType.Fiat) {
					return currentTrade.value?.paymentMethod?.name || activePaymentMethod.value?.paymentMethod?.name || '';
				} else if (
					isWithdrawalForm.value &&
					activeWallet.value?.currencyType === WalletCurrencyType[CurrencyType.Fiat]
				) {
					return currentTrade.value?.paymentMethod?.name || activePaymentMethod.value?.paymentMethod?.name || '';
				}

				return '';
			});

			const giveTitle = computed(() => {
				return $t('balance.ImGiving');
			});

			const giveText = computed(() => {
				let amountFormatted = '';
				let amountTitle = '';
				if (walletsStore.getActiveFlow === FlowType.SWAP) {
					if (walletsStore.getAuthenticatedUserName === currentTrade.value?.cryptoBuyer?.username) {
						amountFormatted = formatNumberAndFixedDecimals(
							currentTrade.value?.buyerCurrency?.amount || currentTrade.value?.cryptoBuyerAmount || 0,
							undefined,
							currentTrade.value?.buyerCurrency?.decimals || 8
						);
						amountTitle = currentTrade.value?.buyerCurrency?.title || activeWalletTitle.value;
					} else {
						amountFormatted = formatNumberAndFixedDecimals(
							currentTrade.value?.sellerCurrency?.amount || currentTrade.value?.cryptoSellerAmount || 0,
							undefined,
							currentTrade.value?.sellerCurrency?.decimals || 8
						);
						amountTitle = currentTrade.value?.sellerCurrency?.title || secondCurrencyStepFlowTitle.value;
					}
				} else {
					amountFormatted = isWithdrawalForm.value
						? formatNumberAndFixedDecimals(
								currentTrade.value?.sellerCurrency?.amount || 0,
								undefined,
								currentTrade.value?.sellerCurrency?.decimals || 8
						  )
						: formatNumberAndFixedDecimals(
								currentTrade.value?.buyerCurrency?.amount || 0,
								undefined,
								currentTrade.value?.buyerCurrency?.decimals || 2
						  );
					amountTitle = isWithdrawalForm.value ? activeWalletTitle.value : secondCurrencyStepFlowTitle.value;
				}
				return `${amountFormatted} ${amountTitle}`;
			});

			const resultEndDateTitle = computed(() => {
				return $t('balance.completionTime');
			});

			const normalizedTime = (time: string): string => {
				if (time && !Number.isInteger(time)) {
					return `${time.toString().substring(0, 10)}T${time.toString().substring(11)}`;
				}

				return time;
			};

			const status = computed(() => {
				return currentTrade.value?.status || '';
			});

			const resultEndDate = computed(() => {
				switch (status.value) {
					case DealStatuses.FundsFreezeConfirmation:
					case DealStatuses.MFASent:
					case DealStatuses.Created:
					case DealStatuses.Terminated:
					case DealStatuses.FundsFrozen:
					case DealStatuses.FiatSent:
						if (!currentTrade.value?.rsgActiveUntil) return '';
						return getDateWithYearLong(normalizedTime(currentTrade.value?.rsgActiveUntil), walletsStore.currentLocale);
					case DealStatuses.Completed:
					case DealStatuses.Cancelled:
						if (!currentTrade.value?.endedAt) return '';
						return getDateWithYearLong(normalizedTime(currentTrade.value?.endedAt), walletsStore.currentLocale);
					default:
						if (!currentTrade.value?.availableUntil) return '';
						return getDateWithYearLong(normalizedTime(currentTrade.value?.availableUntil), walletsStore.currentLocale);
				}
			});

			const resultEndTime = computed(() => {
				switch (status.value) {
					case 'FundsFreezeConfirmation':
					case 'MFASent':
					case 'Created':
					case 'Terminated':
					case 'FundsFrozen':
					case 'FiatSent':
						if (!currentTrade.value?.rsgActiveUntil) return '';
						return getTimeFull(normalizedTime(currentTrade.value?.rsgActiveUntil), walletsStore.currentLocale);
					case 'Completed':
					case 'Refused':
					case DealStatuses.Cancelled:
						if (!currentTrade.value?.endedAt) return '';
						return getTimeFull(normalizedTime(currentTrade.value?.endedAt), walletsStore.currentLocale);
					default:
						if (!currentTrade.value?.availableUntil) return '';
						return getTimeFull(normalizedTime(currentTrade.value?.availableUntil), walletsStore.currentLocale);
				}
			});

			const idTitle = computed(() => {
				return $t('balance.orderIdentificator');
			});

			const idText = computed(() => {
				return walletsStore.computedCurrentTradeId;
			});

			const feeTitle = computed(() => {
				return `${$t('balance.fee')}:`;
			});

			const feeText = computed(() => {
				return currentTrade.value?.serviceFee || currentTrade.value?.commission || activePaymentMethod.value?.commission
					? `${convertExponentialToDecimal(
							currentTrade.value?.serviceFee || activePaymentMethod.value?.commission || 0
					  )} ${secondCurrencyStepFlowTitle.value}`
					: '';
			});

			const viewTypeIsProcess = computed(() => {
				return viewTypeComputed.value === 'process';
			});

			const viewTypeIsSuccess = computed(() => {
				return viewTypeComputed.value === 'success';
			});

			const viewTypeIsFail = computed(() => {
				return viewTypeComputed.value === 'fail';
			});

			const showCheckActions = computed(() => {
				return false;
			});

			const resultViewTitle = computed(() => {
				if (viewTypeIsProcess.value) {
					return 'balance.tradeInProcess';
				}
				if (viewTypeIsSuccess.value) {
					return 'balance.dealCompleted';
				}
				if (viewTypeIsFail.value) {
					return 'balance.operationProcessingError';
				}

				return 'balance.operationProcessingError';
			});

			const activePaymentMethod = computed(() => {
				return walletsStore.activePaymentMethod;
			});

			const resultViewSubtitle = computed(() => {
				if (viewTypeIsProcess.value) {
					return 'balance.estimatedWaitTime';
				}
				if (viewTypeIsSuccess.value) {
					return 'balance.youSuccessfullyPurchased';
				}
				if (viewTypeIsFail.value) {
					return 'balance.operationProcessingError';
				}

				return '';
			});

			const successLongBtnTitle = computed(() => {
				if (viewTypeIsProcess.value) {
					return '';
				}
				if (viewTypeIsSuccess.value) {
					return 'balance.toMainScreen';
				}
				if (viewTypeIsFail.value) {
					return 'balance.goToChat';
				}

				return '';
			});

			const predictMinutes = computed(() => {
				const minutes = activePaymentMethod.value?.predictTime?.split?.(':')[1] || 1;
				return Number(minutes);
			});

			const seamlessStepsEnabled = computed(() => {
				return walletsStore.seamlessStepsEnabled;
			});

			const isWithdrawalForm = computed(() => {
				return activeFormComputed.value === FormType.WITHDRAWAL;
			});

			const cardWrapperVariables = [
				{
					name: 'styleString',
					type: 'string',
					defaultValue: ''
				}
			];

			const tooltipVariables = [
				{
					name: 'tooltipIconColor',
					type: 'string',
					defaultValue: ''
				},
				{
					name: 'tooltipText',
					type: 'string',
					defaultValue: 'balance.goToDealChatTooltip'
				}
			];

			const progressCircularVariables = [
				{
					name: 'circularSize',
					type: 'string',
					defaultValue: '48'
				},
				{
					name: 'circularStrokeWidth',
					type: 'string',
					defaultValue: '6.75'
				}
			];

			const copiedVariables = [
				{
					name: 'copiedText',
					type: 'translation',
					defaultValue: 'balance.copied'
				}
			];

			return {
				cardWrapperVariables,
				tooltipVariables,
				progressCircularVariables,
				copiedVariables,
				viewTypeIsProcess,
				viewTypeIsSuccess,
				viewTypeIsFail,
				viewTypeComputed,
				activeFormComputed,
				isWithdrawalForm,
				showCheckActions,
				seamlessStepsEnabled,
				resultViewTitle,
				resultViewSubtitle,
				predictMinutes,
				copyToClipboard,
				downloadCheckHandler,
				statusIcon,
				statusIconColor,
				shareLinkHandler,
				primaryBtnHandler,
				secondaryBtnHandler,
				errorBtnHandler,
				currencyRelation,
				resultStatus,
				resultAction,
				getCurrencyIcon,
				giveCurrencyIcon,
				paymentMethodIcon,
				paymentMethodName,
				paymentMethodTitle,
				rateInfoTitle,
				rateInfoText,
				getTitle,
				getText,
				getCurrencyProviderMethodIcon,
				getCurrencyProviderMethodName,
				giveCurrencyProviderMethodIcon,
				giveCurrencyProviderMethodName,
				giveTitle,
				giveText,
				resultEndDateTitle,
				resultEndDate,
				resultEndTime,
				idTitle,
				idText,
				feeTitle,
				feeText,
				providerMethodIcon,
				providerMethodTitle,
				providerMethodName,
				successLongBtnTitle,
				currentRequisites,
				showCopyTooltip,
				activeFlowNotSwap,
				statusIsFiatSent,
				goP2PTradeChat
			};
		}
	});
</script>
