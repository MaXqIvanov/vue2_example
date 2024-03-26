<template>
	<Widget name="balance-actions-crypto-deposit-qr-row">
		<WidgetItem v-slot="{ computedAttrs }" name="dialog">
			<Widget
				v-if="qrCodeValue"
				:key="`balance-actions-deposit-qr-${qrCodeValue}`"
				name="balance-actions-crypto-deposit-qr-activator"
				@click.native="dialog = true"
			>
				<WidgetItem v-slot="{ computedAttrs }" name="icon">
					<KIcon
						v-bind="computedAttrs"
						:name="openQrModalIcon"
					/>
				</WidgetItem>

				<WidgetItem
					v-slot="{ computedAttrs, title, activeColor, disableColor }"
					:contentVariables="textColorVariables"
					name="text"
				>
					<KText
						v-bind="computedAttrs"
						:style="{ color: isActive ? activeColor : disableColor }"
					>
						{{ title }}
					</KText>
				</WidgetItem>

				<WidgetItem name="tooltip-icon">
					<InfoTooltip
						:iconName="openQrTooltipIcon"
					>
						<Widget name="balance-text-body-2-regular">
							<WidgetItem v-slot="{ computedAttrs }" name="text">
								<KText v-bind="computedAttrs">
									{{ uriAmount ? $t('balance.qrValueChanged') : $t('balance.qrValueChangedWithoutAmount') }}
								</KText>
							</WidgetItem>
						</Widget>
					</InfoTooltip>
				</WidgetItem>
			</Widget>
			<KDialog
				v-model="dialog"
				v-bind="computedAttrs"
				:disabled="!isActive"
			>
				<template #activator="{ on, attrs }">
					<div v-bind="attrs" v-on="on" />
				</template>

				<KCard>
					<Widget name="balance-qrCode-modal">
						<WidgetItem v-slot="{ computedAttrs, name }" name="close-icon">
							<KIcon
								v-bind="computedAttrs"
								:name="name"
								@click="dialog = false"
							/>
						</WidgetItem>

						<WidgetItem
							v-slot="{ computedAttrs, sizeQr }"
							name="qr-code"
							:contentVariables="app2Variables"
						>
							<QrCode
								:value="qrCodeValue"
								v-bind="computedAttrs"
								:size="sizeQr"
								level="M"
							/>
						</WidgetItem>

						<WidgetItem
							v-if="amount"
							v-slot="{ computedAttrs }"
							name="amount"
						>
							<KText v-bind="computedAttrs">
								{{ amount }} {{ currencyTitle }}
							</KText>
						</WidgetItem>

						<WidgetItem
							v-if="equivalentValue"
							v-slot="{ computedAttrs }"
							name="equivalent"
						>
							<KText v-bind="computedAttrs">
								~{{ equivalentValue }} {{ equivalentTitle }}
							</KText>
						</WidgetItem>

						<WidgetItem
							v-if="address"
							key="balance-qrCode-address"
							name="address"
						>
							<Widget name="balance-qrCode-modal-background-box">
								<TooltipValue :value="address" />
							</Widget>
						</WidgetItem>
						<WidgetItem
							v-if="tagValue"
							key="balance-qrCode-memo"
							name="memo"
						>
							<!-- todo: w_i_th -->
							<Widget name="balance-qrCode-modal-value-wuth-title">
								<WidgetItem v-slot="{ computedAttrs }" name="title">
									<KText v-bind="computedAttrs">
										{{ tagName }}:
									</KText>
								</WidgetItem>

								<TooltipValue :value="tagValue" />
							</Widget>
						</WidgetItem>

						<WidgetItem
							v-if="publicKeyValue"
							key="balance-qrCode-publicKey"
							name="publicKey"
						>
							<!-- todo: w_i_th -->
							<Widget name="balance-qrCode-modal-value-wuth-title">
								<WidgetItem v-slot="{ computedAttrs }" name="title">
									<KText v-bind="computedAttrs">
										{{ publicKeyTitle }}:
									</KText>
								</WidgetItem>
								<TooltipValue :value="publicKeyValue" />
							</Widget>
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs, title }" name="text">
							<KText v-bind="computedAttrs">
								{{ title }}
							</KText>
						</WidgetItem>
					</Widget>
				</KCard>
			</KDialog>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import TooltipValue from '@/components/QrCodeModalTooltipValue.vue';
	import InfoTooltip from '@/components/InfoTooltip.vue';
	import MyRootStore from '@/store/store';

	@Component({ components: { TooltipValue, InfoTooltip } })
	export default class QrCodeModal extends Vue {
		@Prop({ type: Boolean, required: true }) protected isActive!: boolean;
		@Prop({ default: '' }) protected qrCodeValue?: string;
		@Prop({ default: '' }) protected qrCodeModalText?: string;
		@Prop({ default: '' }) protected address?: string;
		@Prop({ default: '' }) protected tagName?: string;
		@Prop({ default: '' }) protected tagValue?: string;
		@Prop({ default: '' }) protected publicKeyTitle?: string;
		@Prop({ default: '' }) protected publicKeyValue?: string;
		@Prop({ default: '' }) protected amount?: string;
		@Prop({ default: '' }) protected currencyTitle?: string;
		@Prop({ default: '' }) protected equivalentValue?: string;
		@Prop({ default: 'USD' }) protected equivalentTitle?: string;
		@Prop({ default: false }) protected uriAmount?: boolean;

		protected walletsStore = MyRootStore.getInstance().wallets;

		protected readonly app2Variables = [{ name: 'sizeQr', type: 'number', defaultValue: 192 }];

		protected showDialog: boolean = false;

		protected get openQrModalIcon(): string {
			return this.isActive ? 'qr-code' : 'qr-code-disabled';
		}

		protected get openQrTooltipIcon(): string {
			return 'info';
		}

		protected set dialog(value: boolean) {
			if (value) {
				this.walletsStore.getCryptoDepositQrUri().then(() => {
					this.showDialog = value;
				});
			} else {
				this.showDialog = value;
			}
		}

		protected get dialog(): boolean {
			return this.showDialog;
		}

		protected textColorVariables = [
			{
				name: 'activeColor',
				type: 'string',
				defaultValue: 'var(--primary-lighten)'
			},
			{
				name: 'disableColor',
				type: 'string',
				defaultValue: 'var(--tertiary-darken-3)'
			}
		];
	}
</script>
