<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="currency-icon"
		>
			<KIcon
				v-bind="computedAttrs"
				:name="iconName"
			/>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="currency-name"
		>
			<KText v-bind="computedAttrs">
				{{ currencyName }}
			</KText>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="currency-title"
		>
			<KText v-bind="computedAttrs">
				{{ currencyTitle }}
			</KText>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs, sideInIcon, sideOutIcon }"
			name="currency-side"
			:contentVariables="iconVariables"
		>
			<KIcon
				v-if="isSideIn"
				v-bind="computedAttrs"
				:name="sideInIcon"
			/>
			<KIcon
				v-if="isSideOut"
				v-bind="computedAttrs"
				:name="sideOutIcon"
			/>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import MyRootStore from '@/store/store';
	import { OperationSide } from '@/const';

	@Component({
		name: 'ModalCurrencyComponent'
	})
	export default class ModalCurrencyComponent extends Vue {
		@Prop({ default: 'balance-modal-currency-component' }) nameWidget!: string;
		@Prop({ required: true }) currencyId!: number;
		@Prop() side?: OperationSide;

		protected walletsStore = MyRootStore.getInstance().wallets;

		protected get currencyTitle(): string {
			return this.walletsStore.currencyTitleById(this.currencyId);
		}

		protected get currencyName(): string {
			return this.walletsStore.currencyNameById(this.currencyId);
		}

		protected get iconName(): string {
			return this.walletsStore.currencyIconNameById(this.currencyId);
		}

		protected get isSideIn(): boolean {
			return this.side === OperationSide.In;
		}

		protected get isSideOut(): boolean {
			return this.side === OperationSide.Out;
		}

		protected iconVariables = [
			{
				name: 'sideInIcon',
				type: 'icon',
				defaultValue: 'balance.operationSide-0'
			},
			{
				name: 'sideOutIcon',
				type: 'icon',
				defaultValue: 'balance.operationSide-1'
			}
		];
	}
</script>
