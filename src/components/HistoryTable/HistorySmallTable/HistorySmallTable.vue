<template>
	<Widget name="balance-wallets-additional-history-operations-small-table">
		<WidgetItem name="small-table-default">
			<HistorySmallTableDefault v-if="nameSmallTable === 'default'" />
		</WidgetItem>
		<WidgetItem name="small-table-detailed">
			<HistorySmallTableDetailed v-if="nameSmallTable === 'detailed'" />
		</WidgetItem>
		<WidgetItem name="small-table-in-process">
			<HistorySmallTableInProcessDetailed v-if="nameSmallTable === 'in-process'" />
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue, { defineAsyncComponent } from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	const HistorySmallTableDefault = defineAsyncComponent(
		() => import('@/components/HistoryTable/HistorySmallTable/HistorySmallTableDefault.vue')
	);
	const HistorySmallTableDetailed = defineAsyncComponent(
		() => import('@/components/HistoryTable/HistorySmallTable/HistorySmallTableDetailed.vue')
	);
	const HistorySmallTableInProcessDetailed = defineAsyncComponent(
		() => import('@/components/HistoryTable/HistorySmallTable/HistorySmallTableInProcessDetailed.vue')
	);

	@Component({
		components: { HistorySmallTableInProcessDetailed, HistorySmallTableDetailed, HistorySmallTableDefault }
	})
	export default class HistorySmallTable extends Vue {
		@Prop({}) nameSmallTable!: string;
	}
</script>

<style scoped></style>
