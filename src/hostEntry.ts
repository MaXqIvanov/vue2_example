import Vue, { CreateElement, VNode } from 'vue';
import App from './App.vue';
import { name } from '../package.json';
import { Store } from 'vuex';
import { createRouter } from '@/router/router';
import MyRootStore, { setStore } from './store/store';
import { RecordPropsDefinition } from 'vue/types/options';

export default function (
	store: Store<any>,
	initialRoute: string
): {
	renderApp: (
		el: HTMLElement,
		props: { [k: string]: RecordPropsDefinition<string> },
		listeners: { [k: string]: (e: Event) => void }
	) => void;
} {
	const router = createRouter('abstract', store.state.configs.api);

	setStore(store);

	const myRootStore = new MyRootStore();

	const routePrefix = '/balance';

	router.replace(initialRoute).catch((e) => {
		// eslint-disable-next-line no-console
		console.log('nested app initial route set error: ', e);
	});

	(store as any).state.appCollector.api.registerApplication({
		id: name,
		name: name,
		store: store,
		module: myRootStore,
		router,
		routePrefix
	});

	const translatorService = store.state.translator.api;
	Vue.use(translatorService);

	const iconService = store.state.icons.api;
	Vue.use(iconService);

	const imageService = store.state.images.api;
	Vue.use(imageService);

	const hrefService = store.state.href.api;
	Vue.use(hrefService);

	const renderApp = (
		el: HTMLElement,
		props: { [k: string]: RecordPropsDefinition<string> },
		listeners: { [k: string]: (e: Event) => void }
	): Vue['$options'] => {
		return {
			store,
			router,
			t: translatorService.makeTranslateFn(name),
			i: iconService.getIconData(name),
			img: imageService.getImageUrl(),
			href: hrefService.getHref(),

			render: (h: CreateElement): VNode => {
				return h(App, {
					props,
					on: listeners,
					class: 'v-application v-application--is-ltr theme--light'
				});
			}
		};
	};

	return {
		renderApp
	};
}
