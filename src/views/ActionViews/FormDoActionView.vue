<template>
	<Widget name="balance-actions-card-wrapper">
		<WidgetItem
			v-slot="{ computedAttrs, styleString }"
			name="card"
			:contentVariables="cardWrapperVariables"
		>
			<KCard
				v-bind="computedAttrs"
				:style="`--sheet-outlined-border: 1px solid var(--tertiary-lighten-5); ${styleString}`"
			>
				<Widget name="balance-actions-do-action">
					<WidgetItem v-slot="{ computedAttrs }" name="title">
						<KText v-bind="computedAttrs">
							{{ resultAction }} {{ activeWalletTitle }} {{ $t('balance.p2pFor') }} {{ secondCurrencyStepFlowTitle }} 
						</KText>
					</WidgetItem>

					<WidgetItem
						v-slot="{ computedAttrs, iconSize, iconName, iconStyle }"
						name="go-to-chat"
						:contentVariables="backBtnVariables"
					>
						<KBtn
							v-bind="computedAttrs"
							icon
						>
							<KIcon
								:name="iconName"
								:size="iconSize"
								:style="iconStyle"
								:to="$href('goToP2P') + goP2PTradePathPiece"
								target="_blank"
							/>
						</KBtn>
					</WidgetItem>

					<WidgetItem name="timer">
						<Widget name="balance-actions-do-action-timer">
							<WidgetItem
								v-slot="{ computedAttrs, timerStyles }"
								name="timer"
								:contentVariables="timerVariables"
							>
								<KText v-bind="computedAttrs" :style="timerStyles">
									{{ timerValue }}
								</KText>
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="text">
								<KText v-bind="computedAttrs">
									{{ $t(doActionSeamlessText) }}
								</KText>
							</WidgetItem>
						</Widget>
					</WidgetItem>

					<WidgetItem v-slot="{ computedAttrs }" name="info-block">
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
							:requisitesTitle="requisitesTitle"
							:requisitesValue="requisitesValue"
							:resultEndDateTitle="resultEndDateTitle"
							:resultEndDate="resultEndDate"
							:activeForm="activeForm"
							:flowType="activeFlow"
							:link="goP2PTradeChat"
						/>
					</WidgetItem>

					<WidgetItem
						v-if="(!isWithdrawalForm || (isWithdrawalForm && statusIsFiatSent)) && !isSwapFlow"
						key="actions-do-action-name-title"
						v-slot="{ computedAttrs }"
						name="do-action-name"
					>
						<KText v-bind="computedAttrs">
							{{ statusIsFiatSent ? $t('balance.verifyReceiptOfPayment') : $t('balance.makePaymentToRequisites') }}
						</KText>
					</WidgetItem>

					<WidgetItem
						v-if="(!isWithdrawalForm || (isWithdrawalForm && statusIsFiatSent)) && !isSwapFlow"
						key="actions-do-action-payment-method"
						name="do-action-payment-method"
					>
						<Widget name="balance-actions-do-action-payment-method">
							<WidgetItem v-slot="{ computedAttrs }" name="title">
								<KText v-bind="computedAttrs">
									{{ $t('balance.paymentMethodTitle') }}
								</KText>
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="icon">
								<KIcon v-bind="computedAttrs" :name="paymentMethodIcon" />
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="text">
								<KText v-bind="computedAttrs">
									{{ paymentMethodName }}
								</KText>
							</WidgetItem>
						</Widget>
					</WidgetItem>

					<WidgetItem
						v-if="(!isWithdrawalForm || isWithdrawalForm && statusIsFiatSent) && currentCountersideRequisites && !isSwapFlow"
						key="do-action-requisites-key"
						v-slot="{ computedAttrs, copiedText }"
						name="do-action-requisites"
						:contentVariables="copiedVariables"
					>
						<KTooltip
							key="do-action-requisites-tooltip"
							v-model="showCopyTooltip"
							v-bind="computedAttrs"
							:openOnHover="false"
							top
						>
							<template #activator="{ attrs }">
								<Widget name="balance-actions-do-action-requisites">
									<WidgetItem v-slot="{ computedAttrs }" name="title">
										<KText v-bind="computedAttrs">
											{{ statusIsFiatSent ? $t('balance.requisitesText') : $t('balance.recipientsDetails') }}
										</KText>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="text">
										<KText
											v-bind="{...attrs, ...computedAttrs}"
											@click="copyToClipboard(currentCountersideRequisites)"
										>
											{{ currentCountersideRequisites }}
										</KText>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="icon">
										<KIcon
											v-bind="{...attrs, ...computedAttrs}"
											@click="copyToClipboard(currentCountersideRequisites)"
										/>
									</WidgetItem>
								</Widget>
							</template>
							<Widget name="balance-text-body-1-regular">
								<WidgetItem v-slot="{ computedAttrs }" name="text">
									<KText v-bind="computedAttrs">
										{{ $t(copiedText) }}
									</KText>
								</WidgetItem>
							</Widget>
						</KTooltip>
					</WidgetItem>

					<WidgetItem
						v-if="!isWithdrawalForm && !isSwapFlow && getRecipientName"
						key="actions-do-action-action-counterparty"
						name="do-action-counterparty"
					>
						<Widget name="balance-actions-do-action-payment-method">
							<WidgetItem v-slot="{ computedAttrs }" name="title">
								<KText v-bind="computedAttrs">
									{{ getRecipientFullNameTitle }}
								</KText>
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="text">
								<KText v-bind="computedAttrs">
									{{ getRecipientName }}
								</KText>
							</WidgetItem>
						</Widget>
					</WidgetItem>

					<WidgetItem
						v-if="isWithdrawalForm && statusIsFiatSent"
						v-slot="{ computedAttrs }"
						name="secondary-btn"
					>
						<KBtn
							v-bind="computedAttrs"
							exact
							@click.native="secondaryBtnHandler"
						/>
					</WidgetItem>

					<WidgetItem
						v-if="isWithdrawalForm && statusIsFiatSent"
						key="actions-do-action-primary-btn-short"
						v-slot="{ computedAttrs }"
						name="primary-btn-half"
					>
						<KBtn
							v-bind="computedAttrs"
							:disabled="fiatSentConfirmationInProcess"
							@click="primaryBtnHandler"
						/>
					</WidgetItem>

					<WidgetItem
						v-else-if="!isWithdrawalForm && !isSwapFlow"
						key="actions-do-action-primary-btn"
						v-slot="{ computedAttrs }"
						name="primary-btn"
					>
						<KBtn
							v-bind="computedAttrs"
							:disabled="fiatSentConfirmationInProcess"
							@click="primaryBtnHandler"
						/>
					</WidgetItem>

					<WidgetItem
						v-if="!isWithdrawalForm && !isSwapFlow"
						v-slot="{ computedAttrs }"
						name="cancel-secondary-btn"
					>
						<KBtn
							v-bind="computedAttrs"
							exact
							@click.native="secondaryBtnHandler"
						/>
					</WidgetItem>
				</Widget>
			</KCard>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Watch } from 'vue-property-decorator';

	import MyRootStore from '@/store/store';
	import { formatNumberAndFixedDecimals, timerTick, convertExponentialToDecimal } from '@/utils/utils';
	import { FlowType, FormType, DealStatuses, WalletCurrencyType, CurrencyType } from '@/const';

	import SeamlessInfoBlock from '@/components/SeamlessInfoBlock.vue';
	import FormAmount from '@/components/FormComponents/FormAmount.vue';

	@Component({
		components: { SeamlessInfoBlock, FormAmount }
	})
	export default class FormDoActionView extends Vue {
		protected appRootStore = MyRootStore.getInstance();
		protected walletsStore = this.appRootStore.wallets;

		protected showCopyTooltip: boolean = false;
		protected copyTimeout: NodeJS.Timeout | null = null;
		protected copyToClipboard(value: string): void {
			navigator.clipboard.writeText(value);
			if (!this.showCopyTooltip) {
				this.showCopyTooltip = true;
			}

			if (this.copyTimeout) {
				clearTimeout(this.copyTimeout);
			}
			this.copyTimeout = setTimeout(() => {
				this.showCopyTooltip = false;
			}, 1200);
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

		protected get currentCountersideRequisites(): string {
			return this.currentTrade?.requisite || '';
		}

		protected get doActionSeamlessText(): string {
			if (this.isSwapFlow) return 'balance.doActionSeamlessWithdrawal';
			return !this.isWithdrawalForm ? 'balance.doActionSeamlessDeposit' : 'balance.doActionSeamlessWithdrawal';
		}

		protected get status(): string {
			return this.currentTrade?.status || '';
		}

		protected get statusIsFiatSent(): boolean {
			return this.status === 'FiatSent';
		}

		protected get getCurrencyIcon(): string {
			return `currency.${this.activeWalletTitle}`;
		}

		protected get giveCurrencyIcon(): string {
			return this.isSwapFlow
				? `currency.${this.secondCurrencyStepFlowTitle}`
				: `fiat.${this.secondCurrencyStepFlowTitle}`;
		}

		protected get idTitle(): string {
			return this.$t('balance.orderIdentificator');
		}

		protected get idText(): string {
			return this.walletsStore.computedCurrentTradeId;
		}

		protected get goP2PTradeChat(): string {
			return `${this.walletsStore.domainUrl}/p2p${this.goP2PTradePathPiece}`;
		}

		protected get goP2PTradePathPiece(): string {
			return `/chat/${this.idText}?chat=${this.currentTrade?.conversationId || null}`;
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
			if (this.isSwapFlow) return '';
			return this.currentTrade?.paymentMethod?.name || this.activePaymentMethod?.paymentMethod?.name || '';
		}

		protected get providerMethodIcon(): string {
			return `balance.${this.activePaymentProvider}-provider`;
		}

		protected get providerMethodTitle(): string {
			return this.$t('balance.providerText');
		}

		protected get providerMethodName(): string {
			if (this.isSwapFlow) return '';
			return this.$t('balance.p2pDealText');
		}

		protected get requisitesTitle(): string {
			return this.$t('balance.requisitesText');
		}

		protected get requisitesValue(): any {
			return this.isWithdrawalForm ? this.currentTrade?.requisite || '' : '';
		}

		protected get currencyRelation(): string {
			const prepositionText = this.activeFlow === FlowType.SWAP ? this.$t('balance.p2pTo') : this.$t('balance.p2pFor');
			const firstAmount = this.isWithdrawalForm ? this.amountGiveText : this.amountGetText;
			const secondAmount = this.isWithdrawalForm ? this.amountGetText : this.amountGiveText;

			return `${firstAmount} ${this.activeWalletTitle} ${prepositionText} ${secondAmount} ${this.secondCurrencyStepFlowTitle}`;
		}

		/**
		 * needs to be replaced - recipientName - with valid data after implementation in the backend
		 */
		public get getRecipientName(): string {
			return this.currentTrade?.recipientName || '';
		}

		public get getRecipientFullNameTitle(): string {
			return this.$t('balance.getRecipientFullNameTitle');
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

		protected get isSwapFlow(): any {
			return this.activeFlow === FlowType.SWAP;
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
			return this.isWithdrawalForm
				? this.formatNumberAndFixedDecimals(
						this.currentTrade?.buyerCurrency?.amount || 0,
						this.currentTrade?.buyerCurrency?.decimals || 2
				  )
				: this.formatNumberAndFixedDecimals(
						this.currentTrade?.sellerCurrency?.amount || 0,
						this.currentTrade?.sellerCurrency?.decimals || 8
				  );
		}

		protected get getText(): string {
			let amountTitle = '';
			if (this.activeFlow === FlowType.SWAP) {
				if (this.walletsStore.getAuthenticatedUserName === this.currentTrade?.cryptoBuyer?.username) {
					amountTitle = this.currentTrade.sellerCurrency?.title || this.secondCurrencyStepFlowTitle;
				} else {
					amountTitle = this.currentTrade.buyerCurrency?.title || this.activeWalletTitle;
				}
			} else {
				amountTitle = !this.isWithdrawalForm ? this.activeWalletTitle || '' : this.secondCurrencyStepFlowTitle;
			}
			return `${this.amountGetText} ${amountTitle}`;
		}

		protected get giveTitle(): string {
			return this.$t('balance.ImGiving');
		}

		protected get currentTradeAvailableUntil(): string {
			switch (this.status) {
				case DealStatuses.FundsFreezeConfirmation:
				case DealStatuses.MFASent:
				case DealStatuses.Created:
				case DealStatuses.Terminated:
				case DealStatuses.FundsFrozen:
				case DealStatuses.FiatSent:
					return this.currentTrade?.rsgActiveUntil || '';
				default:
					return this.currentTrade?.availableUntil || '';
			}
		}

		protected intervalId = 0;
		protected timer = '';
		protected get timerValue(): string {
			return this.timer || '0';
		}

		protected clearTimer(): void {
			this.timer = '';
			clearInterval(this.intervalId);
		}

		@Watch('currentTradeAvailableUntil', { immediate: true })
		protected initTimer(): void {
			if (this.currentTradeAvailableUntil) {
				const date = new Date(this.normalizedTime(this.currentTradeAvailableUntil)).getTime();
				const timeDifference = date - Date.now();
				if (timeDifference < 0) {
					return;
				}
				this.startTimer(date);
			}
		}

		protected startTimer(endTime: number, interval: number = 1000): void {
			this.clearTimer();

			this.timer = timerTick(endTime, false);
			this.intervalId = setInterval(() => {
				this.timer = timerTick(endTime, false);
				if (Date.now() >= endTime) {
					this.clearTimer();
					this.$emit('update-data');
					return;
				}
			}, interval) as any;
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
			if (this.isSwapFlow) return this.$t('balance.instantTime');
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
			return this.isWithdrawalForm
				? this.formatNumberAndFixedDecimals(
						this.currentTrade?.sellerCurrency?.amount || 0,
						this.currentTrade?.sellerCurrency?.decimals || 8
				  )
				: this.formatNumberAndFixedDecimals(
						this.currentTrade?.buyerCurrency?.amount || 0,
						this.currentTrade?.buyerCurrency?.decimals || 2
				  );
		}

		protected get giveText(): string {
			let amountTitle = '';
			if (this.activeFlow === FlowType.SWAP) {
				if (this.walletsStore.getAuthenticatedUserName === this.currentTrade?.cryptoBuyer?.username) {
					amountTitle = this.currentTrade.buyerCurrency?.title || this.activeWalletTitle;
				} else {
					amountTitle = this.currentTrade.sellerCurrency?.title || this.secondCurrencyStepFlowTitle;
				}
			} else {
				amountTitle = !this.isWithdrawalForm ? this.secondCurrencyStepFlowTitle : this.activeWalletTitle || '';
			}
			return `${this.amountGiveText} ${amountTitle}`;
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

		protected get promtTitleText(): string {
			return this.$t('balance.pleaseGoToDealChat');
		}

		protected get promptTooltipText(): string {
			return 'no text - prompt Tooltip Text';
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

		protected get errorsGetAmount(): string {
			return '';
		}

		protected get errorsGiveAmount(): string {
			return '';
		}

		protected formatNumberAndFixedDecimals(price: number, decimals: number): string {
			return formatNumberAndFixedDecimals(price, undefined, decimals);
		}

		protected get fiatSentConfirmationInProcess(): boolean {
			return this.walletsStore.fiatSentConfirmationInProcess;
		}

		protected primaryBtnHandler(): void {
			if (this.isWithdrawalForm) {
				this.walletsStore.confirmP2PWithdrawalFiatReceived();
			} else {
				this.walletsStore.fiatSentConfirmation();
			}
		}

		protected secondaryBtnHandler(): void {
			if (this.isWithdrawalForm && this.statusIsFiatSent) {
				window.open(this.$href('goToP2P') + this.goP2PTradePathPiece, '_blank');
			} else {
				this.walletsStore.setNeedConfirmCancelDeal(true);
			}
		}

		protected cardWrapperVariables = [
			{
				name: 'styleString',
				type: 'string',
				defaultValue: ''
			}
		];

		protected backBtnVariables = [
			{
				name: 'iconSize',
				type: 'string',
				defaultValue: '14'
			},
			{
				name: 'iconStyle',
				type: 'string',
				defaultValue: '--icon-color:var(--tertiary-darken)'
			}
		];

		protected timerVariables = [
			{
				name: 'timerStyles',
				type: 'string',
				defaultValue:
					'background-image: var(--gradient-primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
			}
		];

		protected copiedVariables = [
			{
				name: 'copiedText',
				type: 'translation',
				defaultValue: 'balance.copied'
			}
		];
	}
</script>
