<template>
	<Widget name="balance-actions-seamless-result-info">
		<WidgetItem v-slot="{ computedAttrs }" name="currency-pair-info">
			<Widget v-bind="computedAttrs" name="balance-actions-result-info-currency-pair">
				<WidgetItem v-slot="{ computedAttrs }" name="get-currency">
					<KIcon v-bind="computedAttrs" :name="getCurrencyIcon" />
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="give-currency">
					<KIcon v-bind="computedAttrs" :name="giveCurrencyIcon" />
				</WidgetItem>

				<WidgetItem
					v-slot="{ computedAttrs }"
					name="action"
				>
					<KText v-bind="computedAttrs" :style="{ color: actionColor }">
						{{ resultAction }}
					</KText>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="currency-relation">
					<KText v-bind="computedAttrs">
						{{ currencyRelation }}
					</KText>
				</WidgetItem>

				<WidgetItem
					v-if="resultStatus"
					:key="resultStatus + 'resultStatus' + currencyRelation"
					v-slot="{ computedAttrs }"
					name="status"
				>
					<KText v-bind="computedAttrs" :style="{ color: colorByViewType }">
						{{ resultStatus }}
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<WidgetItem
			v-if="paymentMethodName && showPaymentMethodRow"
			:key="paymentMethodName + 'paymentMethodName' + currencyRelation"
			v-slot="{ computedAttrs }"
			name="payment-info"
		>
			<Widget v-bind="computedAttrs" name="balance-actions-result-info-payment-method">
				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs">
						{{ paymentMethodTitle }}
					</KText>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="method-icon">
					<KIcon v-bind="computedAttrs" :name="paymentMethodIcon" />
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="method-name">
					<KText v-bind="computedAttrs">
						{{ paymentMethodName }}
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<WidgetItem
			v-if="providerMethodName"
			:key="providerMethodName + 'providerMethodName' + currencyRelation"
			v-slot="{ computedAttrs }"
			name="provider-info"
		>
			<Widget v-bind="computedAttrs" name="balance-actions-result-info-payment-method">
				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs">
						{{ providerMethodTitle }}
					</KText>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="method-icon">
					<KIcon v-bind="computedAttrs" :name="providerMethodIcon" />
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="method-name">
					<KText v-bind="computedAttrs">
						{{ providerMethodName }}
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<WidgetItem
			v-if="requisitesValue"
			:key="requisitesValue + 'needRateInfoText' + currencyRelation"
			v-slot="{ computedAttrs }"
			name="requisites-info"
		>
			<Widget v-bind="computedAttrs" name="balance-actions-result-info-payment-about-amount">
				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs">
						{{ requisitesTitle }}
					</KText>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="value">
					<KText v-bind="computedAttrs">
						{{ requisitesValue }}
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<WidgetItem
			v-if="needRateInfoText"
			:key="rateInfoText + 'needRateInfoText' + currencyRelation"
			v-slot="{ computedAttrs }"
			name="rate-info"
		>
			<Widget v-bind="computedAttrs" name="balance-actions-result-info-payment-about-amount">
				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs">
						{{ rateInfoTitle }}
					</KText>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="value">
					<KText v-bind="computedAttrs">
						{{ rateInfoText }}
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<WidgetItem
			v-if="getText"
			:key="getText + 'getText' + currencyRelation"
			v-slot="{ computedAttrs }"
			name="get-info"
		>
			<Widget v-bind="computedAttrs" name="balance-actions-result-info-payment-about-amount">
				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs">
						{{ getTitle }}
					</KText>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="value">
					<KText v-bind="computedAttrs">
						{{ getText }}
					</KText>
				</WidgetItem>

				<WidgetItem
					v-if="getCurrencyProviderMethodIcon"
					:key="getCurrencyProviderMethodIcon + 'getCurrencyProviderMethodIcon'"
					v-slot="{ computedAttrs }"
					name="method-icon"
				>
					<KIcon v-bind="computedAttrs" :name="getCurrencyProviderMethodIcon" />
				</WidgetItem>

				<WidgetItem
					v-if="getCurrencyProviderMethodName"
					:key="getCurrencyProviderMethodName + 'getCurrencyProviderMethodName'"
					v-slot="{ computedAttrs }"
					name="method-name"
				>
					<KText v-bind="computedAttrs">
						{{ getCurrencyProviderMethodName }}
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<WidgetItem
			v-if="giveText"
			:key="giveText + 'giveText' + currencyRelation"
			v-slot="{ computedAttrs }"
			name="give-info"
		>
			<Widget v-bind="computedAttrs" name="balance-actions-result-info-payment-about-amount">
				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs">
						{{ giveTitle }}
					</KText>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="value">
					<KText v-bind="computedAttrs">
						{{ giveText }}
					</KText>
				</WidgetItem>

				<WidgetItem
					v-if="giveCurrencyProviderMethodIcon"
					:key="giveCurrencyProviderMethodIcon + 'giveCurrencyProviderMethodIcon'"
					v-slot="{ computedAttrs }"
					name="method-icon"
				>
					<KIcon v-bind="computedAttrs" :name="giveCurrencyProviderMethodIcon" />
				</WidgetItem>

				<WidgetItem
					v-if="giveCurrencyProviderMethodName"
					:key="giveCurrencyProviderMethodName + 'giveCurrencyProviderMethodName'"
					v-slot="{ computedAttrs }"
					name="method-name"
				>
					<KText v-bind="computedAttrs">
						{{ giveCurrencyProviderMethodName }}
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<WidgetItem
			v-if="feeText"
			:key="feeText + 'feeText' + currencyRelation"
			v-slot="{ computedAttrs }"
			name="fee-info"
		>
			<Widget v-bind="computedAttrs" name="balance-actions-result-info-payment-about-amount">
				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs">
						{{ feeTitle }}
					</KText>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="value">
					<KText v-bind="computedAttrs">
						{{ feeText }}
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<WidgetItem
			v-if="idText"
			:key="idText + 'idText' + currencyRelation"
			v-slot="{ computedAttrs }"
			name="id-info"
		>
			<Widget v-bind="computedAttrs" name="balance-actions-result-info-payment-about-amount">
				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs">
						{{ idTitle }}
					</KText>
				</WidgetItem>
				<WidgetItem v-slot="{ computedAttrs }" name="link-text">
					<KText
						v-bind="computedAttrs"
						:to="link"
						target="_blank"
					>
						{{ idText }}
					</KText>
				</WidgetItem>
				<WidgetItem v-slot="{ computedAttrs }" name="copy-text">
					<KTooltip
						v-model="showCopyTooltip"
						:openOnHover="false"
						top
						v-bind="{computedAttrs}"
					>
						<template #activator="{ attrs }">
							<WidgetItem v-slot="{ computedAttrs }" name="value">
								<KText
									v-bind="{...attrs, ...computedAttrs}"
									style="color: var(--primary-lighten); cursor: pointer"
									@click="copyToClipboard(idText)"
								>
									{{ idText }}
								</KText>
							</WidgetItem>
						</template>
						<Widget name="balance-text-body-1-regular">
							<WidgetItem v-slot="{ computedAttrs }" name="text">
								<KText v-bind="computedAttrs">
									{{ $t('balance.copied') }}
								</KText>
							</WidgetItem>
						</Widget>
					</KTooltip>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<WidgetItem
			v-if="resultEndDate || resultEndTime"
			:key="(resultEndDate || resultEndTime) + 'end-date-info' + currencyRelation"
			v-slot="{ computedAttrs }"
			name="end-date-info"
		>
			<Widget v-bind="computedAttrs" name="balance-actions-result-info-payment-about-date">
				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs">
						{{ resultEndDateTitle }}
					</KText>
				</WidgetItem>

				<WidgetItem
					v-if="resultEndDate"
					:key="resultEndDate + 'resultEndDate' + currencyRelation"
					v-slot="{ computedAttrs }"
					name="date"
				>
					<KText v-bind="computedAttrs">
						{{ resultEndDate }}
					</KText>
				</WidgetItem>

				<WidgetItem
					v-if="resultEndTime"
					:key="resultEndTime + 'resultEndTime' + currencyRelation"
					v-slot="{ computedAttrs }"
					name="time"
				>
					<KText v-bind="computedAttrs">
						{{ resultEndTime }}
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<WidgetItem
			v-if="limitText"
			:key="limitText + 'limitText' + currencyRelation"
			v-slot="{ computedAttrs }"
			name="limit-info"
		>
			<Widget v-bind="computedAttrs" name="balance-actions-result-info-payment-about-amount">
				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs">
						{{ limitTitle }}
					</KText>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="value">
					<KText v-bind="computedAttrs">
						{{ limitText }}
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import { FlowType, FormType } from '@/const';
	import { Ref, defineComponent, toRef, ref, computed } from 'vue';

	export default defineComponent({
		name: 'SeamlessInfoBlock',
		components: {},
		inheritAttrs: false,

		props: {
			viewType: {
				type: String,
				default: 'success'
			},
			getCurrencyIcon: {
				type: String,
				default: ''
			},
			giveCurrencyIcon: {
				type: String,
				default: ''
			},
			resultAction: {
				type: String,
				default: ''
			},
			currencyRelation: {
				type: String,
				default: ''
			},
			resultStatus: {
				type: String,
				default: ''
			},
			paymentMethodTitle: {
				type: String,
				default: ''
			},
			paymentMethodIcon: {
				type: String,
				default: ''
			},
			paymentMethodName: {
				type: String,
				default: ''
			},
			providerMethodIcon: {
				type: String,
				default: ''
			},
			providerMethodTitle: {
				type: String,
				default: ''
			},
			providerMethodName: {
				type: String,
				default: ''
			},
			showPaymentMethodRow: {
				type: Boolean,
				default: false
			},
			rateInfoTitle: {
				type: String,
				default: ''
			},
			rateInfoText: {
				type: String,
				default: ''
			},
			needRateInfoText: {
				type: Boolean,
				default: true
			},
			getTitle: {
				type: String,
				default: ''
			},
			getText: {
				type: String,
				default: ''
			},
			getCurrencyProviderMethodIcon: {
				type: String,
				default: ''
			},
			getCurrencyProviderMethodName: {
				type: String,
				default: ''
			},
			giveCurrencyProviderMethodIcon: {
				type: String,
				default: ''
			},
			giveCurrencyProviderMethodName: {
				type: String,
				default: ''
			},
			giveTitle: {
				type: String,
				default: ''
			},
			giveText: {
				type: String,
				default: ''
			},
			idTitle: {
				type: String,
				default: ''
			},
			idText: {
				type: String,
				default: ''
			},
			resultEndDateTitle: {
				type: String,
				default: ''
			},
			resultEndDate: {
				type: String,
				default: ''
			},
			resultEndTime: {
				type: String,
				default: ''
			},
			feeTitle: {
				type: String,
				default: ''
			},
			feeText: {
				type: String,
				default: ''
			},
			activeForm: {
				type: String,
				default: FormType.DEPOSIT
			},
			flowType: {
				type: String,
				default: FlowType.SWAP
			},
			requisitesTitle: {
				type: String,
				default: ''
			},
			requisitesValue: {
				type: String,
				default: ''
			},
			limitTitle: {
				type: String,
				default: ''
			},
			limitText: {
				type: String,
				default: ''
			},
			link: {
				type: String,
				default: ''
			}
		},

		setup(props, ctx) {
			const viewTypeComputed = toRef(props, 'viewType');
			const activeFormComputed = toRef(props, 'activeForm');
			const flowTypeComputed = toRef(props, 'flowType');
			const showCopyTooltip: Ref<boolean> = ref(false);
			const copyTimeout: Ref<NodeJS.Timeout | null> = ref(null);
			const copyToClipboard = (value: string): void => {
				navigator.clipboard.writeText(value);
				showCopyTooltip.value = true;

				if (copyTimeout.value) {
					clearTimeout(copyTimeout.value);
				}
				copyTimeout.value = setTimeout(() => {
					showCopyTooltip.value = false;
				}, 1200);
			};

			const actionColor = computed(() => {
				if (flowTypeComputed.value === FlowType.SWAP) return 'var(--primary-lighten)';
				return activeFormComputed.value === FormType.DEPOSIT
					? 'var(--status-success-darken)'
					: 'var(--status-error-darken)';
			});

			const colorByViewType = computed(() => {
				if (viewTypeComputed.value === 'success') {
					return 'var(--status-success-darken)';
				}
				if (viewTypeComputed.value === 'fail') {
					return 'var(--status-error-darken)';
				}

				return 'var(--tertiary-darken)';
			});

			return {
				showCopyTooltip,
				copyTimeout,
				copyToClipboard,
				colorByViewType,
				actionColor
			};
		}
	});
</script>
