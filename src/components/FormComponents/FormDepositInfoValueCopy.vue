<template>
	<WidgetItem
		v-slot="{ computedAttrs, copiedText }"
		name="value"
		:contentVariables="copiedVariables"
	>
		<KTooltip
			v-model="showCopyTooltip"
			v-bind="computedAttrs"
			:openOnHover="false"
			top
		>
			<template #activator="{ on, attrs }">
				<Widget name="balance-account-form-info-value">
					<WidgetItem v-slot="{ computedAttrs }" name="text">
						<KText
							v-bind="{...attrs, ...computedAttrs}"
							:style="{ color: 'currentColor' }"
							v-on="on"
							@click="copyToClipboard"
						>
							{{ value }}
						</KText>
					</WidgetItem>
				</Widget>
			</template>
			<Widget name="balance-text-body-1-regular">
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

	@Component
	export default class FormDepositInfoValueCopy extends Vue {
		@Prop({ required: true }) protected value!: string;

		protected showCopyTooltip: boolean = false;

		protected copyToClipboard(): void {
			navigator.clipboard.writeText(this.value);
			this.showCopyTooltip = true;
			setTimeout(() => {
				this.showCopyTooltip = false;
			}, 1200);
		}

		protected copiedVariables = [
			{
				name: 'copiedText',
				type: 'translation',
				defaultValue: 'balance.copied'
			}
		];
	}
</script>