<template>
	<Widget name="balance-wallets-search">
		<WidgetItem v-slot="{ computedAttrs }" name="search">
			<KTextField
				v-model="search"
				label=""
				v-bind="computedAttrs"
				hideDetails
				autofocus
				@blur="$emit('search-handle-blur', $event)"
				@click:clear="$emit('search-handle-input', '')"
				@input="searchHandleInput"
			>
				<template #prepend-inner>
					<KIcon name="balance.active-search" />
				</template>
			</KTextField>
		</WidgetItem>

		<WidgetItem v-slot="{ computedAttrs, name }" name="dashboard-button">
			<KIcon
				:name="name"
				v-bind="computedAttrs"
				@click="searchHandleClick"
			/>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component } from 'vue-property-decorator';

	@Component
	export default class WalletsSearch extends Vue {
		public search = '';

		public searchHandleInput(): void {
			this.$emit('search-handle-input', this.search);
		}

		public searchHandleClick(): void {
			this.$emit('search-handle-click');
		}
	}
</script>
