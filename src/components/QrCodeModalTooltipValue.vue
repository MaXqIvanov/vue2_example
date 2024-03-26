<template>
	<WidgetItem
		v-slot="{ computedAttrs, copiedText }"
		name="tooltip-value"
		:contentVariables="copiedVariables"
	>
		<KTooltip
			v-model="showCopyTooltip"
			v-bind="computedAttrs"
			:openOnHover="false"
			top
		>
			<template #activator="{ on, attrs }">
				<Widget name="balance-actions-crypto-deposit-qr-value">
					<WidgetItem v-slot="{ computedAttrs }" name="text">
						<KText
							v-bind="{ ...attrs, ...computedAttrs }"
							v-on="on"
							@click="copyToClipboard(value)"
						>
							{{ value }}
						</KText>
					</WidgetItem>
				</Widget>
			</template>
			<Widget name="balance-text-body-2-regular">
				<WidgetItem v-slot="{ computedAttrs }" name="text">
					<KText v-bind="computedAttrs">
						{{ $t(copiedText) }}
					</KText>
				</WidgetItem>
			</Widget>
		</KTooltip>
	</WidgetItem>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';

	@Component({ components: {} })
	export default class QrCodeModalTooltipValue extends Vue {
		@Prop({ required: true }) value!: string;

		protected showCopyTooltip: boolean = false;

		protected copiedVariables = [
			{
				name: 'copiedText',
				type: 'translation',
				defaultValue: 'balance.copied'
			}
		];

		protected copyToClipboard(value: string): void {
			navigator.clipboard.writeText(value);
			this.showCopyTooltip = true;
			setTimeout(() => {
				this.showCopyTooltip = false;
			}, 1200);
		}
	}
</script>