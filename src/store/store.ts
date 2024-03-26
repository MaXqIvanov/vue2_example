import { Module, Getter } from 'vuex-simple';
import { Store } from 'vuex';
import WalletModule from '@/store/modules/walletModule';
import HistoryModule from '@/store/modules/historyModule';

let instance: MyRootStore | null = null;
let store: Store<any> | undefined = undefined;

export function setStore(globalStore: Store<any>): void {
	store = globalStore;
}

export function getStore(): Store<any> {
	return store as Store<any>;
}

export default class MyRootStore {
	static getInstance(): MyRootStore {
		return instance || new MyRootStore();
	}

	constructor() {
		if (instance) return instance;
		instance = this;
	}

	public store = getStore();

	@Module()
	public wallets = WalletModule.getInstance();

	@Module()
	public history = HistoryModule.getInstance();

	@Getter()
	public get isScreenSizeLessMD(): boolean {
		return ['xs', 'sm'].includes(this.store.state.appLayout.screenSize);
	}
}
