import Vue from 'vue';
import Component from 'vue-class-component';

// You can declare mixins as the same style as components.
@Component
export default class TranslateMixin extends Vue {
	protected get translateMessage(): (meta: COMMON.TranslateMeta) => string {
		return (meta: COMMON.TranslateMeta): string => {
			return this.$t(meta.message, meta.options);
		};
	}
}
