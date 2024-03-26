<template>
	<InfoModal
		v-model="showModalCancel"
		:titleModal="modalTitle"
	>
		<template #body-2="{}">
			<Widget name="balance-modal-cancel-sending-funds">
				<WidgetItem v-slot="{computedAttrs}" name="subtitle">
					<KText v-bind="computedAttrs" />
				</WidgetItem>

				<WidgetItem
					v-slot="{computedAttrs}"
					name="description"
				>
					<KText v-bind="computedAttrs" />
				</WidgetItem>
				<WidgetItem
					v-slot="{computedAttrs, label}"
					name="checkbox"
				>
					<KCheckbox v-model="checkbox" v-bind="computedAttrs">
						<template #label>
							<KText class="k-text-k-typography-body-1-regular">
								{{ label }}
							</KText>
						</template>
					</KCheckbox>
				</WidgetItem>
			</Widget>
		</template>

		<template #actions>
			<Widget name="balance-modal-confirm-actions">
				<WidgetItem v-slot="{ computedAttrs }" name="confirm">
					<KBtn
						v-bind="computedAttrs"
						:disabled="disabledCancel"
						@click="cancelActions"
					/>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs }" name="cancel">
					<KBtn
						v-bind="computedAttrs"
						:disabled="false"
						@click="showModalCancel = false"
					/>
				</WidgetItem>
			</Widget>
		</template>
	</InfoModal>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component } from 'vue-property-decorator';
	import MyRootStore from '@/store/store';
	import InfoModal from '@/views/ModalViews/InfoModal.vue';
	import { FormType, RouteName } from '@/const';

	@Component({
		name: 'CancelDealModal',
		components: { InfoModal }
	})
	export default class CancelDealModal extends Vue {
		protected walletsStore = MyRootStore.getInstance().wallets;
		protected checkbox = false;

		protected get disabledCancel(): boolean {
			return !this.checkbox;
		}

		protected get modalTitle(): string {
			return this.$t('balance.cancelDeal');
		}

		protected get activeForm(): WALLETS.FormTypeValues {
			return this.walletsStore.getActiveForm || FormType.DEPOSIT;
		}

		protected cancelActions(): void {
			this.walletsStore.seamlessP2PDepositCancel();
			this.closeModal();
			this.$router.push({ name: RouteName.BalanceActiveForm, params: { activeForm: this.activeForm } });
		}

		protected get showModalCancel(): boolean {
			return this.walletsStore.confirmCancelDealModal;
		}
		protected set showModalCancel(val: boolean) {
			this.walletsStore.setNeedConfirmCancelDeal(val);
		}

		protected closeModal(): void {
			this.showModalCancel = false;
		}
	}
</script>
<style></style>
