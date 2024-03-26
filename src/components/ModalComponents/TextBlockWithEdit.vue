<template>
	<Widget :name="nameWidget">
		<template v-if="!value">
			<WidgetItem
				key="balance-modal-text-block-with-edit-title"
				name="title"
			>
				<TitleWithTooltip
					:title="title"
					:tooltipText="tooltipText"
				/>
			</WidgetItem>
			<WidgetItem
				v-if="text"
				key="balance-modal-text-block-with-edit-text"
				v-slot="{ computedAttrs }"
				name="text"
			>
				<KText v-bind="computedAttrs">
					{{ text }}
				</KText>
			</WidgetItem>
			<WidgetItem
				v-else
				key="balance-modal-text-block-with-edit-empty-text"
				v-slot="{ computedAttrs }"
				name="empty-text"
			>
				<KText v-bind="computedAttrs">
					{{ emptyText }}
				</KText>
			</WidgetItem>
			<WidgetItem
				key="balance-modal-text-block-with-edit-edit-button"
				v-slot="{ computedAttrs, iconName }"
				name="edit-button"
				:contentVariables="variables"
			>
				<KBtn
					v-bind="computedAttrs"
					icon
					@click="openEdit"
				>
					<Widget name="balance-modal-action-icon">
						<WidgetItem v-slot="{ computedAttrs }" name="icon">
							<KIcon
								:name="iconName"
								v-bind="computedAttrs"
							/>
						</WidgetItem>
					</Widget>
				</KBtn>
			</WidgetItem>
		</template>
		<WidgetItem
			v-else
			key="balance-modal-text-block-with-edit-text-area"
			name="text-area"
		>
			<TextareaWithActions
				v-model="model"
				:title="title"
				@accept="accept"
				@decline="closeEdit"
			/>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import TitleWithTooltip from '@/components/ModalComponents/TitleWithTooltip.vue';
	import TextareaWithActions from '@/components/ModalComponents/TextareaWithActions.vue';

	@Component({
		name: 'ModalTextBlockWithEdit',
		components: { TitleWithTooltip, TextareaWithActions }
	})
	export default class ModalTextBlockWithEdit extends Vue {
		@Prop({ default: 'balance-modal-text-block-with-edit' }) nameWidget!: string;
		@Prop({ default: false }) value!: boolean;
		@Prop({ default: '' }) title!: string;
		@Prop({ default: '' }) text!: string;
		@Prop({ default: '' }) emptyText!: string;
		@Prop({ default: '' }) tooltipText!: string;

		protected model: string = '';

		protected variables = [
			{
				name: 'iconName',
				type: 'icon',
				defaultValue: '$edit'
			}
		];

		public openEdit(): void {
			this.$emit('input', true);
			this.model = this.text;
		}

		public closeEdit(): void {
			this.$emit('input', false);
		}

		public accept(): void {
			this.$emit('input', false);
			this.$emit('accept', this.model);
		}
	}
</script>
