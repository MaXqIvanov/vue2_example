<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-slot="{ computedAttrs, backgroundColor }"
			name="select"
			:contentVariables="selectVariables"
		>
			<KSelect
				v-bind="computedAttrs"
				ref="selectCurrencyQuickFilter"
				:value="value"
				:items="itemsFiltred"
				itemValue="id"
				:menuProps="{
					rounded: 'lg',
					bottom: true,
					offsetY: true,
					offsetOverflow: true,
					minWidth: '292px',
					auto: false,
					maxHeight: '408px',
					closeOnClick: true
				}"
				attach=""
				:backgroundColor="backgroundColor"
				:label="title"
				@input="inputHandler"
				@click:append="selectClickHandler"
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
								{{ item.title }}
							</KText>
						</WidgetItem>
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="name"
						>
							<KText
								v-bind="computedAttrs"
							>
								{{ item.name }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>

				<template #selection>
					<Widget name="balance-modal-currency-quick-filter-selection">
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="text"
						>
							<KText v-bind="computedAttrs">
								{{ prependInnerText }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>

				<template #prepend-item>
					<Widget name="balance-modal-currency-quick-filter-textfield">
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="text"
							:contentVariables="variables"
						>
							<KTextField
								v-model="test"
								v-bind="computedAttrs"
								autofocus
							/>
						</WidgetItem>
					</Widget>
				</template>

				<template #no-data>
					<Widget name="balance-wallets-card-list-empty" :style="{ marginTop: 'var(--spacing-16)', marginBottom: '156px' }">
						<WidgetItem v-slot="{ computedAttrs, name }" name="icon">
							<KIcon
								v-bind="computedAttrs"
								:name="name"
								size="64"
							/>
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs, title }" name="title">
							<KText v-bind="computedAttrs">
								{{ title }}
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
	import { WalletCurrencyType, WalletCurrencyTypeIconNamespace } from '@/const';

	@Component({
		name: 'ModalCurrencyQuickFilterComponent'
	})
	export default class ModalCurrencyQuickFilterComponent extends Vue {
		@Prop({ default: 'balance-modal-currency-quick-filter-component' }) nameWidget!: string;
		@Prop({ default: '' }) title!: string;
		@Prop({ default: 0 }) value!: number;

		protected walletsStore = MyRootStore.getInstance().wallets;

		protected test = '';

		protected get prependInnerText(): string {
			const currency = this.items.find((item) => item.id === this.value);
			return currency?.title || this.$t('balance.quickFilterAllCurrencies');
		}

		protected get items(): Array<HISTORY.CurrencyListItem> {
			return [
				{
					id: null,
					title: this.$t('balance.quickFilterAllCurrencies')
				},
				...this.walletsStore.wallets.map((wallet: WALLETS.Wallet) => ({
					id: wallet.currencyId,
					name: wallet.currencyName,
					title: wallet.currencyTitle,
					type: wallet.currencyType
				}))
			];
		}

		protected get itemsFiltred(): Array<HISTORY.CurrencyListItem> {
			return this.items.filter(this.filterFunction);
		}

		public getIconName(item: HISTORY.CurrencyListItem): string {
			return item.id
				? `${WalletCurrencyTypeIconNamespace[item.type ?? WalletCurrencyType.Cryptocurrency]}.${item.title}`
				: 'all-coins';
		}

		public inputHandler(value: number): void {
			this.$emit('input', value);
		}

		public filterFunction(item: HISTORY.CurrencyListItem): boolean {
			return (
				item.name?.toLowerCase().includes(this.test.toLowerCase()) ||
				item.title.toLowerCase().includes(this.test.toLowerCase()) ||
				item.title === this.prependInnerText
			);
		}

		protected selectClickHandler(): void {
			// @ts-ignore-next-line
			this.$refs.selectCurrencyQuickFilter?.onClick(this.$refs.selectCurrencyQuickFilter);
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
			}
		];
	}
</script>
