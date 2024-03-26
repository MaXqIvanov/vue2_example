<template>
	<Widget name="balance-history-table-p2p-direction-icon-cell">
		<WidgetItem v-slot="{computedAttrs}" name="icon">
			<KIcon
				size="24"
				:name="icon"
				v-bind="computedAttrs"
			/>
		</WidgetItem>
	</Widget>
</template>
<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import { CurrencyType } from '@/const';

	@Component({
		name: 'TableDirectionIcon'
	})
	export default class TableDirectionIcon extends Vue {
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

		protected get icon(): string {
			if (this.giveCurrency.type === CurrencyType.Cryptocurrency && this.getCurrency.type === CurrencyType.Fiat) {
				return 'deal-type-give-crypto';
			}
			if (this.giveCurrency.type === CurrencyType.Fiat && this.getCurrency.type === CurrencyType.Cryptocurrency) {
				return 'deal-type-give-fiat';
			}
			return 'deal-type-swap';
		}
	}
</script>
