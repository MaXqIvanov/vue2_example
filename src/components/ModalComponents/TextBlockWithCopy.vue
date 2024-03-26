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
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="text"
		>
			<KText
				v-bind="computedAttrs"
				@click="clickHandler"
			>
				{{ valueToShow }}
			</KText>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import MyRootStore from '@/store/store';

	@Component({
		name: 'ModalTextBlockWithCopy'
	})
	export default class ModalTextBlockWithCopy extends Vue {
		@Prop({ default: 'balance-modal-text-block-with-copy' }) nameWidget!: string;
		@Prop({ default: '' }) title!: string;
		@Prop({ default: '' }) text!: string;
		@Prop({ default: '' }) value!: string;

		protected historyStore = MyRootStore.getInstance().history;

		protected get valueToShow(): string {
			return this.text || this.value;
		}

		protected get valueToCopy(): string {
			return this.value || this.text;
		}

		public clickHandler(): void {
			this.historyStore.copyToClipboard(this.valueToCopy);
		}
	}
</script>
