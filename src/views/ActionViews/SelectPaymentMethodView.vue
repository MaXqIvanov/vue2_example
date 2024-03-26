<template>
	<Widget name="balance-actions-card-wrapper">
		<WidgetItem
			v-slot="{ computedAttrs, styleString }"
			name="card"
			:contentVariables="cardWrapperVariables"
		>
			<KCard
				v-bind="computedAttrs"
				:style="`--sheet-outlined-border: 1px solid var(--tertiary-lighten-5); ${styleString}`"
			>
				<Widget name="balance-actions-step2-card">
					<WidgetItem
						v-slot="{ computedAttrs, iconSize, iconName, iconStyle }"
						name="back-icon"
						:contentVariables="backBtnVariables"
					>
						<KBtn
							v-bind="computedAttrs"
							icon
							exact
							:to="backToObject"
						>
							<KIcon
								:name="iconName"
								:size="iconSize"
								:style="iconStyle"
							/>
						</KBtn>
					</WidgetItem>

					<WidgetItem v-slot="{ computedAttrs }" name="title">
						<KText v-bind="computedAttrs">
							{{ $t('balance.selectPaymentMethod') }}
						</KText>
					</WidgetItem>

					<WidgetItem v-slot="{ computedAttrs }" name="subtitle">
						<KText
							v-bind="computedAttrs"
						>
							{{ resultAction }} {{ activeWalletTitle }} {{ $t('balance.p2pFor') }} {{ secondCurrencyStepFlowTitle }} 
						</KText>
					</WidgetItem>

					<WidgetItem v-slot="{ computedAttrs }" name="step">
						<KText v-bind="computedAttrs">
							<span style="color: var(--tertiary-darken)">2</span> / 4
						</KText>
					</WidgetItem>

					<WidgetItem v-slot="{ computedAttrs }" name="search">
						<KTextField
							v-model="search"
							:label="$t('balance.found')"
							v-bind="computedAttrs"
							hideDetails
							autofocus
							@input="$emit('search-handle-input', $event)"
							@blur="$emit('search-handle-blur', $event)"
							@click:clear="$emit('search-handle-input', '')"
						/>
					</WidgetItem>

					<WidgetItem v-if="false" name="chips">
						chips
					</WidgetItem>

					<WidgetItem v-if="false" name="sort">
						sort
					</WidgetItem>

					<WidgetItem
						v-if="paymentMethods.length && Object.keys(paymentMethodsToShow).length"
						v-slot="{ computedAttrs }"
						name="method-list"
					>
						<template v-for="method in paymentMethods">
							<KCard
								v-show="paymentMethodsToShow[method.paymentMethodId]"
								:key="method.paymentMethodId + 'method-item'"
								v-bind="computedAttrs"
								style="--card-sheet-border-radius: 0;"
								@click="setPaymentMethod(method)"
							>
								<Widget
									:key="'step2-select-item' + method.paymentMethodId"
									name="balance-actions-step2-payment-select-item"
								>
									<WidgetItem v-slot="{ computedAttrs }" name="method-icon">
										<KIcon v-bind="computedAttrs" :name="`payment-methods.${method.paymentMethodId}`" />
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="method-name">
										<KText
											v-bind="computedAttrs"
										>
											{{ method.paymentMethod.name }}
										</KText>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="method-limits">
										<KText
											v-bind="computedAttrs"
										>
											{{ $t('balance.limitText') }} {{ method.limits.minLimit }} - {{ method.limits.maxLimit }} {{ secondCurrencyStepFlowTitle }}
										</KText>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="method-price">
										<KText
											v-bind="computedAttrs"
										>
											{{ $t('balance.fromText') }} {{ formatNumberAndFixedDecimals(method.avgPrice) }}
										</KText>
									</WidgetItem>
									<WidgetItem v-slot="{ computedAttrs }" name="method-currency-title">
										<KText v-bind="computedAttrs">
											{{ secondCurrencyStepFlowTitle }}
										</KText>
									</WidgetItem>
									<WidgetItem
										v-slot="{ computedAttrs, positiveValue, negativeValue, neutralValue }"
										name="method-avg-dif-percent"
										:contentVariables="avgDiffPriceVariable"
									>
										<KText
											v-bind="computedAttrs"
											:style="{color: getAvgDiffColor({method, positiveValue, negativeValue, neutralValue})}"
										>
											{{ getAvgDiffPrice(method) }}
										</KText>
									</WidgetItem>
								</Widget>
							</KCard>
						</template>
					</WidgetItem>

					<WidgetItem
						v-else
						key="seamless-step-second-card-list-empty"
						name="no-data"
					>
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
			</KCard>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component } from 'vue-property-decorator';

	import { FormType } from '@/const';
	import MyRootStore from '@/store/store';
	import { Location } from 'vue-router';
	import { formatNumberAndFixedDecimals } from '@/utils/utils';

	@Component({
		components: {}
	})
	export default class SelectPaymentMethodView extends Vue {
		protected appRootStore = MyRootStore.getInstance();
		protected walletsStore = this.appRootStore.wallets;

		protected get activeForm(): WALLETS.FormTypeValues {
			return this.walletsStore.getActiveForm;
		}

		protected get activeWallet(): WALLETS.Wallet | undefined {
			return this.walletsStore.getActiveWallet;
		}

		protected get activeWalletTitle(): string | undefined {
			return this.activeWallet?.currencyTitle;
		}

		protected get secondCurrencyStepFlow(): any {
			return this.walletsStore.secondCurrencyStepFlow;
		}

		protected get secondCurrencyStepFlowTitle(): string {
			return this.secondCurrencyStepFlow?.title || '';
		}

		protected get secondCurrencyStepFlowDecimals(): number {
			return this.secondCurrencyStepFlow?.decimals || 8;
		}

		protected get resultAction(): string {
			if (this.activeForm === FormType.DEPOSIT) {
				return this.$t('balance.p2pBuy');
			}
			if (this.activeForm === FormType.WITHDRAWAL) {
				return this.$t('balance.p2pSell');
			}

			return this.$t('balance.p2pBuy');
		}

		protected get paymentMethods(): WALLETS.CurrentPaymentMethodInfo[] {
			return this.walletsStore.currentPaymentMethodInfo;
		}

		protected get backToObject(): Location {
			return {
				name: 'balance-activeForm',
				params: {
					currency: this.activeWalletTitle as string,
					activeForm: this.activeForm
				}
			};
		}

		protected search: string = '';

		protected get paymentMethodsToShow(): any {
			return this.paymentMethods.reduce((acc, method) => {
				if (!this.search) {
					acc[method.paymentMethodId] = true;
					return acc;
				}

				const methodNameInLowerCase = method.paymentMethod?.name?.toLowerCase();
				const methodPathInLowerCase = method.paymentMethod?.pathName?.toLowerCase();
				const aliases = method.paymentMethod?.aliases;
				const searchInLowerCase = this.search?.toLowerCase();

				const intermediate =
					methodNameInLowerCase?.includes(searchInLowerCase) ||
					searchInLowerCase.includes(methodNameInLowerCase) ||
					methodPathInLowerCase?.includes(searchInLowerCase) ||
					searchInLowerCase.includes(methodPathInLowerCase) ||
					aliases.some((alias: string) => alias.includes(searchInLowerCase) || searchInLowerCase.includes(alias));

				if (intermediate) acc[method.paymentMethodId] = intermediate;

				return acc;
			}, {} as COMMON.IMap<any>);
		}

		protected formatNumberAndFixedDecimals(price: number): string {
			return formatNumberAndFixedDecimals(price, undefined, this.secondCurrencyStepFlowDecimals);
		}

		protected get paymentProviders(): string[] {
			return this.walletsStore.paymentProvidersList;
		}

		public getAvgDiffPrice(method: WALLETS.CurrentPaymentMethodInfo): string {
			if (method.avgDiffPercent > 0) {
				return `+${method.avgDiffPercent}%`;
			} else if (method.avgDiffPercent < 0) {
				return `${method.avgDiffPercent}%`;
			}
			return '0%';
		}

		public getAvgDiffColor({
			method,
			positiveValue,
			negativeValue,
			neutralValue
		}: {
			method: WALLETS.CurrentPaymentMethodInfo;
			positiveValue: string;
			negativeValue: string;
			neutralValue: string;
		}): string {
			if (method.avgDiffPercent > 0) {
				return positiveValue;
			} else if (method.avgDiffPercent < 0) {
				return negativeValue;
			}
			return neutralValue;
		}

		protected setPaymentMethod(method: any): void {
			this.activeForm === FormType.DEPOSIT
				? this.walletsStore.setDepositBuyPaymentMethod(method)
				: this.walletsStore.setWithdrawalBuyPaymentMethod(method);

			if (this.paymentProviders.length < 2) {
				this.walletsStore.activePaymentProvider = 'p2p';
				const routeName =
					this.activeForm === FormType.DEPOSIT ? 'balance-buy-form-fourth-step' : 'balance-sell-form-fourth-step';
				this.$router.push({
					name: routeName,
					params: {
						currency: this.activeWallet?.currencyTitle as string,
						activeForm: this.activeForm,
						giveCurrency: this.secondCurrencyStepFlowTitle,
						getCurrency: this.secondCurrencyStepFlowTitle,
						paymentMethod: method.paymentMethod.pathName,
						paymentProvider: 'p2p'
					}
				});
			} else {
				const routeName =
					this.activeForm === FormType.DEPOSIT ? 'balance-buy-form-third-step' : 'balance-sell-form-third-step';
				this.$router.push({
					name: routeName,
					params: {
						currency: this.activeWallet?.currencyTitle as string,
						activeForm: this.activeForm,
						giveCurrency: this.secondCurrencyStepFlowTitle,
						getCurrency: this.secondCurrencyStepFlowTitle,
						paymentMethod: method.paymentMethod.pathName
					}
				});
			}
		}

		protected cardWrapperVariables = [
			{
				name: 'styleString',
				type: 'string',
				defaultValue: ''
			}
		];

		protected backBtnVariables = [
			{
				name: 'iconSize',
				type: 'string',
				defaultValue: '14'
			},
			{
				name: 'iconName',
				type: 'string',
				defaultValue: '$prev--colorable'
			},
			{
				name: 'iconStyle',
				type: 'string',
				defaultValue: '--icon-color:var(--tertiary-darken)'
			}
		];

		public avgDiffPriceVariable = [
			{
				name: 'positiveValue',
				type: 'string',
				defaultValue: 'var(--status-success-darken)'
			},
			{
				name: 'negativeValue',
				type: 'string',
				defaultValue: 'var(--status-error-darken)'
			},
			{
				name: 'neutralValue',
				type: 'string',
				defaultValue: 'var(--text-tertiary)'
			}
		];
	}
</script>
