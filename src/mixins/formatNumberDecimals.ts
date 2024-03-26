import Vue from 'vue';
import Component from 'vue-class-component';
import { DEFAULT_DECIMALS } from '@/const';
import MyRootStore from '@/store/store';
import { formatNumberAndFixedDecimals, convertExponentialToDecimal } from '@/utils/utils';

@Component
export default class FormatNumberDecimals extends Vue {
	protected walletsStore = MyRootStore.getInstance().wallets;

	protected get currentLocale(): string {
		return this.$store.state.translator.currentLocale;
	}
	protected getFormatNumberAndFixedDecimals(amount: number, currencyName: string): string | number {
		if (amount === 0) return 0;
		const notExponentAmount = convertExponentialToDecimal(amount);
		const quantityDecimals: number = String(notExponentAmount).split('.')[1]?.length;
		if (quantityDecimals > DEFAULT_DECIMALS) {
			const currentCurrency: HISTORY.Currencies | undefined = this.walletsStore.getCurrencyFromSharedData(currencyName);
			const decimals = currentCurrency?.decimals || DEFAULT_DECIMALS;
			return formatNumberAndFixedDecimals(notExponentAmount as number, this.currentLocale, decimals);
		}
		return String(notExponentAmount);
	}
}
