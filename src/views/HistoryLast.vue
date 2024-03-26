<template>
	<Widget name="balance-wallets-additional-history">
		<WidgetItem v-slot="{ computedAttrs }" name="title">
			<KText v-bind="computedAttrs">
				{{ lastTransactionsText }}
			</KText>
		</WidgetItem>

		<WidgetItem name="last-operation">
			<Widget name="balance-wallets-additional-history-operations">
				<WidgetItem
					v-if="dealsInProcessLoading && !(lastOperationsInProcess && lastOperationsInProcess.length)"
					key="balance-wallets-additional-history-operations-list-loader-2"
					name="list-loader-2"
				>
					<KSkeletonLoader
						class="k-skeleton-loader-simple-text"
						minWidth="100"
						style="height: 22px; margin-top: 4px"
						type="text"
					/>
					<KSkeletonLoader
						class="k-skeleton-loader-heading-primary"
						minWidth="100%"
						style="margin: 6px 0 24px"
						type="heading"
					/>
					<KSkeletonLoader
						class="k-skeleton-loader-heading-primary"
						minWidth="100%"
						style="margin: 6px 0 24px"
						type="heading"
					/>
					<KSkeletonLoader
						class="k-skeleton-loader-simple-text"
						minWidth="100"
						style="height: 22px;"
						type="text"
					/>
					<KSkeletonLoader
						class="k-skeleton-loader-heading-primary"
						minWidth="100%"
						style="margin: 6px 0 24px"
						type="heading"
					/>
					<KSkeletonLoader
						class="k-skeleton-loader-simple-text"
						minWidth="100"
						style="height: 22px;"
						type="text"
					/>
				</WidgetItem>

				<template v-if="!dealsInProcessLoading && lastOperationsInProcess && lastOperationsInProcess.length">
					<WidgetItem
						key="deals-in-process-title"
						v-slot="{ computedAttrs }"
						name="deals-in-process-title"
					>
						<KText v-bind="computedAttrs" />
					</WidgetItem>

					<WidgetItem
						key="deals-in-process-table"
						v-slot="{ nameSmallTableInProcess }"
						name="deals-in-process-table"
						:contentVariables="choseSmallTable"
					>
						<HistorySmallTable :nameSmallTable="nameSmallTableInProcess" />
					</WidgetItem>
				</template>

				<WidgetItem
					v-if="operationsLoading && !(lastOperations && lastOperations.length)"
					key="balance-wallets-additional-history-operations-list-loader"
					name="list-loader"
				>
					<KSkeletonLoader
						class="k-skeleton-loader-heading-primary"
						minWidth="100%"
						style="margin: 6px 0 24px"
						type="heading"
					/>
					<KSkeletonLoader
						class="k-skeleton-loader-heading-primary"
						minWidth="100%"
						style="margin: 6px 0 24px"
						type="heading"
					/>
					<KSkeletonLoader
						class="k-skeleton-loader-simple-text"
						minWidth="100"
						style="height: 22px;"
						type="text"
					/>
					<KSkeletonLoader
						class="k-skeleton-loader-heading-primary"
						minWidth="100%"
						style="margin: 6px 0 24px"
						type="heading"
					/>
					<KSkeletonLoader
						class="k-skeleton-loader-heading-primary"
						minWidth="100%"
						style="margin: 6px 0 24px"
						type="heading"
					/>
					<KSkeletonLoader
						class="k-skeleton-loader-heading-primary"
						minWidth="100%"
						style="margin: 6px 0 24px"
						type="heading"
					/>
				</WidgetItem>

				<template v-else-if="!operationsLoading && lastOperations && lastOperations.length">
					<WidgetItem v-slot="{ computedAttrs }" name="last-operations-title">
						<KText v-bind="computedAttrs" />
					</WidgetItem>

					<WidgetItem
						v-slot="{ nameSmallTable }"
						name="small-table"
						:contentVariables="choseSmallTable"
					>
						<HistorySmallTable :nameSmallTable="nameSmallTable" />
					</WidgetItem>
				</template>

				<template v-else>
					<WidgetItem name="empty-last-operations">
						<Widget name="balance-wallets-additional-history-emty">
							<WidgetItem v-slot="{ computedAttrs, name }" name="icon">
								<KIcon
									v-bind="computedAttrs"
									:name="name"
									size="48"
								/>
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs, title }" name="title">
								<KText v-bind="computedAttrs">
									{{ title }}
								</KText>
							</WidgetItem>
						</Widget>
					</WidgetItem>
				</template>
			</Widget>
		</WidgetItem>

		<WidgetItem
			v-if="!operationsLoading"
			key="balance-wallets-history-go-to-history"
			v-slot="{ computedAttrs, title }"
			name="go-history"
		>
			<KBtn
				v-bind="computedAttrs"
				:title="title"
				prependInnerIcon="update--colorable"
				style="color:var(--primary-lighten)"
				:to="{ name: 'balance-historyType', params: { historyType: 'transactions'} }"
			>
				<Widget name="balance-wallets-additional-history-btn-text">
					<WidgetItem v-slot="{ computedAttrs }" name="text">
						<KText v-bind="computedAttrs" />
					</WidgetItem>
				</Widget>
			</KBtn>
		</WidgetItem>

		<WidgetItem
			v-if="!operationsLoading"
			key="balance-wallets-history-go-to-history-no-prepend-icon"
			v-slot="{ computedAttrs, title }"
			name="go-history-no-prepend-icon"
		>
			<KBtn
				v-bind="computedAttrs"
				:title="title"
				style="color:var(--primary-lighten)"
				:to="{ name: 'balance-historyType', params: { historyType: 'transactions'} }"
			>
				<Widget name="balance-wallets-additional-history-btn-text">
					<WidgetItem v-slot="{ computedAttrs }" name="text">
						<KText v-bind="computedAttrs" />
					</WidgetItem>
				</Widget>
			</KBtn>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component } from 'vue-property-decorator';
	import MyRootStore from '@/store/store';
	import HistorySmallTable from '@/components/HistoryTable/HistorySmallTable/HistorySmallTable.vue';

	@Component({
		components: { HistorySmallTable }
	})
	export default class HistoryLast extends Vue {
		protected historyStore = MyRootStore.getInstance().history;
		protected walletsStore = MyRootStore.getInstance().wallets;

		protected get lastOperationsInProcess(): any {
			return this.historyStore.lastOperationsInProcess;
		}

		protected get dealsInProcessLoading(): any {
			return this.historyStore.dealsInProcessLoading;
		}

		protected get lastOperations(): any {
			return this.historyStore.lastOperations;
		}

		protected get operationsLoading(): any {
			return this.historyStore.lastOperationsLoading;
		}

		protected get lastTransactionsText(): string {
			return this.$t('balance.lastTransactions');
		}

		protected async created(): Promise<void> {
			this.historyStore.setLastOperations();
			this.historyStore.getMyDealsInProcess();
		}

		protected goToHistory(): void {
			this.walletsStore.goToHistory();
		}

		protected choseSmallTable = [
			{
				name: 'nameSmallTable',
				type: 'string',
				defaultValue: 'default'
			},
			{
				name: 'nameSmallTableInProcess',
				type: 'string',
				defaultValue: 'in-process'
			}
		];
	}
</script>
