<template>
	<Widget
		key="balance-actions-payment-select"
		name="balance-actions-payment-select"
	>
		<WidgetItem
			v-slot="{ computedAttrs, label, placeholderTop,
				expandIconTop,
				borderRadius,
				outlineColor,
				outlineHoverColor,
				outlineFieldsetBorder,
				activeLabelTransform,
				menuBackgroundColor,
				menuHeight }"
			:contentVariables="autocompleteVariables"
			name="select"
			style="position:relative"
		>
			<KAutocomplete
				ref="autocompletePayment"
				:items="methods"
				itemValue="id"
				itemText="name"
				attach=""
				:value="value"
				:label="label"
				:readonly="isReadonly"
				:disabled="isReadonly"
				returnObject
				:hideNoData="false"
				:menuProps="{ rounded: 'lg', maxHeight: menuHeight, }"
				:style="getAutocompleteStyle({placeholderTop,
					expandIconTop,
					borderRadius,
					outlineColor,
					outlineHoverColor,
					outlineFieldsetBorder,
					activeLabelTransform,
					menuBackgroundColor})"
				v-bind="computedAttrs"
				:filter="filterPaymentMethods"
				@change="setComputedMethod"
				@click:append="toggleAutocomplete"
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
					<Widget name="balance-actions-payment-select-item">
						<WidgetItem v-slot="{ computedAttrs }" name="currency-icon">
							<KIcon v-bind="computedAttrs" :name="`payment-methods.${item.id}`" />
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="currency-name">
							<KText
								v-bind="computedAttrs"
							>
								{{ item.name }}
							</KText>
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="info-text">
							<KText v-bind="computedAttrs">
								Комиссия: 0,23 {{ giveCurrencyTitle }}, Время сделки: 30 мин
							</KText>
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="equivalent">
							<KText v-bind="computedAttrs">
								≈ 4 799,65 {{ giveCurrencyTitle }}
							</KText>
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="rate-currency">
							<KText v-bind="computedAttrs">
								Курс {{ getCurrencyName }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>
				<template #selection="{ item }">
					<Widget name="balance-actions-payment-selection">
						<WidgetItem v-slot="{ computedAttrs }" name="currency-icon">
							<KIcon v-bind="computedAttrs" :name="`payment-methods.${item.id}`" />
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="currency-name">
							<KText v-bind="computedAttrs">
								{{ item.name }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>
				<template #no-data>
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
				</template>
				<template #prepend-item>
					// previously used widget
				</template>
			</KAutocomplete>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop, Watch } from 'vue-property-decorator';

	@Component
	export default class FormPaymentMethodSelect extends Vue {
		@Prop() protected value?: number;
		@Prop({ required: true })
		protected methods!: any;
		@Prop({ default: false }) protected isReadonly?: boolean;
		@Prop({ default: false }) protected disableAutoOpen?: boolean;
		@Prop({ required: true }) protected giveCurrencyTitle!: string;
		@Prop({ required: true }) protected getCurrencyName!: string;

		protected setComputedMethod(method: any): void {
			this.$emit('setMethod', method);
		}

		protected getAutocompleteStyle({
			placeholderTop,
			expandIconTop,
			borderRadius,
			outlineColor,
			outlineHoverColor,
			outlineFieldsetBorder,
			activeLabelTransform,
			menuBackgroundColor
		}: COMMON.IMap<string>): string {
			return `--text-field-single-line-label-top:${placeholderTop};--text-field-outlined-dense-label-top:${placeholderTop};--text-field-outlined-prepend-append-margin-top: ${expandIconTop};--text-field-border-radius: ${borderRadius};--text-field-outlined-color:${outlineColor};--text-field-outlined-hover-color:${outlineHoverColor}; --text-field-outlined-fieldset-border:${outlineFieldsetBorder};--text-field-outlined-dense-label-active-transform:${activeLabelTransform};--list-background-color:${menuBackgroundColor}`;
		}

		protected filterPaymentMethods(item: any, queryText: string): boolean {
			return (
				item.pathName?.toLowerCase().includes(queryText?.toLowerCase()) ||
				queryText?.toLowerCase().includes(item.pathName?.toLowerCase()) ||
				item.name?.toLowerCase().includes(queryText?.toLowerCase()) ||
				queryText?.toLowerCase().includes(item.name?.toLowerCase()) ||
				(item.aliases.length &&
					item.aliases.some(
						(alias: string) =>
							alias?.toLowerCase().includes(queryText?.toLowerCase()) ||
							queryText?.toLowerCase().includes(alias?.toLowerCase())
					))
			);
		}

		protected toggleAutocomplete(): void {
			if ((this.$refs as any).autocompletePayment) {
				if (!(this.$refs as any).autocompletePayment.isMenuActive) {
					(this.$refs as any).autocompletePayment.focus();
					(this.$refs as any).autocompletePayment.isMenuActive = true;
				} else {
					(this.$refs as any).autocompletePayment.blur();
					(this.$refs as any).autocompletePayment.isMenuActive = false;
				}
			}
		}

		@Watch('methods', { immediate: true })
		protected onMethodsChanged(): void {
			if (!this.disableAutoOpen && !this.isReadonly) {
				this.methods?.length && !this.value && setTimeout(() => this.toggleAutocomplete());
			}
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
				defaultValue: 'var(--spacing-2)'
			},
			{
				name: 'menuBackgroundColor',
				type: 'string',
				defaultValue: 'var(--gradient-secondary-gradient)'
			},
			{
				name: 'outlineColor',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'outlineHoverColor',
				type: 'string',
				defaultValue: 'var(--primary-lighten)'
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
				name: 'menuHeight',
				type: 'string',
				defaultValue: '408px'
			}
		];
	}
</script>
