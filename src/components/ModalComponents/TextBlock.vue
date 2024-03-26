<template>
	<Widget :name="nameWidget">
		<WidgetItem name="title">
			<TitleWithTooltip
				:title="title"
				:tooltipText="tooltipText"
			/>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="text"
		>
			<KText v-bind="computedAttrs">
				{{ text }}
			</KText>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="extra"
		>
			<KText v-bind="computedAttrs">
				{{ extra }}
			</KText>
		</WidgetItem>
		<WidgetItem
			v-if="link"
			v-slot="{ computedAttrs }"
			:key="link"
			name="link"
		>
			<KText
				v-bind="computedAttrs"
				:to="link"
				target="_blank"
			>
				{{ linkText || link }}
			</KText>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import TitleWithTooltip from '@/components/ModalComponents/TitleWithTooltip.vue';

	@Component({
		name: 'ModalTextBlock',
		components: { TitleWithTooltip }
	})
	export default class ModalTextBlock extends Vue {
		@Prop({ default: 'balance-modal-text-block' }) nameWidget!: string;
		@Prop({ default: '' }) title!: string;
		@Prop({ default: '' }) text!: string;
		@Prop({ default: '' }) extra!: string;
		@Prop({ default: '' }) tooltipText!: string;
		@Prop({ default: null }) link?: string | null;
		@Prop({ default: '_self' }) target?: string;
		@Prop({ default: '' }) linkText?: string;
	}
</script>
