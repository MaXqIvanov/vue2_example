<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-if="!isAutocomplete"
			v-slot="{ computedAttrs, backgroundColor, minWidth }"
			name="select"
			:contentVariables="selectVariables"
		>
			<KSelect
				v-bind="computedAttrs"
				ref="selectEventQuickFilter"
				:value="value"
				:items="items"
				itemValue="value"
				:menuProps="{
					rounded: 'lg',
					bottom: true,
					offsetY: true,
					offsetOverflow: true,
					minWidth: minWidth,
					auto: false,
					maxHeight: '408px',
					closeOnClick: true
				}"
				:label="title"
				:backgroundColor="backgroundColor"
				@input="inputHandler"
				@click:append="selectClickHandler()"
			>
				<template #selection="{ item }">
					<Widget name="balance-modal-event-quick-filter-selection">
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="text"
						>
							<KText
								v-bind="computedAttrs"
							>
								{{ item.text }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>
				<template #item="{ item }">
					<Widget name="balance-modal-event-filter-item">
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="title"
						>
							<KText
								v-bind="computedAttrs"
							>
								{{ item.text }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>
			</KSelect>
		</WidgetItem>
		<WidgetItem
			v-if="isAutocomplete"
			v-slot="{ computedAttrs, backgroundColor }"
			name="autocomplete"
			:contentVariables="selectVariables"
		>
			<KAutocomplete
				v-bind="computedAttrs"
				ref="selectEventQuickFilter"
				:value="value"
				:items="items"
				:label="title"
				:backgroundColor="backgroundColor"
				@input="inputHandler"
			>
				<template #item="{ item }">
					<Widget name="balance-modal-event-filter-item">
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="title"
						>
							<KText
								v-bind="computedAttrs"
							>
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
	import { BALANCE_TEXT, OperationTypeFilter } from '@/const';

	@Component({
		name: 'ModalEventQuickFilterComponent'
	})
	export default class ModalEventQuickFilterComponent extends Vue {
		@Prop({ default: 'balance-modal-event-quick-filter-component' }) nameWidget!: string;
		@Prop({ default: '' }) title!: string;
		@Prop({ default: 0 }) value!: number;
		@Prop({ default: null }) list!: Array<WALLETS.networkCryptoCurrency>;
		@Prop({ default: false }) isAutocomplete!: boolean;

		protected walletsStore = MyRootStore.getInstance().wallets;
		protected historyStore = MyRootStore.getInstance().history;

		protected get items(): Array<{ value: OperationTypeFilter | null | number; text: string }> {
			return this.list ? this.addTitleToList(this.list) : this.operationTypeListFilter;
		}

		protected get operationTypeListFilter(): Array<{ value: OperationTypeFilter | null; text: string }> {
			return [
				{ value: null, text: this.$t(BALANCE_TEXT.allEvents) },
				...this.historyStore.getOperationTypeListFilter.map((key: OperationTypeFilter) => ({
					value: key,
					text: this.$t(BALANCE_TEXT.operationType + key)
				}))
			];
		}

		protected addTitleToList(list: Array<WALLETS.networkCryptoCurrency>): Array<WALLETS.networkCryptoCurrency> {
			list.unshift({ value: null, text: this.$t(this.title) });
			return list;
		}

		public inputHandler(value: number): void {
			this.$emit('input', value);
		}

		protected selectClickHandler(): void {
			// @ts-ignore-next-line
			this.$refs.selectEventQuickFilter?.onClick(this.$refs.selectEventQuickFilter);
		}

		protected variables = [
			{
				name: 'noSelection',
				type: 'translation',
				defaultValue: 'balance.quickFilterAllCurrencies'
			}
		];

		protected selectVariables = [
			{
				name: 'backgroundColor',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'minWidth',
				type: 'string',
				defaultValue: '292px'
			}
		];
	}
</script>
