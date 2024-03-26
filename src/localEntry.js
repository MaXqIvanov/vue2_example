import Vue from 'vue';
import App from './App.vue';
import Vuex from 'vuex';
import MyRootStore, { setStore } from './store/store';
import { createRouter } from './router/router';
import UiKit from '@cash-frontends/koshelekui';

Vue.use(Vuex);
Vue.use(UiKit);

import { name } from '../package.json';
import { webpackInit } from './webpackUtils';
import { mainLayoutTemplate, widgetsTemplates } from './templates/defaultTemplate';

const nestedRouter = createRouter('history');

webpackInit().then((store) => {
	setStore(store);

	const myRootStore = new MyRootStore(store);

	const translatorService = store.state.translator.api;
	const iconService = store.state.icons.api;

	const {
		appCollector: {
			api: { registerApplication }
		},
		cssBundler: {
			api: { applyCSSBundles }
		}
	} = store.state;

	const initializedServicesList = [
		translatorService.initialize(['ru', 'en']),
		iconService.initialize(),
		applyCSSBundles(document, ['http://localhost:3200/static/mainapp.css', 'http://localhost:3200/static/vuetify.css'])
	];

	Promise.all(initializedServicesList).then(() => {
		Vue.use(translatorService);
		Vue.use(iconService);

		const vm = new Vue({
			store,
			router: nestedRouter,
			t: translatorService.makeTranslateFn(name),
			i: iconService.getIconData(name),
			render: (h) => h(App)
		});

		registerApplication({
			id: name,
			name: name,
			store: store,
			module: myRootStore,
			router: nestedRouter,
			routePrefix: '',
			layoutConfig: { views: { 'p2p-view': {} }, widgetsTemplates, mainLayoutTemplate },
			icons
		});
		vm.$mount('#app');
	});
});
