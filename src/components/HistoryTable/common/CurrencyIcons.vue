<template>
	<Widget name="balance-history-table-xs-currency-pair">
		<WidgetItem v-slot="{computedAttrs}" name="give-currency-icon">
			<KIcon
				v-bind="computedAttrs"
				:name="giveIconName"
			/>
		</WidgetItem>
		<WidgetItem v-slot="{computedAttrs}" name="get-currency-icon">
			<KIcon
				v-bind="computedAttrs"
				:name="getIconName"
			/>
		</WidgetItem>
	</Widget>
</template>
<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';

	@Component({})
	export default class CurrencyIcons extends Vue {
		@Prop({ default: '' }) protected giveIconName!: string;
		@Prop({ default: '' }) protected getIconName!: string;
	}
</script>


