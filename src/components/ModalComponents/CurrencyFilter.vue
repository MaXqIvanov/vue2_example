<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-slot="{ computedAttrs, maxHeight }"
			name="select"
			:contentVariables="menuVariables"
		>
			<KAutocomplete
				v-bind="computedAttrs"
				:value="value"
				:items="items"
				itemValue="currencyId"
				itemText="currencyTitle"
				:label="title"
				:menuProps="{ maxHeight: maxHeight }"
				@input="inputHandler"
			>
				<template #item="{ item }">
					<Widget name="balance-modal-currency-filter-item">
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="icon"
						>
							<KIcon
								:name="getIconName(item)"
								v-bind="computedAttrs"
							/>
						</WidgetItem>
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="title"
						>
							<KText
								v-bind="computedAttrs"
							>
								{{ item.currencyTitle }}
							</KText>
						</WidgetItem>
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="name"
						>
							<KText
								v-bind="computedAttrs"
							>
								{{ item.currencyName }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>
				<template #selection="{ item }">
					<Widget name="balance-modal-currency-filter-item">
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="icon"
						>
							<KIcon
								:name="getIconName(item)"
								v-bind="computedAttrs"
							/>
						</WidgetItem>
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="name"
						>
							<KText
								v-bind="computedAttrs"
							>
								{{ item.currencyName }}
							</KText>
						</WidgetItem>
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="title"
						>
							<KText
								v-bind="computedAttrs"
							>
								{{ item.currencyTitle }}
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
	import { WalletCurrencyTypeIconNamespace } from '@/const';

	@Component({
		name: 'ModalCurrencyFilterComponent'
	})
	export default class ModalCurrencyFilterComponent extends Vue {
		@Prop({ default: 'balance-modal-currency-filter-component' }) nameWidget!: string;
		@Prop({ default: '' }) title!: string;
		@Prop({ default: 0 }) value!: number;

		protected walletsStore = MyRootStore.getInstance().wallets;

		protected get items(): WALLETS.WalletList {
			return this.walletsStore.wallets;
		}

		public getIconName(item: WALLETS.Wallet): string {
			return `${WalletCurrencyTypeIconNamespace[item.currencyType]}.${item.currencyTitle}`;
		}

		public inputHandler(value: number): void {
			this.$emit('input', value);
		}

		protected menuVariables = [
			{
				name: 'maxHeight',
				type: 'string',
				defaultValue: '304px'
			}
		];
	}
</script>
