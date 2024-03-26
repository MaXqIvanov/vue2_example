<template>
	<Widget name="balance-auto-withdrawal-view">
		<WidgetItem
			v-slot="{ computedAttrs, cardStyles }"
			name="card"
			:contentVariables="cardVariables"
		>
			<KCard
				v-bind="computedAttrs"
				height="100%"
				:style="cardStyles"
			>
				<Widget name="balance-auto-withdrawal-main">
					<WidgetItem
						v-slot="{ computedAttrs, iconSize, iconName, iconStyle }"
						name="back-icon"
						:contentVariables="backBtnVariables"
					>
						<KBtn
							v-if="!showDeleteSelectedHeader"
							v-bind="computedAttrs"
							icon
							exact
							:to="backToObject"
							@click.native="setActiveFlow"
						>
							<KIcon
								:name="iconName"
								:size="iconSize"
								:style="iconStyle"
							/>
						</KBtn>
						<KBtn
							v-if="showDeleteSelectedHeader"
							v-bind="computedAttrs"
							icon
							exact
							@click="cancelDeleteSelectedHeader"
						>
							<KIcon
								:name="iconName"
								:size="iconSize"
								style="--icon-color:var(--tertiary-darken)"
							/>
						</KBtn>
					</WidgetItem>

					<WidgetItem
						v-slot="{ computedAttrs }"
						name="title"
					>
						<KText v-if="!showDeleteSelectedHeader" v-bind="computedAttrs">
							{{ $t('balance.autoConversion') }}
						</KText>
						<KText
							v-else-if="showDeleteSelectedHeader"
							v-bind="computedAttrs"
							style="color: var(--status-error-darken); cursor: pointer"
							@click="deleteSelected"
						>
							{{ $t('balance.deleteText') }}
						</KText>
					</WidgetItem>

					<WidgetItem
						v-slot="{ computedAttrs, iconSize, iconAddName, iconRemoveName }"
						name="add-button"
						:contentVariables="addBtnVariables"
					>
						<KBtn
							v-if="!showDeleteSelectedHeader"
							v-bind="computedAttrs"
							icon
							exact
							style="color: var(--primary-lighten)"
							:to="{ name: 'auto-conversion-new' }"
						>
							<KIcon
								:name="iconAddName"
								:size="iconSize"
							/>
						</KBtn>
						<KBtn
							v-else-if="showDeleteSelectedHeader"
							v-bind="computedAttrs"
							icon
							style="color: var(--status-error-darken)"
							@click="deleteSelected"
						>
							<KIcon
								:name="iconRemoveName"
								:size="iconSize"
							/>
						</KBtn>
					</WidgetItem>

					<WidgetItem v-slot="{ computedAttrs }" name="instant-conversion-button">
						<KBtn
							v-bind="computedAttrs"
							exact
							:to="{ name: 'auto-conversion-instant' }"
						>
							{{ $t('balance.convertNowText') }}
						</KBtn>
					</WidgetItem>

					<WidgetItem
						v-if="showDeleteSelectedHeader"
						key="auto-withdrawal-remove-checkbox"
						v-slot="{ computedAttrs }"
						name="table-remove-checkbox"
					>
						<KSimpleCheckbox
							:value="headerCheckboxState"
							:indeterminate="isHeaderCheckboxIndeterminate"
							v-bind="computedAttrs"
							style="--checkbox-selection-controls-ripple-margin: 0; display: flex"
							@click="headerCheckboxClickHandler"
						/>
					</WidgetItem>

					<WidgetItem name="table">
						<AutoConversionTable />
					</WidgetItem>

					<WidgetItem name="table-mob">
						<AutoConversionTableMob />
					</WidgetItem>
				</Widget>
			</KCard>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import { defineComponent, computed, ref } from 'vue';
	import MyRootStore from '@/store/store';
	import AutoConversionTable from '@/components/AutoTables/AutoConversionTable.vue';
	import AutoConversionTableMob from '@/components/AutoTables/AutoConversionTableMob.vue';
	import { FormType, FlowType } from '@/const';

	export default defineComponent({
		name: 'AutoConversionView',
		components: { AutoConversionTable, AutoConversionTableMob },

		setup() {
			const walletsStore = MyRootStore.getInstance().wallets;

			const activeForm = computed(() => {
				return walletsStore.activeForm;
			});

			const activeCurrency = computed(() => {
				return walletsStore.autoConversionToWallet?.currencyTitle || walletsStore.getActiveWallet?.currencyTitle || '';
			});

			const showDeleteSelectedHeader = computed(() => {
				return Boolean(walletsStore.autoConversionSelected.length);
			});

			const deleteSelected = (): void => {
				const currenciesFrom = walletsStore.autoConversionSelected.reduce((acc, tableItem) => {
					acc = [...acc, ...tableItem.currenciesFrom];
					return acc;
				}, [] as any[]);
				walletsStore.deleteAutoConversion(currenciesFrom);
			};

			const cancelDeleteSelectedHeader = (): void => {
				walletsStore.autoConversionSelected = [];
			};

			const headerCheckboxState = ref(true);

			const headerCheckboxClickHandler = (): void => {
				if (isHeaderCheckboxIndeterminate.value || !headerCheckboxState.value) {
					headerCheckboxState.value = true;
					walletsStore.autoConversionSelected = [...walletsStore.autoConversionList];
				} else if (headerCheckboxState.value) {
					headerCheckboxState.value = false;
					cancelDeleteSelectedHeader();
				}
			};
			const isHeaderCheckboxIndeterminate = computed(() => {
				return walletsStore.autoConversionSelected.length !== walletsStore.autoConversionList.length;
			});

			const backToObject = computed(() => {
				if (!walletsStore.seamlessIntegrationEnabled) {
					return {
						name: 'balance-activeForm',
						params: { activeForm: activeForm.value, currency: activeCurrency.value }
					};
				}

				if (activeForm.value && activeCurrency.value) {
					const newRouteName = activeForm.value === FormType.DEPOSIT ? 'balance-get-form' : 'balance-transfer-form';
					return { name: newRouteName, params: { activeForm: activeForm.value, currency: activeCurrency.value } };
				}

				return { name: 'balance-wallets' };
			});

			const setActiveFlow = (): void => {
				const flowName = activeForm.value === FormType.DEPOSIT ? FlowType.GET : FlowType.BUY;
				walletsStore.setActiveFlow(flowName);
			};

			const cardVariables = ref([
				{
					name: 'cardStyles',
					type: 'string',
					defaultValue: 'padding:var(--spacing-6)'
				}
			]);

			const backBtnVariables = ref([
				{
					name: 'iconSize',
					type: 'string',
					defaultValue: '14'
				},
				{
					name: 'iconName',
					type: 'string',
					defaultValue: '$prev--colorable'
				},
				{
					name: 'iconStyle',
					type: 'string',
					defaultValue: '--icon-color:var(--tertiary-darken)'
				}
			]);

			const addBtnVariables = ref([
				{
					name: 'iconSize',
					type: 'string',
					defaultValue: '24'
				},
				{
					name: 'iconAddName',
					type: 'string',
					defaultValue: 'plus--colorable'
				},
				{
					name: 'iconRemoveName',
					type: 'string',
					defaultValue: 'remove--colorable'
				}
			]);

			return {
				cardVariables,
				addBtnVariables,
				backBtnVariables,
				showDeleteSelectedHeader,
				deleteSelected,
				cancelDeleteSelectedHeader,
				headerCheckboxState,
				headerCheckboxClickHandler,
				isHeaderCheckboxIndeterminate,
				backToObject,
				setActiveFlow
			};
		}
	});
</script>
