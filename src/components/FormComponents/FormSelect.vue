<template>
	<Widget name="balance-actions-form-select">
		<WidgetItem
			v-slot="{ computedAttrs, hideSliderValue, enabledTabStyles, disabledTabStyles, tabsHeight, tabsGroupStyles }"
			name="tabs"
			:contentVariables="tabsVariables"
		>
			<KTabs
				v-model="model"
				v-bind="computedAttrs"
				fixedTabs
				:height="tabsHeight"
				:style="tabsGroupStyles"
				:hideSlider="getBooleanValueFromString(hideSliderValue)"
			>
				<KTab
					v-for="key in actionForms"
					:key="key"
					:to="toObjectBy[key]"
					:style="key === currentForm ? enabledTabStyles : disabledTabStyles"
					:class="key === currentForm ? 'v-tab--active' : ''"
					@click="() => setActiveForm(key)"
				>
					<Widget name="balance-actions-form-select-tab">
						<WidgetItem v-slot="{ computedAttrs }" name="icon">
							<KIcon
								v-bind="computedAttrs"
								:name="key === currentForm ? `balance.${key}--colorable` : `balance.${key}`"
							/>
						</WidgetItem>
						<WidgetItem v-slot="{ computedAttrs }" name="text">
							<KText v-bind="computedAttrs">
								{{ getTranslation(key) }}
							</KText>
						</WidgetItem>
					</Widget>
				</KTab>
			</KTabs>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import { FormType, FlowType } from '@/const';
	import { Location } from 'vue-router';

	@Component
	export default class FormSelect extends Vue {
		@Prop({ required: true })
		protected currentForm!: WALLETS.FormTypeValues;
		@Prop({ default: false })
		protected seamlessIntegrationEnabled?: boolean;
		@Prop({ required: true })
		protected currentFlowRecord!: Record<WALLETS.FormTypeValues, WALLETS.FlowTypeValues>;
		@Prop({ required: true })
		protected currentCurrency!: string;
		@Prop({ default: () => [FormType.DEPOSIT, FormType.WITHDRAWAL] })
		protected actionForms?: WALLETS.FormTypeList;
		@Prop({ default: 'RUB' })
		protected fiatSecondCurrency!: string;
		@Prop({ default: 'ETH' })
		protected cryptoSecondCurrency!: string;

		protected model: string = '';

		protected created(): void {
			this.model = this.currentForm;
		}

		protected setActiveForm(actionType: WALLETS.FormTypeValues): void {
			this.$emit('setActiveForm', actionType);
		}

		protected getTranslation(key: string): string {
			return this.$t(`balance.${key}`);
		}

		protected getBooleanValueFromString(value: string): boolean {
			return value === 'true';
		}

		protected get toObjectBy(): Record<
			FormType.DEPOSIT | FormType.WITHDRAWAL | FormType.EXCHANGE | FormType.STAKING,
			Location
		> {
			if (!this.seamlessIntegrationEnabled) {
				return {
					[FormType.DEPOSIT]: {
						name: 'balance-activeForm',
						params: { currency: this.currentCurrency, activeForm: FormType.DEPOSIT }
					},
					[FormType.WITHDRAWAL]: {
						name: 'balance-activeForm',
						params: { currency: this.currentCurrency, activeForm: FormType.WITHDRAWAL }
					},
					[FormType.EXCHANGE]: {
						name: 'balance-activeForm',
						params: { currency: this.currentCurrency, activeForm: FormType.EXCHANGE }
					},
					[FormType.STAKING]: {
						name: 'balance-activeForm',
						params: { currency: this.currentCurrency, activeForm: FormType.STAKING }
					}
				};
			}

			return {
				[FormType.DEPOSIT]:
					this.currentFlowRecord[FormType.DEPOSIT] === FlowType.GET
						? {
								name: 'balance-get-form',
								params: { currency: this.currentCurrency, activeForm: FormType.DEPOSIT }
						  }
						: {
								name: 'balance-buy-form',
								params: {
									currency: this.currentCurrency,
									activeForm: FormType.DEPOSIT,
									giveCurrency: this.fiatSecondCurrency
								}
						  },
				[FormType.WITHDRAWAL]:
					this.currentFlowRecord[FormType.WITHDRAWAL] === FlowType.TRANSFER
						? {
								name: 'balance-transfer-form',
								params: { currency: this.currentCurrency, activeForm: FormType.WITHDRAWAL }
						  }
						: {
								name: 'balance-sell-form',
								params: {
									currency: this.currentCurrency,
									activeForm: FormType.WITHDRAWAL,
									getCurrency: this.fiatSecondCurrency
								}
						  },
				[FormType.EXCHANGE]: {
					name: 'balance-exchange-form',
					params: {
						currency: this.currentCurrency,
						activeForm: FormType.EXCHANGE,
						secondCurrency: this.cryptoSecondCurrency
					}
				},
				[FormType.STAKING]: {
					name: 'balance-activeForm',
					params: { currency: this.currentCurrency, activeForm: FormType.STAKING }
				}
			};
		}

		protected tabsVariables = [
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
				name: 'tabsHeight',
				type: 'string',
				defaultValue: '40'
			},
			{
				name: 'tabsGroupStyles',
				type: 'string',
				defaultValue: '--tabs-item-padding: var(--spacing-2)'
			}
		];
	}
</script>
