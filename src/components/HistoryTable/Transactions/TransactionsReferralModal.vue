<template>
	<InfoModal
		:value="isModal"
		:titleModal="title"
		@input="showModal"
	>
		<template #body-2>
			<Widget name="balance-transactions-referral-modal">
				<WidgetItem name="currency">
					<Currency
						:currencyId="currencyId"
					/>
				</WidgetItem>
				<WidgetItem v-if="status" name="status">
					<TransactionStatusComponent
						:status="status"
					/>
				</WidgetItem>
				<WidgetItem name="date">
					<DateBlock :date="dateCreated" />
				</WidgetItem>
				<WidgetItem
					v-slot="{ eventTitle, referralTitle }"
					name="event"
					:contentVariables="variables"
				>
					<TextBlock
						:title="eventTitle"
						:text="referralTitle"
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
	import DateBlock from '@/components/ModalComponents/DateBlock.vue';
	import CurrencyChangeBlock from '@/components/ModalComponents/CurrencyChangeBlock.vue';
	import TransactionStatusComponent from '@/components/ModalComponents/TransactionStatus.vue';
	import TextBlock from '@/components/ModalComponents/TextBlock.vue';
	import { OperationType } from '@/const';

	@Component({
		name: 'TransactionsReferralModal',
		components: {
			InfoModal,
			Currency,
			DateBlock,
			CurrencyChangeBlock,
			TextBlock,
			TransactionStatusComponent
		}
	})
	export default class TransactionsReferralModal extends Vue {
		protected historyStore = MyRootStore.getInstance().history;

		protected get isModal(): boolean {
			return this.historyStore.isTransactionsReferralModal;
		}

		protected get transactionsData(): HISTORY.Transaction | undefined {
			return this.historyStore.transactionsModalData;
		}

		protected get currencyId(): number {
			return this.transactionsData?.currencyId || 0;
		}

		protected get dateCreated(): string {
			return this.transactionsData?.dateCreated || '';
		}

		protected get amount(): number {
			return this.transactionsData?.amount || 0;
		}

		protected get fee(): number {
			return Math.abs(this.transactionsData?.fee || 0);
		}

		protected get amountChange(): number {
			return (this.transactionsData?.amount || 0) - Math.abs(this.transactionsData?.fee || 0);
		}

		public showModal(value: boolean): void {
			this.historyStore.showTransactionsReferralModal(value);
		}

		protected get title(): string {
			return this.$t('balance.transactionsDepositModalTitle') + ' ' + (this.transactionsData?.id || 0);
		}

		protected get isReferral(): boolean {
			return this.transactionsData?.operationType === OperationType.Referral && !!this.referralOperationType;
		}

		protected get referralOperationType(): number | undefined {
			return this.transactionsData?.referralOperation?.type;
		}

		protected get status(): number | undefined {
			return this.isReferral ? this.referralOperationType : this.transactionsData?.transactionData?.transactionStatus;
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
				name: 'referralTitle',
				type: 'translation',
				defaultValue: 'balance.modalReferralEventTitle'
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
			}
		];
	}
</script>
