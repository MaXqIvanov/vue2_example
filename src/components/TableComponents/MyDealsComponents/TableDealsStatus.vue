<template>
	<Widget name="balance-history-table-p2p-deal-status-cell">
		<TradesStatusComponent :status="dealStatus" :isVisible="!showTimer" />
		<WidgetItem
			v-slot="{computedAttrs, gradientTimer, classTextTimer}"
			name="timer"
			:contentVariables="colors"
		>
			<KChip
				v-if="showTimer"
				v-bind="computedAttrs"
			>
				<KText :style="`background-image: ${gradientTimer}; -webkit-background-clip: text; -webkit-text-fill-color: transparent;`" :class="classTextTimer">
					{{ timer }}
				</KText>
			</KChip>
		</WidgetItem>
	</Widget>
</template>
<script lang="ts">
	import { DealStatuses } from '@/const';
	import { timerTick } from '@/utils/utils';
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import TradesStatusComponent from '@/components/BaseComponents/StatusComponents/TradesStatusComponent.vue';

	@Component({
		name: 'TableDealsStatus',
		components: { TradesStatusComponent }
	})
	export default class TableDealsStatus extends Vue {
		@Prop({ default: 'none' }) protected dealStatus!: string;
		@Prop({ required: true }) protected availableUntil!: string;
		@Prop({ required: true }) protected rsgActiveUntil!: string;

		protected colors = [
			{
				name: 'gradientTimer',
				type: 'string',
				defaultValue: 'var(--gradient-primary-gradient)'
			},
			{
				name: 'classTextTimer',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-1-medium'
			}
		];

		created(): void {
			this.initTimer();
		}

		protected intervalId = 0;
		protected timer = '';

		protected clearTimer(): void {
			this.timer = '';
			clearInterval(this.intervalId);
		}

		protected normalizedTime(time: string): string {
			if (time && !Number.isInteger(time)) {
				return `${time.toString().substring(0, 10)}T${time.toString().substring(11)}`;
			}
			return time;
		}

		protected initTimer(): void {
			if (this.activeUntilTimer) {
				const date = new Date(this.normalizedTime(this.activeUntilTimer)).getTime();
				const timeDifference = date - Date.now();
				if (timeDifference < 0) {
					return;
				}
				this.startTimer(date);
			}
		}

		protected startTimer(endTime: number, interval: number = 1000): void {
			this.clearTimer();

			this.timer = timerTick(endTime);
			this.intervalId = setInterval(() => {
				this.timer = timerTick(endTime);
				if (Date.now() >= endTime) {
					this.clearTimer();
					this.$emit('update-data');
					return;
				}
			}, interval) as any;
		}

		public get activeUntilTimer(): string {
			switch (this.dealStatus) {
				case DealStatuses.FundsFreezeConfirmation:
				case DealStatuses.MFASent:
				case DealStatuses.Created:
					return this.rsgActiveUntil;
				default:
					return this.availableUntil;
			}
		}

		protected get showTimer(): boolean {
			return (
				Boolean(this.timer) && this.dealStatus !== DealStatuses.Completed && this.dealStatus !== DealStatuses.Cancelled
			);
		}
	}
</script>
