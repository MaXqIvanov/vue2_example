<template>
	<Widget name="balance-wallets-card-wrapper">
		<WidgetItem v-slot="{ computedAttrs }" name="card">
			<KCard v-bind="computedAttrs" style="--sheet-outlined-border:1px solid var(--tertiary-lighten-5);">
				<Widget name="balance-wallets-card">
					<WidgetItem name="actions">
						<WalletsActions
							v-if="!isSearchWallet && wallets.length"
							:wallets="wallets"
							:selectedItemId="favoriteCurrency.id"
							:isAutoViewAvailable="isAutoViewAvailable"
							@search-handle-click="searchHandleClick"
						/>
						<WalletsSearch
							v-if="Boolean(isSearchWallet)"
							@search-handle-click="searchHandleClick"
							@search-handle-blur="searchHandleBlur"
							@search-handle-input="searchHandleInput"
						/>
					</WidgetItem>
					<WidgetItem v-if="previouslyUsedCurrencies.length !== 0" name="block-used-before">
						<Widget name="balance-wallets-slider-wallets-used">
							<WidgetItem v-slot="{ computedAttrs }" name="title">
								<KText v-bind="computedAttrs" />
							</WidgetItem>
							<WidgetItem v-slot="{ computedAttrs }" name="slider-group">
								<KSlideGroup
									v-bind="computedAttrs"
								>
									<KSlideItem
										v-for="wallet in previouslyUsedCurrencies"
										:key="wallet.currencyId"
									>
										<Widget :name="'balance-wallets-slider-wallets-used-card'">
											<WidgetItem v-slot="computedAttrs" name="card">
												<KCard
													v-bind="computedAttrs"
													replace
													:ripple="false"
													:to="{ name: 'balance-activeForm', params: { currency: wallet.currencyTitle, activeForm: activeForm } }"
													@click.native="setActiveWallet(wallet)"
												>
													<Widget :key="getActiveWallet(wallet) ? `${wallet.currencyId}-active`: `${wallet.currencyId}`" :name="getActiveWallet(wallet) ? 'balance-wallets-slider-wallets-used-card-item-acitve': 'balance-wallets-slider-wallets-used-card-item'">
														<WidgetItem v-slot="computedAttrs" name="icon">
															<KIcon
																:name="`${iconName(wallet)}`"
																v-bind="computedAttrs"
															/>
														</WidgetItem>
														<WidgetItem v-slot="computedAttrs" name="title">
															<KText v-bind="computedAttrs">
																{{ wallet.currencyTitle }}
															</KText>
														</WidgetItem>
													</Widget>
												</KCard>
											</WidgetItem>
										</Widget>
									</KSlideItem>
								</KSlideGroup>
							</WidgetItem>
						</Widget>
					</WidgetItem>

					<WidgetItem
						v-if="loadingWallets"
						key="balance-wallets-card-wallets-list-loader"
						name="wallets-list-loader"
						style="overflow-y: hidden"
					>
						<KSkeletonLoader
							type="list-item@15"
							class="k-skeleton-loader-table-row-divider"
							style="--skeleton-loader-text-border-radius: 14px;--skeleton-loader-container-bg-color: transparent;--skeleton-loader-list-item-height: var(--spacing-16);--skeleton-loader-text-height: var(--spacing-12);--skeleton-loader-item-padding: var(--spacing-2) var(--spacing-3);"
						/>
					</WidgetItem>

					<WidgetItem
						v-else-if="!loadingWallets"
						key="balance-wallets-card-wallets-list"
						v-slot="{
							computedAttrs,
							currencyNameTypographyClass,
							currencyTitleTypographyClass,
							availableFundsTypographyClass,
							equivalentTypographyClass,
							equivalentTypographyMobClass,
							dailyChangePercentPositiveTypographyClass,
							dailyChangePercentPositiveTypographyMobClass,
							dailyChangePercentNegativeTypographyClass,
							dailyChangeTimeTypographyClass,
							dailyChangeTimeTypographyMobClass,
							availableEquivalentTypographyClass,
							availableEquivalentTypographyMobClass,
							frozenFundsTypographyClass,
							stakingLabelTypographyClass,
							stakingAmountTypographyClass,
							stakingEquivalentTypographyClass,
							currencyNameTextColor
						}"
						:contentVariables="walletItemTypographyVariables"
						name="wallets-list"
					>
						<KCard
							v-touch="{
								up: () => scrollListener(),
								down: () => scrollListener()
							}"
							v-bind="computedAttrs"
							class="balance-wallets-card"
							@wheel.passive="scrollListener"
							@scroll.passive="scrollListener"
						>
							<Widget name="balance-wallets-card-list">
								<WidgetItem v-if="showedWallets && !Object.keys(showedWallets).length" name="nothing-founded">
									<Widget name="balance-wallets-card-list-empty">
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

								<WidgetItem
									v-if="!showBalance"
									key="show-balance-in-wallets"
									name="show-balance"
								>
									<Widget name="balance-wallets-card-list-show-balance">
										<WidgetItem v-slot="{ computedAttrs }" name="icon">
											<KIcon v-bind="computedAttrs" />
										</WidgetItem>
										<WidgetItem v-slot="{ computedAttrs }" name="text">
											<KText v-bind="computedAttrs" />
										</WidgetItem>
									</Widget>
								</WidgetItem>

								<WidgetItem
									v-else-if="showBalance"
									key="not-show-balance-in-wallets"
									name="show-balance-cap"
								/>

								<WidgetItem
									v-slot="{ computedAttrs, hideSliderValue, enabledTabStyles, disabledTabStyles, tabsHeight, tabsGroupBackground, tabsGroupStyles, assetsList }"
									key="assets-tabs-in-wallets"
									name="assets-tabs"
									:contentVariables="tabsVariables"
								>
									<KTabs
										v-bind="computedAttrs"
										centerActive
										:centered="true"
										:height="tabsHeight"
										:backgroundColor="tabsGroupBackground"
										:style="tabsGroupStyles"
										:hideSlider="getBooleanValueFromString(hideSliderValue)"
									>
										<KTab
											v-for="name in mapAssetsFromString(assetsList)"
											:key="name"
											:style="name === currentAssetType ? enabledTabStyles : disabledTabStyles"
											@change="assetHandleClick(name)"
										>
											{{ $t(`balance.${name}`) }}
										</KTab>
									</KTabs>
								</WidgetItem>
								<WidgetItem
									v-for="wallet in wallets"
									v-show="!showedWallets || (showedWallets && showedWallets[wallet.currencyId])"
									:key="wallet.currencyId"
									v-slot="{ computedAttrs, classActiveBalanceCard }"
									name="wallet-item"
									:contentVariables="cardBalanceVariables"
								>
									<KCard
										v-bind="computedAttrs"
										:class="(activeCurrencyTitle === wallet.currencyTitle) ? classActiveBalanceCard : ''"
										:to="{
											name: walletRouteName,
											params: {
												currency: wallet.currencyTitle,
												activeForm: activeForm,
												giveCurrency: computedFiatSecondCurrency.title,
												getCurrency: computedFiatSecondCurrency.title,
												secondCurrency: computedCryptoSecondCurrency.title
											}
										}"
										:ripple="false"
										@click.native="setActiveWallet(wallet)"
									>
										<WalletsItem
											:wallet="wallet"
											:windowSize="windowSize"
											:staking="stakingCurrency(wallet.currencyId)"
											:favoriteCurrencySymbol="favoriteCurrencySymbol"
											:favoriteCurrencyDecimals="favoriteCurrency.decimals"
											:currencyNameTextColor="currencyNameTextColor"
											:typographyClasses="{
												currencyNameTypographyClass,
												currencyTitleTypographyClass,
												availableFundsTypographyClass,
												equivalentTypographyClass,
												equivalentTypographyMobClass,
												dailyChangePercentPositiveTypographyClass,
												dailyChangePercentPositiveTypographyMobClass,
												dailyChangePercentNegativeTypographyClass,
												dailyChangeTimeTypographyClass,
												dailyChangeTimeTypographyMobClass,
												availableEquivalentTypographyClass,
												availableEquivalentTypographyMobClass,
												frozenFundsTypographyClass,
												stakingLabelTypographyClass,
												stakingAmountTypographyClass,
												stakingEquivalentTypographyClass
											}"
										/>
									</KCard>
								</WidgetItem>
							</Widget>
						</KCard>
					</WidgetItem>

					<WidgetItem v-slot="{ computedAttrs }" name="fab">
						<KBtn
							v-show="showScrollTop"
							v-bind="computedAttrs"
							@click="scrollToTopItem"
						/>
					</WidgetItem>
				</Widget>
			</KCard>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop, Watch } from 'vue-property-decorator';
	import WalletsActions from '@/components/WalletComponents/WalletsActions.vue';
	import WalletsSearch from '@/components/WalletComponents/WalletsSearch.vue';
	import WalletsItem from '@/components/WalletComponents/WalletsItem.vue';

	import MyRootStore from '@/store/store';
	import { FlowType, FormType, LocaleStorageItems, WalletCurrencyType } from '@/const';

	@Component({
		name: 'Wallets',
		components: { WalletsActions, WalletsItem, WalletsSearch }
	})
	export default class Wallets extends Vue {
		@Prop({ required: true })
		public wallets?: WALLETS.WalletList;

		@Prop({ required: true })
		protected staking?: any;

		public isSearchWallet: boolean = false;
		public showScrollTop: boolean = false;

		@Watch('isSearchWallet')
		protected watchIsSearchWallet(newVal: boolean): void {
			if (!newVal) {
				this.walletsStore.walletSearch = '';
			}
		}

		public get windowSize(): string {
			return this.$store.state.appLayout.screenSize;
		}

		protected walletsStore = MyRootStore.getInstance().wallets;

		public get isAutoViewAvailable(): boolean {
			return this.walletsStore.isAutoViewAvailable;
		}

		protected get showBalance(): boolean {
			return this.$store.state.sharedData.showBalance;
		}

		protected get activeForm(): string {
			return this.walletsStore.activeForm;
		}

		protected get computedFiatSecondCurrency(): Partial<HISTORY.Currencies> & { currencyType?: WalletCurrencyType } {
			return this.walletsStore.computedFiatSecondCurrency;
		}
		protected get computedCryptoSecondCurrency(): Partial<HISTORY.Currencies> & { currencyType?: WalletCurrencyType } {
			return this.walletsStore.computedCryptoSecondCurrency;
		}

		protected get walletRouteName(): string {
			if (!this.walletsStore.seamlessIntegrationEnabled || this.walletsStore.seamlessStepsEnabled) {
				return 'balance-activeForm';
			}

			if (this.activeForm === FormType.DEPOSIT) {
				return this.activeFlow === FlowType.GET ? 'balance-get-form' : 'balance-buy-form';
			} else if (this.activeForm === FormType.WITHDRAWAL) {
				return this.activeFlow === FlowType.TRANSFER ? 'balance-transfer-form' : 'balance-sell-form';
			} else if (this.activeForm === FormType.EXCHANGE) {
				return 'balance-exchange-form';
			}

			return 'balance-activeForm';
		}

		protected get activeFlow(): string {
			return this.walletsStore.getActiveFlow;
		}

		protected get activeCurrencyTitle(): string | undefined {
			return this.walletsStore.getActiveWallet?.currencyTitle;
		}

		public get favoriteCurrency(): Partial<HISTORY.Currencies> & { currencyType?: WalletCurrencyType } {
			return this.walletsStore.favoriteCurrency ? this.walletsStore.favoriteCurrency : ({} as HISTORY.Currencies);
		}

		protected get favoriteCurrencySymbol(): string | undefined {
			return this.walletsStore.favoriteCurrency?.title;
		}

		protected get walletSearch(): string {
			return this.walletsStore.walletSearch;
		}
		protected set walletSearch(newVal: string) {
			this.walletsStore.walletSearch = newVal;
		}

		protected get loadingWallets(): boolean {
			return this.walletsStore.loadingWallets;
		}

		protected get showedWallets(): Record<number, boolean> | null {
			return this.walletsStore.showedWallets;
		}

		protected searchHandleClick(): void {
			this.isSearchWallet = !this.isSearchWallet;
		}

		protected setActiveWallet(wallet: WALLETS.Wallet): void {
			this.walletsStore.setActiveWallet(wallet);
			this.isSearchWallet = false;
			sessionStorage.setItem(LocaleStorageItems.ActiveWallet, `${wallet.currencyId}`);
		}

		protected searchHandleBlur(): void {
			// Срабатывает раньше выбора валюты, нужно переделать
			// this.isSearchWallet = false;
			// this.$nextTick(() => {
			// 	this.isSearchWallet = false;
			// });
		}

		public searchHandleInput(value: string): void {
			this.walletsStore.searchHandleInput(value);
		}

		protected stakingCurrency(id: any): any {
			const stakingCurerncy = this.staking.find((currency: any) => currency.currencyId === id);
			return stakingCurerncy || undefined;
		}

		protected scrollToTopItem(): void {
			document.querySelector('.remoteComponent')?.shadowRoot?.querySelector('.balance-wallets-card > div')?.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
			this.showScrollTop = false;
		}

		protected scrollListener(): void {
			const topListPosition =
				document
					.querySelector('.remoteComponent')
					?.shadowRoot?.querySelector('.balance-wallets-card div .k-card-plain:first-child')
					?.getBoundingClientRect().y || 0;
			const FABShowThreshold = 0;
			this.showScrollTop = topListPosition < FABShowThreshold;
		}

		protected getBooleanValueFromString(value: string): boolean {
			return value === 'true';
		}

		protected get currentAssetType(): string {
			return this.walletsStore.currentAssetType;
		}

		protected assetHandleClick(assetType: string): void {
			this.walletsStore.assetHandleClick(assetType);
		}

		protected mapAssetsFromString(assetsListString: string): string[] {
			return assetsListString.split(',').map((asset) => asset.trim());
		}

		public get previouslyUsedCurrencies(): WALLETS.WalletList {
			const localStorageWallets = this.walletsStore.storageModule.read('previouslyUsedCurrencies')?.split(',') || [];
			const currentWallets = this.wallets
				? this.wallets
						.filter((wallet) => localStorageWallets.includes(String(wallet.currencyId)))
						.sort(
							(a: WALLETS.WalletList[0], b: WALLETS.WalletList[0]) =>
								localStorageWallets.indexOf(a.currencyId) - localStorageWallets.indexOf(b.currencyId)
						)
				: [];
			return currentWallets;
		}

		public iconName(wallet: WALLETS.WalletList[0]): string {
			return `${Boolean(wallet.currencyType) ? 'currency' : 'fiat'}.${wallet.currencyTitle}`;
		}

		public getActiveWallet(wallet: WALLETS.WalletList[0]): boolean {
			return wallet.currencyId === this.walletsStore.activeWallet?.currencyId;
		}

		protected tabsVariables = [
			{ name: 'hideSliderValue', type: 'string', defaultValue: 'false' },
			{
				name: 'enabledTabStyles',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'disabledTabStyles',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'tabsGroupBackground',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'tabsHeight',
				type: 'string',
				defaultValue: '32'
			},
			{
				name: 'tabsGroupStyles',
				type: 'string',
				defaultValue: ''
			},
			{ name: 'assetsList', type: 'string', defaultValue: 'Cryptocurrency, Fiat' }
		];

		protected walletItemTypographyVariables = [
			{
				name: 'currencyNameTypographyClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-2-regular'
			},
			{
				name: 'currencyTitleTypographyClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-2-medium'
			},
			{
				name: 'availableFundsTypographyClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-2-regular'
			},
			{
				name: 'equivalentTypographyClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-3-regular'
			},
			{
				name: 'equivalentTypographyMobClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-3-medium'
			},
			{
				name: 'dailyChangePercentPositiveTypographyClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-3-regular'
			},
			{
				name: 'dailyChangePercentPositiveTypographyMobClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-3-medium'
			},
			{
				name: 'dailyChangePercentNegativeTypographyClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-3-regular'
			},
			{
				name: 'dailyChangeTimeTypographyClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-3-regular'
			},
			{
				name: 'dailyChangeTimeTypographyMobClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-3-medium'
			},
			{
				name: 'availableEquivalentTypographyClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-3-regular'
			},
			{
				name: 'availableEquivalentTypographyMobClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-3-medium'
			},
			{
				name: 'frozenFundsTypographyClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-3-regular k-text-default'
			},
			{
				name: 'stakingLabelTypographyClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-3-regular'
			},
			{
				name: 'stakingAmountTypographyClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-3-regular'
			},
			{
				name: 'stakingEquivalentTypographyClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-3-regular'
			},
			{
				name: 'currencyNameTextColor',
				type: 'string',
				defaultValue: 'var(--tertiary-darken-3)'
			}
		];

		protected cardBalanceVariables = [
			{
				name: 'classActiveBalanceCard',
				type: 'string',
				defaultValue: 'k-sheet-review-active k-card-review-active'
			}
		];
	}
</script>
