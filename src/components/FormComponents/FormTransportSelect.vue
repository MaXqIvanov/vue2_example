<template>
	<Widget key="balance-actions-transport-select" name="balance-actions-transport-select">
		<WidgetItem v-slot="{ computedAttrs, title }" name="title">
			<KText
				v-bind="computedAttrs"
				:title="title"
			/>
		</WidgetItem>

		<WidgetItem v-slot="{ computedAttrs, title }" name="subtitle">
			<KText
				v-bind="computedAttrs"
				:title="title"
			/>
		</WidgetItem>

		<WidgetItem v-slot="{ computedAttrs }" name="tooltip">
			<KTooltip
				v-if="subtitleTooltipText"
				key="balance-actions-transport-select-tooltip"
				top
			>
				<template #activator="{ on, attrs }">
					<KIcon
						name="$info"
						size="1rem"
						v-bind="{...attrs, ...computedAttrs}"
						v-on="on"
					/>
				</template>
				<Widget name="balance-text-body-2-regular">
					<WidgetItem v-slot="{ computedAttrs }" name="text">
						<KText v-bind="computedAttrs">
							{{ subtitleTooltipText }}
						</KText>
					</WidgetItem>
				</Widget>
			</KTooltip>
		</WidgetItem>

		<WidgetItem
			v-if="seamlessIntegrationEnabled && !value"
			key="balance-actions-transport-list"
			v-slot="{ computedAttrs }"
			name="transport-list"
		>
			<template v-for="(transport, index) in transports">
				<KCard
					:key="index + 'transport-item'"
					v-bind="computedAttrs"
					style="--card-sheet-border-radius: 0;"
					@click="setComputedTransport(transport)"
				>
					<FormTransportSelectItem
						:transportIconName="transport.iconName"
						:transportName="transport.name"
					/>
				</KCard>

				<KDivider :key="index + 'transport-divider'" style="background-color: var(--tertiary-darken); opacity: 0.1; margin: var(--spacing-2) 0" />
			</template>
		</WidgetItem>

		<WidgetItem
			v-else
			key="actions-transport-select-autocomplete"
			v-slot="{ computedAttrs, label, placeholderTop,
				expandIconTop,
				borderRadius,
				outlineColor,
				outlineHoverColor,
				outlineFieldsetBorder,
				activeLabelTransform }"
			:contentVariables="autocompleteVariables"
			name="select"
		>
			<KSelect
				v-bind="computedAttrs"
				ref="autocomplete"
				:items="transports"
				itemValue="id"
				itemText="name"
				:value="value"
				:label="label"
				:readonly="isReadonly"
				:disabled="isReadonly"
				returnObject
				:style="getAutocompleteStyle({placeholderTop,
					expandIconTop,
					borderRadius,
					outlineColor,
					outlineHoverColor,
					outlineFieldsetBorder,
					activeLabelTransform})"
				@change="setComputedTransport"
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
			</KSelect>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop, Watch } from 'vue-property-decorator';

	import FormTransportSelectItem from '@/components/FormComponents/FormTransportSelectItem.vue';

	@Component({ components: { FormTransportSelectItem } })
	export default class FormTransportSelect extends Vue {
		@Prop() protected value?: number;
		@Prop({ required: true })
		protected transports!: WALLETS.DepositTransactionMethodList;
		@Prop({ default: false }) protected isReadonly?: boolean;
		@Prop({ default: false }) protected seamlessIntegrationEnabled?: boolean;
		@Prop({ default: 'Выберите метод пополнения' }) protected subtitleText?: string;
		@Prop({ default: 'Выберите метод пополнения тултип' }) protected subtitleTooltipText?: string;

		protected setComputedTransport(transport: WALLETS.DepositTransactionMethod): void {
			this.$emit('setTransport', transport);
		}

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

		protected openAutocomplete(): void {
			if ((this.$refs as any).autocomplete) {
				(this.$refs as any).autocomplete.focus();
				(this.$refs as any).autocomplete.isMenuActive = true;
			}
		}

		@Watch('transports', { immediate: true })
		protected onTransportsChanged(): void {
			this.transports?.length && !this.value && setTimeout(() => this.openAutocomplete());
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
