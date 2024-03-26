<template>
	<Widget name="balance-history-table-p2p-payment-methods-cell">
		<WidgetItem v-if="paymentMethods.length" name="payment-methods-list">
			<TablePaymentMethodItem
				v-for="method in modPaymentMethods"
				:key="method.id"
				:paymentMethod="method"
				:isPaymentMethod="isPaymentMethod"
				:isCryptoCurrencySwap="isCryptoCurrencySwap"
			/>
		</WidgetItem>
		<WidgetItem
			v-if="hiddenMethods"
			v-slot="{computedAttrs}"
			name="counter"
		>
			<KChip v-bind="computedAttrs">
				+ {{ hiddenMethods }}
			</KChip>
		</WidgetItem>
		<WidgetItem v-else-if="isPaymentMethod" name="payment-method">
			<TablePaymentMethodItem
				:paymentMethod="paymentMethod"
				:isPaymentMethod="isPaymentMethod"
				:isCryptoCurrencySwap="isCryptoCurrencySwap"
			/>
		</WidgetItem>
		<WidgetItem v-else name="swap-currency">
			<TablePaymentMethodItem
				:isCryptoCurrencySwap="isCryptoCurrencySwap"
			/>
		</WidgetItem>
	</Widget>
</template>
<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import { CurrencyType } from '@/const';
	import TablePaymentMethodItem from '@/components/TableComponents/MyDealsComponents/TablePaymentMethodItem.vue';

	@Component({
		name: 'TablePaymentMethods',
		components: { TablePaymentMethodItem }
	})
	export default class TablePaymentMethods extends Vue {
		@Prop({ default: () => [] }) protected paymentMethods!: Array<any>;
		@Prop({ default: 0 }) protected maxFullView!: number;
		@Prop({ default: () => ({}) }) protected firstCurrency!: any;
		@Prop({ default: () => ({}) }) protected secondCurrency!: any;
		@Prop({ default: null }) protected paymentMethod!: any | null;

		protected get hiddenMethods(): number {
			if (this.paymentMethods.length <= this.maxFullView) {
				return 0;
			}
			return this.paymentMethods.length - this.maxFullView;
		}

		protected get modPaymentMethods(): Array<any> {
			if (this.maxFullView) {
				return this.paymentMethods.slice(0, this.maxFullView);
			}
			return this.paymentMethods;
		}

		protected get isPaymentMethod(): boolean {
			return this.paymentMethod !== null && !!Object.keys(this.paymentMethod).length;
		}

		protected get isCryptoCurrencySwap(): boolean {
			return (
				(this.firstCurrency.type === this.secondCurrency.type &&
					this.firstCurrency.type === CurrencyType.Cryptocurrency) ||
				(!this.isPaymentMethod && this.paymentMethods.length === 0)
			);
		}
	}
</script>
