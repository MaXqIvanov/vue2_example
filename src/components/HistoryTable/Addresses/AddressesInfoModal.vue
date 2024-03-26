<template>
	<InfoModal
		:value="isModal"
		:titleModal="title"
		@input="showModal"
	>
		<template #body-2>
			<Widget name="balance-addresses-info-modal">
				<WidgetItem name="currency">
					<Currency :currencyId="currencyId" />
				</WidgetItem>
				<WidgetItem name="status">
					<AddressStatus :isPinned="pinned" />
				</WidgetItem>
				<WidgetItem
					v-slot="{ dateTitle }"
					name="date"
					:contentVariables="modalVariables"
				>
					<DateBlock
						:date="dateCreated"
						:title="dateTitle"
					/>
				</WidgetItem>
				<WidgetItem
					v-slot="{ networkTitle }"
					name="network"
					:contentVariables="modalVariables"
				>
					<TextBlock
						:title="networkTitle"
						:text="networkText"
					/>
				</WidgetItem>
				<WidgetItem
					v-slot="{ computedAttrs, networkDescription }"
					name="network-description"
					:contentVariables="modalVariables"
				>
					<KText v-bind="computedAttrs">
						{{ networkDescription }}
					</KText>
				</WidgetItem>

				<WidgetItem
					v-slot="{ addressTitle }"
					name="address"
					:contentVariables="modalVariables"
				>
					<TextBlockWithCopy
						:title="addressTitle"
						:text="addressText"
						:value="addressValue"
					/>
				</WidgetItem>
				<WidgetItem name="explorer-link">
					<Share
						v-if="sharePath"
						:to="sharePath"
					/>
				</WidgetItem>
				<WidgetItem
					v-if="tagValue"
					v-slot="{ tagTitle }"
					name="tag"
					:contentVariables="modalVariables"
				>
					<TextBlockWithCopy
						:title="tagTitle"
						:text="tagValue"
						:value="tagValue"
					/>
				</WidgetItem>
				<WidgetItem
					v-slot="{ operationsTitle }"
					name="operations"
					:contentVariables="modalVariables"
				>
					<TextBlock
						:title="operationsTitle"
						:text="operationsText"
					/>
				</WidgetItem>
			</Widget>
		</template>
		<template #actions>
			<Widget name="balance-addresses-info-modal-close">
				<WidgetItem
					v-slot="{ computedAttrs, close }"
					name="button"
					:contentVariables="modalVariables"
				>
					<KBtn
						v-bind="computedAttrs"
						@click="showModal(false)"
					>
						{{ close }}
					</KBtn>
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
	import Currency from '@/components/ModalComponents/Currency.vue';
	import DateBlock from '@/components/ModalComponents/DateBlock.vue';
	import TextBlock from '@/components/ModalComponents/TextBlock.vue';
	import TextBlockWithCopy from '@/components/ModalComponents/TextBlockWithCopy.vue';
	import AddressStatus from '@/components/ModalComponents/AddressStatus.vue';
	import Share from '@/components/ModalComponents/Share.vue';
	import { ellipsisString } from '@/utils/utils';

	@Component({
		name: 'AddressesInfoModal',
		components: {
			InfoModal,
			Currency,
			DateBlock,
			TextBlock,
			TextBlockWithCopy,
			AddressStatus,
			Share
		}
	})
	export default class AddressesInfoModal extends Vue {
		protected historyStore = MyRootStore.getInstance().history;
		protected walletsStore = MyRootStore.getInstance().wallets;

		protected get isModal(): boolean {
			return this.historyStore.isAddressInfoModal;
		}

		protected get title(): string {
			return this.$t('balance.addressInfoModalTitle');
		}

		protected get addressData(): HISTORY.Address {
			return this.historyStore.addressInfoModalData;
		}

		protected get currencyId(): number {
			return this.addressData.currencyId;
		}

		protected get pinned(): boolean {
			return !this.addressData.notPinned;
		}

		protected get dateCreated(): string {
			return this.addressData.dateCreated;
		}

		protected get networkText(): string {
			return this.addressData.network;
		}

		protected get addressText(): string {
			return this.ellipsisString(this.addressData.address);
		}

		protected get addressValue(): string {
			return this.addressData.address;
		}

		protected get sharePath(): string {
			const urlAddress = this.walletsStore.cryptoCurrencies?.find(
				(e: WALLETS.CryptoCurrency) => e.id === this.addressData.cryptoCurrencyId
			)?.urlAddress;
			if (!urlAddress || !this.addressValue) return '';

			return urlAddress.replace('{address}', this.addressValue);
		}

		protected get tagValue(): string | null {
			return this.addressData.tag;
		}

		protected get operationsText(): number {
			return this.addressData.transactionsCount;
		}

		protected modalVariables = [
			{
				name: 'networkTitle',
				type: 'translation',
				defaultValue: 'balance.modalAddressNetworkTitle'
			},
			{
				name: 'networkDescription',
				type: 'translation',
				defaultValue: 'balance.modalAddressNetworkDescription'
			},
			{
				name: 'addressTitle',
				type: 'translation',
				defaultValue: 'balance.modalAddressAddressTitle'
			},
			{
				name: 'tagTitle',
				type: 'translation',
				defaultValue: 'balance.modalAddressTagTitle'
			},
			{
				name: 'operationsTitle',
				type: 'translation',
				defaultValue: 'balance.modalAddressOperationsTitle'
			},
			{
				name: 'close',
				type: 'translation',
				defaultValue: 'balance.close'
			},
			{
				name: 'dateTitle',
				type: 'translation',
				defaultValue: 'balance.modalAddressDateTitle'
			}
		];

		public showModal(value: boolean): void {
			this.historyStore.showAddressInfoModal(value);
		}

		protected ellipsisString(value: string): string {
			return ellipsisString({ value, ellipsisLength: 16, replacement: '***' });
		}
	}
</script>
