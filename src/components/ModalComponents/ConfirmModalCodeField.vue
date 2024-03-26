<template>
	<Widget name="balance-modal-confirm-blocks-code-field">
		<WidgetItem
			v-slot="{ computedAttrs, timerStyle, btnClass, textClass, resend }"
			name="confirm-field"
			:contentVariables="codeInputVariables"
		>
			<KTextField
				v-model="value"
				v-bind="computedAttrs"
				:type="inputType"
				:label="$t(`balance.${section}Code`)"
				:errorMessages="error"
				:messages="codeSendMessage"
				:class="{ 'k-text-field-p2p-requisites-field': true, 'k-text-field-primary-error': error }"
				:readonly="isU2fNfa"
				@click="setU2fCode"
				@input="$emit('input', $event)"
				@keypress="keyDownHandler"
				@paste="keyDownHandler"
			>
				<template #append>
					<Widget v-if="needCodeResentElement" name="balance-modal-confirm-code-field-append">
						<WidgetItem
							v-if="timer"
							v-slot="{ computedAttrs }"
							key="timer-key"
							name="timer"
						>
							<KText
								v-bind="computedAttrs"
								:style="timerStyle"
								:class="textClass"
							>
								{{ timer }}
							</KText>
						</WidgetItem>
						<WidgetItem
							v-else
							v-slot="{ computedAttrs }"
							key="resend-key"
							name="resend"
						>
							<KBtn
								:class="btnClass"
								v-bind="computedAttrs"
								@click="resendCode"
							>
								{{ resend }}
							</KBtn>
						</WidgetItem>
					</Widget>
					<Widget v-if="isQuestion" name="balance-modal-confirm-code-field-question">
						<WidgetItem
							v-slot="{ icon }"
							key="icon"
							name="icon"
							:contentVariables="questionVariables"
						>
							<InfoTooltip
								nameWidget="balance-question-tooltip"
								:iconName="icon"
							>
								<Widget name="balance-text-body-2-regular">
									<WidgetItem v-slot="{ computedAttrs }" name="text">
										<KText v-bind="computedAttrs">
											{{ $t(mfaData.question) }}
										</KText>
									</WidgetItem>
								</Widget>
							</InfoTooltip>
						</WidgetItem>
					</Widget>
					<div v-if="isPasswordInput" class="k-btn-icon-btn">
						<KBtn
							:aria-label="isPasswordInput ? 'preview open' : 'preview close'"
							icon
							tile
							class="v-btn v-btn--icon v-btn--round v-btn--tile theme--light v-size--default"
							@click="togglePasswordInputType"
						>
							<KIcon :name="passwordIcon" />
						</KBtn>
					</div>
				</template>
			</KTextField>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop, Watch } from 'vue-property-decorator';
	import MyRootStore from '@/store/store';
	import { ContentVariableType, NfaServiceType } from '@/const';
	import TextFieldMessage from '@/components/ModalComponents/TextFieldMessage.vue';
	import InfoTooltip from '@/components/InfoTooltip.vue';

	const noSentCodeServices = [
		NfaServiceType[NfaServiceType.Google],
		NfaServiceType[NfaServiceType.Question],
		NfaServiceType[NfaServiceType.Codes],
		NfaServiceType[NfaServiceType.Password],
		NfaServiceType[NfaServiceType.U2F]
	];

	@Component({ components: { TextFieldMessage, InfoTooltip } })
	export default class ConfirmModalCodeField extends Vue {
		@Prop({ required: true }) protected section!: keyof typeof NfaServiceType;
		@Prop({ required: false }) protected length!: number;
		@Prop({ required: true }) protected mfaData!: COMMON.IMap<string>;
		@Prop({ default: null }) protected resendCallback?: CallableFunction;
		@Prop({ default: true }) protected needResendElements?: boolean;

		protected timer: string = '';
		protected intervalId?: unknown;
		protected showInputAsPassword: boolean = true;

		protected walletsStore = MyRootStore.getInstance().wallets;

		protected codeInputVariables = [
			{
				name: 'timerStyle',
				type: 'string',
				defaultValue:
					'background-image: var(--gradient-primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
			},
			{
				name: 'textClass',
				type: 'string',
				defaultValue: 'k-text-k-typography-body-1-medium'
			},
			{
				name: 'btnClass',
				type: 'string',
				defaultValue: 'k-btn-balance-resend'
			},
			{
				name: 'resend',
				type: ContentVariableType.TRANSLATION,
				defaultValue: 'balance.resend'
			}
		];

		protected questionVariables = [
			{
				name: 'icon',
				type: 'icon',
				defaultValue: 'help'
			}
		];

		protected beforeDestroy(): void {
			const nfaIndex = this.walletsStore.confirmWithdrawalErrors?.nfaServiceTypeList.indexOf(this.section);
			(nfaIndex || nfaIndex === 0) && this.walletsStore.confirmWithdrawalErrors?.nfaServiceTypeList.splice(nfaIndex, 1);
		}

		protected get codeCanBeResent(): boolean {
			return !noSentCodeServices.includes(this.section);
		}

		protected get needCodeResentElement(): boolean {
			return Boolean(this.needResendElements) && this.codeCanBeResent;
		}

		protected get value(): string | number {
			if (this.isU2fNfa && this.walletsStore.withdrawalCodes?.[this.section]) return this.$t('balance.u2fConfirmed');
			return this.walletsStore.withdrawalCodes?.[this.section] || '';
		}
		protected set value(newValue: string | number) {
			this.setValue(newValue);
		}

		public setValue(newValue: string | number): void {
			this.walletsStore.clearConfirmWithdrawalErrors(this.section);
			this.walletsStore.setWithdrawalCode(newValue, this.section);
		}

		protected get canSendCode(): boolean {
			return this.timer !== '';
		}

		protected get isQuestion(): boolean {
			return this.section === 'Question';
		}

		protected initEndTime(timeout: number = 60, initTime: string | undefined = undefined): number {
			const end = initTime ? new Date(initTime) : new Date();
			const offset = initTime ? 0 : timeout;
			end.setSeconds(end.getSeconds() + offset);
			return end.getTime();
		}

		public keyDownHandler(e: COMMON.IEventBase): void {
			this.walletsStore.keyDownHandler(e, this.section, this.setValue);
		}

		public startTimer(endTime: number, interval: number = 1000): void {
			this.timer = this.timerTick(endTime);
			this.intervalId = setInterval(() => {
				this.timer = this.timerTick(endTime);
				if (Date.now() >= endTime) {
					this.timer = '';
					clearInterval(this.intervalId as number);
					return;
				}
			}, interval);
		}

		protected mounted(): void {
			this.codeCanBeResent
				? this.startTimer(this.initEndTime(undefined, this.mfaData?.resendTime || undefined))
				: undefined;
		}

		@Watch('mfaData.resendTime')
		protected onResendTimeChanged(): void {
			if (this.codeCanBeResent && !this.timer) {
				this.startTimer(this.initEndTime(undefined, this.mfaData?.resendTime || undefined));
			}
		}

		protected timerTick(endTime: number): string {
			const now = Date.now();
			const t = endTime - now;
			const date = new Date(t);
			return this.formatDate(date);
		}

		protected formatDate(date: Date): string {
			const seconds = date.getSeconds();
			const minutes = date.getMinutes();
			return `${minutes > 9 ? minutes : `0${minutes}`}:${seconds > 9 ? seconds : `0${seconds}`}`;
		}

		protected togglePasswordInputType(): void {
			this.showInputAsPassword = !this.showInputAsPassword;
		}

		protected get confirmWithdrawalErrors(): any {
			return this.walletsStore.confirmWithdrawalErrors;
		}

		protected get error(): string {
			const fieldError =
				this.walletsStore.activeTransport?.id &&
				this.walletsStore?.errors[this.walletsStore.activeTransport.id] &&
				this.walletsStore?.errors[this.walletsStore.activeTransport.id][this.section]?.message;
			if (fieldError) {
				return this.$t(`${fieldError}`);
			}

			if (this.confirmWithdrawalErrors?.nfaServiceTypeList?.includes(this.section)) {
				return this.confirmWithdrawalErrors.attempts > 0
					? this.$t('balance.wrongCodeAttemptsText', { attempts: this.confirmWithdrawalErrors.attempts })
					: this.$t('balance.codeLockedUntilText', { lockedUntil: this.confirmWithdrawalErrors.lockedUntil });
			}

			return '';
		}

		protected get isPasswordInput(): boolean {
			return this.section === NfaServiceType[NfaServiceType.Password];
		}

		protected get passwordIcon(): string {
			return this.isPasswordInput
				? this.showInputAsPassword
					? 'system.preview-close-one'
					: 'system.preview-open-one'
				: '';
		}

		protected get inputType(): string {
			return this.isPasswordInput && this.showInputAsPassword
				? 'password'
				: [
						NfaServiceType[NfaServiceType.Question],
						NfaServiceType[NfaServiceType.Codes],
						NfaServiceType[NfaServiceType.Password],
						NfaServiceType[NfaServiceType.U2F]
				  ].includes(this.section)
				? 'text'
				: 'number';
		}

		protected async resendCode(): Promise<void> {
			if (!this.resendCallback) {
				await this.walletsStore.resendCode(this.section);
				return;
			}
			await this.resendCallback(this.section);
		}

		protected get codeSendMessage(): string {
			return this.codeCanBeResent
				? this.$t('balance.codeSentTo', {
						codeNumber: this.mfaData?.number,
						mfaServiceID: this.mfaData?.receiver
				  })
				: this.$t(`balance.${this.section}Hint`);
		}

		protected async setU2fCode(): Promise<void> {
			if (this.isU2fNfa) {
				const u2fCode = await this.walletsStore.checkU2fToken(this.mfaData?.response);
				this.$emit('input', u2fCode);
				this.value = u2fCode as string;
			}
		}

		protected get isU2fNfa(): boolean {
			return this.section === NfaServiceType[NfaServiceType.U2F];
		}
	}
</script>
