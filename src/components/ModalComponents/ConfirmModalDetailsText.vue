<template>
	<Widget name="balance-modal-confirm-details-text">
		<WidgetItem v-slot="{ computedAttrs }" name="label">
			<KText v-bind="computedAttrs">
				{{ labelTranslation }}
			</KText>
		</WidgetItem>
		
		<WidgetItem v-slot="{ computedAttrs }" name="value-currency">
			<Widget v-bind="computedAttrs" name="balance-modal-confirm-details-value-row">
				<WidgetItem
					v-if="!isNeedCopy"
					v-slot="{ computedAttrs }"
					name="value"
				>
					<KText v-bind="computedAttrs">
						{{ value }}
					</KText>
				</WidgetItem>
				<WidgetItem
					v-else
					v-slot="{ computedAttrs }"
					name="value-copy"
				>
					<Widget name="balance-modal-confirm-details-value-copy" v-bind="computedAttrs">
						<FormDepositInfoValueCopy :value="value" />
					</Widget>
				</WidgetItem>
				<WidgetItem
					v-if="currency"
					v-slot="{ computedAttrs }"
					name="currency"
				>
					<KText v-bind="computedAttrs">
						{{ currency }}
					</KText>
				</WidgetItem>

				<WidgetItem
					v-if="subtextRow"
					v-slot="{ computedAttrs }"
					name="subtext-row"
				>
					<KText v-bind="computedAttrs">
						{{ subtextRow }}
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem>
		<WidgetItem
			v-if="subtext"
			v-slot="{ computedAttrs }"
			name="subtext"
		>
			<KText v-bind="computedAttrs">
				{{ subtext }}
			</KText>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import FormDepositInfoValueCopy from '@/components/FormComponents/FormDepositInfoValueCopy.vue';

	@Component({ components: { FormDepositInfoValueCopy } })
	export default class ConfirmModalDetailsText extends Vue {
		@Prop({ required: true, type: String }) protected label!: string;
		@Prop({ required: true, type: [String, Number] }) protected value!: string | number;
		@Prop({ required: false, default: '', type: String }) protected currency?: string;
		@Prop({ required: false, default: '', type: String }) protected subtext?: string;
		@Prop({ required: false, default: '', type: String }) protected subtextRow?: string;
		@Prop({ required: false, default: false, type: Boolean }) protected isNeedCopy?: boolean;

		protected get labelTranslation(): string {
			return this.$t(this.label);
		}
	}
</script>