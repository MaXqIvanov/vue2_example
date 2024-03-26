<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-slot="{ computedAttrs, modalDateTitle }"
			name="title"
			:contentVariables="modalDateVariables"
		>
			<KText v-bind="computedAttrs">
				{{ title || modalDateTitle }}
			</KText>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="date"
		>
			<KText v-bind="computedAttrs">
				{{ getDate }}
			</KText>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="time"
		>
			<KText v-bind="computedAttrs">
				{{ getTime }}
			</KText>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import { getDate, getTime } from '@/utils/utils';

	@Component({
		name: 'ModalDateBlock'
	})
	export default class ModalDateBlock extends Vue {
		@Prop({ default: 'balance-modal-date-block' }) nameWidget!: string;
		@Prop({ required: true }) date!: string;
		@Prop({ default: '' }) title!: string;

		protected get currentLocale(): string {
			return this.$store.state.translator.currentLocale;
		}

		protected get getDate(): string {
			return getDate(this.date, this.currentLocale);
		}

		protected get getTime(): string {
			return getTime(this.date, this.currentLocale);
		}

		protected modalDateVariables = [
			{
				name: 'modalDateTitle',
				type: 'translation',
				defaultValue: 'balance.modalDateTitle'
			}
		];
	}
</script>
