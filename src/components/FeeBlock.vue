<template>
	<Widget name="balance-actions-fee-block">
		<WidgetItem v-slot="{ computedAttrs }" name="header">
			<KText v-bind="computedAttrs" />
		</WidgetItem>
		<WidgetItem name="value-row">
			<Widget name="balance-actions-fee-block-value"> 
				<WidgetItem v-slot="{ computedAttrs }" name="fee-value">
					<KText v-bind="computedAttrs">
						{{ feeValueString }}
					</KText>
				</WidgetItem>
				<WidgetItem
					v-slot="{ tooltip }"
					name="fee-tooltip"
					:contentVariables="translationVariables"
				>
					<InfoTooltip>
						<Widget name="balance-text-body-2-regular">
							<WidgetItem v-slot="{ computedAttrs }" name="text">
								<KText v-bind="computedAttrs">
									{{ tooltip }}
								</KText>
							</WidgetItem>
						</Widget>
					</InfoTooltip>
				</WidgetItem>
			</Widget>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component } from 'vue-property-decorator';
	import { formatNumberAndFixedDecimals } from '@/utils/utils';
	import InfoTooltip from '@/components/InfoTooltip.vue';

	import MyRootStore from '@/store/store';

	@Component({
		components: { InfoTooltip }
	})
	export default class FeeBlock extends Vue {
		protected walletsStore = MyRootStore.getInstance().wallets;
		protected numberFormattingService = MyRootStore.getInstance().store.state.numberFormatting.api;
		protected currentFinalFee = '0';

		protected get feeValueString(): string {
			return `${this.feeFinalValue} ${this.activeWallet?.currencyTitle}`;
		}

		protected get feeFinalValue(): string {
			if (this.activeWalletData.feeFinal) {
				this.currentFinalFee = this.numberFormattingService
					.format(this.activeWalletData.feeFinal)
					.locale(this.currentLocale)
					.value();
			}
			return this.currentFinalFee;
		}

		protected formatNumberAndFixedDecimals(value: number, decimals: number): string {
			return formatNumberAndFixedDecimals(value, this.currentLocale, decimals);
		}

		protected get currentLocale(): string {
			return this.$store.state.translator.currentLocale;
		}

		protected get activeWallet(): WALLETS.Wallet | undefined {
			return this.walletsStore.getActiveWallet;
		}

		protected get activeWalletData(): any | undefined {
			return this.walletsStore.getActiveWalletData;
		}

		protected translationVariables = [
			{
				name: 'tooltip',
				type: 'translation',
				defaultValue: 'balance.feeTooltipText'
			}
		];
	}
</script>
