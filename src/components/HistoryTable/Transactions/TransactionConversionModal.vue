<template>
	<InfoModal
		:value="isModal"
		:titleModal="title"
		@input="showModal"
	>
		<template #body-2>
			<Widget name="balance-transactions-conversion-modal">
				<WidgetItem name="currency">
					<Currency
						:currencyId="currencyId"
						:side="side"
					/>
				</WidgetItem>
				<WidgetItem name="date">
					<DateBlock :date="dateCreated" />
				</WidgetItem>
				<WidgetItem
					v-slot="{ eventTitle, conversionTitle }"
					name="event"
					:contentVariables="variables"
				>
					<TextBlock
						:title="eventTitle"
						:text="conversionTitle"
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
				<WidgetItem name="conversionDirection">
					<Widget name="balance-transactions-conversion-direction">
						<WidgetItem v-slot="{ computedAttrs }" name="title">
							<KText v-bind="computedAttrs" />
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="from-icon">
							<KIcon v-bind="computedAttrs" :name="fromCurrencyIconName" />
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="to-icon">
							<KIcon v-bind="computedAttrs" :name="resultCurrencyIconName" />
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="event">
							<KText v-bind="computedAttrs" />
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="currency-pair">
							<KText v-bind="computedAttrs" :title="pairText" />
						</WidgetItem>
					</Widget>
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
	import DateBlock from '@/components/ModalComponents/DateBlock.vue';
	import CurrencyChangeBlock from '@/components/ModalComponents/CurrencyChangeBlock.vue';
	import TextBlock from '@/components/ModalComponents/TextBlock.vue';
	import { OperationSide } from '@/const';
	import { ellipsisString } from '@/utils/utils';

	@Component({
		name: 'TransactionConversionModal',
		components: {
			InfoModal,
			Currency,
			DateBlock,
			CurrencyChangeBlock,
			TextBlock
		}
	})
	export default class TransactionConversionModal extends Vue {
		protected historyStore = MyRootStore.getInstance().history;
		protected walletsStore = MyRootStore.getInstance().wallets;

		protected get isModal(): boolean {
			return this.historyStore.isTransactionsConversionModal;
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

		protected get dateCreated(): string {
			return this.transactionsData?.dateCreated || '';
		}

		protected get fee(): number {
			return Math.abs(this.transactionsData?.fee || 0);
		}

		protected get amount(): number | string {
			return this.historyStore.getAmountTransaction(this.transactionsData);
		}

		protected get amountChange(): number | string {
			return this.historyStore.getAmountTransactionChange(this.transactionsData);
		}

		public showModal(value: boolean): void {
			this.historyStore.showTransactionsConversionModal(value);
		}

		protected get fromCurrencyId(): number {
			return this.transactionsData?.convertData?.fromCurrencyId || 0;
		}

		protected get resultCurrencyId(): number {
			return this.transactionsData?.convertData?.resultCurrencyId || 0;
		}

		protected get fromCurrencyTitle(): string {
			return this.walletsStore.currencyTitleById(this.fromCurrencyId);
		}

		protected get resultCurrencyTitle(): string {
			return this.walletsStore.currencyTitleById(this.resultCurrencyId);
		}

		protected get fromCurrencyIconName(): string {
			return this.walletsStore.currencyIconNameById(this.fromCurrencyId);
		}

		protected get resultCurrencyIconName(): string {
			return this.walletsStore.currencyIconNameById(this.resultCurrencyId);
		}

		protected get pairText(): string {
			return `${this.fromCurrencyTitle} ${this.$t('p2pTo')} ${this.resultCurrencyTitle}`;
		}

		protected ellipsisString(value: string): string {
			return ellipsisString({ value, ellipsisLength: 16, replacement: '***' });
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
				name: 'conversionTitle',
				type: 'translation',
				defaultValue: 'balance.autoConversion'
			},
			{
				name: 'netTitle',
				type: 'translation',
				defaultValue: 'balance.modalNetTitle'
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
				name: 'commentTooltipText',
				type: 'translation',
				defaultValue: 'balance.modalCommentTooltipText'
			}
		];
	}
</script>
