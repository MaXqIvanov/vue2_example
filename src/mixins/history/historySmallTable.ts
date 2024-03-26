import Component, { mixins } from 'vue-class-component';
import MyRootStore from '@/store/store';
import FormatNumberDecimals from '@/mixins/formatNumberDecimals';
import { TransactionStatus } from '@/const';
@Component
export default class HistorySmallTable extends mixins(FormatNumberDecimals) {
	protected historyStore = MyRootStore.getInstance().history;
	protected walletsStore = MyRootStore.getInstance().wallets;

	protected get currentLocale(): string {
		return this.$store.state.translator.currentLocale;
	}

	protected get lastOperationsInProcess(): HISTORY.Transaction[] {
		return this.historyStore.lastOperationsInProcess;
	}

	protected get lastOperationsInProcessDate(): string[] {
		const lastOperationsDateAll = this.lastOperationsInProcess.map((operation: any) =>
			this.getDateWithDay(operation.dateCreated)
		);
		return [...new Set(lastOperationsDateAll)];
	}

	protected get lastOperations(): HISTORY.Transaction[] {
		if (this.walletsStore.seamlessStepsEnabled) {
			return this.historyStore.lastOperations.filter(
				(item: HISTORY.Transaction) =>
					item.transactionData?.transactionStatus !== TransactionStatus.awaitingUserConfirmation
			);
		}
		return this.historyStore.lastOperations;
	}

	protected get lastOperationsDate(): string[] {
		const lastOperationsDateAll = this.lastOperations.map((operation: HISTORY.Transaction) =>
			this.getDateWithDay(operation.dateCreated)
		);
		return [...new Set(lastOperationsDateAll)];
	}

	protected showTransactionsModal(item: HISTORY.Transaction): void {
		this.historyStore.showTransactionsModal(item);
	}

	protected get showBalance(): boolean {
		return this.$store.state.sharedData.showBalance;
	}

	protected getDate(val: string): string {
		return new Intl.DateTimeFormat(this.currentLocale, {
			year: '2-digit',
			month: 'numeric',
			day: 'numeric'
		}).format(new Date(val));
	}

	protected getDateWithDay(val: string): string {
		if (val === undefined) return '';
		const date = this.getDate(val);
		const today = String(new Date());
		const dateToday = this.getDate(today);
		const yesterday = String(new Date(Date.now() - 24 * 3600 * 1000));
		const dateYesterday = this.getDate(yesterday);
		return date === dateToday ? this.$t('balance.today') : date === dateYesterday ? this.$t('balance.yesterday') : date;
	}

	protected getTime(val: string): string {
		return new Intl.DateTimeFormat(this.currentLocale, {
			hour: 'numeric',
			minute: 'numeric'
		}).format(new Date(val));
	}

	protected getOperationIcon(operation: HISTORY.Transaction): string {
		if (operation.operationType === 2) {
			return `balance.transaction-type-${operation.transactionData?.transactionType ?? 0}`;
		}

		return `balance.operation-type-${operation.operationType}`;
	}

	protected getFormattedAmount(val: HISTORY.Transaction): string {
		const intermediate = `${val.side ? '-' : '+'}${this.getFormatNumberAndFixedDecimals(
			val.amount,
			val.currencyTitle
		)}`;
		if (intermediate.length > 11) {
			return intermediate.slice(0, 11).concat('…');
		}
		return intermediate;
	}

	protected getAmount(item: HISTORY.Transaction | undefined): number | string {
		return this.historyStore.getAmountTransaction(item);
	}

	protected readonly colorsAmountVar = [
		{ name: 'min', type: 'string', defaultValue: 'var(--status-error-darken)' },
		{ name: 'plus', type: 'string', defaultValue: 'var(--status-success-darken)' },
		{ name: 'noShow', type: 'string', defaultValue: 'var(--tertiary-darken-2)' }
	];

	protected iconVariables = [{ name: 'iconSize', type: 'string', defaultValue: '12' }];
}
