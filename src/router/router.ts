import Vue from 'vue';
import VueRouter, { Route } from 'vue-router';

import WalletsWrapper from '@/views/WalletsWrapper.vue';
import HistoryView from '@/views/HistoryView.vue';
import AutoView from '@/views/AutoViews/AutoView.vue';
import AutoWithdrawalView from '@/views/AutoViews/AutoWithdrawalView.vue';
import AutoWithdrawalCreateView from '@/views/AutoViews/AutoWithdrawalCreateView.vue';
import AutoConversionView from '@/views/AutoViews/AutoConversionView.vue';
import AutoConversionCreateView from '@/views/AutoViews/AutoConversionCreateView.vue';
import FormView from '@/views/ActionViews/FormView.vue';
import SeamlessResultView from '@/views/SeamlessResultView.vue';
import SelectPaymentMethodView from '@/views/ActionViews/SelectPaymentMethodView.vue';
import FourthStepFormView from '@/views/ActionViews/FourthStepFormView.vue';
import FormDoActionView from '@/views/ActionViews/FormDoActionView.vue';

Vue.use(VueRouter);

const routes = [
	{
		path: '/history',
		name: 'balance-history',
		component: HistoryView,
		children: [
			{
				name: 'balance-historyType',
				path: '/history/:historyType'
			}
		]
	},
	{
		path: '*',
		name: '$not-found'
	}
];

export const oldWalletsRoute = {
	path: '/wallets',
	component: WalletsWrapper,
	children: [
		{
			path: '',
			name: 'balance-wallets',
			component: FormView
		},
		{
			name: 'balance-currency',
			path: '/wallets/:currency',
			component: FormView
		},
		{
			name: 'balance-activeForm',
			path: '/wallets/:currency/:activeForm',
			component: FormView
		}
	]
};

export const seamlessIntegrationWalletsRoute = {
	path: '/wallets',
	component: WalletsWrapper,
	children: [
		{
			path: '',
			name: 'balance-wallets',
			component: FormView
		},
		{
			name: 'balance-currency',
			path: '/wallets/:currency',
			component: FormView
		},
		{
			name: 'balance-activeForm',
			path: '/wallets/:currency/:activeForm',
			component: FormView
		}
		// hidden
	]
};

export const seamlessStepsWalletsRoute = {
	path: '/wallets',
	component: WalletsWrapper,
	children: [
		{
			path: '',
			name: 'balance-wallets',
			component: FormView
		},
		{
			name: 'balance-currency',
			path: '/wallets/:currency',
			component: FormView
		},
		{
			name: 'balance-activeForm',
			path: '/wallets/:currency/:activeForm',
			component: FormView
		},
		{
			name: 'balance-get-form',
			path: '/wallets/:currency/:activeForm/get',
			component: FormView
		},
		{
			name: 'balance-buy-form',
			path: '/wallets/:currency/:activeForm/buy/:giveCurrency',
			component: SelectPaymentMethodView
		},
		{
			name: 'balance-buy-form-third-step',
			path: '/wallets/:currency/:activeForm/buy/:giveCurrency/:paymentMethod',
			component: SelectPaymentMethodView
		}
		// hidden
	]
};

export const autoViewRoute = {
	path: '/auto',
	name: 'auto-view',
	redirect: '/auto/withdrawal',
	component: AutoView,
	children: [
		{
			name: 'auto-withdrawal',
			path: '/auto/withdrawal',
			component: AutoWithdrawalView
		},
		{
			name: 'auto-withdrawal-new',
			path: '/auto/withdrawal/new',
			component: AutoWithdrawalCreateView
		},
		{
			name: 'auto-conversion',
			path: '/auto/conversion',
			component: AutoConversionView
		},
		{
			name: 'auto-conversion-new',
			path: '/auto/conversion/new',
			component: AutoConversionCreateView
		},
		{
			name: 'auto-conversion-instant',
			path: '/auto/conversion/instant',
			component: AutoConversionCreateView
		}
	]
};

let router!: VueRouter;

export function createRouter(mode: 'abstract' | 'history', configsModule: any): VueRouter {
	router = new VueRouter({
		mode,
		routes,
		// @ts-ignore
		prefix: 'balance'
	});

	const feature = configsModule.getConfig('feature');
	if (feature?.balanceAutoViews === undefined || feature.balanceAutoViews === true) {
		router.addRoute(autoViewRoute);
	}
	if (feature?.balanceSeamlessIntegration === true && feature?.balanceSeamlessSteps === true) {
		// @ts-ignore-next-line
		router.addRoute(seamlessStepsWalletsRoute);
	} else if (feature?.balanceSeamlessIntegration === true) {
		// @ts-ignore-next-line
		router.addRoute(seamlessIntegrationWalletsRoute);
	} else {
		router.addRoute(oldWalletsRoute);
	}

	return router;
}

const getRouter = (): VueRouter => router;

export default getRouter;
