<template>
	<Widget name="balance-modal-confirm-wrapper">
		<WidgetItem
			v-slot="{ title }"
			name="card"
			:contentVariables="translateVariables"
		>
			<InfoModal
				v-model="confirmedWithdrawalModal"
				:titleModal="`${title} ${currencyTitle}`"
			>
				<template #body-2>
					<Widget name="balance-modal-confirmed">
						<WidgetItem v-slot="{ computedAttrs }" name="modal-hero">
							<Widget v-bind="computedAttrs" name="balance-modal-confirmed-withdrawal-text">
								<WidgetItem v-slot="{ computedAttrs }" name="icon">
									<KIcon v-bind="computedAttrs" />
								</WidgetItem>
								<WidgetItem
									v-slot="{ computedAttrs }"
									name="are-you-sure"
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
								>
									<KText v-bind="computedAttrs">
										{{ address }}
									</KText>
								</WidgetItem>
								<WidgetItem
									v-slot="{ computedAttrs }"
									name="link-to-history-text"
								>
									<KText v-bind="computedAttrs" />
								</WidgetItem>
								<WidgetItem
									v-slot="{ computedAttrs }"
									name="link-to-history"
								>
									<KText v-bind="computedAttrs" to="/history/transactions" />
								</WidgetItem>
							</Widget>
						</WidgetItem>

						<WidgetItem
							v-slot="{ computedAttrs }"
							name="download-check"
						>
							<KBtn v-bind="computedAttrs" @click="downloadCheckHandler">
								<Widget name="balance-actions-seamless-result-download-check">
									<WidgetItem v-slot="{ computedAttrs }" name="icon">
										<KIcon v-bind="computedAttrs" />
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="text">
										<KText v-bind="computedAttrs" />
									</WidgetItem>
								</Widget>
							</KBtn>
						</WidgetItem>

						<WidgetItem
							v-slot="{ computedAttrs }"
							name="share"
						>
							<KBtn v-bind="computedAttrs" @click="shareLinkHandler">
								<Widget name="balance-actions-seamless-result-share-btn">
									<WidgetItem v-slot="{ computedAttrs }" name="icon">
										<KIcon v-bind="computedAttrs" />
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="text">
										<KText v-bind="computedAttrs" />
									</WidgetItem>
								</Widget>
							</KBtn>
						</WidgetItem>

						<WidgetItem name="modal-card-expand-button">
							<Widget name="balance-modal-confirmed-expand-button" @click.native="isCardOpen = !isCardOpen">
								<WidgetItem v-slot="{ computedAttrs }" name="text">
									<KText v-bind="computedAttrs" />
								</WidgetItem>
								<WidgetItem
									v-slot="{ computedAttrs, straight, reversed }"
									name="icon"
									:contentVariables="styleVariables"
								>
									<KIcon :style="isCardOpen ? reversed : straight" v-bind="computedAttrs" />
								</WidgetItem>
							</Widget>
						</WidgetItem>

						<WidgetItem
							v-if="isCardOpen"
							v-slot="{ computedAttrs, labelId, labelDate, labelNetwork, labelAddress, labelMemo, labelFundsToSend, labelRecieptAmount, labelFee }"
							name="modal-card"
							:contentVariables="translateVariablesConfirmCard"
						>
							<KCard v-bind="computedAttrs">
								<Widget name="balance-modal-confirm-card">
									<WidgetItem name="currency-icon-heading">
										<Widget name="balance-modal-confirm-card-currency-heading">
											<WidgetItem v-slot="{ computedAttrs }" name="title-icon">
												<KIcon v-bind="computedAttrs" :name="`currency.${lastTransactionCurrencyTitle}`" />
											</WidgetItem>

											<WidgetItem v-slot="{ computedAttrs }" name="title-currency">
												<KText v-bind="computedAttrs">
													{{ lastTransactionCurrencyTitle }}
												</KText>
											</WidgetItem>

											<WidgetItem v-slot="{ computedAttrs }" name="title-text">
												<KText v-bind="computedAttrs" />
											</WidgetItem>
										</Widget>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="id">
										<ConfirmModalDetailsText
											v-bind="computedAttrs"
											:label="labelId"
											:value="confirmedTransactionDataId"
											:isNeedCopy="true"
										/>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="date">
										<ConfirmModalDetailsText
											v-bind="computedAttrs"
											:label="labelDate"
											:value="getDate"
											:subtextRow="getTime"
										/>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="transport-title">
										<ConfirmModalDetailsText
											v-bind="computedAttrs"
											:label="labelNetwork"
											:value="activeTransport"
										/>
									</WidgetItem>
									<WidgetItem v-slot="{ computedAttrs }" name="address">
										<ConfirmModalDetailsText
											v-bind="computedAttrs"
											:label="labelAddress"
											:value="lastTransactionDataAddress"
										/>
									</WidgetItem>
									<WidgetItem
										v-if="lastTransactionDataMemo"
										v-slot="{ computedAttrs }"
										name="memo"
									>
										<ConfirmModalDetailsText
											v-bind="computedAttrs"
											:label="labelMemo"
											:value="lastTransactionDataMemo"
										/>
									</WidgetItem>
									<WidgetItem v-slot="{ computedAttrs }" name="funds-to-send">
										<ConfirmModalDetailsText
											v-bind="computedAttrs"
											:label="labelFundsToSend"
											:value="formatNumberAndFixedDecimals(lastTransactionDataAmount + lastTransactionDataTransactionFee, 16)"
											:currency="lastTransactionCurrencyTitle"
										/>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="reciept-amount">
										<ConfirmModalDetailsText
											v-bind="computedAttrs"
											:label="labelRecieptAmount"
											:value="formatNumberAndFixedDecimals(lastTransactionDataAmount, 16)"
											:currency="lastTransactionCurrencyTitle"
											:subtext="amountEquivalentText"
										/>
									</WidgetItem>

									<WidgetItem
										v-if="lastTransactionDataTransactionFee"
										key="balance-modal-confirm-card-fee"
										v-slot="{ computedAttrs }"
										name="fee"
									>
										<ConfirmModalDetailsText
											v-bind="computedAttrs"
											:label="labelFee"
											:value="formatNumberAndFixedDecimals(lastTransactionDataTransactionFee, 16)"
											:currency="lastTransactionCurrencyTitle"
										/>
									</WidgetItem>
									<WidgetItem
										v-if="lastTransactionDataDetail"
										key="balance-modal-confirm-card-detail"
										v-slot="{ computedAttrs }"
										name="detail"
									>
										<ConfirmModalDetailsText
											v-bind="computedAttrs"
											:label="labelDetail"
											:value="lastTransactionDataDetail"
										/>
									</WidgetItem>
									<WidgetItem
										v-if="lastTransactionDataStatus"
										key="balance-modal-confirm-card-status"
										v-slot="{ computedAttrs }"
										name="status"
									>
										<TransactionStatusComponent
											v-bind="computedAttrs"
											:status="lastTransactionDataStatus"
										/>
									</WidgetItem>
									<WidgetItem
										v-if="lastTransactionDataTxId"
										key="balance-modal-confirm-card-txId"
										v-slot="{ computedAttrs }"
										name="txId"
									>
										<ConfirmModalDetailsText
											v-bind="computedAttrs"
											:label="labelTxId"
											:value="lastTransactionDataTxId"
											:isNeedCopy="true"
										/>
									</WidgetItem>
								</Widget>
							</KCard>
						</WidgetItem>
					</Widget>
				</template>
				<template #actions>
					<Widget name="balance-modal-confirmed-action">
						<WidgetItem v-slot="{ computedAttrs }" name="close">
							<KBtn v-bind="computedAttrs" @click="closeModal" />
						</WidgetItem>
						<WidgetItem v-slot="{ computedAttrs }" name="return-to">
							<KBtn v-bind="computedAttrs" @click="closeModal" />
						</WidgetItem>
					</Widget>
				</template>
			</InfoModal>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component } from 'vue-property-decorator';
	import InfoModal from '@/views/ModalViews/InfoModal.vue';
	import ConfirmModalDetailsText from '@/components/ModalComponents/ConfirmModalDetailsText.vue';
	import TransactionStatusComponent from '@/components/ModalComponents/TransactionStatus.vue';
	import MyRootStore from '@/store/store';
	import { formatNumberAndFixedDecimals, getDate, getTimeFull } from '@/utils/utils';

	@Component({
		components: { InfoModal, ConfirmModalDetailsText, TransactionStatusComponent }
	})
	export default class ConfirmedModal extends Vue {
		protected walletsStore = MyRootStore.getInstance().wallets;

		protected isCardOpen: boolean = false;

		protected get confirmedWithdrawalModal(): boolean {
			return this.walletsStore.getConfirmedWithdrawalModal;
		}

		protected set confirmedWithdrawalModal(val: boolean) {
			this.walletsStore.setConfirmedWithdrawalModal(val);
		}

		protected get lastTransactionData(): WALLETS.UserTransactionDto | undefined {
			return this.walletsStore.getLastTransactionData;
		}

		protected get confirmedTransactionData(): WALLETS.UserTransactionDto | undefined {
			return this.walletsStore.getConfirmedTransactionData;
		}

		protected get activeTransport(): string {
			return this.walletsStore.getActiveTransport?.name || '';
		}

		protected get amountEquivalentText(): string {
			return `~${this.amountEquivalent} ${this.favoriteCurrencySymbol}`;
		}

		protected get amountEquivalent(): number | string {
			if (this.currentRate && this.activeWalletData && this.activeWalletData.amountValue) {
				return Math.round(this.currentRate * Number(this.activeWalletData.amountValue) * 10) / 10;
			}
			return 0;
		}

		protected get favoriteCurrencySymbol(): string {
			return this.walletsStore.favoriteCurrency?.title || 'USD';
		}

		protected get currentRate(): number | undefined {
			return this.walletsStore.getActiveWallet?.rate;
		}

		protected get activeWalletData(): WALLETS.IActiveWalletData | undefined {
			return this.walletsStore.getActiveWalletData;
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

		protected get lastTransactionCurrencyTitle(): string {
			return this.lastTransactionData?.currencyTitle || '';
		}

		protected get lastTransactionDataAddress(): string {
			return (
				this.lastTransactionData?.cryptoTransaction.cryptoAddress ||
				this.lastTransactionData?.cryptoTransaction.address ||
				''
			);
		}
		protected get lastTransactionDataMemo(): string | undefined {
			return this.lastTransactionData?.cryptoTransaction?.tag;
		}

		protected get lastTransactionDataAmount(): number {
			return this.lastTransactionData?.amount || 0;
		}

		protected get lastTransactionDataTransactionFee(): number {
			return this.lastTransactionData?.transactionFee || 0;
		}

		protected get lastTransactionDataDetail(): string {
			return this.lastTransactionData?.details || '';
		}

		protected get labelDetail(): string {
			return this.$t('balance.modalDetailsTitle');
		}

		protected get lastTransactionDataStatus(): number | undefined {
			return this.lastTransactionData?.transactionStatus;
		}

		protected get labelStatus(): string {
			return this.$t('balance.filtersStatusTitle');
		}

		protected get lastTransactionDataTxId(): string {
			return this.lastTransactionData?.cryptoTransaction.txId || '';
		}

		protected get labelTxId(): string {
			return this.$t('balance.modalTxIdTitle');
		}

		protected get address(): string {
			return this.lastTransactionData?.cryptoTransaction.address || '';
		}

		protected get currencyTitle(): string {
			return this.confirmedTransactionData?.currencyTitle || '';
		}

		protected get confirmedTransactionDataId(): number {
			return this.confirmedTransactionData?.id || 0;
		}

		protected get currencyIcon(): string {
			return `currency.${this.lastTransactionData?.currencyTitle}`;
		}

		protected get getDate(): string {
			if (!this.confirmedTransactionData?.dateConfirmed) return '';
			return getDate(this.confirmedTransactionData.dateConfirmed, this.currentLocale);
		}

		protected get getTime(): string {
			if (!this.confirmedTransactionData?.dateConfirmed) return '';
			return getTimeFull(this.confirmedTransactionData.dateConfirmed, this.currentLocale);
		}

		protected closeModal(): void {
			this.walletsStore.setConfirmedWithdrawalModal(false);
		}

		protected formatNumberAndFixedDecimals(value: number, decimals: number): string {
			return formatNumberAndFixedDecimals(value, this.currentLocale, decimals);
		}

		protected downloadCheckHandler(): void {
			const dataArray = [
				[this.$t('balance.withdrawalOfFunds'), this.lastTransactionCurrencyTitle || ''],
				[this.$t('balance.transactionId'), String(this.confirmedTransactionDataId)],
				[this.$t('balance.time'), this.getDate + ' ' + this.getTime],
				[this.$t('balance.network'), this.activeTransport],
				[this.$t('balance.recipientAddress'), this.lastTransactionDataAddress]
			];
			if (this.lastTransactionDataMemo) {
				dataArray.push([this.$t('balance.memo'), this.lastTransactionDataMemo]);
			}
			dataArray.push(
				[
					this.$t('balance.fundsToSend'),
					this.formatNumberAndFixedDecimals(
						this.lastTransactionDataAmount + this.lastTransactionDataTransactionFee,
						16
					) +
						' ' +
						this.lastTransactionCurrencyTitle
				],
				[
					this.$t('balance.recieptAmount'),
					this.formatNumberAndFixedDecimals(this.lastTransactionDataAmount, 16) +
						' ' +
						this.lastTransactionCurrencyTitle
				]
			);
			if (this.lastTransactionDataMemo) {
				dataArray.push([
					this.$t('balance.fee'),
					this.formatNumberAndFixedDecimals(this.lastTransactionDataTransactionFee, 16) +
						' ' +
						this.lastTransactionCurrencyTitle
				]);
			}

			const childrenArray = dataArray.map((horizontalBlockPare, index) => {
				const block = document.createElement('div');
				block.setAttribute(
					'style',
					`display: grid; grid-area: ${index + 1} / 1 / ${
						index + 2
					} / 2; grid-template-columns: max-content max-content; justify-content: space-between`
				);

				const childrenFirst = document.createElement('div');
				childrenFirst.setAttribute('style', 'grid-area: 1 / 1 / 2 / 2; margin-right: 24px');
				childrenFirst.innerHTML = horizontalBlockPare[0];

				const childrenSecond = document.createElement('div');
				childrenSecond.setAttribute('style', 'grid-area: 1 / 2 / 2 / 3');
				childrenSecond.innerHTML = horizontalBlockPare[1];

				block.appendChild(childrenFirst);
				block.appendChild(childrenSecond);
				return block;
			});

			const checkBloc = document.createElement('div');
			checkBloc.setAttribute(
				'style',
				'margin: auto; width: 365px; display: grid; padding: 24px; background: var(--card-bg-secondary); border-radius: var(--border-radius-md);'
			);
			childrenArray.forEach((children) => checkBloc.appendChild(children));

			const blob = new Blob([checkBloc.outerHTML], { type: 'text/plain' });
			const link = document.createElement('a');
			link.setAttribute('href', URL.createObjectURL(blob));
			link.setAttribute('download', 'my-text.HTML');
			link.click();
		}

		protected shareLinkHandler(): void {
			//
		}

		protected translateVariables = [
			{
				name: 'title',
				type: 'translation',
				defaultValue: 'balance.confirmedWithdrawalModalTitle'
			}
		];

		public translateVariablesConfirmCard = [
			{
				name: 'labelId',
				type: 'translation',
				defaultValue: 'balance.transactionId'
			},
			{
				name: 'labelDate',
				type: 'translation',
				defaultValue: 'balance.time'
			},
			{
				name: 'labelNetwork',
				type: 'translation',
				defaultValue: 'balance.network'
			},
			{
				name: 'labelAddress',
				type: 'translation',
				defaultValue: 'balance.recipientAddress'
			},
			{
				name: 'labelMemo',
				type: 'translation',
				defaultValue: 'balance.memo'
			},
			{
				name: 'labelFundsToSend',
				type: 'translation',
				defaultValue: 'balance.fundsToSend'
			},
			{
				name: 'labelRecieptAmount',
				type: 'translation',
				defaultValue: 'balance.recieptAmount'
			},
			{
				name: 'labelFee',
				type: 'translation',
				defaultValue: 'balance.fee'
			}
		];

		protected styleVariables = [
			{
				name: 'reversed',
				type: 'string',
				defaultValue: 'transform: rotate(180deg); transition: transform 0.2s ease-out;'
			},
			{
				name: 'straight',
				type: 'string',
				defaultValue: 'transition: transform 0.2s ease-out;'
			}
		];
	}
</script>
