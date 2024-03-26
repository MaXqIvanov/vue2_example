<template>
	<Widget name="balance-history-table-p2p-currency-pair-cell">
		<WidgetItem v-slot="{computedAttrs}" name="give-currency-icon">
			<KIcon
				v-bind="computedAttrs"
				:name="giveCurrencyNameIcon"
			/>
		</WidgetItem>
		<WidgetItem v-slot="{computedAttrs}" name="get-currency-icon">
			<KIcon
				v-bind="computedAttrs"
				:name="getCurrencyNameIcon"
			/>
		</WidgetItem>
	</Widget>
</template>
<script lang="ts">
	import { CurrencyTypeIconNamespace } from '@/const';
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';

	@Component({
		name: 'TablePairCurrencyMyDeal'
	})
	export default class TablePairCurrencyMyDeal extends Vue {
		@Prop({ default: () => ({}) }) protected buyerCurrency!: any;
		@Prop({ default: () => ({}) }) protected sellerCurrency!: any;
		@Prop({ default: '' }) protected currentUserName!: string;
		@Prop({ default: '' }) protected cryptoSellerName!: string;

		protected get giveCurrency(): any {
			if (this.currentUserName === this.cryptoSellerName) {
				return this.sellerCurrency;
			} else {
				return this.buyerCurrency;
			}
		}

		protected get getCurrency(): any {
			if (this.currentUserName === this.cryptoSellerName) {
				return this.buyerCurrency;
			} else {
				return this.sellerCurrency;
			}
		}

		protected readonly namespaceByTypeCurrency: any = CurrencyTypeIconNamespace;

		protected get giveCurrencyNameIcon(): string {
			return `${this.namespaceByTypeCurrency[this.giveCurrency.type]}.${this.giveCurrency.title}`;
		}
		protected get getCurrencyNameIcon(): string {
			return `${this.namespaceByTypeCurrency[this.getCurrency.type]}.${this.getCurrency.title}`;
		}
	}
</script>


