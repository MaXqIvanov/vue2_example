<template>
	<Widget
		name="balance-wallets-additional-history-operations-small-table-detailed-item"
	>
		<WidgetItem
			v-slot="{ computedAttrs, iconSize }"
			:contentVariables="iconVariables"
			name="icon"
			style="justify-content: center; align-items: center"
		>
			<KIcon
				v-bind="computedAttrs"
				:name="getOperationIcon(operation)"
				:size="iconSize"
			/>
		</WidgetItem>

		<WidgetItem
			v-slot="{ computedAttrs }"
			name="type"
		>
			<KText
				v-bind="computedAttrs"
			>
				{{ operationType }}
			</KText>
		</WidgetItem>

		<WidgetItem
			v-slot="{ textClass }"
			name="amount"
			:contentVariables="textClassVariables"
		>
			<CurrencyChangeBlock
				v-if="showBalance"
				:value="amount"
				:currencyId="operation.currencyId"
				:hasSign="true"
				:classText="textClass"
			/>
			<KText v-else>
				{{ $t('balance.textHideBalance') }}
			</KText>
		</WidgetItem>

		<WidgetItem
			v-if="status"
			name="status"
		>
			<TransactionStatusComponent
				nameWidget="balance-wallets-additional-history-operations-small-table-detailed-item-status"
				:status="status"
			/>
		</WidgetItem>

		<WidgetItem
			v-if="comment"
			v-slot="{ computedAttrs }"
			name="comment"
		>
			<KText
				v-bind="computedAttrs"
			>
				{{ comment }}
			</KText>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import { Component, Prop } from 'vue-property-decorator';
	import { mixins } from 'vue-class-component';
	import HistorySmallTable from '@/mixins/history/historySmallTable';
	import { OperationSide, OperationType, TransactionStatus } from '@/const';
	import TransactionStatusComponent from '@/components/ModalComponents/TransactionStatus.vue';
	import CurrencyChangeBlock from '@/components/ModalComponents/CurrencyChangeBlock.vue';

	@Component({
		components: { CurrencyChangeBlock, TransactionStatusComponent }
	})
	export default class HistorySmallTableDetailedIRow extends mixins(HistorySmallTable) {
		@Prop({ required: true }) operation!: HISTORY.Transaction;
		@Prop({ required: true }) operationDate!: string;

		protected get textTransaction(): string {
			return this.operation.side === OperationSide.In
				? this.$t(`balance.modalDepositEventTitle`)
				: this.$t(`balance.withdrawalOfFunds`);
		}

		protected get operationType(): string {
			return this.operation.operationType === OperationType.Transaction
				? this.textTransaction
				: this.$t(`balance.operationType-${this.operation.operationType}`);
		}

		protected get status(): TransactionStatus {
			return this.operation?.transactionData?.transactionStatus;
		}

		protected get comment(): string {
			return this.operation?.transactionData?.details;
		}

		protected get amount(): number | string {
			return this.getAmount(this.operation);
		}

		protected textClassVariables = [
			{
				name: 'textClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-2-regular k-text-default'
			}
		];
	}
</script>

<style scoped></style>
