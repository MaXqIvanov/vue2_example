<template>
	<Widget key="balance-form-frequency-select" name="balance-form-frequency-select">
		<WidgetItem v-slot="{ computedAttrs, title }" name="title">
			<KText
				v-bind="computedAttrs"
				:title="title"
			/>
		</WidgetItem>

		<WidgetItem
			v-slot="{ computedAttrs, label, placeholderTop,
				expandIconTop,
				borderRadius,
				outlineColor,
				outlineHoverColor,
				outlineFieldsetBorder,
				activeLabelTransform }"
			:contentVariables="autocompleteVariables"
			name="select"
			style="position:relative"
		>
			<KMenu
				v-model="menuStatus"
				offsetY
				attach=""
				rounded="lg"
				minWidth="100%"
			>
				<template #activator="{ on, attrs }">
					<KAutocomplete
						v-model="frequency"
						itemValue="value"
						itemText="value"
						autoSelectFirst
						readonly
						:items="list"
						returnObject
						hideDetails
						:style="getAutocompleteStyle({placeholderTop,
							expandIconTop,
							borderRadius,
							outlineColor,
							outlineHoverColor,
							outlineFieldsetBorder,
							activeLabelTransform})"
						v-bind="{ ...attrs, ...computedAttrs }"
						v-on="on"
						@change="setComputedFrequency"
						@click="menuStatus = true"
						@click:append="menuStatus = true"
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
						<template #selection="{ item }">
							<Widget name="balance-currency-select-item">
								<WidgetItem v-slot="{ computedAttrs }" name="currency-name">
									<KText
										v-bind="computedAttrs"
										:style="{ cursor: 'pointer' }"
										@click="menuStatus = true"
									>
										{{ $t(`balance.frequency-${item.value}`) }}
									</KText>
								</WidgetItem>
							</Widget>
						</template>
					</KAutocomplete>
				</template>
				<KList>
					<KListItemGroup>
						<KListItem
							v-for="(item, key) in list"
							:key="key"
							style="--list-item-color: var(--primary-lighten)"
							dense
							link
							@click="frequency = item.value"
						>
							<KListItemContent>
								<Widget name="balance-amount-input-label-body-1">
									<WidgetItem v-slot="{ computedAttrs }" name="text">
										<KText v-bind="computedAttrs" style="color:var(--tertiary-darken)">
											{{ $t(`balance.frequency-${item.value}`) }}
										</KText>
									</WidgetItem>
								</Widget>
							</KListItemContent>
						</KListItem>
					</KListItemGroup>
				</KList>
			</KMenu>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';

	@Component
	export default class FormFrequencySelect extends Vue {
		@Prop({ required: true })
		protected list!: any;
		@Prop({ required: true })
		protected currentFrequency!: string;

		protected get frequency(): string {
			return this.currentFrequency;
		}
		protected set frequency(value: string) {
			this.$emit('changeFrequency', value);
		}

		protected setComputedFrequency(wallet: WALLETS.Wallet): void {
			this.$emit('setWallet', wallet);
		}

		protected menuStatus = false;

		protected getAutocompleteStyle({
			placeholderTop,
			expandIconTop,
			borderRadius,
			outlineColor,
			outlineHoverColor,
			outlineFieldsetBorder,
			activeLabelTransform
		}: COMMON.IMap<string>): string {
			return `--text-field-single-line-label-top:${placeholderTop};--text-field-outlined-dense-label-top:${placeholderTop};--text-field-outlined-prepend-append-margin-top: ${expandIconTop};--text-field-border-radius: ${borderRadius};--text-field-outlined-color:${outlineColor};--text-field-outlined-hover-color:${outlineHoverColor}; --text-field-outlined-fieldset-border:${outlineFieldsetBorder};--text-field-outlined-dense-label-active-transform:${activeLabelTransform};`;
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
			}
		];
	}
</script>
