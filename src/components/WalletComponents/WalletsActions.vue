<template>
	<Widget name="balance-wallets-dashboard">
		<WidgetItem v-slot="{ computedAttrs }" name="region-icon">
			<KIcon v-bind="computedAttrs" />
		</WidgetItem>

		<WidgetItem v-slot="{ computedAttrs, title }" name="dashboard">
			<KText v-bind="computedAttrs" style="color: inherit">
				{{ title }}
			</KText>
		</WidgetItem>

		<WidgetItem v-slot="{ computedAttrs }" name="search">
			<KIcon
				v-bind="computedAttrs"
				name="balance.search"
				@click="searchHandleClick"
			/>
		</WidgetItem>

		<WidgetItem v-slot="{ computedAttrs }" name="icon-show-hide-balance">
			<KIcon
				v-bind="computedAttrs"
				:name="iconToggleBalance"
				@click="toggleBalance"
			/>
		</WidgetItem>

		<WidgetItem
			v-if="isAutoViewAvailable"
			key="balance-actions-go-to-auto"
			v-slot="{ computedAttrs }"
			name="go-to-auto"
		>
			<KBtn
				v-bind="computedAttrs"
				icon
				:to="{ name: 'auto-withdrawal' }"
			>
				<KIcon name="balance.settings" />
			</KBtn>
		</WidgetItem>

		<WidgetItem name="history">
			<Widget name="balance-wallets-dashboard-history-icon" />
		</WidgetItem>

		<WidgetItem name="settings" style="overflow: visible !important">
			<KDialog v-model="dialog" width="min-content">
				<template #activator="{ on, attrs }">
					<KIcon
						name="balance.menu"
						v-bind="attrs"
						v-on="on"
					/>
				</template>

				<KCard>
					<Widget name="balance-wallets-settings">
						<WidgetItem name="close-button">
							<KIcon name="$close" @click="dialog = false" />
						</WidgetItem>

						<WidgetItem
							v-slot="{ computedAttrs, title }"
							name="title"
							style="display: flex; justify-self: center; align-self: center"
						>
							<KText v-bind="computedAttrs" style="color: inherit ;">
								{{ title }}
							</KText>
						</WidgetItem>

						<WidgetItem
							v-slot="{ computedAttrs, nameColor, itemClass, titleColor }"
							name="main-currency"
							:contentVariables="autocompleteCurrenciesClasses"
						>
							<KAutocomplete
								itemValue="currencyId"
								:filter="filter"
								itemText="currencyName"
								:items="wallets"
								returnObject
								hideDetails
								:value="selectedItem"
								:style="favoriteCurrencyStyle"
								v-bind="computedAttrs"
								@blur="blurHandler"
								@focus="focusHandler"
								@change="setCurrency($event)"
							>
								<template #item="{ item }">
									<KIcon
										size="24"
										:name="`${namespaceByCurrencyTypeId[item.currencyType]}.${item.currencyTitle}`"
										style="padding-right: 8px"
									/>
									<KText
										:class="itemClass"
										:style="{ color: nameColor }"
										style="padding-right: 5px"
									>
										{{ item.currencyName }}
									</KText>
									<KText :class="itemClass" :style="{ color: titleColor }">
										{{ item.currencyTitle }}
									</KText>
								</template>
								<template #selection="{ item }">
									<KIcon
										size="24"
										:name="`${namespaceByCurrencyTypeId[item.currencyType]}.${item.currencyTitle}`"
										style="padding-right: 8px"
									/>
									<KText
										:class="itemClass"
										:style="{ color: nameColor }"
										style="padding-right: 5px"
									>
										{{ item.currencyName }}
									</KText>
									<KText :class="itemClass" :style="{ color: titleColor }">
										{{ item.currencyTitle }}
									</KText>
								</template>
							</KAutocomplete>
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="save-button">
							<KBtn v-bind="computedAttrs" @click="saveSettingsHandler" />
						</WidgetItem>
					</Widget>
				</KCard>
			</KDialog>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import { CurrencyTypeIota } from '@/const';
	import MyRootStore from '@/store/store';

	@Component
	export default class WalletsActions extends Vue {
		@Prop({ type: Array, required: true }) protected wallets!: WALLETS.WalletList;
		@Prop({ type: Number, default: 1 }) protected selectedItemId!: number;
		@Prop({ type: Boolean, default: true }) protected isAutoViewAvailable!: number;
		protected walletsStore = MyRootStore.getInstance().wallets;
		protected dialog: boolean = false;
		protected favoriteCurrencyFocused: boolean = false;
		protected chosenCurrencyId: any = null;

		protected namespaceByCurrencyTypeId: COMMON.IMap<string> = {
			[CurrencyTypeIota.Fiat]: 'fiat',
			[CurrencyTypeIota.Cryptocurrency]: 'currency'
		};

		protected get selectedItem(): WALLETS.Wallet | Record<string, unknown> {
			const item = this.wallets.find((currency: WALLETS.Wallet) => {
				return currency.currencyId === this.selectedItemId;
			});
			if (item) {
				return item;
			}
			return {};
		}

		protected get favoriteCurrencyStyle(): string {
			return this.favoriteCurrencyFocused || this.chosenCurrencyId
				? '--text-field-outlined-prepend-append-margin-top: 10px;'
				: '--text-field-outlined-dense-label-top: 15px; --text-field-outlined-prepend-append-margin-top: 10px;';
		}

		protected saveSettingsHandler(): void {
			this.dialog = false;
			this.$emit('change-favorite-market', this.chosenCurrencyId);
		}

		protected searchHandleClick(): void {
			this.$emit('search-handle-click');
		}

		protected toggleBalance(): void {
			this.walletsStore.setShowBalance();
		}

		protected filter(item: any, queryText: string, itemText: string): boolean {
			return (
				itemText.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1 ||
				(item.currencyTitle && item.currencyTitle.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1)
			);
		}

		protected setCurrency(item: any): void {
			this.chosenCurrencyId = item.currencyId;
		}

		protected blurHandler(): void {
			this.favoriteCurrencyFocused = false;
		}

		protected focusHandler(): void {
			this.favoriteCurrencyFocused = true;
		}

		protected get showBalance(): boolean {
			return this.$store.state.sharedData.showBalance;
		}

		protected get iconToggleBalance(): string {
			return this.showBalance ? 'system.preview-close-one--colorable' : 'system.preview-open-one--colorable';
		}

		protected autocompleteCurrenciesClasses = [
			{
				name: 'nameColor',
				type: 'string',
				defaultValue: 'var(--tertiary-darken)'
			},
			{
				name: 'itemClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-1-regular'
			},
			{
				name: 'titleColor',
				type: 'string',
				defaultValue: 'var(--tertiary-darken)'
			}
		];
	}
</script>
