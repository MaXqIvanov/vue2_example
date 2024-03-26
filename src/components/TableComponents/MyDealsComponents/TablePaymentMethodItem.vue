<template>
	<Widget name="balance-history-table-p2p-payment-method-item-cell">
		<WidgetItem v-slot="{computedAttrs}" name="icon-method">
			<KIcon
				v-if="!showSwap"
				size="12"
				:name="iconPaymentMethod"
				v-bind="computedAttrs"
			/>
		</WidgetItem>
		<WidgetItem v-slot="{ computedAttrs }" name="payment-method-name">
			<KText
				v-if="!showSwap"
				v-bind="computedAttrs"
			>
				{{ paymentMethodName }}
			</KText>
		</WidgetItem>
		<WidgetItem v-slot="{computedAttrs}" name="icon-instant-exchange">
			<KIcon
				v-if="showSwap"
				v-bind="computedAttrs"
				size="12"
				name="payment-methods.instant-exchange"
			/>
		</WidgetItem>
		<WidgetItem
			v-if="showSwap"
			v-slot="{computedAttrs, title}"
			name="instant-exchange"
		>
			<KText
				v-if="showSwap"
				v-bind="computedAttrs"
			>
				{{ title }}
			</KText>
		</WidgetItem>
	</Widget>
</template>
<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';

	@Component({
		name: 'TablePaymentMethods'
	})
	export default class TablePaymentMethods extends Vue {
		@Prop({ default: () => ({}) }) protected isCryptoCurrencySwap!: boolean;
		@Prop({ default: null }) protected paymentMethod!: any | null;

		protected get showSwap(): boolean {
			return this.isCryptoCurrencySwap || (this.paymentMethod !== null && !this.paymentMethod?.name);
		}

		protected get iconPaymentMethod(): string {
			return `payment-methods.${this.paymentMethod?.id}`;
		}

		protected get paymentMethodName(): string {
			if (this.paymentMethod?.name) {
				return this.paymentMethod?.name;
			}
			return '';
		}
	}
</script>
