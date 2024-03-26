<template>
	<InfoModal
		:value="isDownloadHistoryModal"
		:titleModal="$t('balance.downloadHistory')"
		@input="hideModal"
	>
		<template #body-2>
			<Widget name="download-history-modal-body">
				<WidgetItem
					name="date"
				>
					<DateRangeFilter
						:fromValue="fromValue"
						:toValue="toValue"
						:title="$t('balance.filtersDateTitle')"
						:locale="locale"
						@input="dateInputHandler"
					/>
				</WidgetItem>
				<WidgetItem name="switch">
					<KSwitch v-if="isTransactions" v-model="isP2PTransactionsDownload">
						<template #label>
							<Widget name="download-history-modal-body-switch-label">
								<WidgetItem
									v-slot="{ computedAttrs }"
									name="label"
								>
									<KText v-bind="computedAttrs" />
								</WidgetItem>
							</Widget>
						</template>
					</KSwitch>
				</WidgetItem>
			</Widget>
		</template>
		<template #actions>
			<Widget name="download-history-modal-buttons">
				<WidgetItem
					v-slot="{ computedAttrs }"
					name="cancel"
				>
					<KBtn v-bind="computedAttrs" @click="hideModal(false)" />
				</WidgetItem>
				<WidgetItem
					v-slot="{ computedAttrs }"
					name="export"
				>
					<KBtn
						v-bind="computedAttrs"
						:disabled="isLoading"
						@click="downloadHistory"
					/>
				</WidgetItem>
			</Widget>
		</template>
	</InfoModal>
</template>

<script lang="ts">
	import { Vue, Component, Prop } from 'vue-property-decorator';
	import InfoModal from '@/views/ModalViews/InfoModal.vue';
	import MyRootStore from '@/store/store';
	import DateRangeFilter from '@/components/ModalComponents/DateRangeFilter.vue';
	import { HISTORY_TABLE_TYPE } from '@/const';

	@Component({
		components: { DateRangeFilter, InfoModal }
	})
	export default class DownloadHistory extends Vue {
		@Prop({ default: false }) isLoading?: boolean;
		protected historyStore = MyRootStore.getInstance().history;
		protected date: Array<string> = [];
		protected isP2PTransactionsDownload: boolean = false;

		protected get isDownloadHistoryModal(): boolean {
			return this.historyStore.isDownloadHistoryModal;
		}

		public hideModal(value: boolean): void {
			this.historyStore.setDownloadHistoryModal(value);
		}

		protected get locale(): string {
			return this.historyStore.currentLocale;
		}

		protected get currentRoute(): string {
			return this.$route.params.historyType;
		}

		protected get isTransactions(): boolean {
			return this.currentRoute === HISTORY_TABLE_TYPE.TRANSACTIONS;
		}

		protected get fromValue(): string {
			return this.date[0];
		}

		protected get toValue(): string {
			return this.date[1];
		}

		public dateInputHandler(date: Array<string>): void {
			this.date = date;
			this.historyStore.setTransactionsFilterValue('dateCreatedFrom', date[0] ?? '');
			this.historyStore.setTransactionsFilterValue('dateCreatedTo', date[1] ?? '');
			this.historyStore.setAddressesFilterValue('dateFrom', date[0] ?? '');
			this.historyStore.setAddressesFilterValue('dateTo', date[1] ?? '');
		}

		protected downloadHistory(): void {
			this.isTransactions
				? this.$emit('downloadHistory', this.isP2PTransactionsDownload)
				: this.$emit('downloadHistory');
		}
	}
</script>

<style scoped></style>
