<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-slot="{ computedAttrs, title }"
			name="header"
			:contentVariables="variables"
		>
			<KText v-bind="computedAttrs">
				{{ title }}
			</KText>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="give-icon"
		>
			<KIcon
				v-bind="computedAttrs"
				:name="giveCurrencyIconName"
			/>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="get-icon"
		>
			<KIcon
				v-bind="computedAttrs"
				:name="getCurrencyIconName"
			/>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs, buy, sell, swap, buyColor, sellColor }"
			name="type"
			:contentVariables="variables"
		>
			<KText
				v-if="isBuy"
				v-bind="computedAttrs"
				:style="{ color: buyColor }"
			>
				{{ buy }}
			</KText>
			<KText
				v-else-if="isSell"
				v-bind="computedAttrs"
				:style="{ color: sellColor }"
			>
				{{ sell }}
			</KText>
			<KText
				v-else
				v-bind="computedAttrs"
			>
				{{ swap }}
			</KText>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs, forText, toText }"
			name="title"
			:contentVariables="variables"
		>
			<KText
				v-if="isBuy"
				v-bind="computedAttrs"
			>
				{{ giveCurrencyTitle }} {{ forText }} {{ getCurrencyTitle }}
			</KText>
			<KText
				v-else-if="isSell"
				v-bind="computedAttrs"
			>
				{{ giveCurrencyTitle }} {{ forText }} {{ getCurrencyTitle }}
			</KText>
			<KText
				v-else
				v-bind="computedAttrs"
			>
				{{ giveCurrencyTitle }} {{ toText }} {{ getCurrencyTitle }}
			</KText>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import MyRootStore from '@/store/store';
	import { P2pDealType, CurrencyType } from '@/const';
	import { OperationSide } from '@/const';

	@Component({
		name: 'ModalDealDirectionComponent'
	})
	export default class ModalDealDirectionComponent extends Vue {
		@Prop({ default: 'balance-modal-deal-direction-component' }) nameWidget!: string;
		@Prop({ required: true }) getCurrencyId!: number;
		@Prop({ required: true }) giveCurrencyId!: number;
		@Prop({ required: true }) side!: number;

		protected walletsStore = MyRootStore.getInstance().wallets;
		protected historyStore = MyRootStore.getInstance().history;

		protected get getCurrencyTitle(): string {
			return this.historyStore.p2pCurrencyTitleById(this.getCurrencyId);
		}

		protected get giveCurrencyTitle(): string {
			return this.historyStore.p2pCurrencyTitleById(this.giveCurrencyId);
		}

		protected get getCurrencyIconName(): string {
			return this.currencyIconNameById(this.getCurrencyId);
		}

		protected get giveCurrencyIconName(): string {
			return this.currencyIconNameById(this.giveCurrencyId);
		}

		protected get dealType(): P2pDealType {
			if (
				this.historyStore.p2pCurrencyTypeById(this.giveCurrencyId) === CurrencyType.Cryptocurrency &&
				this.historyStore.p2pCurrencyTypeById(this.getCurrencyId) === CurrencyType.Cryptocurrency
			) {
				return P2pDealType.Swap;
			} else if (this.side === OperationSide.In) {
				return P2pDealType.Buy;
			}
			return P2pDealType.Sell;
		}

		protected get isBuy(): boolean {
			return this.dealType === P2pDealType.Buy;
		}

		protected get isSell(): boolean {
			return this.dealType === P2pDealType.Sell;
		}

		protected currencyIconNameById(id: number): string {
			return this.historyStore.p2pCurrencyIconNameById(id);
		}

		protected variables = [
			{
				name: 'title',
				type: 'translation',
				defaultValue: 'balance.dealDirectionTitle'
			},
			{
				name: 'buy',
				type: 'translation',
				defaultValue: 'balance.p2pBuy'
			},
			{
				name: 'sell',
				type: 'translation',
				defaultValue: 'balance.p2pSell'
			},
			{
				name: 'swap',
				type: 'translation',
				defaultValue: 'balance.p2pSwap'
			},
			{
				name: 'forText',
				type: 'translation',
				defaultValue: 'balance.p2pFor'
			},
			{
				name: 'toText',
				type: 'translation',
				defaultValue: 'balance.p2pTo'
			},
			{
				name: 'buyColor',
				type: 'string',
				defaultValue: 'var(--status-success-darken)'
			},
			{
				name: 'sellColor',
				type: 'string',
				defaultValue: 'var(--status-error-darken)'
			}
		];
	}
</script>
