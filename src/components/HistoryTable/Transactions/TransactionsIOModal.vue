<template>
	<InfoModal
		:value="isModal"
		:titleModal="title"
		@input="showModal"
	>
		<template #body-2>
			<Widget name="balance-transactions-deposit-modal">
				<WidgetItem name="currency">
					<Currency
						:currencyId="currencyId"
						:side="side"
					/>
				</WidgetItem>
				<WidgetItem name="status">
					<TransactionStatusComponent
						:status="status"
					/>
				</WidgetItem>
				<WidgetItem name="date">
					<DateBlock :date="dateCreated" />
				</WidgetItem>
				<WidgetItem
					v-slot="{ eventTitle, depositTitle, withdrawalTitle }"
					name="event"
					:contentVariables="variables"
				>
					<TextBlock
						v-if="isSideIn"
						:title="eventTitle"
						:text="depositTitle"
					/>
					<TextBlock
						v-else
						:title="eventTitle"
						:text="withdrawalTitle"
					/>
				</WidgetItem>
				<WidgetItem
					v-slot="{ netTitle }"
					name="net"
					:contentVariables="variables"
				>
					<TextBlock
						:title="netTitle"
						:text="net"
						:extra="tokenType"
					/>
				</WidgetItem>
				<WidgetItem
					v-slot="{ confirmationTitle }"
					name="confirmation"
					:contentVariables="variables"
				>
					<TextBlock
						:title="confirmationTitle"
						:text="confirmationCount"
						:extra="confirmationTime"
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
				<WidgetItem
					v-show="txId"
					v-slot="{ txIdTitle }"
					name="txId"
					:contentVariables="variables"
				>
					<TextBlockWithCopy
						:title="txIdTitle"
						:value="txId"
						:text="txIdText"
					/>
				</WidgetItem>
				<WidgetItem v-show="txidExplorerPath" name="txid-explorer-link">
					<Share
						:to="txidExplorerPath"
					/>
				</WidgetItem>
				<WidgetItem
					v-show="address"
					v-slot="{ addressTitle }"
					name="address"
					:contentVariables="variables"
				>
					<TextBlockWithCopy
						:title="addressTitle"
						:value="address"
						:text="addressText"
					/>
				</WidgetItem>
				<WidgetItem v-show="addressExplorerPath" name="address-explorer-link">
					<Share
						:to="addressExplorerPath"
					/>
				</WidgetItem>
				<WidgetItem
					v-show="memo"
					v-slot="{ memoTitle }"
					name="memo"
					:contentVariables="variables"
				>
					<TextBlockWithCopy

						:title="memoTitle"
						:value="memo"
						:text="memoText"
					/>
				</WidgetItem>
				<WidgetItem
					v-slot="{ detailsTitle, detailsTooltipText, detailsEmptyText }"
					name="details"
					:contentVariables="variables"
				>
					<TextBlockWithEdit
						v-model="isDetailsEditing"
						:title="detailsTitle"
						:text="detailsText"
						:emptyText="detailsEmptyText"
						:tooltipText="detailsTooltipText"
						@accept="setDetails"
					/>
				</WidgetItem>
				<WidgetItem
					v-show="commentText"
					v-slot="{ commentTitle }"
					name="comment"
					:contentVariables="variables"
				>
					<TextBlock
						:title="commentTitle"
						:text="commentText"
					/>
				</WidgetItem>
				<WidgetItem
					v-show="isWithdrawal"
					v-slot="{ computedAttrs }"
					name="divider"
				>
					<KDivider v-bind="computedAttrs" />
				</WidgetItem>
				<WidgetItem
					v-show="isWithdrawal"
					v-slot="{ computedAttrs, repeatTitle }"
					name="repeat"
					:contentVariables="variables"
				>
					<KBtn
						v-bind="computedAttrs"
						@click="repeat"
					>
						{{ repeatTitle }}
					</KBtn>
				</WidgetItem>
			</Widget>
		</template>
		<template #actions>
			<Widget name="balance-transactions-deposit-modal-close">
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
	import TextBlockWithEdit from '@/components/ModalComponents/TextBlockWithEdit.vue';
	import TextBlockWithCopy from '@/components/ModalComponents/TextBlockWithCopy.vue';
	import Share from '@/components/ModalComponents/Share.vue';
	import { OperationSide, TransactionStatus } from '@/const';
	import { ellipsisString } from '@/utils/utils';

	@Component({
		name: 'TransactionsDepositModal',
		components: {
			InfoModal,
			Currency,
			TransactionStatusComponent,
			DateBlock,
			CurrencyChangeBlock,
			TextBlock,
			TextBlockWithEdit,
			TextBlockWithCopy,
			Share
		}
	})
	export default class TransactionsDepositModal extends Vue {
		protected historyStore = MyRootStore.getInstance().history;

		protected isDetailsEditing: boolean = false;

		protected get isModal(): boolean {
			return this.historyStore.isTransactionsIOModal;
		}

		protected get transactionsData(): HISTORY.Transaction | undefined {
			return this.historyStore.transactionsModalData;
		}

		protected get currencyId(): number {
			return this.transactionsData?.currencyId || 0;
		}

		protected get side(): OperationSide {
			return this.transactionsData?.side || 0;
		}

		protected get status(): TransactionStatus {
			return this.transactionsData?.transactionData?.transactionStatus || 0;
		}

		protected get dateCreated(): string {
			return this.transactionsData?.dateCreated || '';
		}

		protected get net(): string {
			return ''; // not ready on backend
		}

		protected get tokenType(): string {
			return ''; // not ready on backend
		}

		protected get confirmationCount(): string {
			return ''; // not ready on backend
		}

		protected get confirmationTime(): string {
			return ''; // not ready on backend
		}

		protected get amount(): number | string {
			return this.historyStore.getAmountTransaction(this.transactionsData);
		}

		protected get fee(): number {
			return Math.abs(this.transactionsData?.fee || 0);
		}

		protected get amountChange(): number | string {
			return this.historyStore.getAmountTransactionChange(this.transactionsData);
		}

		protected get txId(): string {
			return this.transactionsData?.transactionData?.cryptoTxId || '';
		}

		protected get txIdText(): string {
			return this.ellipsisString(this.transactionsData?.transactionData?.cryptoTxId || '');
		}

		protected get txidExplorerPath(): string {
			return this.transactionsData?.transactionData?.urlTx || '';
		}

		protected get address(): string {
			return this.transactionsData?.transactionData?.destination || '';
		}

		protected get addressText(): string {
			return this.ellipsisString(this.transactionsData?.transactionData?.destination || '');
		}

		protected get memo(): string {
			return this.transactionsData?.transactionData?.destinationTag || '';
		}

		protected get memoText(): string {
			return this.ellipsisString(this.transactionsData?.transactionData?.destinationTag || '');
		}

		protected get addressExplorerPath(): string {
			return this.transactionsData?.transactionData?.urlAddress || '';
		}

		protected get detailsText(): string {
			return this.transactionsData?.transactionData?.details || this.transactionsData?.details || '';
		}

		protected get commentText(): string {
			return this.transactionsData?.transactionData?.comment || '';
		}

		protected get isWithdrawal(): boolean {
			return (this.transactionsData?.side || 0) === OperationSide.Out;
		}

		public showModal(value: boolean): void {
			if (!value) {
				this.isDetailsEditing = false;
			}
			this.historyStore.showTransactionsIOModal(value);
		}

		public setDetails(value: string): void {
			console.log(value); // not ready on backend
		}

		protected ellipsisString(value: string): string {
			return ellipsisString({ value, ellipsisLength: 16, replacement: '***' });
		}

		protected get title(): string {
			return this.$t('balance.transactionsDepositModalTitle') + ' ' + (this.transactionsData?.id || 0);
		}

		protected repeat(): void {
			this.$emit('repeat', this.transactionsData);
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
				name: 'depositTitle',
				type: 'translation',
				defaultValue: 'balance.modalDepositEventTitle'
			},
			{
				name: 'withdrawalTitle',
				type: 'translation',
				defaultValue: 'balance.modalWithdrawalEventTitle'
			},
			{
				name: 'netTitle',
				type: 'translation',
				defaultValue: 'balance.modalNetTitle'
			},
			{
				name: 'confirmationTitle',
				type: 'translation',
				defaultValue: 'balance.modalConfirmationTitle'
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
				name: 'txIdTitle',
				type: 'translation',
				defaultValue: 'balance.modalTxIdTitle'
			},
			{
				name: 'addressTitle',
				type: 'translation',
				defaultValue: 'balance.modalAddressTitle'
			},
			{
				name: 'memoTitle',
				type: 'translation',
				defaultValue: 'balance.modalMemoTitle'
			},
			{
				name: 'detailsTitle',
				type: 'translation',
				defaultValue: 'balance.modalDetailsTitle'
			},
			{
				name: 'detailsTooltipText',
				type: 'translation',
				defaultValue: 'balance.modalDetailsTooltipText'
			},
			{
				name: 'detailsEmptyText',
				type: 'translation',
				defaultValue: 'balance.modalDetailsEmptyText'
			},
			{
				name: 'commentTitle',
				type: 'translation',
				defaultValue: 'balance.modalCommentTitle'
			},
			{
				name: 'commentTooltipText',
				type: 'translation',
				defaultValue: 'balance.modalCommentTooltipText'
			},
			{
				name: 'repeatTitle',
				type: 'translation',
				defaultValue: 'balance.modalRepeatTransaction'
			}
		];
	}
</script>
