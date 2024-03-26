<template>
	<Widget name="balance-modal-confirm-wrapper">
		<WidgetItem
			v-slot="{ title }"
			name="card"
			:contentVariables="translateVariables"
		>
			<InfoModal
				v-model="confirmWithdrawalModal"
				:titleModal="title"
			>
				<template #body-2>
					<Widget name="balance-modal-confirm-blocks" style="margin-top:calc(0 - var(--spacing-6))">
						<WidgetItem v-slot="{ computedAttrs }" name="code-fields">
							<template v-for="({ section, data }, index) in lastTransactionMfaList">
								<ConfirmModalCodeField
									:key="section + index"
									:section="section"
									:mfaData="data"
									v-bind="computedAttrs"
									:needResendElements="false"
									@input="inputCodeHandler"
								/>
							</template>
						</WidgetItem>
					</Widget>
				</template>
				<template #actions>
					<Widget name="balance-modal-confirm-actions">
						<WidgetItem v-slot="{ computedAttrs }" name="confirm">
							<KBtn v-bind="computedAttrs" @click="confirmAction" />
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="cancel">
							<KBtn v-bind="computedAttrs" @click="openCancelModal" />
						</WidgetItem>
					</Widget>
				</template>
			</InfoModal>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component } from 'vue-property-decorator';
	import ConfirmModalCodeField from '@/components/ModalComponents/ConfirmModalCodeField.vue';
	import InfoModal from '@/views/ModalViews/InfoModal.vue';
	import MyRootStore from '@/store/store';
	import { NfaServiceType } from '@/const';

	@Component({
		components: { ConfirmModalCodeField, InfoModal }
	})
	export default class ConfirmAutoModal extends Vue {
		protected walletsStore = MyRootStore.getInstance().wallets;

		protected get lastTransactionMfaList(): WALLETS.MfaListItemDto[] {
			return this.walletsStore.getLastTransactionMfaList ?? [];
		}

		protected get currentLocale(): string {
			return this.$store.state.translator.currentLocale;
		}

		protected get confirmWithdrawalModal(): boolean {
			return this.walletsStore.getConfirmWithdrawalModal;
		}

		protected set confirmWithdrawalModal(val: boolean) {
			this.walletsStore.setNeedConfirmWithdrawal(val);
		}

		protected closeModal(): void {
			this.confirmWithdrawalModal = false;
		}

		protected openCancelModal(): void {
			// this.walletsStore.setShowCancelWithdrawal(true);
			this.closeModal();
		}

		protected confirmAction(): void {
			if (this.$route.name?.includes('auto-withdrawal')) {
				this.walletsStore.confirmAutoWithdrawal();
			} else if (this.$route.name?.includes('auto-conversion')) {
				this.walletsStore.confirmAutoConversion();
			}
		}

		protected inputCodeHandler(): void {
			const mfaList = this.lastTransactionMfaList.map((e) => e.section);
			const autocompleteMfaList = [
				NfaServiceType[NfaServiceType.Email],
				NfaServiceType[NfaServiceType.Google],
				NfaServiceType[NfaServiceType.SMS],
				NfaServiceType[NfaServiceType.TelegramBot]
			];
			if (!mfaList.every((e) => autocompleteMfaList.includes(e as string))) {
				return;
			}
			if (mfaList.every((e) => (this.walletsStore.withdrawalCodes?.[e as string] as string)?.length === 6)) {
				this.confirmAction();
			}
		}

		protected translateVariables = [
			{
				name: 'title',
				type: 'translation',
				defaultValue: 'balance.confirmAutoWithdrawal'
			}
		];
	}
</script>
