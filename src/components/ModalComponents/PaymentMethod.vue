<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-slot="{ computedAttrs, title }"
			name="header"
			:contentVariables="variables"
		>
			<KText v-bind="computedAttrs">
				{{ title }}
			</KText>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="icon"
		>
			<KIcon
				v-bind="computedAttrs"
				:name="paymentMethodIconName"
			/>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="name"
		>
			<KText v-bind="computedAttrs">
				{{ paymentMethodName }}
			</KText>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';

	@Component({
		name: 'ModalPaymentMethodComponent'
	})
	export default class ModalPaymentMethodComponent extends Vue {
		@Prop({ default: 'balance-modal-payment-method-component' }) nameWidget!: string;
		@Prop({ required: true }) paymentMethodId!: number;
		@Prop({ required: true }) paymentMethodName!: string;

		protected get paymentMethodIconName(): string {
			return `payment-methods.${this.paymentMethodId}`;
		}

		protected variables = [
			{
				name: 'title',
				type: 'translation',
				defaultValue: 'balance.paymentMethodTitle'
			}
		];
	}
</script>
