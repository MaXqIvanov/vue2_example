<template>
	<Widget name="balance-history-table-xs-section">
		<WidgetItem v-slot="{ computedAttrs }" name="date-row">
			<Widget v-bind="computedAttrs" name="balance-history-data-table-xs-date-section-header">
				<WidgetItem v-slot="{ computedAttrs }" name="date-string">
					<KText v-bind="computedAttrs">
						{{ dateString }}
					</KText>
				</WidgetItem>
				<WidgetItem v-slot="{ computedAttrs }" name="amount">
					<KText v-bind="computedAttrs">
						{{ listLengthString }}
					</KText>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<WidgetItem v-slot="{ computedAttrs }" name="data-list">
			<DataList :items="list" v-bind="computedAttrs" />
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import DataList from '@/components/HistoryTable/DataList.vue';
	import { pluralize } from '@/utils/utils';
	import { CURRENT_YEAR, renderDateKey } from '@/const';

	@Component({ components: { DataList } })
	export default class Section extends Vue {
		@Prop({ required: true }) protected list!: any[];
		@Prop({ required: true }) protected date!: string;

		protected get listLength(): number {
			return this.list.length;
		}

		protected get type(): string {
			return this.$route.params.historyType;
		}

		protected get listLengthString(): string {
			const currentEntityStrings = [
				`balance.${this.type}Amount-1`,
				`balance.${this.type}Amount-n`,
				`balance.${this.type}Amount-0`
			];
			return this.$t(pluralize(this.listLength, currentEntityStrings), { amount: this.listLength });
		}

		protected get dateString(): string {
			const dateValue = this.list[0][renderDateKey[this.type]];
			const fixDateFormat = dateValue.replace(/\s/, 'T');
			const dateYear = new Intl.DateTimeFormat(this.currentLocale, {
				year: 'numeric'
			}).format(new Date(fixDateFormat));
			const currentDate = new Intl.DateTimeFormat(this.currentLocale, {
				month: 'long',
				day: 'numeric'
			}).format(new Date(fixDateFormat));
			const isSameYear = Number(CURRENT_YEAR) === Number(dateYear) || !dateYear;
			return isSameYear ? currentDate : `${currentDate} ${dateYear}`;
		}

		protected get currentLocale(): string {
			return this.$store.state.translator.currentLocale;
		}
	}
</script>