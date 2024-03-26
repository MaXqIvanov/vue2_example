<template>
	<KDialog
		v-model="infoModal"
		width="100%"
		maxWidth="max-content"
		class="k-dialog-default"
		attach=""
		v-on="$listeners"
	>
		<Widget name="balance-modal-card">
			<WidgetItem v-slot="{ computedAttrs }" name="card">
				<KCard v-bind="computedAttrs">
					<Widget :key="nameWidget" :name="nameWidget">
						<WidgetItem v-slot="{ computedAttrs }" name="title">
							<KText v-if="titleModal" v-bind="computedAttrs">
								{{ titleModal }}
							</KText>
							<KText v-else v-bind="computedAttrs" />
						</WidgetItem>
						<WidgetItem
							v-slot="{ computedAttrs, closeIconName }"
							name="close-btn"
							:contentVariables="iconVariables"
						>
							<KBtn
								v-bind="computedAttrs"
								icon
								@click="$emit('input', false)"
							>
								<KIcon :name="closeIconName" />
							</KBtn>
						</WidgetItem>
						<WidgetItem v-slot="{ computedAttrs }" name="divider">
							<KDivider v-bind="computedAttrs" />
						</WidgetItem>
						<WidgetItem
							v-slot="{ computedAttrs, colorBody }"
							name="body"
							:contentVariables="adsModalVariables"
						>
							<KText v-bind="computedAttrs" :style="{color: colorBody}" />
						</WidgetItem>
						<WidgetItem
							name="body-2"
						>
							<Widget name="balance-modal-body">
								<WidgetItem v-slot="{ computedAttrs }" name="body">
									<slot :computedAttrs="computedAttrs" name="body-2" />
								</WidgetItem>
							</Widget>
						</WidgetItem>
						<WidgetItem v-slot="{ computedAttrs }" name="actions">
							<slot :computedAttrs="computedAttrs" name="actions" />
						</WidgetItem>
						<WidgetItem v-slot="{ computedAttrs }" name="action-1">
							<slot :computedAttrs="computedAttrs" name="action-1" />
						</WidgetItem>
						<WidgetItem v-slot="{ computedAttrs }" name="action-2">
							<slot :computedAttrs="computedAttrs" name="action-2" />
						</WidgetItem>
					</Widget>
				</KCard>
			</WidgetItem>
		</Widget>
	</KDialog>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop, VModel } from 'vue-property-decorator';

	@Component({
		name: 'InfoModal'
	})
	export default class InfoModal extends Vue {
		@Prop({ default: 'balance-info-modal' }) nameWidget!: string;
		@Prop({ default: '' }) titleModal!: string;
		@VModel({ type: Boolean }) infoModal!: boolean;

		protected adsModalVariables = [
			{
				name: 'colorBody',
				type: 'string',
				defaultValue: 'var(--tertiary-darken)'
			}
		];

		protected iconVariables = [
			{
				name: 'closeIconName',
				type: 'icon',
				defaultValue: '$close'
			}
		];
	}
</script>
