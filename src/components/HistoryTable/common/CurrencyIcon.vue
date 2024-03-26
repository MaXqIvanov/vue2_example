<template>
	<WidgetItem v-slot="{ computedAttrs }" name="icon">
		<KIcon v-bind="computedAttrs" :name="computedName" />
	</WidgetItem>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import MyRootStore from '@/store/store';

	@Component({ components: {} })
	export default class CurrencyIcon extends Vue {
		@Prop({ required: true, type: Number }) currencyId!: number;

		protected walletsStore = MyRootStore.getInstance().wallets;

		protected get computedName(): string {
			const wallet = this.walletsStore.getCurrencyById(this.currencyId);
			if (wallet === null) return '';
			const { currencyTitle, currencyType } = wallet;
			const namespace = currencyType ? 'currency' : 'fiat';
			return `${namespace}.${currencyTitle}`;
		}
	}
</script>