<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="title"
		>
			<KText v-bind="computedAttrs" :class="classText">
				{{ title }}
			</KText>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs, inColor, outColor }"
			name="value"
			:contentVariables="modalCurrencyChangeVariables"
		>
			<KText
				v-if="hasSign"
				:class="classText"
				:style="{
					color: value > 0 ? inColor :
						value < 0 ? outColor :
						undefined
				}"
				v-bind="computedAttrs"
			>
				{{ valueText }}
			</KText>
			<KText
				v-else
				:class="classText"
				v-bind="computedAttrs"
			>
				{{ valueText }}
			</KText>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="currency-title"
		>
			<KText v-bind="computedAttrs" :class="classText">
				{{ currencyTitle }}
			</KText>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import { Component, Prop } from 'vue-property-decorator';
	import MyRootStore from '@/store/store';
	import { formatNumberAndFixedDecimals } from '@/utils/utils';
	import { mixins } from 'vue-class-component';
	import FormatNumberDecimals from '@/mixins/formatNumberDecimals';

	@Component({
		name: 'ModalCurrencyChangeBlock'
	})
	export default class ModalCurrencyChangeBlock extends mixins(FormatNumberDecimals) {
		@Prop({ default: 'balance-modal-currency-change-block' }) nameWidget!: string;
		@Prop({ default: '' }) title!: string;
		@Prop({ required: true }) value!: number;
		@Prop({ default: false }) hasSign!: boolean;
		@Prop({ required: true }) currencyId!: number;
		@Prop({ default: '' }) classText!: string;

		protected walletsStore = MyRootStore.getInstance().wallets;

		protected get currencyTitle(): string {
			const currencyTitle = this.walletsStore.currencyTitleById(this.currencyId);
			if (currencyTitle != String(this.currencyId)) return currencyTitle;

			const currency = this.walletsStore.sharedDataCurrencies?.find((item) => item.id === this.currencyId);
			return currency?.title || String(this.currencyId);
		}

		protected get valueText(): string {
			const sign: string = this.value > 0 ? '+' : '';
			const prefix = this.hasSign ? sign : '';
			return prefix + this.getFormatNumberAndFixedDecimals(this.value, this.title);
		}

		protected get currentLocale(): string {
			return this.$store.state.translator.currentLocale;
		}

		protected formatNumberAndFixedDecimals(value: number, decimals: number): string {
			return formatNumberAndFixedDecimals(value, this.currentLocale, decimals);
		}

		protected modalCurrencyChangeVariables = [
			{
				name: 'inColor',
				type: 'string',
				defaultValue: 'var(--status-success-darken)'
			},
			{
				name: 'outColor',
				type: 'string',
				defaultValue: 'var(--status-error-darken)'
			}
		];
	}
</script>
