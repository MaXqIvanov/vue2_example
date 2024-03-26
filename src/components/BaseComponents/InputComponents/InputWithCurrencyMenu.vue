<!-- 
    Данный компонент представляет собой text-field с возможностью установить валюту эквивалент и получить эквивалент для выбранного значения
 -->
<template>
	<WidgetItem
		v-slot="{ computedAttrs }"
		:key="keyWidget"
		:name="nameWidget"
		style="position:relative"
	>
		<KMenu
			v-model="menuBuyGiveStatusComputed"
			v-bind="computedAttrs"
			offsetY
			:closeOnContentClick="false"
			attach=""
			nudgeBottom="1"
			rounded="lg"
			minWidth="100%"
		>
			<template #activator="{ attrs }">
				<FormAmount
					key="balance-actions-seamless-buy-give-amount"
					v-model="depositAmountValue"
					:useAdditionalAppend="true"
					:amountTitle="amountTitle"
					:amountLabel="amountLabel"
					:currencyTitle="computedEquivalentCurrency ? computedEquivalentCurrency.title : ''"
					:errorMessages="errorMessages"
					backgroundColor="var(--card-bg-secondary)"
					:maxLimitText="maxLimitText"
					:minLimitText="minLimitText"
					:availableFunds="availableFundsWithdrawal"
					:maxLimit="maxLimit"
					:minLimit="minLimit"
					:equivalentCurrencyValue="equivalentCurrencyValue"
					:equivalentCurrencyTitle="equivalentCurrencyTitle"
					@handleCheckBlur="amountBlur"
					@amountChange="amountChangeHandler"
					@deposit="deposit"
				>
					<template #additional-append>
						<div
							v-bind="attrs"
							@click="menuBuyGiveStatusComputed = true"
						>
							<Widget name="balance-actions-amount-append-menu-activator">
								<WidgetItem v-slot="{ computedAttrs }" name="icon">
									<KIcon
										v-bind="computedAttrs"
										:name="getIconName(computedEquivalentCurrency)"
									/>
								</WidgetItem>

								<WidgetItem v-slot="{ computedAttrs }" name="title">
									<KText v-bind="computedAttrs">
										{{ activeWallet ? computedEquivalentCurrency.title : '' }}
									</KText>
								</WidgetItem>

								<WidgetItem v-slot="{ computedAttrs }" name="expand-icon">
									<KIcon
										v-bind="computedAttrs"
										:style="menuBuyGiveStatus
											? style='transform: rotate(180deg); color: var(--primary-lighten)'
											: ''"
									/>
								</WidgetItem>
							</Widget>
						</div>
					</template>
				</FormAmount>
			</template>

			<Widget name="balance-actions-amount-append-menu-list">
				<WidgetItem name="previously-used">
					// previously used widget
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="search">
					<KTextField
						v-model="menuBuyGiveSearch"
						v-bind="computedAttrs"
						autofocus
						@input="setMenuBuyGiveSearch"
					/>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs" />
				</WidgetItem>

				<WidgetItem
					v-if="filterTags.length > 1"
					key="amount-append-menu-chip-group"
					v-slot="{ computedAttrs, chipClass, chipActiveClass }"
					name="chip-group"
					:contentVariables="equivalentMenuVariables"
				>
					<KChipGroup
						v-model="filterCurrencies"
						:showArrows="false"
						:mandatory="false"
						v-bind="computedAttrs"
					>
						<KChip
							v-for="tab in filterTags"
							:key="tab.value + '-chip-tag'"
							outlined
							:value="tab.value"
							:class="{[chipClass]: filterCurrencies != tab.value, [chipActiveClass]: filterCurrencies == tab.value}"
						>
							{{ tab.title }}
						</KChip>
					</KChipGroup>
				</WidgetItem>

				<WidgetItem
					v-if="menuBuyGiveCurrencies.length"
					v-slot="{ computedAttrs }"
					name="list"
				>
					<KList
						v-bind="computedAttrs"
						style="--list-background-color: transparent"
					>
						<KListItemGroup
							ref="list-group"
							style="overflowY: auto; maxHeight: 300px"
							@scroll.native="scrollHandler"
						>
							<KListItem
								v-for="(item, key) in displayArray"
								:key="key + 'append-menu-list-item'"
								dense
								@click="setEquivalentCurrency(item)"
							>
								<KListItemContent>
									<Widget name="balance-actions-amount-append-menu-list-item">
										<WidgetItem v-slot="{ computedAttrs }" name="icon">
											<KIcon v-bind="computedAttrs" :name="getIconName(item)" />
										</WidgetItem>

										<WidgetItem v-slot="{ computedAttrs }" name="title">
											<KText v-bind="computedAttrs">
												{{ item.title || item.currencyTitle }}
											</KText>
										</WidgetItem>

										<WidgetItem v-slot="{ computedAttrs }" name="name">
											<KText v-bind="computedAttrs">
												{{ item.name || item.currencyName }}
											</KText>
										</WidgetItem>

										<WidgetItem
											v-if="equivalentCurrenciesRatesRecord[item.currencyId || item.id]"
											v-slot="{ computedAttrs }"
											name="equivalent-rate"
										>
											<KText v-bind="computedAttrs">
												1 {{ item.title || item.currencyTitle }} {{ (item.title || item.currencyTitle) !== secondCurrencyTitleByForm ? '~' : '=' }} {{ toFixedDecimals(1 / equivalentCurrenciesRatesRecord[item.currencyId || item.id], firstCurrencyDecimalsByForm) }} {{ secondCurrencyTitleByForm }}
											</KText>
										</WidgetItem>
									</Widget>
								</KListItemContent>
							</KListItem>
						</KListItemGroup>
					</KList>
				</WidgetItem>

				<WidgetItem v-else name="no-data">
					<Widget name="balance-wallets-card-list-empty" :style="{ margin: 'var(--spacing-10) 0' }">
						<WidgetItem v-slot="{ computedAttrs, name }" name="icon">
							<KIcon
								v-bind="computedAttrs"
								:name="name"
								size="64"
							/>
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs, title }" name="title">
							<KText v-bind="computedAttrs">
								{{ title }}
							</KText>
						</WidgetItem>
					</Widget>
				</WidgetItem>
			</Widget>
		</KMenu>
	</WidgetItem>
</template>

<script lang="ts">
	import { Component, ModelSync, Prop } from 'vue-property-decorator';
	import MyRootStore from '@/store/store';
	import { mixins } from 'vue-class-component';
	import TranslateMixin from '@/mixins/translate';
	import FormAmount from '@/components/FormComponents/FormAmount.vue';
	import { FormType, CurrencyTypeIconNamespace, WalletCurrencyType, CurrencyType } from '@/const';

	import { inputMask, inputDecimalsMask, formatNumberAndFixedDecimals, toFixedDecimals } from '@/utils/utils';

	@Component({
		name: 'InputWithCurrencyMenu',
		components: { FormAmount }
	})
	export default class InputWithCurrencyMenu extends mixins(TranslateMixin) {
		@Prop({ default: '' }) text?: string;
		@Prop({ default: 'amount-with-equivalent-default' }) nameWidget?: string;
		@Prop({ default: 'amount-with-equivalent-default' }) keyWidget?: string;
		@Prop({ default: '' }) amountTitle?: string;
		@Prop({ default: '' }) amountLabel?: string;
		@Prop({ default: [] }) errorMessages!: string[];
		@Prop({ default: null }) maxLimit?: number;
		@Prop({ default: null }) minLimit?: number;
		@Prop({ default: '' }) maxLimitText?: string;
		@Prop({ default: '' }) minLimitText?: string;
		@ModelSync('input', 'input', { type: String, required: true, default: '' })
		public readonly depositAmountValue!: string;

		protected appRootStore = MyRootStore.getInstance();
		protected walletsStore = this.appRootStore.wallets;

		public filterCurrencies: string = '';
		public menuBuyGiveSearch = '';
		public menuBuyGiveStatus = false;

		public displayArray: HISTORY.Currencies[] = [];

		public setDisplayArray(value: HISTORY.Currencies[]): void {
			this.displayArray = value;
		}

		public scrollHandler(): void {
			if (this.menuBuyGiveStatusComputed) {
				const ref = this.$refs['list-group'];
				this.walletsStore.getListWithAutoLoading({
					listDefault: this.menuBuyGiveCurrencies,
					mutableList: this.displayArray,
					ref,
					itemHeight: 50,
					type: 'default'
				});
			}
		}

		public get menuBuyGiveStatusComputed(): boolean {
			return this.menuBuyGiveStatus;
		}

		public set menuBuyGiveStatusComputed(newValue: boolean) {
			if (newValue) {
				setTimeout(() => {
					const ref = this.$refs['list-group'];
					this.walletsStore.getListWithAutoLoading({
						listDefault: this.menuBuyGiveCurrencies,
						mutableList: this.displayArray,
						ref,
						itemHeight: 50,
						type: 'default'
					});
				}, 0);
			} else {
				setTimeout(() => {
					this.walletsStore.getListWithAutoLoading({
						listDefault: this.menuBuyGiveCurrencies,
						mutableList: this.displayArray,
						ref: null,
						itemHeight: 50,
						type: 'default',
						itemPerPage: 0,
						setValue: this.setDisplayArray
					});
				}, 0);
			}

			this.menuBuyGiveStatus = newValue;

			if (!newValue) {
				setTimeout(() => {
					this.menuBuyGiveSearch = '';
					this.filterCurrencies = '';
				}, 400);

				// This is triggered before the menu closes
				// this.$nextTick(() => (this.menuBuyGiveSearch = ''));
			}
		}

		public setMenuBuyGiveSearch(): void {
			setTimeout(() => {
				this.walletsStore.getListWithAutoLoading({
					listDefault: this.menuBuyGiveCurrencies,
					mutableList: this.displayArray,
					ref: null,
					itemHeight: 50,
					type: 'search',
					itemPerPage: 20,
					setValue: this.setDisplayArray
				});
			}, 0);
		}

		public get computedEquivalentCurrency(): any {
			if (!this.walletsStore.equivalentCurrency.title) {
				const currency = this.isDepositForm
					? { ...this.activeWallet, title: this.activeWallet?.currencyTitle || '' }
					: { ...this.secondCurrencyStepFlow, title: this.secondCurrencyStepFlowTitle || '' };
				this.computedEquivalentCurrency = currency;
				this.getRates(currency);
				return currency;
			}
			return this.walletsStore.equivalentCurrency;
		}
		public set computedEquivalentCurrency(currency: HISTORY.Currencies) {
			this.menuBuyGiveStatusComputed = false;
			this.walletsStore.equivalentCurrency = currency;
		}

		public async getRates(currency: HISTORY.Currencies): Promise<void> {
			if (currency.id && this.baseCurrencyId) {
				await this.walletsStore.getRates(currency.id, this.baseCurrencyId);
			}
		}

		public async setEquivalentCurrency(currency: HISTORY.Currencies): Promise<void> {
			this.computedEquivalentCurrency = currency;
			await this.getRates(currency);
			this.amountBlur();
		}

		public get isDepositForm(): boolean {
			return this.activeForm === FormType.DEPOSIT;
		}

		public get activeForm(): WALLETS.FormTypeValues {
			return this.walletsStore.getActiveForm || FormType.DEPOSIT;
		}

		public get activeWallet(): WALLETS.Wallet | undefined {
			return this.walletsStore.getActiveWallet;
		}

		public get secondCurrencyStepFlow(): any {
			return this.walletsStore.secondCurrencyStepFlow;
		}

		public get secondCurrencyStepFlowTitle(): string {
			return this.secondCurrencyStepFlow?.title || '';
		}

		public get baseCurrencyId(): number | undefined {
			return this.walletsStore.baseCurrencyId;
		}

		public isNeedShowValueAsString(value: string): boolean {
			return (
				isNaN(Number(value)) ||
				value[value.length - 1] === '.' ||
				value.includes(' ') ||
				(String(value).includes('.') && String(value)[String(value).length - 1] === '0')
			);
		}

		public getFormattedValueForAmountValue(value: string, decimails: number | null | undefined): string {
			let newValue = value;
			if (newValue.includes('-')) {
				newValue = newValue.replace(/-/g, '');
			}
			newValue = newValue.replace(' ', '');
			newValue = decimails ? inputDecimalsMask(newValue, decimails) : inputMask(newValue);
			return newValue;
		}

		public formatNumberAndFixedDecimals(price: number, decimals: number): string {
			return formatNumberAndFixedDecimals(price, undefined, decimals);
		}

		public get secondCurrencyStepFlowDecimals(): number {
			return this.secondCurrencyStepFlow?.decimals || 8;
		}

		public get equivalentCurrencyRate(): number {
			return this.walletsStore.equivalentCurrencyRate;
		}

		public get activePaymentMethod(): any {
			return this.walletsStore.activePaymentMethod;
		}

		public get availableFundsWithdrawal(): number | null {
			if (!this.isDepositForm && !this.equivalentCurrencyTitle) {
				const availableFunds = toFixedDecimals(
					this.walletsStore.getCurrentCyrrencyAvailableFunds * (this.activePaymentMethod?.avgPrice || 1),
					this.secondCurrencyStepFlowDecimals
				);
				return availableFunds;
			} else if (this.equivalentCurrencyTitle) {
				return null;
			}
			return 0;
		}

		public get equivalentCurrenciesRatesRecord(): Record<number, number> {
			return this.walletsStore.equivalentCurrenciesRatesRecord;
		}

		public get equivalentCurrencyTitle(): string {
			if (
				this.isDepositForm
					? this.computedEquivalentCurrency?.title &&
					  this.computedEquivalentCurrency?.title === this.activeWallet?.currencyTitle
					: this.computedEquivalentCurrency?.title &&
					  this.computedEquivalentCurrency?.title === this.secondCurrencyStepFlow?.title
			) {
				return '';
			}
			return `${this.$t('balance.sumText')} ${this.getCurrencyTitle}`;
		}

		public get equivalentCurrencyValue(): string {
			if (
				this.isDepositForm
					? this.computedEquivalentCurrency?.title &&
					  this.computedEquivalentCurrency?.title === this.activeWallet?.currencyTitle
					: this.computedEquivalentCurrency?.title &&
					  this.computedEquivalentCurrency?.title === this.secondCurrencyStepFlow?.title
			) {
				return '';
			}
			return `~ ${
				this.formatNumberAndFixedDecimals(
					(1 / this.equivalentCurrencyRate) * Number(this.depositAmountValue),
					this.getCurrencyDecimals
				) || 0
			} ${this.getCurrencyTitle}`;
		}

		public get getCurrencyDecimals(): number {
			return this.isDepositForm ? this.activeWallet?.currencyDecimals : this.secondCurrencyStepFlow?.decimals || 8;
		}

		public get getCurrencyTitle(): string {
			return this.isDepositForm ? this.activeWallet?.currencyTitle || '' : this.secondCurrencyStepFlowTitle;
		}

		public getIconName(item: HISTORY.Currencies): string {
			if (!item) {
				return 'currency.ETH';
			}

			return `${
				CurrencyTypeIconNamespace[
					item.type ||
						WalletCurrencyType[(item as HISTORY.Currencies & { currencyType: WalletCurrencyType }).currencyType]
				]
			}.${item.title || (item as HISTORY.Currencies & { currencyTitle: string }).currencyTitle}`;
		}

		public get filterTags(): Array<COMMON.IMap<string>> {
			return this.filterCategories
				.map((tag) => ({
					title: this.$t(`balance.${tag.title}`),
					type: tag.type,
					value: tag.value
				}))
				.filter((category) => {
					return this.walletsStore.sharedDataCurrencies.some((currency) => currency.type === category.type);
				});
		}

		public filterCategories: Array<COMMON.IMap<string>> = [
			{ title: 'cryptoCurrencyText', value: CurrencyType.Cryptocurrency, type: CurrencyType.Cryptocurrency },
			{ title: 'fiatCurrencyText', value: CurrencyType.Fiat, type: CurrencyType.Fiat }
		];

		public get menuBuyGiveCurrencies(): HISTORY.Currencies[] {
			return this.menuBuyGiveSearch || this.filterCurrencies
				? this.walletsStore.sharedDataCurrencies.filter(
						(item) =>
							(!this.filterCurrencies || item.type === this.filterCurrencies) &&
							(item.title?.toLowerCase().includes(this.menuBuyGiveSearch?.toLowerCase()) ||
								this.menuBuyGiveSearch?.toLowerCase().includes(item.title?.toLowerCase()) ||
								item.name?.toLowerCase().includes(this.menuBuyGiveSearch?.toLowerCase()) ||
								this.menuBuyGiveSearch?.toLowerCase().includes(item.name?.toLowerCase()) ||
								(item.aliases.length &&
									item.aliases.some(
										(alias: string) =>
											alias?.toLowerCase().includes(this.menuBuyGiveSearch?.toLowerCase()) ||
											this.menuBuyGiveSearch?.toLowerCase().includes(alias?.toLowerCase())
									)))
				  )
				: this.walletsStore.sharedDataCurrencies;
		}

		public get secondCurrencyTitleByForm(): string {
			return this.isDepositForm ? this.secondCurrencyStepFlowTitle : this.activeWalletTitle || '';
		}

		public get activeWalletTitle(): string | undefined {
			return this.activeWallet?.currencyTitle;
		}

		protected get activeWalletDecimals(): number {
			return this.activeWallet?.currencyDecimals || 8;
		}

		public amountChangeHandler(newVal: string): void {
			this.$emit('amountChange', newVal);
		}

		public amountBlur(): void {
			if (this.menuBuyGiveStatusComputed) {
				return;
			}
			this.$emit('handleCheckBlur');
		}

		public deposit(): void {
			this.$emit('deposit');
		}

		public get firstCurrencyDecimalsByForm(): number {
			return this.activeWalletDecimals > this.secondCurrencyStepFlowDecimals
				? this.activeWalletDecimals
				: this.secondCurrencyStepFlowDecimals;
		}

		public toFixedDecimals(price: number, decimals: number): number {
			return toFixedDecimals(price, decimals);
		}

		public equivalentMenuVariables = [
			{
				name: 'chipClass',
				type: 'string',
				defaultValue: 'k-chip-p2p-currencies-filters'
			},
			{
				name: 'chipActiveClass',
				type: 'string',
				defaultValue: 'k-chip-p2p-methods-history-active'
			}
		];
	}
</script>
