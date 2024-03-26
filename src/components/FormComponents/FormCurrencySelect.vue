<template>
	<Widget key="balance-form-currency-select" name="balance-form-currency-select">
		<WidgetItem
			v-if="title"
			key="form-currency-select-title"
			v-slot="{ computedAttrs }"
			name="title"
		>
			<KText
				v-bind="computedAttrs"
				:title="title"
			/>
		</WidgetItem>

		<WidgetItem
			v-slot="{ computedAttrs, placeholderTop,
				expandIconTop,
				borderRadius,
				outlineColor,
				outlineHoverColor,
				outlineFieldsetBorder,
				activeLabelTransform,
				autocompleteFocusedInputMinWidth }"
			:contentVariables="autocompleteVariables"
			name="select"
		>
			<KAutocomplete
				ref="autocomplete"
				:key="label + 'autocomplete'"
				itemValue="currencyId"
				:filter="filter"
				itemText="currencyName"
				:items="wallets"
				returnObject
				hideDetails
				:multiple="multiple"
				:readonly="isReadonly"
				:disabled="isReadonly"
				:value="value"
				:style="getAutocompleteStyle({placeholderTop,
					expandIconTop,
					borderRadius,
					outlineColor,
					outlineHoverColor,
					outlineFieldsetBorder,
					activeLabelTransform,
					autocompleteFocusedInputMinWidth})"
				v-bind="computedAttrs"
				@change="setComputedWallet"
				@blur="$emit('blurHandler')"
				@focus="$emit('focusHandler')"
			>
				<template #label>
					<Widget name="balance-amount-input-label-body-1">
						<WidgetItem v-slot="{ computedAttrs }" name="text">
							<KText v-bind="computedAttrs">
								{{ label }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>
				<template #item="{ item }">
					<Widget name="balance-currency-select-item">
						<WidgetItem v-slot="{ computedAttrs }" name="icon">
							<KIcon
								v-bind="computedAttrs"
								:name="`${namespaceByCurrencyTypeId[item.currencyType]}.${item.currencyTitle}`"
							/>
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="currency-name">
							<KText v-bind="computedAttrs">
								{{ item.currencyName }}
							</KText>
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="currency-title">
							<KText v-bind="computedAttrs">
								{{ item.currencyTitle }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>
				<template #selection="{ item, index }">
					<Widget
						v-if="!multiple"
						key="balance-currency-select-item-selection"
						name="balance-currency-select-item"
					>
						<WidgetItem v-slot="{ computedAttrs }" name="icon">
							<KIcon
								v-bind="computedAttrs"
								:name="`${namespaceByCurrencyTypeId[item.currencyType]}.${item.currencyTitle}`"
							/>
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="currency-name">
							<KText v-bind="computedAttrs">
								{{ item.currencyName }}
							</KText>
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="currency-title">
							<KText v-bind="computedAttrs">
								{{ item.currencyTitle }}
							</KText>
						</WidgetItem>
					</Widget>
					<Widget
						v-else-if="index < maxAmountChips && multiple"
						:key="`balance-currency-select-chip-${item.currencyTitle}`"
						name="balance-currency-select-item-chip"
					>
						<WidgetItem v-slot="{ computedAttrs }" name="chip">
							<KChip v-bind="computedAttrs">
								<Widget name="balance-currency-select-item-chip-inner">
									<WidgetItem v-slot="{ computedAttrs }" name="text">
										<KText v-bind="computedAttrs">
											{{ item.currencyTitle }}
										</KText>
									</WidgetItem>
									<WidgetItem v-slot="{ computedAttrs }" name="close">
										<KIcon v-bind="computedAttrs" @click="clickClearChip(index)" />
									</WidgetItem>
								</Widget>
							</KChip>
						</WidgetItem>
					</Widget>
					<Widget
						v-else-if="index === maxAmountChips && multiple"
						key="balance-currency-select-chip-count"
						name="balance-currency-select-item-chip-count"
					>
						<WidgetItem v-slot="{ computedAttrs }" name="count">
							<KText v-bind="computedAttrs">
								{{ textAmountHiddenChips }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>
			</KAutocomplete>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop, Watch } from 'vue-property-decorator';
	import { CurrencyTypeIota, MAX_AMOUNT_CHIP_IN_SELECTOR } from '@/const';

	@Component
	export default class FormCurrencySelect extends Vue {
		@Prop() protected value?: WALLETS.Wallet | number;
		@Prop({ default: '' }) protected title?: string;
		@Prop({ default: '' }) protected label?: string;
		@Prop({ default: false }) protected multiple?: boolean;
		@Prop({ default: false }) protected isReadonly?: boolean;
		@Prop({ default: true }) protected shouldAutoOpen?: any;
		@Prop({ required: true })
		protected wallets!: WALLETS.DepositTransactionMethodList;

		protected setComputedWallet(wallet: WALLETS.Wallet): void {
			this.$emit('setWallet', wallet);
		}

		protected getAutocompleteStyle({
			placeholderTop,
			expandIconTop,
			borderRadius,
			outlineColor,
			outlineHoverColor,
			outlineFieldsetBorder,
			activeLabelTransform,
			autocompleteFocusedInputMinWidth
		}: COMMON.IMap<string>): string {
			return `--text-field-single-line-label-top:${placeholderTop};--text-field-outlined-dense-label-top:${placeholderTop};--text-field-outlined-prepend-append-margin-top: ${expandIconTop};--text-field-border-radius: ${borderRadius};--text-field-outlined-color:${outlineColor};--text-field-outlined-hover-color:${outlineHoverColor}; --text-field-outlined-fieldset-border:${outlineFieldsetBorder};--text-field-outlined-dense-label-active-transform:${activeLabelTransform};--autocomplete-focused-input:${autocompleteFocusedInputMinWidth}`;
		}

		protected namespaceByCurrencyTypeId: COMMON.IMap<string> = {
			[CurrencyTypeIota.Fiat]: 'fiat',
			[CurrencyTypeIota.Cryptocurrency]: 'currency'
		};

		protected filter(item: any, queryText: string, itemText: string): boolean {
			return (
				itemText.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1 ||
				(item.currencyTitle && item.currencyTitle.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1)
			);
		}

		protected clickClearChip(index: number): void {
			this.$emit('removeItem', index);
		}

		protected openAutocomplete(): void {
			(this.$refs as any).autocomplete.focus();
			(this.$refs as any).autocomplete.isMenuActive = true;
		}

		public get windowSize(): string {
			return this.$store.state.appLayout.screenSize;
		}

		public get isMobile(): boolean {
			return this.windowSize === 'xs';
		}

		protected get maxAmountChips(): number {
			return this.isMobile ? MAX_AMOUNT_CHIP_IN_SELECTOR.mob : MAX_AMOUNT_CHIP_IN_SELECTOR.desktop;
		}

		protected get amountHiddenChips(): number | string {
			return Array.isArray(this.value) ? this.value.length - this.maxAmountChips : '';
		}

		protected get textAmountHiddenChips(): string {
			return this.$t('balance.amountHiddenChip', { amount: this.amountHiddenChips });
		}

		@Watch('wallets', { immediate: true })
		protected onWalletsChanged(): void {
			this.shouldAutoOpen &&
				this.wallets?.length &&
				!this.value &&
				!this.multiple &&
				this.$nextTick(() => this.openAutocomplete());
		}

		@Watch('shouldAutoOpen', { immediate: true })
		protected onShouldAutoOpenChanged(): void {
			this.onWalletsChanged();
		}

		protected autocompleteVariables = [
			{
				name: 'placeholderTop',
				type: 'string',
				defaultValue: '14px'
			},
			{
				name: 'expandIconTop',
				type: 'string',
				defaultValue: '12px'
			},
			{
				name: 'borderRadius',
				type: 'string',
				defaultValue: '10px'
			},
			{
				name: 'outlineColor',
				type: 'string',
				defaultValue: 'var(--tertiary-darken-7)'
			},
			{
				name: 'outlineHoverColor',
				type: 'string',
				defaultValue: 'var(--primary-lighten-4)'
			},
			{
				name: 'outlineFieldsetBorder',
				type: 'string',
				defaultValue: '1px solid var(--primary-lighten)'
			},
			{
				name: 'activeLabelTransform',
				type: 'string',
				defaultValue: 'translateY(-20px) scale(0.75)'
			},
			{
				name: 'autocompleteFocusedInputMinWidth',
				type: 'string',
				defaultValue: '1px'
			}
		];
	}
</script>
