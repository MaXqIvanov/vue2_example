<template>
	<Widget name="balance-modal-cancel-withdrawal-wrapper">
		<WidgetItem
			v-slot="{ computedAttrs, width }"
			name="dialog"
			:contentVariables="app2Variables"
		>
			<KDialog
				v-model="showCancelWithdrawalModal"
				attach=""
				:width="width"
				v-bind="computedAttrs"
			>
				<Widget name="balance-modal-cancel-withdrawal">
					<WidgetItem name="header">
						<Widget v-bind="computedAttrs" name="balance-modal-cancel-withdrawal-header">
							<WidgetItem v-slot="{ computedAttrs }" name="card-title">
								<KText v-bind="computedAttrs" />
							</WidgetItem>
							<WidgetItem v-slot="{ computedAttrs }" name="close-icon">
								<KIcon v-bind="computedAttrs" @click="openConfirmModal" />
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="divider">
								<Widget name="balance-modal-cancel-withdrawal-header-divider" v-bind="computedAttrs">
									<WidgetItem v-slot="{ computedAttrs }" name="divider">
										<KDivider v-bind="computedAttrs" />
									</WidgetItem>
								</Widget>
							</WidgetItem>
						</Widget>
					</WidgetItem>
					
					<WidgetItem v-slot="{ computedAttrs }" name="icon">
						<KIcon v-bind="computedAttrs" />
					</WidgetItem>

					<WidgetItem
						v-slot="{ computedAttrs, width }"
						name="description-text"
						:contentVariables="contentWidth"
					>
						<Widget v-bind="computedAttrs" name="balance-modal-cancel-withdrawal-text">
							<WidgetItem
								v-slot="{ computedAttrs }"
								name="are-you-sure"
								:style="`width: ${width}px`"
							>
								<KText v-bind="computedAttrs" />
							</WidgetItem>
							<WidgetItem v-slot="{ computedAttrs }" name="value">
								<Widget v-bind="computedAttrs" name="balance-modal-cancel-withdrawal-currency">
									<WidgetItem v-slot="{ computedAttrs }" name="icon">
										<KIcon v-bind="computedAttrs" :name="currencyIcon" /> 
									</WidgetItem>
									<WidgetItem v-slot="{ computedAttrs }" name="text">
										<KText v-bind="computedAttrs">
											{{ valueString }}
										</KText>
									</WidgetItem>
								</Widget>
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="to-address">
								<KText v-bind="computedAttrs" />
							</WidgetItem>
							<WidgetItem
								v-slot="{ computedAttrs }"
								name="address-value"
								:style="`width: ${width}px`"
							>
								<KText v-bind="computedAttrs">
									{{ address }}
								</KText>
							</WidgetItem>
						</Widget>
					</WidgetItem>

					<WidgetItem name="confirm-blocks">
						<Widget name="balance-modal-cancel-withdrawal-blocks">
							<WidgetItem name="actions">
								<Widget name="balance-modal-cancel-withdrawal-actions">
									<WidgetItem v-slot="{ computedAttrs }" name="back">
										<KBtn v-bind="computedAttrs" @click="openConfirmModal" />
									</WidgetItem>
												
									<WidgetItem v-slot="{ computedAttrs }" name="cancel">
										<KBtn v-bind="computedAttrs" @click="closeModal" />
									</WidgetItem>
								</Widget>
							</WidgetItem>
						</Widget>
					</WidgetItem>
				</Widget>
			</KDialog>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component } from 'vue-property-decorator';
	import MyRootStore from '@/store/store';
	import { formatNumberAndFixedDecimals } from '@/utils/utils';

	@Component({ components: {} })
	export default class CancelWithdrawalModal extends Vue {
		protected walletsStore = MyRootStore.getInstance().wallets;
		protected readonly app2Variables = [{ name: 'width', type: 'number', defaultValue: 448 }]; /* xs 288 */
		protected readonly contentWidth = [{ name: 'width', type: 'number', defaultValue: 240 }]; /* xs 288 */

		protected get showCancelWithdrawalModal(): boolean {
			return this.walletsStore.showCancelWithdrawalModal;
		}

		protected get lastTransactionData(): WALLETS.UserTransactionDto | undefined {
			return this.walletsStore.lastTransactionData;
		}

		protected get currencyIcon(): string {
			return `currency.${this.lastTransactionData?.currencyTitle}`;
		}

		protected get currentLocale(): string {
			return this.$store.state.translator.currentLocale;
		}

		protected get valueString(): string {
			if (this.lastTransactionData) {
				return `${this.formatNumberAndFixedDecimals(this.lastTransactionData.amount, 16)} ${
					this.lastTransactionData?.currencyTitle
				}`;
			}
			return '';
		}

		protected formatNumberAndFixedDecimals(value: number, decimals: number): string {
			return formatNumberAndFixedDecimals(value, this.currentLocale, decimals);
		}

		protected get address(): string {
			return this.lastTransactionData?.cryptoTransaction.address || '';
		}

		protected closeModal(): void {
			this.walletsStore.cancelLastTransaction();
			this.walletsStore.setShowCancelWithdrawal(false);
			this.$emit('cancel');
		}

		protected openConfirmModal(): void {
			this.walletsStore.setShowCancelWithdrawal(false);
			this.walletsStore.setNeedConfirmWithdrawal(true);
		}
	}
</script>