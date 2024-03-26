<template>
	<Widget name="balance-history-table-p2p-deal-info-cell">
		<WidgetItem v-slot="{computedAttrs}" name="give">
			<KText
				v-bind="computedAttrs"
			/>
		</WidgetItem>
		<WidgetItem v-slot="{computedAttrs}" name="give-currency">
			<KText
				v-bind="computedAttrs"
			>
				{{ giveCurrencyLabel }}
			</KText>
		</WidgetItem>
		<WidgetItem v-slot="{computedAttrs, title}" name="for">
			<KText
				v-bind="computedAttrs"
			>
				{{ title }}
			</KText>
		</WidgetItem>
		<WidgetItem v-slot="{computedAttrs}" name="get-currency">
			<KText
				v-bind="computedAttrs"
			>
				{{ getCurrencyLabel }}
			</KText>
		</WidgetItem>
		<WidgetItem v-slot="{computedAttrs}" name="rate-title">
			<KText
				v-bind="computedAttrs"
			/>
		</WidgetItem>
		<WidgetItem v-slot="{computedAttrs, title}" name="rate">
			<KText v-if="exchangeRate" v-bind="computedAttrs">
				{{ ratePrimaryCurrency }} {{ title }} {{ rateSecondaryCurrency }}
			</KText>
		</WidgetItem>
		<WidgetItem v-slot="{computedAttrs}" name="rate-mobile">
			<KText v-if="exchangeRate" v-bind="computedAttrs">
				{{ ratePrimaryCurrency }} = {{ rateSecondaryCurrency }}
			</KText>
		</WidgetItem>
	</Widget>
</template>
<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import { CurrencyType } from '@/const';
	import { formatNumberAndFixedDecimals } from '@/utils/utils';

	@Component({
		name: 'TableDealInfo'
	})
	export default class TableDealInfo extends Vue {
		@Prop({ default: () => ({}) }) protected buyerCurrency!: any;
		@Prop({ default: () => ({}) }) protected sellerCurrency!: any;
		@Prop({ default: '' }) protected currentUserName!: string;
		@Prop({ default: '' }) protected cryptoSellerName!: string;
		@Prop({ default: 'ru-RU' }) protected locale!: string;
		@Prop({}) protected exchangeRate!: number;

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

		protected get giveCurrencyTitle(): string {
			return this.giveCurrency.title;
		}

		protected get getCurrencyTitle(): string {
			return this.getCurrency.title;
		}

		protected get giveCurrencyAmount(): number {
			return this.giveCurrency.amount;
		}

		protected get getCurrencyAmount(): number {
			return this.getCurrency.amount;
		}

		protected get giveCurrencyIsCrypto(): boolean {
			return this.giveCurrency.type === CurrencyType.Cryptocurrency;
		}

		protected get firstCurrencyTitle(): string {
			return this.giveCurrencyIsCrypto ? this.giveCurrencyTitle : this.getCurrencyTitle;
		}

		protected get secondCurrencyTitle(): string {
			return !this.giveCurrencyIsCrypto ? this.giveCurrencyTitle : this.getCurrencyTitle;
		}

		protected get giveCurrencyDecimals(): number {
			return this.giveCurrency.decimals;
		}

		protected get giveCurrencyLabel(): string {
			return `${formatNumberAndFixedDecimals(this.giveCurrencyAmount, this.locale, this.giveCurrencyDecimals)} ${
				this.giveCurrencyTitle
			}`;
		}

		protected get getCurrencyDecimals(): number {
			return this.getCurrency.decimals;
		}

		protected get getCurrencyLabel(): string {
			return `${formatNumberAndFixedDecimals(this.getCurrencyAmount, this.locale, this.getCurrencyDecimals)} ${
				this.getCurrencyTitle
			}`;
		}

		protected get ratePrimaryCurrency(): string {
			return `1 ${this.firstCurrencyTitle}`;
		}

		protected get decimals(): number {
			return !this.giveCurrencyIsCrypto ? this.giveCurrency.decimals : this.getCurrency.decimals;
		}

		protected get rate(): string {
			return formatNumberAndFixedDecimals(this.exchangeRate, this.locale, this.decimals);
		}

		protected get rateSecondaryCurrency(): string {
			return `${this.rate} ${this.secondCurrencyTitle}`;
		}
	}
</script>


