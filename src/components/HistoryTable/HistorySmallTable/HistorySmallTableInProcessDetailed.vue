<template>
	<Widget name="balance-wallets-additional-history-operations-small-table-detailed">
		<template v-for="operationDate in lastOperationsInProcessDate">
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
			<WidgetItem :key="operationDate + 'items + in-process'" name="items">
				<template v-for="(operation, index) in getLastOperationsDate(operationDate)">
					<div
						v-if="operation.inProcessType === 'p2p'"
						:key="operation.id + index + 'p2p'"
						@click="pushTradeRoute(operation)"
					>
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
									:value="getAmountInProcess(operation)"
									:currencyId="getCurrencyIdInProcess(operation)"
									:hasSign="true"
									:classText="textClass"
								/>
								<KText v-else>
									{{ $t('balance.textHideBalance') }}
								</KText>
							</WidgetItem>

							<TradesStatusComponent :status="operation.status" />

							<WidgetItem
								v-if="false"
								v-slot="{ computedAttrs }"
								name="comment"
							>
								<KText
									v-bind="computedAttrs"
								>
									\\ <!-- {{ comment }} -->
								</KText>
							</WidgetItem>
						</Widget>
					</div>

					<div
						v-else
						:key="operation.id + index + 'operation'"
						@click="showTransactionsModal(operation)"
					>
						<HistorySmallTableDetailedIRow
							:operation="operation"
							:operationDate="operationDate"
						/>
					</div>
				</template>
			</WidgetItem>
		</template>
	</Widget>
</template>

<script lang="ts">
	import { Component } from 'vue-property-decorator';
	import { mixins } from 'vue-class-component';
	import { convertExponentialToDecimal } from '@/utils/utils';
	import HistorySmallTable from '@/mixins/history/historySmallTable';
	import HistorySmallTableDetailedIRow from '@/components/HistoryTable/HistorySmallTable/HistorySmallTableDetailedIRow.vue';
	import TransactionStatusComponent from '@/components/ModalComponents/TransactionStatus.vue';
	import CurrencyChangeBlock from '@/components/ModalComponents/CurrencyChangeBlock.vue';
	import { FlowType, FormType } from '@/const';
	import TradesStatusComponent from '@/components/BaseComponents/StatusComponents/TradesStatusComponent.vue';

	@Component({
		components: {
			HistorySmallTableDetailedIRow,
			TransactionStatusComponent,
			CurrencyChangeBlock,
			TradesStatusComponent
		}
	})
	export default class HistorySmallTableInProcessDetailed extends mixins(HistorySmallTable) {
		protected getLastOperationsDate(operationDate: string): HISTORY.Transaction[] {
			return this.lastOperationsInProcess.filter(
				(operation: HISTORY.Transaction) => this.getDateWithDay(operation.dateCreated) === operationDate
			);
		}

		protected pushTradeRoute(operation: any): void {
			const notSwap =
				operation.sellerCurrency?.type !== 'Cryptocurrency' || operation.buyerCurrency?.type !== 'Cryptocurrency';
			if (
				notSwap &&
				!operation?.paymentMethod?.pathName &&
				operation?.paymentMethod?.id &&
				this.walletsStore.paymentMethodsMap.size
			) {
				const method = this.walletsStore.paymentMethodsMap.get(operation.paymentMethod.id);
				operation.paymentMethod = {
					...operation.paymentMethod,
					...method
				};
			}

			this.walletsStore.tradeRecord = {
				...this.walletsStore.tradeRecord,
				[operation.id]: {
					...(this.walletsStore.tradeRecord[operation.id] || {}),
					...operation
				}
			};

			this.walletsStore.findAndExecSetActiveWallet(operation.sellerCurrency.title);
			const currentUserIsBuyer = this.walletsStore.getAuthenticatedUserName === operation.cryptoBuyer?.username;
			this.walletsStore.setActiveForm(currentUserIsBuyer ? FormType.DEPOSIT : FormType.WITHDRAWAL);
			const isSwapFlow = operation.buyerCurrency?.type === 'Cryptocurrency';
			this.walletsStore.setActiveFlow(isSwapFlow ? FlowType.SWAP : currentUserIsBuyer ? FlowType.BUY : FlowType.SELL);

			const secondCurrencyDoAction = this.walletsStore.sharedDataCurrencies.find(
				(item) => item.title === operation.buyerCurrency.title
			);
			if (secondCurrencyDoAction) {
				this.walletsStore.computedFiatSecondCurrency = secondCurrencyDoAction;
				this.walletsStore.secondCurrencyStepFlow = secondCurrencyDoAction;
			}

			this.walletsStore.activePaymentProvider = 'p2p';

			const desiredRouteName =
				currentUserIsBuyer && operation.status === 'FiatSent'
					? 'balance-form-process'
					: this.walletsStore.seamlessRouteNameByTradeStatus.get(operation.status);

			const params = {
				name: desiredRouteName,
				params: {
					currency: operation.sellerCurrency.title,
					activeForm: currentUserIsBuyer ? FormType.DEPOSIT : FormType.WITHDRAWAL,
					flowType: isSwapFlow ? FlowType.SWAP : currentUserIsBuyer ? FlowType.BUY : FlowType.SELL,
					secondCurrency: operation.buyerCurrency.title,
					paymentMethod: !operation.paymentMethod.pathName
						? operation?.paymentMethod.name
						: this.walletsStore.paymentMethodsMap.get(operation.paymentMethod.id)?.pathName ||
						  operation?.paymentMethod.name ||
						  'default',
					paymentProvider: 'p2p',
					transactionId: operation.id
				}
			};

			const possibleRoute = this.$router.resolve(params);
			if (possibleRoute.route.fullPath !== this.$router.currentRoute.fullPath) {
				this.$router.push(params);
			}

			if ((isSwapFlow || !currentUserIsBuyer) && operation.status === 'MFASent') {
				this.walletsStore.lastTradeData = operation;
				this.walletsStore.lastTradeId = operation.id;
				this.walletsStore.setConfirmWithdrawalOfferModal(true);
				return;
			}
		}

		protected getAmountInProcess(operation: any): number {
			const currentUserIsBuyer = this.walletsStore.getAuthenticatedUserName === operation.cryptoBuyer?.username;
			const amount = Number(convertExponentialToDecimal(operation.cryptoSellerAmount));

			return currentUserIsBuyer ? amount : -amount;
		}

		protected getCurrencyIdInProcess(operation: any): number {
			return operation.sellerCurrency?.id;
		}

		protected get operationType(): string {
			return this.$t(`balance.operationType-4`);
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
