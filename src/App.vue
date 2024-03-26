<template>
	<KeepAlive>
		<RouterView />
	</KeepAlive>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Watch } from 'vue-property-decorator';

	import MyRootStore from '@/store/store';

	@Component({
		name: 'Balance'
	})
	export default class App extends Vue {
		protected store = MyRootStore.getInstance();
		protected walletsStore = this.store.wallets;
		protected historyStore = this.store.history;

		protected async activated(): Promise<void> {
			// this.walletsStore.setFormRoute();
			this.historyStore.setAddresses();
			this.historyStore.setMyDeals();
			this.walletsStore.initWallets();
		}

		protected get isScreenSizeLessMD(): boolean {
			return this.store.isScreenSizeLessMD;
		}

		@Watch('isScreenSizeLessMD')
		protected onScreenSizeChanged(newValue: boolean): void {
			!newValue && this.historyStore.setLastOperations();
		}
	}
</script>
