<template>
	<Widget name="balance-history-table-xs-empty-table">
		<WidgetItem v-slot="{ computedAttrs }" name="icon">
			<KIcon v-bind="computedAttrs" :name="iconName" />
		</WidgetItem>
		<WidgetItem v-slot="{ computedAttrs }" name="description-text">
			<KText v-bind="computedAttrs">
				{{ descriptionText }}
			</KText>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';

	@Component({ components: {} })
	export default class EmptyTableScreen extends Vue {
		@Prop({ required: true, type: String }) type!: string;
		@Prop({ default: false, type: Boolean }) isFiltered!: boolean;

		protected get iconName(): string {
			return this.isFiltered ? 'balance.no-results' : `balance.${this.type}-history-empty`;
		}

		protected get descriptionText(): string {
			return this.isFiltered
				? this.$t('balance.filterNothingFound')
				: this.$t(`balance.${this.type}HistoryEmptyDescription`);
		}
	}
</script>