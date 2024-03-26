<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="textarea"
		>
			<KTextarea
				:value="value"
				v-bind="computedAttrs"
				:label="labelComputed"
				:error="isError"
				@input="inputHandler($event)"
			/>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs, acceptIconName }"
			name="accept"
			:contentVariables="variables"
		>
			<KBtn
				v-bind="computedAttrs"
				:disabled="isError"
				@click="accept"
			>
				<Widget name="balance-modal-action-icon">
					<WidgetItem v-slot="{ computedAttrs }" name="icon">
						<KIcon
							:name="acceptIconName"
							v-bind="computedAttrs"
						/>
					</WidgetItem>
				</Widget>
			</KBtn>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs, declineIconName }"
			name="decline"
			:contentVariables="variables"
		>
			<KBtn
				v-bind="computedAttrs"
				@click="decline"
			>
				<Widget name="balance-modal-action-icon">
					<WidgetItem v-slot="{ computedAttrs }" name="icon">
						<KIcon
							:name="declineIconName"
							v-bind="computedAttrs"
						/>
					</WidgetItem>
				</Widget>
			</KBtn>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';

	@Component({
		name: 'ModalTextBlock'
	})
	export default class ModalTextareaWithActions extends Vue {
		@Prop({ default: 'balance-modal-textarea-with-actions' }) nameWidget!: string;
		@Prop({ default: '' }) title!: string;
		@Prop({ default: '' }) value!: string;
		@Prop({ default: 200 }) maxLength!: number;

		protected get labelComputed(): string {
			return `${this.title} (${this.value.length}/${this.maxLength})`;
		}

		protected get isError(): boolean {
			return this.value.length > this.maxLength;
		}

		public inputHandler(value: string): void {
			this.$emit('input', value);
		}

		public accept(): void {
			this.$emit('accept');
		}

		public decline(): void {
			this.$emit('decline');
		}

		protected variables = [
			{
				name: 'acceptIconName',
				type: 'icon',
				defaultValue: 'complete'
			},
			{
				name: 'declineIconName',
				type: 'icon',
				defaultValue: 'close-small'
			}
		];
	}
</script>
