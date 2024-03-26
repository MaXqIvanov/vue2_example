<template>
	<Widget ref="autoViewWrapper" name="balance-auto-view-wrapper">
		<WidgetItem name="header">
			<HeaderView key="balance-wallets-header-main-key" />
		</WidgetItem>

		<WidgetItem name="content">
			<Widget name="balance-auto-view">
				<WidgetItem name="auto-links">
					<Widget
						ref="autoViewLinks"
						key="balance-auto-view-links"
						name="balance-auto-view-links"
						style="position: relative"
					>
						<WidgetItem
							v-for="(link, index) in autoTabLinks"
							:ref="(el) => { autoViewLinksRefs[link.to.name] = el }"
							v-slot="{ computedAttrs, cardDisabledStyle, cardStyle }"
							:key="index + '-auto-link'"
							name="auto-links-item"
							:contentVariables="linkWrapperVariables"
						>
							<KCard
								v-bind="computedAttrs"
								height="44px"
								activeClass="k-sheet-review-active k-card-review-active"
								:style="(routeName !== link.to.name && !link.to.childrens.includes(routeName)) ? cardDisabledStyle : cardStyle"
								:to="link.to"
								:ripple="false"
								@click.native="checkScroll(link.to.name)"
							>
								<Widget name="balance-auto-view-link-item">
									<WidgetItem
										v-slot="{ computedAttrs, colorText, colorTextActive }"
										name="title"
										:contentVariables="linkItemVariables"
									>
										<KText
											v-bind="computedAttrs"
											:style="{ color: (routeName === link.to.name || link.to.childrens.includes(routeName)) ? colorTextActive : colorText }"
										>
											{{ $t(link.title) }}
										</KText>
									</WidgetItem>

									<WidgetItem
										v-if="link.amount"
										key="balance-auto-view-link-item-amount"
										v-slot="{ computedAttrs, colorText, colorTextActive }"
										name="amount"
										:contentVariables="linkItemVariables"
									>
										<KText
											v-bind="computedAttrs"
											:style="{ color: (routeName === link.to.name || link.to.childrens.includes(routeName)) ? colorTextActive : colorText }"
										>
											{{ link.amount }}
										</KText>
									</WidgetItem>
								</Widget>
							</KCard>
						</WidgetItem>
					</Widget>
				</WidgetItem>

				<WidgetItem name="auto-view">
					<RouterView />
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<ConfirmAutoModal />
	</Widget>
</template>

<script lang="ts">
	import { onMounted, ref, defineComponent, computed, onBeforeMount } from 'vue';
	import { useRoute } from '@/utils/utils';
	import MyRootStore from '@/store/store';
	import ConfirmAutoModal from '@/views/ModalViews/ConfirmAutoModal.vue';

	import HeaderView from '@/views/HeaderView.vue';

	export default defineComponent({
		name: 'AutoView',
		components: { HeaderView, ConfirmAutoModal },
		inheritAttrs: false,

		setup() {
			const walletsStore = MyRootStore.getInstance().wallets;
			const routeName = computed(() => {
				return useRoute().name;
			});
			const autoViewWrapper: null | any = ref(null);

			const activeForm = computed(() => {
				return walletsStore.activeForm;
			});

			const activeCurrency = computed(() => {
				return walletsStore.getActiveWallet?.currencyTitle || '';
			});

			const autoConversionTotal = computed(() => walletsStore.autoConversionTotal);
			const autoWithdrawalsTotal = computed(() => walletsStore.autoWithdrawalsTotal);

			const autoTabLinks = computed(() => [
				{
					title: 'balance.autoWithdrawalTitle',
					to: { name: 'auto-withdrawal', childrens: ['auto-withdrawal-new'] },
					amount: autoWithdrawalsTotal.value || 0
				},
				{
					title: 'balance.autoConversion',
					to: { name: 'auto-conversion', childrens: ['auto-conversion-new', 'auto-conversion-instant'] },
					amount: autoConversionTotal.value || 0
				}
			]);

			onBeforeMount(() => {
				walletsStore.getAutoConversion();
				walletsStore.getAutoWithdrawals();
			});

			onMounted(() => {
				if (autoViewWrapper?.value?.$el?.parentElement) {
					autoViewWrapper.value.$el.parentElement.style.height = '100%';
				}
				setTimeout(() => {
					checkScroll(routeName.value);
				}, 200);
			});

			const linkItemVariables = ref([
				{
					name: 'colorText',
					type: 'string',
					defaultValue: 'var(--text-primary)'
				},
				{
					name: 'colorTextActive',
					type: 'string',
					defaultValue: 'var(--primary-lighten)'
				}
			]);
			const linkWrapperVariables = ref([
				{
					name: 'cardDisabledStyle',
					type: 'string',
					defaultValue: 'background:transparent'
				},
				{
					name: 'cardStyle',
					type: 'string',
					defaultValue: ''
				}
			]);
			const autoViewLinksRefs = ref({});
			const autoViewLinks = ref(null);

			const checkScroll = (name: string): void => {
				const leftOffset =
					((autoViewLinksRefs.value as any)[name] as any)?.$el?.offsetLeft +
					((autoViewLinksRefs.value as any)[name] as any)?.$el?.offsetWidth -
					(autoViewLinks.value as any)?.$el.offsetWidth;

				(autoViewLinks.value as any).$el?.scrollTo?.({
					left: leftOffset > 0 ? leftOffset : 0,
					behavior: 'smooth'
				});
			};

			return {
				autoTabLinks,
				autoViewWrapper,
				routeName,
				activeForm,
				activeCurrency,
				linkItemVariables,
				checkScroll,
				autoViewLinksRefs,
				autoViewLinks,
				linkWrapperVariables
			};
		}
	});
</script>
