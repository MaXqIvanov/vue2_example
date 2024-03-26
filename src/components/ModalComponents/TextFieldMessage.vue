<template>
	<Widget
		:key="`${prefix}-input-message`"
		:name="`${prefix}-input-message`"
	>
		<WidgetItem
			v-slot="{ computedAttrs }"
			:name="widgetItemName"
		>
			<KText v-bind="computedAttrs">
				{{ message }}
			</KText>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';

	@Component
	export default class TextFieldMessage extends Vue {
		@Prop({ default: 'balance-modal-confirm-code', type: String }) protected prefix!: string;

		@Prop({ required: true, type: String }) protected message!: string;
		@Prop({ default: false, type: Boolean }) protected isHint!: boolean;

		protected get widgetItemName(): string {
			return this.isHint ? 'message-hint' : 'message';
		}
	}
</script>
