<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-slot="{ computedAttrs, title }"
			name="title"
			:contentVariables="modalStatusVariables"
		>
			<KText v-bind="computedAttrs">
				{{ title }}
			</KText>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="text"
			:contentVariables="statusColorVariables"
		>
			<KText
				:style="{ color: colorTextStatus }"
				v-bind="computedAttrs"
			>
				{{ statusText }}
			</KText>
		</WidgetItem>
		<WidgetItem
			v-slot="{
				computedAttrs,
				completedIcon,
				processingIcon,
				cancelledIcon
			}"
			name="icon"
			:contentVariables="modalStatusVariables"
		>
			<KIcon
				v-if="isCompleted"
				v-bind="computedAttrs"
				:name="completedIcon"
			/>
			<KIcon
				v-else-if="isCancelled"
				v-bind="computedAttrs"
				:name="cancelledIcon"
			/>
			<KIcon
				v-else
				v-bind="computedAttrs"
				:name="processingIcon"
			/>
		</WidgetItem>
		<WidgetItem
			name="tooltip"
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
	import { TransactionStatus } from '@/const';
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import InfoTooltip from '@/components/InfoTooltip.vue';
	import { statusColorVariables } from '@/const';

	@Component({
		name: 'TransactionStatusBlock',
		components: { InfoTooltip }
	})
	export default class TransactionStatusBlock extends Vue {
		@Prop({ default: 'balance-modal-transaction-status-block' }) nameWidget!: string;
		@Prop({ required: true }) status!: TransactionStatus;

		protected readonly statusColorVariables = statusColorVariables;

		protected get isCompleted(): boolean {
			return this.status === TransactionStatus.completed;
		}

		protected get isCancelled(): boolean {
			return this.status === TransactionStatus.cancelled;
		}

		protected get isAwaitingUserConfirmation(): boolean {
			return this.status === TransactionStatus.awaitingUserConfirmation;
		}

		protected get statusText(): string {
			return this.$t(`balance.codeStatus-${this.status}`);
		}

		protected get tooltipText(): string {
			return this.$t(`balance.tooltipStatus-${this.status}`);
		}

		protected get colorTextStatus(): string {
			return this.statusColorVariables[0].defaultValue[this.status];
		}

		protected modalStatusVariables = [
			{
				name: 'title',
				type: 'translation',
				defaultValue: 'balance.modalTransactionStatusTitle'
			},
			{
				name: 'completedIcon',
				type: 'icon',
				defaultValue: 'balance.operation-status-completed'
			},
			{
				name: 'cancelledIcon',
				type: 'icon',
				defaultValue: 'balance.operation-status-cancelled'
			},
			{
				name: 'processingIcon',
				type: 'icon',
				defaultValue: 'balance.operation-status-processing'
			},
			{
				name: 'completedColor',
				type: 'string',
				defaultValue: 'var(--status-success-darken)'
			},
			{
				name: 'cancelledColor',
				type: 'string',
				defaultValue: 'var(--status-error-darken-2)'
			},
			{
				name: 'awaitingUserConfirmationColor',
				type: 'string',
				defaultValue: 'var(--primary-lighten)'
			},
			{
				name: 'processingColor',
				type: 'string',
				defaultValue: 'var(--status-warning-darken)'
			}
		];
	}
</script>
