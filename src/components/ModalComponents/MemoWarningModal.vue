<template>
	<WidgetItem
		key="balance-actions-crypto-memo-warning-modal"
		v-slot="{ computedAttrs }"
		name="memo-warning-modal"
	>
		<KDialog
			v-model="dialog"
			v-bind="computedAttrs"
			attach=""
		>
			<Widget name="balance-actions-crypto-memo-warning-modal-dialog">
				<WidgetItem v-slot="{ computedAttrs }" name="title">
					<KText v-bind="computedAttrs" />
				</WidgetItem>
				<WidgetItem v-slot="{ computedAttrs }" name="close-btn">
					<KIcon v-bind="computedAttrs" @click="closeModal" />
				</WidgetItem>
				<WidgetItem v-slot="{ computedAttrs }" name="text-body">
					<KText v-bind="computedAttrs">
						{{ textBody }}
					</KText>
				</WidgetItem>
				<WidgetItem v-slot="{ computedAttrs, title }" name="text-link">
					<KText v-bind="computedAttrs">
						{{ title }}
						<WidgetItem v-slot="{ computedAttrs }" name="text-link-colorable">
							<KText v-bind="computedAttrs" />
						</WidgetItem>
					</KText>
				</WidgetItem>
				<WidgetItem
					v-slot="{ computedAttrs, activeCheckBox, inactiveCheckBox }"
					name="check-box"
					:contentVariables="checkBoxIconVariables"
				>
					<KIcon
						v-bind="computedAttrs"
						:name="isCheckBoxActive ? activeCheckBox : inactiveCheckBox"
						@click="setCheckBox"
					/>
				</WidgetItem>
				<WidgetItem v-slot="{ computedAttrs }" name="check-box-title">
					<KText v-bind="computedAttrs" />
				</WidgetItem>
				<WidgetItem v-slot="{ computedAttrs }" name="action-close-modal">
					<KBtn v-bind="computedAttrs" @click="closeModal" />
				</WidgetItem>
			</Widget>
		</KDialog>
	</WidgetItem>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';

	@Component({ components: {} })
	export default class MemoWarningModal extends Vue {
		@Prop({ default: null }) setModalActive!: (a: boolean, b: boolean) => void;
		@Prop({ type: Boolean, default: false }) isOpen!: boolean;
		@Prop({ type: String, default: '' }) textBody?: string;
		protected dialog = false;
		public isCheckBoxActive = false;

		public setCheckBox(): void {
			this.isCheckBoxActive = !this.isCheckBoxActive;
		}

		public closeModal(): void {
			this.setModalActive(false, this.isCheckBoxActive);
		}

		protected mounted(): void {
			this.dialog = this.isOpen;
		}

		public checkBoxIconVariables = [
			{
				name: 'activeCheckBox',
				type: 'icon',
				defaultValue: '$checkboxOn'
			},
			{
				name: 'inactiveCheckBox',
				type: 'icon',
				defaultValue: '$checkboxOff'
			}
		];
	}
</script>