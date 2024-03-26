<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="title"
		>
			<KText v-bind="computedAttrs">
				{{ title }}
			</KText>
		</WidgetItem>
		<WidgetItem name="tooltip">
			<InfoTooltip
				v-if="tooltipText"
			>
				<Widget name="balance-text-body-2-regular">
					<WidgetItem v-slot="{ computedAttrs }" name="text">
						<KText v-bind="computedAttrs">
							{{ tooltipText }}
						</KText>
					</WidgetItem>
				</Widget>
			</InfoTooltip>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import InfoTooltip from '@/components/InfoTooltip.vue';

	@Component({
		name: 'ModalTitleWithTooltip',
		components: { InfoTooltip }
	})
	export default class ModalTitleWithTooltip extends Vue {
		@Prop({ default: 'balance-modal-title-with-tooltip' }) nameWidget!: string;
		@Prop({ default: '' }) title!: string;
		@Prop({ default: '' }) tooltipText!: string;
	}
</script>
