import Vue, { ComponentOptions } from 'vue';
import VueRouter from 'vue-router';

declare module 'vue/types/options' {
	interface ComponentOptions<V extends Vue> {
		t?: (key: string) => string;
		i?: (key: string) => string;
		img?: (key: string) => string;
		href?: (key: string) => string;
		globalRouter?: VueRouter;
	}
}

declare module 'vue/types/vue' {
	interface Vue {
		$t: (key: string, options?: unknown) => string;
		$i: (key: string, options?: unknown) => string;
		$img: (key: string) => string;
		$href: (key: string) => string;
		$globalRouter: VueRouter;
	}
}
