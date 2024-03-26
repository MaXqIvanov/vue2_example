<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="select"
		>
			<KSelect
				v-bind="computedAttrs"
				:value="value"
				:items="items"
				itemValue="value"
				itemText="text"
				:label="title"
				:menuProps="{ rounded: 'lg', bottom: true, offsetY: true, offsetOverflow: true }"
				multiple
				@input="inputHandler"
			>
				<template #selection="{ index }">
					<Widget :name="selectionNameWidget">
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="text"
						>
							<KText
								v-if="!index"
								v-bind="computedAttrs"
							>
								{{ selectionTitle }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>
				<template #item="{ item }">
					<Widget name="balance-status-filter-select-items">
						<WidgetItem v-slot="{ computedAttrs }" name="checkbox">
							<KCheckbox
								:value="value.includes(item.value)"
								v-bind="computedAttrs"
							/>
						</WidgetItem>
						<WidgetItem v-slot="{ computedAttrs }" name="title">
							<KText v-bind="computedAttrs">
								{{ item.text }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>
			</KSelect>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import MyRootStore from '@/store/store';
	import { TransactionStatusFilter } from '@/const';

	@Component({
		name: 'ModalStatusFilterComponent'
	})
	export default class ModalStatusFilterComponent extends Vue {
		@Prop({ default: 'balance-modal-status-filter-component' }) nameWidget!: string;
		@Prop({ default: 'balance-modal-status-filter-selection' }) selectionNameWidget!: string;
		@Prop({ default: '' }) title!: string;
		@Prop({ default: () => [] }) value!: Array<number>;

		protected walletsStore = MyRootStore.getInstance().wallets;

		protected get items(): Array<any> {
			return Object.entries(TransactionStatusFilter).map(([key, value]) => ({
				value: value,
				text: this.$t(`balance.codeStatus-${key}`)
			}));
		}

		protected get selectionTitle(): string {
			if (this.value.length === 1) {
				return this.items.find((e) => e.value === this.value[0])?.text ?? '';
			}
			return `${this.title} (${this.value.length})`;
		}

		public inputHandler(data: number[][]): void {
			this.$emit('input', data);
		}
	}
</script>
