<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="select"
		>
			<KAutocomplete
				v-bind="computedAttrs"
				:value="value"
				:items="items"
				itemValue="value"
				itemText="text"
				:label="title"
				@input="inputHandler"
			>
				<template #item="{ item }">
					<Widget name="balance-event-filter-select-item">
						<WidgetItem v-slot="{ computedAttrs }" name="title">
							<KText v-bind="computedAttrs">
								{{ item.text }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>
			</KAutocomplete>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import MyRootStore from '@/store/store';
	import { OperationTypeFilter } from '@/const';

	@Component({
		name: 'ModalEventFilterComponent'
	})
	export default class ModalEventFilterComponent extends Vue {
		@Prop({ default: 'balance-modal-event-filter-component' }) nameWidget!: string;
		@Prop({ default: '' }) title!: string;
		@Prop({ default: '' }) value!: string;

		protected walletsStore = MyRootStore.getInstance().wallets;
		protected historyStore = MyRootStore.getInstance().history;

		protected get items(): Array<{ value: OperationTypeFilter | null; text: string }> {
			return this.historyStore.getOperationTypeListFilter.map((key: OperationTypeFilter) => ({
				value: key,
				text: this.$t(`balance.operationType-${key}`)
			}));
		}

		public inputHandler(value: number): void {
			this.$emit('input', value);
		}
	}
</script>
