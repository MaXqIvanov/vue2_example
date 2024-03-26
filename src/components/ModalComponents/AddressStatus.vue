<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-show="!isPinned"
			v-slot="{ computedAttrs, basic }"
			name="basic"
			:contentVariables="variables"
		>
			<KText v-bind="computedAttrs">
				{{ basic }}
			</KText>
		</WidgetItem>
		<WidgetItem
			v-show="isPinned"
			v-slot="{ computedAttrs, pinned }"
			name="pinned"
			:contentVariables="variables"
		>
			<KText v-bind="computedAttrs">
				{{ pinned }}
			</KText>
		</WidgetItem>
		<WidgetItem
			name="info"
		>
			<InfoTooltip>
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
		name: 'ModalAddressStatusComponent',
		components: { InfoTooltip }
	})
	export default class ModalAddressStatusComponent extends Vue {
		@Prop({ default: 'balance-modal-address-status-component' }) nameWidget!: string;
		@Prop({ required: true }) isPinned!: boolean;

		protected get tooltipText(): string {
			return this.$t(`balance.addressStatus-${!this.isPinned ? 'basic' : 'pinned'}`);
		}

		protected variables = [
			{
				name: 'basic',
				type: 'translation',
				defaultValue: 'balance.basic'
			},
			{
				name: 'pinned',
				type: 'translation',
				defaultValue: 'balance.pinned'
			}
		];
	}
</script>
