<template>
	<InfoModal
		:value="isModal"
		:titleModal="title"
		@input="showModal"
	>
		<template #body-2>
			<Widget name="balance-transactions-p2p-modal">
				<WidgetItem name="currency">
					<Currency
						:currencyId="currencyId"
						:side="side"
					/>
				</WidgetItem>
				<!-- <WidgetItem name="status">
					<TransactionStatusComponent
						:status="status"
					/>
				</WidgetItem> -->
				<WidgetItem name="date">
					<DateBlock :date="dateCreated" />
				</WidgetItem>
				<WidgetItem
					v-slot="{ eventTitle, p2pTitle }"
					name="event"
					:contentVariables="variables"
				>
					<TextBlock
						:title="eventTitle"
						:text="p2pTitle"
					/>
				</WidgetItem>
				<WidgetItem
					v-slot="{ amountTitle }"
					name="amount"
					:contentVariables="variables"
				>
					<CurrencyChangeBlock
						:title="amountTitle"
						:value="amount"
						:currencyId="currencyId"
						:hasSign="true"
					/>
				</WidgetItem>
				<WidgetItem
					v-slot="{ feeTitle }"
					name="fee"
					:contentVariables="variables"
				>
					<CurrencyChangeBlock
						:title="feeTitle"
						:value="fee"
						:currencyId="currencyId"
					/>
				</WidgetItem>
				<WidgetItem
					v-slot="{ amountChangeTitle }"
					name="amountChange"
					:contentVariables="variables"
				>
					<CurrencyChangeBlock
						:title="amountChangeTitle"
						:value="amountChange"
						:currencyId="currencyId"
						:hasSign="true"
					/>
				</WidgetItem>
				<WidgetItem name="direction">
					<DealDirection
						:getCurrencyId="getCurrencyId"
						:giveCurrencyId="giveCurrencyId"
						:side="side"
					/>
				</WidgetItem>
				<WidgetItem name="payment-method">
					<PaymentMethod
						:paymentMethodId="paymentMethodId"
						:paymentMethodName="paymentMethodName"
					/>
				</WidgetItem>
				<WidgetItem
					v-slot="{ chatLinkTitle }"
					name="chat-link"
					:contentVariables="variables"
				>
					<TextBlock
						:title="chatLinkTitle"
						:link="getLink"
						:linkText="getLinkText"
						target="_blank"
					/>
				</WidgetItem>
			</Widget>
		</template>
		<template #actions>
			<Widget name="balance-transactions-modal-close">
				<WidgetItem
					v-slot="{ computedAttrs, close }"
					name="button"
					:contentVariables="variables"
				>
					<KBtn
						v-bind="computedAttrs"
						@click="showModal(false)"
					>
						{{ close }}
					</KBtn>
				</WidgetItem>
			</Widget>
		</template>
	</InfoModal>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component } from 'vue-property-decorator';
	import MyRootStore from '@/store/store';
	import InfoModal from '@/views/ModalViews/InfoModal.vue';
	import Currency from '@/components/ModalComponents/Currency.vue';
	import TransactionStatusComponent from '@/components/ModalComponents/TransactionStatus.vue';
	import DateBlock from '@/components/ModalComponents/DateBlock.vue';
	import CurrencyChangeBlock from '@/components/ModalComponents/CurrencyChangeBlock.vue';
	import TextBlock from '@/components/ModalComponents/TextBlock.vue';
	import DealDirection from '@/components/ModalComponents/DealDirection.vue';
	import PaymentMethod from '@/components/ModalComponents/PaymentMethod.vue';
	import { OperationSide, CurrencyType } from '@/const';

	@Component({
		name: 'TransactionsDepositModal',
		components: {
			InfoModal,
			Currency,
			TransactionStatusComponent,
			DateBlock,
			CurrencyChangeBlock,
			TextBlock,
			DealDirection,
			PaymentMethod
		}
	})
	export default class TransactionsDepositModal extends Vue {
		protected historyStore = MyRootStore.getInstance().history;
		protected walletStore = MyRootStore.getInstance().wallets;

		protected isDetailsEditing: boolean = false;

		protected get isModal(): boolean {
			return this.historyStore.isTransactionsP2pModal;
		}

		protected get transactionsData(): HISTORY.Transaction | undefined {
			return this.historyStore.transactionsModalData;
		}

		protected get getCurrencyId(): number {
			return this.transactionsData?.p2PTransactionData?.tradeInfo?.getCurrencyId || 0;
		}

		protected get giveCurrencyId(): number {
			return this.transactionsData?.p2PTransactionData?.tradeInfo?.giveCurrencyId || 0;
		}

		protected get tradeId(): number | null {
			return this.transactionsData?.p2PTransactionData?.tradeId || null;
		}

		protected get chatId(): number | null {
			return this.transactionsData?.p2PTransactionData?.groupChatInfo?.id || null;
		}

		protected get isCryptoCurrencySwap(): boolean {
			const getCurrencyId = this.transactionsData?.p2PTransactionData?.tradeInfo?.getCurrencyId || null;
			const giveCurrencyId = this.transactionsData?.p2PTransactionData?.tradeInfo?.giveCurrencyId || null;
			return (
				Boolean(getCurrencyId) &&
				Boolean(giveCurrencyId) &&
				this.historyStore.p2pCurrencyTypeById(this.giveCurrencyId) === CurrencyType.Cryptocurrency &&
				this.historyStore.p2pCurrencyTypeById(this.getCurrencyId) === CurrencyType.Cryptocurrency
			);
		}

		protected get paymentMethodId(): number | string {
			if (this.isCryptoCurrencySwap) {
				return 'instant-exchange';
			}

			return this.transactionsData?.p2PTransactionData?.tradeInfo?.paymentMethodId || 0;
		}

		protected get paymentMethodName(): string {
			if (this.isCryptoCurrencySwap) {
				return this.$t('balance.instantExchange');
			}

			return this.transactionsData?.p2PTransactionData?.tradeInfo?.paymentMethodName || '';
		}

		protected get currencyId(): number {
			return this.transactionsData?.currencyId || 0;
		}

		protected get side(): OperationSide {
			return this.transactionsData?.side || 0;
		}

		protected get dateCreated(): string {
			return this.transactionsData?.dateCreated || '';
		}

		protected get amount(): number | string {
			return this.historyStore.getAmountTransaction(this.transactionsData);
		}

		public get amountChange(): number | string {
			return this.historyStore.getAmountTransactionChange(this.transactionsData);
		}

		protected get fee(): number {
			return Math.abs(this.transactionsData?.fee || 0);
		}

		public get getLink(): string | null {
			if (this.tradeId && this.chatId) {
				return `${this.walletStore.domainUrl}/p2p/chat/${this.tradeId}?chat=${this.chatId}`;
			}
			return null;
		}

		public get getLinkText(): string {
			return `${this.tradeId}`;
		}

		public showModal(value: boolean): void {
			if (!value) {
				this.isDetailsEditing = false;
			}
			this.historyStore.showTransactionsP2pModal(value);
		}

		protected get title(): string {
			return this.$t('balance.transactionsDepositModalTitle') + ' ' + (this.transactionsData?.id || 0);
		}

		protected variables = [
			{
				name: 'close',
				type: 'translation',
				defaultValue: 'balance.close'
			},
			{
				name: 'eventTitle',
				type: 'translation',
				defaultValue: 'balance.modalEventTitle'
			},
			{
				name: 'p2pTitle',
				type: 'translation',
				defaultValue: 'balance.modalP2pEventTitle'
			},
			{
				name: 'amountTitle',
				type: 'translation',
				defaultValue: 'balance.modalAmountTitle'
			},
			{
				name: 'feeTitle',
				type: 'translation',
				defaultValue: 'balance.modalFeeTitle'
			},
			{
				name: 'amountChangeTitle',
				type: 'translation',
				defaultValue: 'balance.modalAmountChangeTitle'
			},
			{
				name: 'chatLinkTitle',
				type: 'translation',
				defaultValue: 'balance.orderIdentificator'
			}
		];
	}
</script>
