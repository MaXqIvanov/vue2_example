<template>
	<Widget name="balance-history-table-xs-row-flex">
		<WidgetItem
			name="flex-left"
			:class="classes.left"
		>
			<slot name="flex-left" />
		</WidgetItem>
		<WidgetItem name="flex-right" :class="classes.right">
			<slot name="flex-right" />
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';

	@Component({})
	export default class RowFlex extends Vue {
		@Prop({ required: false, type: Object, default: () => ({}) }) classes!: COMMON.IMap<string | undefined>;
	}
</script>