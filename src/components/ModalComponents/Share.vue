<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-slot="{ computedAttrs, iconName }"
			name="title"
			:contentVariables="iconVariables"
		>
			<KBtn
				v-bind="computedAttrs"
				icon
				:href="to"
				target="_blank"
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
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';

	@Component({
		name: 'ModalShareComponent'
	})
	export default class ModalShareComponent extends Vue {
		@Prop({ default: 'balance-modal-share-component' }) nameWidget!: string;
		@Prop({ default: '' }) to!: string;

		protected iconVariables = [
			{
				name: 'iconName',
				type: 'icon',
				defaultValue: 'share'
			}
		];
	}
</script>
