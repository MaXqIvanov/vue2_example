<template>
	<Widget name="balance-history-table-xs-row">
		<WidgetItem v-slot="{ computedAttrs }" name="row-item">
			<template v-for="(number) in rowsAmount">
				<RowFlex
					:key="number"
					v-bind="computedAttrs"
					:classes="slotClasses[number]"
				>
					<template #flex-left>
						<slot :name="`flex-left-row-${number}`" />
					</template>
					<template #flex-right>
						<slot :name="`flex-right-row-${number}`" />
					</template>
				</RowFlex>
			</template>

			<Widget name="balance-history-table-xs-row-divider">
				<WidgetItem v-slot="{ computedAttrs }" name="divider">
					<KDivider v-bind="computedAttrs" />
				</WidgetItem>
			</Widget>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import RowFlex from '@/components/HistoryTable/common/RowFlex.vue';

	@Component({ components: { RowFlex } })
	export default class Row extends Vue {
		@Prop({ default: 1 }) rowsAmount!: number;
		@Prop({ required: false, type: Object, default: () => ({}) }) flexClass!: any;

		protected get slotClasses(): { [key: number]: COMMON.IMap<string | undefined> } {
			let classObject: { [key: number]: COMMON.IMap<string | undefined> } = {};
			for (let number = 1; number <= this.rowsAmount; number++) {
				classObject[number] = {
					left: this.flexClass[`flex-left-row-${number}`],
					right: this.flexClass[`flex-right-row-${number}`]
				};
			}

			return classObject;
		}
	}
</script>