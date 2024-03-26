<template>
	<Widget name="balance-history-table-xs-p2p-trade-info">
		<WidgetItem v-slot="{ computedAttrs }" name="currency-icons">
			<CurrencyIcons
				v-bind="computedAttrs"
				:giveIconName="giveIconName"
				:getIconName="getIconName"
			/>
		</WidgetItem>
		<WidgetItem v-slot="{ computedAttrs }" name="currency-names">
			<KText v-bind="computedAttrs">
				{{ currencyNames }}
			</KText>
		</WidgetItem>
		<WidgetItem v-slot="{ computedAttrs }" name="payment-method-icon">
			<KIcon v-bind="computedAttrs" :name="paymentMethodIconName" />
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs, exceededStringStyles }"
			name="payment-method-title"
			:contentVariables="titleContentVariables"
		>
			<KText
				v-bind="computedAttrs"
				:style="exceededStringStyles"
			>
				{{ tradeInfo.paymentMethodName }}
			</KText>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import CurrencyIcons from '@/components/HistoryTable/common/CurrencyIcons.vue';
	import { CurrencyTypeIconNamespace } from '@/const';
	import { CurrencyType } from '@/const';
	import { getStore } from '@/store/store';

	@Component({ components: { CurrencyIcons } })
	export default class P2PTradeInfo extends Vue {
		@Prop({ required: true }) tradeInfo!: any;

		protected readonly titleContentVariables = [
			{
				name: 'exceededStringStyles',
				type: 'string',
				defaultValue:
					'text-overflow: ellipsis; white-space: nowrap; overflow: hidden; display: inline-block; max-width: 100%; vertical-align: middle;'
			}
		];

		private store = getStore();

		protected processIconName(currency: string): string {
			const type: CurrencyType.Fiat | CurrencyType.Cryptocurrency = this.store.state.sharedData.currencies.find(
				({ title }: COMMON.Currency) => title === currency
			).type;
			return `${CurrencyTypeIconNamespace[type]}.${currency}`;
		}

		protected get giveIconName(): string {
			return this.processIconName(this.tradeInfo.giveCurrencyTitle);
		}

		protected get getIconName(): string {
			return this.processIconName(this.tradeInfo.getCurrencyTitle);
		}

		protected get paymentMethodIconName(): string {
			return `payment-methods.${this.tradeInfo.paymentMethodId}`;
		}

		protected get currencyNames(): string {
			return `${this.tradeInfo.giveCurrencyTitle}/${this.tradeInfo.getCurrencyTitle}`;
		}
	}
</script>