<template>
	<WidgetItem
		name="small-table-default"
	>
		<div
			v-for="operation in lastOperations"
			:key="operation.id + '-' + operation.operationType + '-' + operation.currencyId"
			@click="showTransactionsModal(operation)"
		>
			<Widget name="balance-wallets-additional-history-item">
				<WidgetItem
					v-slot="{ computedAttrs, iconSize }"
					:contentVariables="iconVariables"
					name="icon"
				>
					<KIcon
						v-bind="computedAttrs"
						:name="getOperationIcon(operation)"
						:size="iconSize"
					/>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="time">
					<KText v-bind="computedAttrs">
						{{ getTime(operation.dateCreated) }}
					</KText>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="date">
					<KText v-bind="computedAttrs">
						{{ getDate(operation.dateCreated) }}
					</KText>
				</WidgetItem>

				<WidgetItem
					v-slot="{ computedAttrs, plus, min, noShow }"
					:contentVariables="colorsAmountVar"
					name="amount"
				>
					<KText
						v-bind="computedAttrs"
						:style="{ color: showBalance ? operation.side ? min : plus : noShow }"
					>
						{{ showBalance ? getFormattedAmount(operation) : '*****' }}
					</KText>
				</WidgetItem>

				<WidgetItem
					v-slot="{ computedAttrs, plus, min, noShow }"
					name="currency"
					:contentVariables="colorsAmountVar"
				>
					<KText
						v-bind="computedAttrs"
						:style="{ color: showBalance ? operation.side ? min : plus : noShow }"
					>
						{{ operation.currencyTitle }}
					</KText>
				</WidgetItem>
			</Widget>
		</div>
	</WidgetItem>
</template>

<script lang="ts">
	import { Component } from 'vue-property-decorator';
	import { mixins } from 'vue-class-component';
	import HistorySmallTable from '@/mixins/history/historySmallTable';

	@Component({})
	export default class HistorySmallTableDefault extends mixins(HistorySmallTable) {}
</script>

<style scoped></style>
