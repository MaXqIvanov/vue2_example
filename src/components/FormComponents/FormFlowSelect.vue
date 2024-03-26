<template>
	<Widget name="balance-actions-flow-select">
		<WidgetItem
			v-slot="{ computedAttrs, enabledTabStyles, disabledTabStyles, tabsHeight, tabsGroupStyles, hideSliderValue }"
			name="flows"
			:contentVariables="tabsVariables"
		>
			<KTabs
				v-bind="computedAttrs"
				fixedTabs
				:height="tabsHeight"
				:style="tabsGroupStyles"
				:hideSlider="getBooleanValueFromString(hideSliderValue)"
			>
				<KTab
					v-for="(flow, index) in currentFlows"
					:key="`flow-${flow}-${index}`"
					:to="toObjectBy[flow]"
					:ripple="false"
					:style="flow === currentFlow ? enabledTabStyles : disabledTabStyles"
					:class="flow === currentFlow ? 'v-tab--active' : ''"
					@click="setActiveFlow(flow)"
				>
					<Widget name="balance-actions-form-select-tab">
						<WidgetItem v-slot="{ computedAttrs }" name="text">
							<KText v-bind="computedAttrs">
								{{ getTranslation(flow) }}
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

	@Component
	export default class FormFlowSelect extends Vue {
		@Prop({ required: true })
		protected currentForm!: WALLETS.FormTypeValues;
		@Prop({ required: true })
		protected currentFlow!: WALLETS.FormTypeValues;
		@Prop({ required: true })
		protected currentCurrency!: string;
		@Prop({ default: 'RUB' })
		protected fiatSecondCurrency!: string;

		protected flows: any = {
			deposit: ['get', 'buy'],
			withdrawal: ['transfer', 'sell']
		};

		protected setActiveFlow(flow: string): void {
			this.$emit('setActiveFlow', flow);
		}

		protected getTranslation(key: string): string {
			return this.$t(`balance.${key}Flow`);
		}

		protected get currentFlows(): string[] {
			return this.flows[this.currentForm] || this.flows.deposit;
		}

		protected get toObjectBy(): any {
			return {
				get: { name: 'balance-get-form', params: { currency: this.currentCurrency, activeForm: 'deposit' } },
				buy: {
					name: 'balance-buy-form',
					params: { currency: this.currentCurrency, activeForm: 'deposit', giveCurrency: this.fiatSecondCurrency }
				},
				transfer: {
					name: 'balance-transfer-form',
					params: { currency: this.currentCurrency, activeForm: 'withdrawal' }
				},
				sell: {
					name: 'balance-sell-form',
					params: {
						currency: this.currentCurrency,
						activeForm: 'withdrawal',
						getCurrency: this.fiatSecondCurrency
					}
				}
			};
		}

		protected getBooleanValueFromString(value: string): boolean {
			return value === 'true';
		}

		protected tabsVariables = [
			{ name: 'hideSliderValue', type: 'string', defaultValue: 'true' },
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
				defaultValue: ''
			}
		];
	}
</script>
