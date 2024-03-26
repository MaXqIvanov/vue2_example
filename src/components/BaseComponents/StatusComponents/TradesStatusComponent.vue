<!-- компонент для статусов типа - FundsFrozen и аналогичные, можно посмотреть в константах DealStatuses -->
<template>
	<WidgetItem v-slot="{computedAttrs}" :name="nameWidgetItem">
		<KText
			v-if="isVisible"
			v-bind="computedAttrs"
			:style="{color: colorStatusDeal}"
		>
			{{ $t(statusText) }}
		</KText>
	</WidgetItem>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import InfoTooltip from '@/components/InfoTooltip.vue';
	import { statusTradesName, statusTradesColor, DealStatuses } from '@/const';

	@Component({
		name: 'TradesStatusComponent',
		components: { InfoTooltip }
	})
	export default class TradesStatusComponent extends Vue {
		@Prop({ default: 'status' }) nameWidgetItem!: string;
		@Prop({ required: true }) status!: DealStatuses;
		@Prop({ required: false, default: true }) isVisible!: boolean;

		public get statusText(): string {
			return statusTradesName[this.status];
		}

		public get colorStatusDeal(): string {
			return statusTradesColor[this.status];
		}
	}
</script>
