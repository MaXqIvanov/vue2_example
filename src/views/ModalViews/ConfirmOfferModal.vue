<template>
	<Widget name="balance-modal-confirm-wrapper">
		<!-- todo: rename: it's not card, it's dialog -->
		<WidgetItem
			v-slot="{ title }"
			name="card"
			:contentVariables="translateVariables"
		>
			<InfoModal
				v-model="confirmWithdrawalOfferModal"
				:titleModal="title"
			>
				<template #body-2>
					<Widget name="balance-modal-confirm">
						<WidgetItem v-slot="{ computedAttrs }" name="modal-card">
							<SeamlessInfoBlock
								v-bind="computedAttrs"
								:getCurrencyIcon="getCurrencyIcon"
								:giveCurrencyIcon="giveCurrencyIcon"
								:resultAction="resultAction"
								:currencyRelation="currencyRelation"
								:idTitle="idTitle"
								:idText="String(idText)"
								:paymentMethodTitle="paymentMethodTitle"
								:paymentMethodIcon="paymentMethodIcon"
								:paymentMethodName="paymentMethodName"
								:providerMethodIcon="providerMethodIcon"
								:providerMethodTitle="providerMethodTitle"
								:providerMethodName="providerMethodName"
								:rateInfoTitle="rateInfoTitle"
								:rateInfoText="rateInfoText"
								:getTitle="getTitle"
								:getText="getText"
								:getCurrencyProviderMethodIcon="getCurrencyProviderMethodIcon"
								:getCurrencyProviderMethodName="getCurrencyProviderMethodName"
								:giveCurrencyProviderMethodIcon="giveCurrencyProviderMethodIcon"
								:giveCurrencyProviderMethodName="giveCurrencyProviderMethodName"
								:giveTitle="giveTitle"
								:giveText="giveText"
								:needRateInfoText="Boolean((currentTrade && currentTrade.exchangeRate) || (activePaymentMethod && activePaymentMethod.avgPrice))"
								:feeTitle="feeTitle"
								:feeText="feeText"
								:resultEndDateTitle="resultEndDateTitle"
								:requisitesTitle="requisitesTitle"
								:requisitesValue="requisitesValue"
								:resultEndDate="resultEndDate"
								:activeForm="activeForm"
								:flowType="activeFlow"
								:link="goP2PTradeChat"
							/>
						</WidgetItem>

						<WidgetItem name="confirm-blocks">
							<Widget name="balance-modal-confirm-blocks">
								<WidgetItem v-slot="{ computedAttrs }" name="code-fields">
									<template v-for="mfa in lastTradeMfa">
										<ConfirmModalCodeField
											:key="mfa.section + mfa.data.resendTime"
											:section="mfa.section"
											:mfaData="mfa.data"
											v-bind="computedAttrs"
											:resendCallback="resendCallback"
											@input="inputCodeHandler"
										/>
									</template>
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
	import ConfirmModalCodeField from '@/components/ModalComponents/ConfirmModalCodeField.vue';

	import MyRootStore from '@/store/store';
	import { convertExponentialToDecimal, formatNumberAndFixedDecimals } from '@/utils/utils';
	import { CurrencyType, FlowType, FormType, NfaServiceType, WalletCurrencyType } from '@/const';
	import { mixins } from 'vue-class-component';
	import FormatNumberDecimals from '@/mixins/formatNumberDecimals';

	import SeamlessInfoBlock from '@/components/SeamlessInfoBlock.vue';
	import InfoModal from '@/views/ModalViews/InfoModal.vue';

	@Component({
		components: { SeamlessInfoBlock, ConfirmModalCodeField, InfoModal }
	})
	export default class ConfirmOfferModal extends mixins(FormatNumberDecimals) {
		protected walletsStore = MyRootStore.getInstance().wallets;
		protected historyStore = MyRootStore.getInstance().history;
		protected timer: string = '-';
		protected intervalId?: unknown;

		protected readonly app2Variables = [{ name: 'width', type: 'number', defaultValue: 448 }];

		protected get nfaServiceType(): Array<string> {
			return this.walletsStore.nfaServiceType;
		}

		protected get activeForm(): WALLETS.FormTypeValues {
			return this.walletsStore.getActiveForm || FormType.DEPOSIT;
		}

		protected get activeFlow(): WALLETS.FlowTypeValues {
			return this.walletsStore.getActiveFlow || FlowType.SWAP;
		}

		protected get activeWallet(): WALLETS.Wallet | undefined {
			return this.walletsStore.getActiveWallet;
		}

		protected get activeWalletTitle(): string | undefined {
			return this.activeWallet?.currencyTitle;
		}

		protected get secondCurrencyStepFlow(): any {
			return this.walletsStore.secondCurrencyStepFlow;
		}

		protected get secondCurrencyStepFlowTitle(): string {
			return this.secondCurrencyStepFlow?.title || '';
		}

		protected get secondCurrencyStepFlowDecimals(): number {
			return this.secondCurrencyStepFlow?.decimals || 8;
		}

		protected get activePaymentProvider(): string {
			return this.walletsStore.activePaymentProvider;
		}

		protected get activePaymentMethod(): any {
			return this.walletsStore.activePaymentMethod;
		}

		protected get getCurrencyIcon(): string {
			return `currency.${this.activeWalletTitle}`;
		}

		protected get giveCurrencyIcon(): string {
			return this.activeFlow === FlowType.SWAP
				? `currency.${this.secondCurrencyStepFlowTitle}`
				: `fiat.${this.secondCurrencyStepFlowTitle}`;
		}

		protected get idTitle(): string {
			return this.$t('balance.orderIdentificator');
		}

		protected get goP2PTradeChat(): string {
			return `${this.walletsStore.domainUrl}/p2p${this.goP2PTradePathPiece}`;
		}

		protected get goP2PTradePathPiece(): string {
			return `/chat/${this.idText}?chat=${this.currentTrade?.conversationId || null}`;
		}

		protected get idText(): string {
			return this.walletsStore.computedCurrentTradeId;
		}

		protected get paymentMethodIcon(): string {
			return `payment-methods.${
				this.currentTrade?.paymentMethod?.id || this.activePaymentMethod?.paymentMethodId || 1
			}`;
		}

		protected get paymentMethodTitle(): string {
			return `${this.$t('balance.paymentMethod')}:`;
		}

		protected get paymentMethodName(): string {
			if (this.activeFlow === FlowType.SWAP) return '';
			return this.currentTrade?.paymentMethod?.name || this.activePaymentMethod?.paymentMethod?.name || '';
		}

		protected get providerMethodIcon(): string {
			return `balance.${this.activePaymentProvider}-provider`;
		}

		protected get providerMethodTitle(): string {
			return this.$t('balance.providerText');
		}

		protected get providerMethodName(): string {
			return this.$t('balance.p2pDealText');
		}

		protected get requisitesTitle(): string {
			return this.$t('balance.requisitesText');
		}

		protected get requisitesValue(): any {
			return this.isWithdrawalForm
				? this.currentTrade?.requisite || this.walletsStore.seamlessStepsRequisites || ''
				: '';
		}

		protected get currencyRelation(): string {
			const prepositionText = this.activeFlow === FlowType.SWAP ? this.$t('balance.p2pTo') : this.$t('balance.p2pFor');
			const firstAmount = this.isWithdrawalForm ? this.amountGiveText : this.amountGetText;
			const secondAmount = this.isWithdrawalForm ? this.amountGetText : this.amountGiveText;

			return `${firstAmount} ${this.activeWalletTitle} ${prepositionText} ${secondAmount} ${this.secondCurrencyStepFlowTitle}`;
		}

		protected get resultAction(): string {
			if (this.activeFlow === FlowType.SWAP) return this.$t('balance.p2pSwap');
			if (this.activeForm === FormType.DEPOSIT) {
				return this.$t('balance.p2pBuy');
			}
			if (this.isWithdrawalForm) {
				return this.$t('balance.p2pSell');
			}

			return this.$t('balance.p2pSwap');
		}

		protected get rateInfoTitle(): string {
			return this.$t('balance.rate');
		}

		protected get getTitle(): string {
			return this.$t('balance.ImGetting');
		}

		protected get currentTrade(): any {
			return this.walletsStore.computedCurrentTrade;
		}

		protected get amountGetText(): string {
			if (this.activeFlow === FlowType.SWAP) {
				if (this.walletsStore.getAuthenticatedUserName === this.currentTrade?.cryptoBuyer?.username) {
					return this.formatNumberAndFixedDecimals(
						this.currentTrade?.sellerCurrency?.amount || this.currentTrade?.cryptoSellerAmount || 0,
						this.currentTrade?.sellerCurrency?.decimals || 8
					);
				}
				return this.formatNumberAndFixedDecimals(
					this.currentTrade?.buyerCurrency?.amount || this.currentTrade?.cryptoBuyerAmount || 0,
					this.currentTrade?.buyerCurrency?.decimals || 8
				);
			}
			return this.formatNumberAndFixedDecimals(
				this.isWithdrawalForm
					? this.currentTrade?.buyerCurrency?.amount || this.currentTrade?.cryptoBuyerAmount || 0
					: this.currentTrade?.sellerCurrency?.amount || this.currentTrade?.cryptoSellerAmount || 0,
				this.isWithdrawalForm
					? this.currentTrade?.buyerCurrency?.decimals || 2
					: this.currentTrade?.sellerCurrency?.decimals || 8
			);
		}

		protected get getText(): string {
			return `${this.amountGetText} ${
				!this.isWithdrawalForm ? this.activeWalletTitle : this.secondCurrencyStepFlowTitle
			}`;
		}

		protected get giveTitle(): string {
			return this.$t('balance.ImGiving');
		}

		protected get currentTradeAvailableUntil(): string {
			switch (this.status) {
				case 'FundsFreezeConfirmation':
				case 'MFASent':
				case 'Created':
				case 'Terminated':
				case 'FundsFrozen':
				case 'FiatSent':
					return this.currentTrade?.rsgActiveUntil || '';
				default:
					return this.currentTrade?.availableUntil || '';
			}
		}

		protected normalizedTime(time: string): string {
			if (time && !Number.isInteger(time)) {
				return `${time.toString().substring(0, 10)}T${time.toString().substring(11)}`;
			}

			return time;
		}

		protected get resultEndDateTitle(): string {
			return this.$t('balance.dealTimeText');
		}

		protected get resultEndDate(): string {
			if (this.activeFlow === FlowType.SWAP) return this.$t('balance.instantTime');
			if (!this.currentTrade?.createdAt || !this.currentTradeAvailableUntil) return '';
			const dateCreated = new Date(this.normalizedTime(this.currentTrade?.createdAt)).getTime();
			const dateUntil = new Date(this.normalizedTime(this.currentTradeAvailableUntil)).getTime();

			const durationInMinutes = Math.trunc((dateUntil - dateCreated) / (1000 * 60));

			return `${durationInMinutes} ${this.$t('system.minute', {
				time: durationInMinutes,
				$plural: 'time'
			}).toLowerCase()}`;
		}

		protected get amountGiveText(): string {
			if (this.activeFlow === FlowType.SWAP) {
				if (this.walletsStore.getAuthenticatedUserName === this.currentTrade?.cryptoBuyer?.username) {
					return this.formatNumberAndFixedDecimals(
						this.currentTrade?.buyerCurrency?.amount || this.currentTrade?.cryptoBuyerAmount || 0,
						this.currentTrade?.buyerCurrency?.decimals || 8
					);
				}
				return this.formatNumberAndFixedDecimals(
					this.currentTrade?.sellerCurrency?.amount || this.currentTrade?.cryptoSellerAmount || 0,
					this.currentTrade?.sellerCurrency?.decimals || 8
				);
			}
			return this.formatNumberAndFixedDecimals(
				this.isWithdrawalForm
					? this.currentTrade?.sellerCurrency?.amount || this.currentTrade?.cryptoSellerAmount || 0
					: this.currentTrade?.buyerCurrency?.amount || this.currentTrade?.cryptoBuyerAmount || 0,
				this.isWithdrawalForm
					? this.currentTrade?.sellerCurrency?.decimals || 8
					: this.currentTrade?.buyerCurrency?.decimals || 2
			);
		}

		protected get giveText(): string {
			return `${this.amountGiveText} ${
				!this.isWithdrawalForm ? this.secondCurrencyStepFlowTitle : this.activeWalletTitle
			}`;
		}

		protected get getCurrencyProviderMethodIcon(): string {
			let id;

			if (!this.isWithdrawalForm && this.activeWallet?.currencyType === WalletCurrencyType[CurrencyType.Fiat]) {
				id = this.currentTrade?.paymentMethod?.id || this.activePaymentMethod?.paymentMethodId;
			} else if (this.isWithdrawalForm && this.secondCurrencyStepFlow.type === CurrencyType.Fiat) {
				id = this.currentTrade?.paymentMethod?.id || this.activePaymentMethod?.paymentMethodId;
			}

			if (id) return `payment-methods.${id}`;

			return '';
		}
		protected get getCurrencyProviderMethodName(): string {
			if (!this.isWithdrawalForm && this.activeWallet?.currencyType === WalletCurrencyType[CurrencyType.Fiat]) {
				return this.currentTrade?.paymentMethod?.name || this.activePaymentMethod?.paymentMethod?.name || '';
			} else if (this.isWithdrawalForm && this.secondCurrencyStepFlow.type === CurrencyType.Fiat) {
				return this.currentTrade?.paymentMethod?.name || this.activePaymentMethod?.paymentMethod?.name || '';
			}

			return '';
		}

		protected get giveCurrencyProviderMethodIcon(): string {
			let id;

			if (!this.isWithdrawalForm && this.secondCurrencyStepFlow.type === CurrencyType.Fiat) {
				id = this.currentTrade?.paymentMethod?.id || this.activePaymentMethod?.paymentMethodId;
			} else if (this.isWithdrawalForm && this.activeWallet?.currencyType === WalletCurrencyType[CurrencyType.Fiat]) {
				id = this.currentTrade?.paymentMethod?.id || this.activePaymentMethod?.paymentMethodId;
			}

			if (id) return `payment-methods.${id}`;

			return '';
		}
		protected get giveCurrencyProviderMethodName(): string {
			if (!this.isWithdrawalForm && this.secondCurrencyStepFlow.type === CurrencyType.Fiat) {
				return this.currentTrade?.paymentMethod?.name || this.activePaymentMethod?.paymentMethod?.name || '';
			} else if (this.isWithdrawalForm && this.activeWallet?.currencyType === WalletCurrencyType[CurrencyType.Fiat]) {
				return this.currentTrade?.paymentMethod?.name || this.activePaymentMethod?.paymentMethod?.name || '';
			}

			return '';
		}

		protected get rateInfoText(): string {
			const avgPrice =
				this.activeFlow === FlowType.SWAP && this.activeForm === FormType.WITHDRAWAL
					? this.formatNumberAndFixedDecimals(
							1 / Number(this.currentTrade?.exchangeRate || this.activePaymentMethod?.avgPrice || 1),
							this.secondCurrencyStepFlowDecimals
					  )
					: this.formatNumberAndFixedDecimals(
							this.currentTrade?.exchangeRate || this.activePaymentMethod?.avgPrice || 1,
							this.secondCurrencyStepFlowDecimals
					  );
			return `1 ${this.activeWalletTitle} ~ ${avgPrice} ${this.secondCurrencyStepFlowTitle}`;
		}

		protected get feeTitle(): string {
			return this.$t('balance.providerCommission');
		}

		protected get isWithdrawalForm(): boolean {
			return this.activeForm === FormType.WITHDRAWAL;
		}

		protected get feeText(): string {
			if (this.isWithdrawalForm) return '';

			return this.currentTrade?.serviceFee || this.currentTrade?.commission || this.activePaymentMethod?.commission
				? `${convertExponentialToDecimal(this.currentTrade?.serviceFee || this.activePaymentMethod?.commission || 0)} ${
						this.secondCurrencyStepFlowTitle
				  }`
				: '';
		}

		protected get status(): string {
			return this.currentTrade?.status || '';
		}

		protected get confirmOfferInProcess(): boolean {
			return this.walletsStore.confirmOfferInProcess;
		}

		protected get isDisableConfirm(): boolean {
			return !this.isInputFields || this.confirmOfferInProcess;
		}

		protected get isInputFields(): boolean {
			const mfaList = this.lastTradeMfa.map((e) => e.section);
			const isWithdrawalCodes = mfaList.every(
				(e) => (this.walletsStore.withdrawalCodes?.[e as string] as string)?.length > 0
			);
			return Object.keys(this.walletsStore.withdrawalCodes).length == this.lastTradeMfa.length && isWithdrawalCodes;
		}

		protected get lastTradeMfa(): WALLETS.MfaListItemDto[] {
			return this.walletsStore.lastTradeMfa;
		}

		protected get currentLocale(): string {
			return this.$store.state.translator.currentLocale;
		}

		protected get confirmWithdrawalOfferModal(): boolean {
			return this.walletsStore.confirmWithdrawalOfferModal;
		}
		protected set confirmWithdrawalOfferModal(val: boolean) {
			this.walletsStore.setConfirmWithdrawalOfferModal(val);
		}

		public inputCodeHandler(): void {
			const mfaList = this.lastTradeMfa.map((e) => e.section);
			const autocompleteMfaList = [
				NfaServiceType[NfaServiceType.Email],
				NfaServiceType[NfaServiceType.Google],
				NfaServiceType[NfaServiceType.SMS],
				NfaServiceType[NfaServiceType.TelegramBot]
			];
			if (!mfaList.every((e) => autocompleteMfaList.includes(e as string))) {
				return;
			}
			if (mfaList.every((e) => (this.walletsStore.withdrawalCodes?.[e as string] as string)?.length === 6)) {
				this.confirmAction();
			}
		}

		protected confirmAction(): void {
			if (this.activeFlow === FlowType.SWAP) {
				this.walletsStore.confirmP2PSwapTradeCodes();
			} else {
				this.walletsStore.confirmP2PWithdrawalOfferCodes();
			}
		}

		protected resendCallback(section: string): void {
			this.walletsStore.resendP2PWithdrawalOfferCode(section);
		}

		protected openCancelModal(): void {
			this.closeModal();
		}

		protected closeModal(): void {
			this.confirmWithdrawalOfferModal = false;
		}

		protected formatNumberAndFixedDecimals(value: number, decimals: number): string {
			return formatNumberAndFixedDecimals(value, this.currentLocale, decimals);
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
