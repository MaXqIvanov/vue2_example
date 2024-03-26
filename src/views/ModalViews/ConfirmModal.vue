<template>
	<Widget name="balance-modal-confirm-wrapper">
		<!-- todo: rename: it's not card, it's dialog -->
		<WidgetItem
			v-slot="{ title }"
			name="card"
			:contentVariables="translateVariables"
		>
			<InfoModal
				v-model="confirmWithdrawalModal"
				:titleModal="title"
			>
				<template #body-2>
					<Widget name="balance-modal-confirm">
						<WidgetItem v-slot="{ computedAttrs }" name="modal-card">
							<KCard v-bind="computedAttrs">
								<Widget name="balance-modal-confirm-card">
									<WidgetItem name="currency-icon-heading">
										<Widget name="balance-modal-confirm-card-currency-heading">
											<WidgetItem v-slot="{ computedAttrs }" name="title-icon">
												<KIcon v-bind="computedAttrs" :name="`currency.${currencyTitle}`" />
											</WidgetItem>

											<WidgetItem v-slot="{ computedAttrs }" name="title-currency">
												<KText v-bind="computedAttrs">
													{{ currencyTitle }}
												</KText>
											</WidgetItem>

											<WidgetItem v-slot="{ computedAttrs }" name="title-text">
												<KText v-bind="computedAttrs" />
											</WidgetItem>
										</Widget>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="status">
										<TransactionStatusComponent
											v-bind="computedAttrs"
											:status="status"
										/>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="transport-title">
										<ConfirmModalDetailsText
											v-bind="computedAttrs"
											:label="'balance.network'"
											:value="activeTransport"
										/>
									</WidgetItem>
									<WidgetItem v-slot="{ computedAttrs }" name="address">
										<ConfirmModalDetailsText
											v-bind="computedAttrs"
											:label="'balance.recipientAddress'"
											:value="address"
										/>
									</WidgetItem>
									<WidgetItem v-slot="{ computedAttrs }" name="funds-to-send">
										<ConfirmModalDetailsText
											v-bind="computedAttrs"
											:label="'balance.fundsToSend'"
											:value="getFormatNumberAndFixedDecimals(amount + transactionFee, currencyTitle)"
											:currency="currencyTitle"
										/>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="reciept-amount">
										<ConfirmModalDetailsText
											v-bind="computedAttrs"
											:label="'balance.recieptAmount'"
											:value="getFormatNumberAndFixedDecimals(amount, currencyTitle)"
											:currency="currencyTitle"
											:subtext="amountEquivalentText"
										/>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="fee">
										<ConfirmModalDetailsText
											v-bind="computedAttrs"
											:label="'balance.fee'"
											:value="getFormatNumberAndFixedDecimals(transactionFee, currencyTitle)"
											:currency="currencyTitle"
										/>
									</WidgetItem>
								</Widget>
							</KCard>
						</WidgetItem>

						<WidgetItem name="confirm-blocks">
							<Widget name="balance-modal-confirm-blocks">
								<WidgetItem v-slot="{ computedAttrs }" name="code-fields">
									<template v-for="({ section, data, length }, index) in lastTransactionMfaList">
										<ConfirmModalCodeField
											:key="section + index + transactionId"
											:section="section"
											:mfaData="data"
											:length="length"
											v-bind="computedAttrs"
											@input="inputCodeHandler"
										/>
									</template>
								</WidgetItem>

								<WidgetItem name="warning-promt">
									<Widget name="balance-modal-confirm-warning-prompt">
										<WidgetItem v-slot="{ computedAttrs, name }" name="icon">
											<KIcon v-bind="computedAttrs" :name="name" />
										</WidgetItem>

										<WidgetItem v-slot="{ computedAttrs }" name="text">
											<KText v-bind="computedAttrs" />
										</WidgetItem>
									</Widget>
								</WidgetItem>
							</Widget>
						</WidgetItem>
					</Widget>
				</template>
				<template #actions>
					<Widget name="balance-modal-confirm-actions">
						<WidgetItem v-slot="{ computedAttrs }" name="confirm">
							<KBtn
								v-bind="computedAttrs"
								:disabled="isDisableConfirm"
								@click="confirmAction"
							/>
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="cancel">
							<KBtn v-bind="computedAttrs" @click="openCancelModal" />
						</WidgetItem>
					</Widget>
				</template>
			</InfoModal>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import { Component } from 'vue-property-decorator';
	import ConfirmModalDetailsText from '@/components/ModalComponents/ConfirmModalDetailsText.vue';
	import ConfirmModalCodeField from '@/components/ModalComponents/ConfirmModalCodeField.vue';
	import TransactionStatusComponent from '@/components/ModalComponents/TransactionStatus.vue';
	import InfoModal from '@/views/ModalViews/InfoModal.vue';
	import MyRootStore from '@/store/store';
	import { formatNumberAndFixedDecimals } from '@/utils/utils';
	import { TransactionStatus } from '@/const';
	import { mixins } from 'vue-class-component';
	import FormatNumberDecimals from '@/mixins/formatNumberDecimals';

	@Component({
		components: { TransactionStatusComponent, ConfirmModalDetailsText, ConfirmModalCodeField, InfoModal }
	})
	export default class ConfirmModal extends mixins(FormatNumberDecimals) {
		protected walletsStore = MyRootStore.getInstance().wallets;
		protected historyStore = MyRootStore.getInstance().history;
		protected timer: string = '-';
		protected intervalId?: unknown;

		protected readonly app2Variables = [{ name: 'width', type: 'number', defaultValue: 448 }];

		protected get nfaServiceType(): Array<string> {
			return this.walletsStore.nfaServiceType;
		}

		protected get isDisableConfirm(): boolean {
			return this.status !== TransactionStatus.awaitingUserConfirmation || !this.isInputFields;
		}

		protected get isInputFields(): boolean {
			const mfaList = this.lastTransactionMfaList.map((e) => e.section);
			const isWithdrawalCodes = mfaList.every(
				(e) => (this.walletsStore.withdrawalCodes?.[e as string] as string)?.length > 0
			);
			return (
				Object.keys(this.walletsStore.withdrawalCodes).length == this.lastTransactionMfaList.length && isWithdrawalCodes
			);
		}

		protected get transactionId(): number {
			return this.lastTransactionData?.id || this.lastTransactionData?.cryptoTransaction?.transactionId || 0;
		}

		protected get currencyTitle(): string {
			return this.lastTransactionData?.currencyTitle || '';
		}

		protected get status(): number | string | undefined {
			return this.lastTransactionData?.transactionStatus;
		}

		protected get amount(): number {
			return this.lastTransactionData?.amount || 0;
		}

		protected get transactionFee(): number {
			return this.lastTransactionData?.transactionFee || 0;
		}

		protected get address(): string {
			return (
				this.lastTransactionData?.cryptoTransaction?.cryptoAddress ||
				this.lastTransactionData?.cryptoTransaction?.address ||
				''
			);
		}

		protected get amountEquivalentText(): string {
			return `~${this.amountEquivalent} ${this.favoriteCurrencySymbol}`;
		}

		protected get favoriteCurrencySymbol(): string {
			return this.walletsStore.favoriteCurrency?.title || 'USD';
		}

		protected get currentRate(): number | undefined {
			return this.walletsStore.getActiveWallet?.rate;
		}

		protected get activeWalletData(): any | undefined {
			return this.walletsStore.getActiveWalletData;
		}

		protected get amountEquivalent(): number | string {
			if (this.currentRate && this.activeWalletData.amountValue) {
				return Math.round(this.currentRate * this.activeWalletData.amountValue * 10) / 10;
			}
			return 0;
		}

		protected get feeValueString(): string {
			return `${this.formatNumberAndFixedDecimals(this.activeWalletData.feeFinal, 16)} ${this.currencyTitle}`;
		}

		protected get lastTransactionHistory(): HISTORY.TransactionsFilter | undefined {
			return this.historyStore?.lastOperations[0];
		}

		protected get lastTransactionData(): WALLETS.UserTransactionDto | undefined {
			return this.walletsStore.getLastTransactionData;
		}

		protected get lastTransactionMfaList(): WALLETS.MfaListItemDto[] {
			return this.walletsStore.getLastTransactionMfaList ?? [];
		}

		protected get activeTransport(): string {
			return this.walletsStore.getActiveTransport?.name || '';
		}

		protected get currentLocale(): string {
			return this.$store.state.translator.currentLocale;
		}

		protected get confirmWithdrawalModal(): boolean {
			return this.walletsStore.getConfirmWithdrawalModal;
		}

		protected set confirmWithdrawalModal(val: boolean) {
			this.walletsStore.setNeedConfirmWithdrawal(val);
		}

		protected closeModal(): void {
			this.confirmWithdrawalModal = false;
		}

		protected openCancelModal(): void {
			this.walletsStore.setShowCancelWithdrawal(true);
			this.closeModal();
		}

		protected formatNumberAndFixedDecimals(value: number, decimals: number): string {
			return formatNumberAndFixedDecimals(value, this.currentLocale, decimals);
		}

		protected confirmAction(): void {
			this.walletsStore.confirmWithdrawalAction();
		}

		protected get canSendCode(): boolean {
			return this.timer !== '';
		}

		protected mounted(): void {
			this.startTimer(this.initEndTime(), 1000);
		}

		protected timerTick(endTime: number): string {
			const now = Date.now();
			const t = endTime - now;
			const date = new Date(t);
			return this.formatDate(date);
		}

		protected formatDate(date: Date): string {
			const seconds = date.getSeconds();
			const minutes = date.getMinutes();
			return `${minutes > 9 ? minutes : `0${minutes}`}:${seconds > 9 ? seconds : `0${seconds}`}`;
		}

		protected initEndTime(timeout: number = 60): number {
			const end = new Date();
			end.setSeconds(end.getSeconds() + timeout);
			return end.getTime();
		}

		public startTimer(endTime: number, interval: number = 1000): void {
			this.timer = this.timerTick(endTime);
			this.intervalId = setInterval(() => {
				this.timer = this.timerTick(endTime);
				if (Date.now() >= endTime) {
					this.timer = '';
					clearInterval(this.intervalId as number);
					return;
				}
			}, interval);
		}

		public inputCodeHandler(): void {
			this.walletsStore.checkCanAutoSubmitMfaCodes() && this.confirmAction();
		}

		protected translateVariables = [
			{
				name: 'title',
				type: 'translation',
				defaultValue: 'balance.confirmation'
			}
		];
	}
</script>
