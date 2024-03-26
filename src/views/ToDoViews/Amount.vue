<template>
	<Widget name="balance-wallets-additional-amount">
		<WidgetItem name="day-perc">
			<Widget name="balance-wallets-additional-amount-item">
				<WidgetItem v-slot="{ computedAttrs }" name="data">
					<KText
						v-bind="computedAttrs"
						:style="{ color: `${activeWallet && activeWallet.dailyChangePercent < 0 ? 'var(--status-error-darken)' : 'var(--status-success-darken)'}` }"
					>
						{{ activeWallet && activeWallet.dailyChangePercent ? formatNumberAndFixedDecimals(activeWallet.dailyChangePercent, 2) + ' %' : 0 }}
					</KText>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs">
						{{ $t('balance.perDay') }}
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<WidgetItem name="week-perc">
			<Widget name="balance-wallets-additional-amount-item">
				<WidgetItem v-slot="{ computedAttrs }" name="data">
					<KText
						v-bind="computedAttrs"
						:style="{ color: `${activeWallet && activeWallet.weeklyChangePercent < 0 ? 'var(--status-error-darken)' : 'var(--status-success-darken)'}` }"
					>
						{{ activeWallet && activeWallet.weeklyChangePercent ? formatNumberAndFixedDecimals(activeWallet.weeklyChangePercent, 2) + ' %' : 0 }}
					</KText>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs">
						{{ $t('balance.perWeek') }}
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<WidgetItem v-slot="{ computedAttrs }" name="amount-of-assets">
			<KText v-bind="computedAttrs">
				{{ cumulativeBalanceText }}
			</KText>
		</WidgetItem>

		<!-- <WidgetItem name="assets-amount">
			<Widget name="balance-wallets-additional-amount-item">
				<WidgetItem v-slot="{ computedAttrs }" name="data">
					<KText v-bind="computedAttrs">
						{{ activeMarket ? activeMarket.lowPrice : 0 }} {{ activeMarket ? activeMarket.derivedCurrencyName : '' }}
					</KText>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs">
						Мин цена
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<WidgetItem name="max-price">
			<Widget name="balance-wallets-additional-amount-item">
				<WidgetItem v-slot="{ computedAttrs }" name="data">
					<KText v-bind="computedAttrs">
						{{ activeMarket ? activeMarket.highPrice : 0 }} {{ activeMarket ? activeMarket.derivedCurrencyName : '' }}
					</KText>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs">
						Макс цена
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem> -->
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component } from 'vue-property-decorator';

	import MyRootStore from '@/store/store';
	import { formatNumberAndFixedDecimals } from '@/utils/utils';

	@Component
	export default class Amount extends Vue {
		protected walletsStore = MyRootStore.getInstance().wallets;

		protected get cumulativeBalance(): any {
			return this.walletsStore.cumulativeBalance ?? {};
		}

		protected get currentLocale(): string {
			return this.$store.state.translator.currentLocale;
		}

		protected get cumulativeBalanceText(): string {
			return this.cumulativeBalance.currencyId
				? `${this.formatNumberAndFixedDecimals(this.cumulativeBalance.balance, 2)} ${
						this.cumulativeBalance.currencyTitle ?? ''
				  }`
				: '';
		}

		protected get activeMarket(): any {
			return this.walletsStore.getMarket;
		}

		protected get activeWallet(): any {
			return this.walletsStore.getActiveWallet;
		}

		protected formatNumberAndFixedDecimals(value: number, decimals: number): string {
			return formatNumberAndFixedDecimals(value, this.currentLocale, decimals);
		}
	}
</script>
