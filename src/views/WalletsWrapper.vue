<template>
	<Widget name="balance-wallets-wrapper">
		<WidgetItem name="header">
			<HeaderView key="balance-wallets-header-main-key" />
		</WidgetItem>

		<WidgetItem v-show="shouldShowWallets" name="wallets">
			<Wallets
				:wallets="wallets"
				:staking="staking"
			/>
		</WidgetItem>

		<WidgetItem 
			v-show="shouldShowActions"
			name="actions"
		>
			<RouterView />
		</WidgetItem>

		<WidgetItem name="additional">
			<Widget name="balance-wallets-additional">
				<WidgetItem v-slot="{ computedAttrs }" name="amount">
					<KCard v-bind="computedAttrs" style="--sheet-outlined-border:1px solid var(--tertiary-lighten-5);">
						<Amount />
					</KCard>
				</WidgetItem>
				<WidgetItem v-slot="{ computedAttrs }" name="chart">
					<KCard v-bind="computedAttrs" style="--sheet-outlined-border:1px solid var(--tertiary-lighten-5);">
						<Chart />
					</KCard>
				</WidgetItem>
				<WidgetItem
					v-slot="{ computedAttrs }"
					name="history-last"
				>
					<KCard v-bind="computedAttrs" style="--sheet-outlined-border:1px solid var(--tertiary-lighten-5);">
						<HistoryLast />
					</KCard>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<TransactionsIOModal
			@repeat="repeatTransaction"
		/>
		<TransactionsStakingModal />
		<TransactionConversionModal />
		<TransactionsReferralModal />
		<TransactionsP2pModal />
		<ConfirmedModal />
		<ConfirmModal />
		<ConfirmOfferModal />
		<CancelDealModal />
		<CancelWithdrawalModal @cancel="setOperations" />
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component } from 'vue-property-decorator';
	import Amount from '@/views/ToDoViews/Amount.vue';
	import Chart from '@/views/ToDoViews/Chart.vue';
	import FormView from '@/views/ActionViews/FormView.vue';
	import HistoryLast from '@/views/HistoryLast.vue';
	import OftenFormer from '@/views/ToDoViews/OftenFormer.vue';
	import Samples from '@/views/ToDoViews/Samples.vue';
	import Wallets from '@/views/Wallets.vue';
	import HeaderView from '@/views/HeaderView.vue';

	import TransactionsIOModal from '@/components/HistoryTable/Transactions/TransactionsIOModal.vue';
	import TransactionConversionModal from '@/components/HistoryTable/Transactions/TransactionConversionModal.vue';
	import TransactionsStakingModal from '@/components/HistoryTable/Transactions/TransactionsStakingModal.vue';
	import TransactionsReferralModal from '@/components/HistoryTable/Transactions/TransactionsReferralModal.vue';
	import TransactionsP2pModal from '@/components/HistoryTable/Transactions/TransactionsP2pModal.vue';
	import CancelWithdrawalModal from '@/views/ModalViews/CancelWithdrawalModal.vue';
	import ConfirmedModal from '@/views/ModalViews/ConfirmedModal.vue';
	import ConfirmModal from '@/views/ModalViews/ConfirmModal.vue';
	import ConfirmOfferModal from '@/views/ModalViews/ConfirmOfferModal.vue';
	import CancelDealModal from '@/views/ModalViews/CancelDealModal.vue';

	import MyRootStore from '@/store/store';
	import { RouteName } from '@/const';

	@Component({
		name: 'wallets-wrapper',
		components: {
			HeaderView,
			Amount,
			Chart,
			FormView,
			HistoryLast,
			OftenFormer,
			Samples,
			Wallets,
			TransactionsIOModal,
			TransactionConversionModal,
			TransactionsStakingModal,
			TransactionsReferralModal,
			TransactionsP2pModal,
			CancelWithdrawalModal,
			ConfirmedModal,
			ConfirmModal,
			ConfirmOfferModal,
			CancelDealModal
		}
	})
	export default class WalletsWrapper extends Vue {
		protected appRootStore = MyRootStore.getInstance();
		protected walletsStore = MyRootStore.getInstance().wallets;
		protected historyStore = MyRootStore.getInstance().history;

		protected get wallets(): WALLETS.WalletList {
			return this.walletsStore.wallets;
		}

		protected get staking(): WALLETS.WalletList {
			return this.walletsStore.getStaking;
		}

		protected get currentRouteIsActiveForm(): boolean {
			return this.$route.matched.some(
				({ name }) =>
					name &&
					[
						RouteName.BalanceCurrency,
						RouteName.BalanceActiveForm,
						RouteName.BalanceGetForm,
						RouteName.BalanceBuyForm,
						RouteName.BalanceTransferForm,
						RouteName.BalanceSellForm,
						RouteName.BalanceExchangeForm,
						RouteName.BalanceBuyFormFourthStep,
						RouteName.BalanceSellFormThirdStep,
						RouteName.BalanceBuyFormThirdStep,
						RouteName.BalanceBuyFormFourthStep,
						RouteName.BalanceSellFormFourthStep,
						RouteName.BalanceFormDoAction,
						RouteName.BalanceFormProcess,
						RouteName.BalanceFormSuccess,
						RouteName.BalanceFormFail
					].includes(name)
			);
		}

		protected get shouldShowActions(): boolean {
			return !this.appRootStore.isScreenSizeLessMD || this.currentRouteIsActiveForm;
		}

		protected get shouldShowWallets(): boolean {
			return !this.appRootStore.isScreenSizeLessMD || !this.currentRouteIsActiveForm;
		}

		protected async repeatTransaction(item: HISTORY.Transaction): Promise<void> {
			this.walletsStore.setRepeatTransactionData(item);
			this.historyStore.showTransactionsIOModal(false);
		}

		public setOperations(): void {
			this.historyStore.setOperations();
		}
	}
</script>
