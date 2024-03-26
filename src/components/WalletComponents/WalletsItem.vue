<template>
	<div
		class="css-grid k-text-default"
		style="
			display: grid;
			place-items: stretch;
			place-content: stretch;
			grid-template-rows: min-content min-content min-content;
			grid-template-columns: min-content 1fr 1fr;
			padding: var(--spacing-4) var(--spacing-3);
			border-bottom: 1px solid var(--border-stroke-on-card);
			cursor: pointer;
			grid-row-gap: var(--spacing-1);
		"
	>
		<div style="grid-area: 1 / 1 / 3 / 2; place-self: center; margin-right: 8px;">
			<KIcon
				:key="iconName"
				:name="iconName"
				size="32px"
			/>
		</div>

		<div
			class="css-grid k-text-default"
			:style="`
				grid-area: 1 / 2 / 2 / 3;
				place-self: center start;
				display: grid;
				place-items: stretch;
				place-content: stretch;
				grid-template-rows: min-content;
				grid-template-columns: min-content min-content;
				column-gap: 6px;
				max-width: ${textWidth > 10 && isMobile ? '43vw' : 'unset'};
				overflow: hidden;
			`"
		>
			<div
				:class="typographyClasses.currencyNameTypographyClass"
				:style="`
					grid-area: 1 / 2 / 2 / 3;
					place-self: center start;
					white-space: nowrap;
					text-overflow: ellipsis;
					white-space: nowrap;
					max-width: ${(wallet.currencyTitle.length > 6) && isMobile ? '50px' : (textWidth > 16 && isMobile) ? '100px' : '100%'};
					color: ${currencyNameTextColor};
					display: flex;
				`"
			>
				<KText
					:style="`
						--text-color: ${currencyNameTextColor};
						color: inherit;
						text-overflow: ellipsis;
						white-space: nowrap;
						overflow: hidden;
						display: inline-block;
						max-width: 100%;
						vertical-align: middle;
						font-size: ${isMobile ? '14px' : '16px'};
						`
					"
					tag="span"
				>
					{{ wallet.currencyName }}
				</KText>
			</div>

			<div
				:class="typographyClasses.currencyTitleTypographyClass"
				style="
					grid-area: 1 / 1 / 2 / 2;
					place-self: center start;
					color: var(--text-primary);
					display: flex;
				"
			>
				<KText :style="`--text-color: var(--text-primary); color: inherit; font-size: ${isMobile ? '14px' : '16px'}`" tag="span">
					{{ wallet.currencyTitle }}
				</KText>
			</div>
		</div>

		<div :class="typographyClasses.availableFundsTypographyClass" :style="`grid-area: 1 / 2 / 2 / 4;place-self: center end; display: flex; flex-wrap: wrap; max-width: ${isMobile ? '28vw' : '140px'}; justify-content: right;`">
			<KText style="--text-color: var(--text-primary);" tag="span">
				{{ showBalance ? formatNumberAndFixedDecimals(wallet.availableFunds, wallet.currencyDecimals) : '*****' }}
			</KText>
			<KText style="--text-color: var(--text-primary); padding-left: var(--spacing-1, 4px)" tag="span">
				{{ wallet.currencyTitle }}
			</KText>
		</div>

		<div
			class="css-grid k-text-default"
			style="
				grid-area: 2 / 2 / 3 / 3;
				place-self: center start;
				display: grid;
				place-items: stretch start;
				place-content: stretch center;
				grid-template-rows: min-content;
				grid-template-columns: max-content min-content max-content;
				column-gap: 8px;
			"
		>
			<div
				v-if="equivalent"
				:class="isMobile ? typographyClasses.equivalentTypographyMobClass : typographyClasses.equivalentTypographyClass"
				style="grid-area: 1 / 1 / 2 / 2; place-self: center start;"
			>
				<KText style="color: rgb(148, 152, 158);" tag="span">
					{{ formatNumberAndFixedDecimals(equivalent, favoriteCurrencyDecimals) }} {{ favoriteCurrencySymbol }}
				</KText>
			</div>

			<div
				v-if="equivalent && isPositiveDayPercChange && wallet.dailyChangePercent"
				:class="isMobile ? typographyClasses.dailyChangePercentPositiveTypographyMobClass : typographyClasses.dailyChangePercentPositiveTypographyClass"
				style="grid-area: 1 / 2 / 2 / 3; place-self: center start; color: var(--status-success-darken);"
			>
				<KText style="color: var(--status-success-darken)" tag="span">
					+{{ formatNumberAndFixedDecimals(wallet.dailyChangePercent, 16) }}%
				</KText>
			</div>

			<div
				v-else-if="equivalent && wallet.dailyChangePercent"
				:class="typographyClasses.dailyChangePercentNegativeTypographyClass"
				style="grid-area: 1 / 2 / 2 / 3; place-self: center start; color: var(--status-success-darken);"
			>
				<KText style="color: var(--status-error-darken)" tag="span">
					{{ formatNumberAndFixedDecimals(wallet.dailyChangePercent, 16) }}%
				</KText>
			</div>

			<div
				v-if="equivalent && wallet.dailyChangePercent"
				:class="isMobile ? typographyClasses.dailyChangeTimeTypographyMobClass : typographyClasses.dailyChangeTimeTypographyClass"
				style="grid-area: 1 / 3 / 2 / 4;"
			>
				<KText :style="{ color: '#C9CCCF' }" tag="span">
					{{ $t('balance.timeInHours', { time: 24 }) }}
				</KText>
			</div>
		</div>

		<div
			v-if="availableEquivalent"
			:class="isMobile ? typographyClasses.availableEquivalentTypographyMobClass : typographyClasses.availableEquivalentTypographyClass"
			:style="`grid-area: ${isAvailableEquivalentLongLength ? '3 / 2 / 3 / 4' : '2 / 3 / 3 / 4'}; place-self: center end; text-align: right`"
		>
			<KText style="color: #94989E; white-space: pre;" tag="span">
				{{ showBalance ? `~ ${availableEquivalent} ${favoriteCurrencySymbol}` : '*****' }}
			</KText>
		</div>

		<div
			v-if="Number(wallet.frozenFunds)"
			class="css-grid"
			style="
				grid-area: 3 / 2 / 4 / 4;
				justify-self: start; margin-top: var(--spacing-1);display: grid;
				place-items: stretch end;
				place-content: center end;
				column-gap: 3px;
				grid-template-rows: min-content;
				grid-template-columns: min-content min-content;
			"
		>
			<div
				class="k-icon-customizable k-icon-default"
				style="
					grid-area: 1 / 1 / 2 / 2;
					place-self: center end;
					--icon-color: currentColor;
					--icon-hover-color: currentColor;
				"
			>
				<KIcon style="--special-size: 12px;" name="frozen" />
			</div>

			<div
				:class="typographyClasses.frozenFundsTypographyClass"
				style="grid-area: 1 / 2 / 2 / 3; place-self: center end; white-space: nowrap;"
			>
				<KText
					style="color: var(--status-warning-darken); --text-font-family: var(--font-family-regular);"
					tag="span"
					:to="`/history/transactions?frozen=${wallet.currencyId}`"
				>
					{{ showBalance ? formatNumberAndFixedDecimals(wallet.frozenFunds, wallet.currencyDecimals) : '*****' }} HOLD
				</KText>
			</div>
		</div>

		<div
			v-if="staking"
			class="css-grid k-text-default k-tooltip-default k-menu-default"
			style="
				grid-area: 4 / 2 / 5 / 4;
				place-self: center start;
				display: grid;
				place-items: end start;
				place-content: end start;
				grid-template-rows: min-content min-content;
				grid-template-columns: auto min-content auto;
			"
		>
			<div :class="typographyClasses.stakingLabelTypographyClass" style="grid-area: 1 / 1 / 2 / 2; place-self: end start; font-size: 12px;">
				<KText style="color: #C9CCCF" tag="span">
					{{ stakingLabel }}
				</KText>
			</div>
			<div class="k-tooltip-info" style="grid-area: 1 / 2 / 2 / 3;">
				<KTooltip
					v-if="staking"
					:top="true"
					attach
					maxWidth="272px"
					:closeDelay="1000"
				>
					<template #activator="{ on, attrs }">
						<Widget name="balance-wallets-dashboard-menu-icon">
							<WidgetItem v-slot="{ computedAttrs, name }" name="info-icon">
								<KIcon
									:name="name"
									v-bind="{ ...attrs, ...computedAttrs }"
									v-on="on"
									@click.stop.prevent
								/>
							</WidgetItem>
						</Widget>
					</template>
					<Widget name="balance-wallets-staking-tooltip-text-button">
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="plain"
						>
							<KText v-bind="computedAttrs">
								{{ tooltipText }}
							</KText>
						</WidgetItem>
						<WidgetItem
							v-slot="{ computedAttrs, href }"
							name="text-button"
						>
							<KText
								v-bind="computedAttrs"
								ref="faqLink"
								:href="$href(href)"
								target="_blank"
								@click.stop
							/>
						</WidgetItem>
					</Widget>
				</KTooltip>
			</div>

			<div :class="typographyClasses.stakingAmountTypographyClass" style="grid-area: 2 / 1 / 3 / 4; place-self: center start;">
				<KText
					:style="{ color: showBalance ? 'var(--status-success-darken)' : 'var(--tertiary-darken-2)' }"
					tag="span"
				>
					{{ stakingAmount }}
				</KText>
			</div>
		</div>

		<div :class="typographyClasses.stakingEquivalentTypographyClass" style="grid-area: 4 / 2 / 5 / 4; place-self: end;">
			<KText
				v-if="staking"
				style="color: var(--tertiary-darken-2)"
				tag="span"
			>
				{{ stakingEquivalent }}
			</KText>
		</div>
	</div>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import { convertExponentialToDecimal, formatNumberAndFixedDecimals } from '@/utils/utils';
	import { MAX_LENGTH_AVAILABLE_EQUIVALENT, MAX_WIDTH_TRANSFER_BALANCE } from '@/const';

	@Component
	export default class WalletsItem extends Vue {
		@Prop({ required: true })
		protected wallet!: WALLETS.Wallet;

		@Prop({ default: '' })
		protected staking?: any;

		@Prop({ default: '' })
		public windowSize?: string;

		@Prop({ default: 'USD' })
		protected favoriteCurrencySymbol?: string;

		@Prop({ default: 2 })
		protected favoriteCurrencyDecimals?: number;

		@Prop({ default: {} })
		protected typographyClasses?: Record<string, string>;

		@Prop({ default: 'var(--tertiary-darken-3)' })
		protected currencyNameTextColor?: string;

		protected get stakingEquivalent(): string {
			return this.showBalance ? `~ ${this.availableStakingEquivalent} ${this.favoriteCurrencySymbol}` : '*****';
		}

		protected get stakingAmount(): string {
			return this.showBalance
				? `${String(
						this.formatNumberAndFixedDecimals(
							Number(Number(convertExponentialToDecimal(this.staking.pBalance)).toFixed(9)),
							16
						)
				  )} ${this.wallet.currencyTitle} +${this.staking.perc}%`
				: '*****';
		}

		public get textWidth(): number {
			return (this.wallet.currencyName + this.wallet.currencyTitle).length;
		}

		public get isMobile(): boolean {
			return this.windowSize === 'xs';
		}

		protected get showBalance(): boolean {
			return this.$store.state.sharedData.showBalance;
		}

		protected get currentLocale(): string {
			return this.$store.state.translator.currentLocale;
		}

		protected get stakingLabel(): string {
			return this.$t('balance.stakingInText') + ' ' + this.$t('balance.timeInHours', { time: 24 });
		}

		protected get iconName(): string {
			return `${Boolean(this.wallet.currencyType) ? 'currency' : 'fiat'}.${this.wallet.currencyTitle}`;
		}

		protected get currentRate(): number | false {
			return this.wallet?.rate;
		}

		protected get tooltipText(): string {
			return this.$t('balance.tooltipStakingText', { currency: this.wallet.currencyTitle });
		}

		protected get equivalent(): number | string {
			if (this.wallet && this.currentRate) {
				if (this.currentRate > 1) {
					return Math.round(this.currentRate * 100) / 100;
				}
				return (
					Math.round(this.currentRate * 10 ** (this.wallet.currencyDecimals || 2)) /
					10 ** (this.wallet.currencyDecimals || 2)
				);
			}
			return 0;
		}

		protected get availableEquivalent(): number | string {
			if (this.wallet && this.currentRate && this.wallet.availableFunds) {
				const value = this.currentRate * this.wallet.availableFunds;
				return this.formatNumberAndFixedDecimals(value, this.favoriteCurrencyDecimals || 2);
			}
			return 0;
		}

		protected get isAvailableEquivalentLongLength(): boolean {
			return (
				String(this.availableEquivalent).length > MAX_LENGTH_AVAILABLE_EQUIVALENT &&
				window.innerWidth < MAX_WIDTH_TRANSFER_BALANCE
			);
		}

		protected get availableStakingEquivalent(): number | string {
			if (this.staking?.pBalance) {
				const value = Number(convertExponentialToDecimal(this.staking.pBalance));
				return this.formatNumberAndFixedDecimals(value, this.favoriteCurrencyDecimals || 2);
			}
			return 0;
		}

		protected get isPositiveDayPercChange(): boolean {
			if (this.wallet && this.wallet.dailyChangePercent) {
				return !String(this.wallet.dailyChangePercent).includes('-');
			}
			return true;
		}

		protected formatNumberAndFixedDecimals(value: number, decimals: number): string {
			return formatNumberAndFixedDecimals(value, this.currentLocale, decimals);
		}

		protected convertExponentialToDecimal(val: number): number | string {
			return convertExponentialToDecimal(val);
		}

		protected currencyNameVars = [
			{
				name: 'currencyNameStyle',
				type: 'string',
				defaultValue:
					'color: inherit; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; display: inline-block; max-width: 100%; vertical-align: middle;'
			}
		];
	}
</script>
