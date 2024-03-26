<template>
	<Widget name="balance-wallets-additional-history-operations-small-table-detailed">
		<template v-for="operationDate in lastOperationsDate">
			<WidgetItem
				v-slot="{ computedAttrs }"
				:key="operationDate + 'date'"
				name="date"
			>
				<KText
					v-bind="computedAttrs"
				>
					{{ operationDate }}
				</KText>
			</WidgetItem>
			<WidgetItem :key="operationDate + 'items'" name="items">
				<div
					v-for="(operation, index) in getLastOperationsDate(operationDate)"
					:key="operation.orderId + index"
					@click="showTransactionsModal(operation)"
				>
					<HistorySmallTableDetailedIRow
						:operation="operation"
						:operationDate="operationDate"
					/>
				</div>
			</WidgetItem>
		</template>
	</Widget>
</template>

<script lang="ts">
	import { Component } from 'vue-property-decorator';
	import { mixins } from 'vue-class-component';
	import HistorySmallTable from '@/mixins/history/historySmallTable';
	import HistorySmallTableDetailedIRow from '@/components/HistoryTable/HistorySmallTable/HistorySmallTableDetailedIRow.vue';

	@Component({
		components: { HistorySmallTableDetailedIRow }
	})
	export default class HistorySmallTableDetailed extends mixins(HistorySmallTable) {
		protected getLastOperationsDate(operationDate: string): HISTORY.Transaction[] {
			return this.lastOperations.filter(
				(operation: HISTORY.Transaction) =>
					this.getDateWithDay(operation.dateCreated) === operationDate && operation?.frozen !== true
			);
		}
	}
</script>

<style scoped></style>
