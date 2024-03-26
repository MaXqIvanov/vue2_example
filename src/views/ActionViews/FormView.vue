<template>
	<Widget name="balance-actions-card-wrapper">
		<WidgetItem
			v-slot="{ computedAttrs, styleString }"
			name="card"
			:contentVariables="cardWrapperVariables"
		>
			<KCard
				v-bind="computedAttrs"
				:style="`--sheet-outlined-border: 1px solid var(--tertiary-lighten-5); ${styleString}`"
			>
				<Widget name="balance-actions-card">
					<WidgetItem
						v-if="!seamlessStepsEnabled || isFirstStep"
						key="balance-actions-card"
						v-slot="{ computedAttrs, currencyTitleColor }"
						:contentVariables="balanceVariables"
						name="header"
					>
						<KText v-bind="computedAttrs" :style="{ textAlign: 'center', margin: 0 }">
							<template v-if="activeWallet && !loadingWallets">
								{{ activeWalletAmount }}
								<span :style="{ color: currencyTitleColor }">
									{{ activeWallet.currencyTitle }}
								</span>
							</template>
							<template v-else>
								<KSkeletonLoader
									type="card-heading"
									class="k-skeleton-loader-table-row-divider"
									:style="{
										'--skeleton-loader-card-heading-loader-heading-margin': '0px auto',
										'--skeleton-loader-container-bg-color': 'transparent'
									}"
								/>
							</template>
						</KText>
					</WidgetItem>

					<WidgetItem v-if="seamlessStepsEnabled && !isFirstStep" name="steps-flow-title">
						<Widget name="balance-actions-card-steps-flow-title">
							<WidgetItem
								v-slot="{ computedAttrs, iconSize, iconName, iconStyle }"
								name="back-icon-steps-flow"
								:contentVariables="backBtnVariables"
							>
								<KBtn
									v-bind="computedAttrs"
									icon
									exact
									:to="{ name: 'balance-activeForm', params: { activeForm: activeForm } }"
								>
									<KIcon
										:name="iconName"
										:size="iconSize"
										:style="iconStyle"
									/>
								</KBtn>
							</WidgetItem>

							<WidgetItem
								v-if="activeWallet"
								v-slot="{ computedAttrs }"
								name="title-steps-flow"
							>
								<KText v-bind="computedAttrs">
									{{ titleStepsFlow }}
								</KText>
							</WidgetItem>
						</Widget>
					</WidgetItem>

					<WidgetItem
						v-if="Boolean(activeWallet && frozenFunds)"
						key="balance-actions-card-header-frozen"
						name="header-frozen"
					>
						<Widget name="balance-wallets-form-frozen">
							<WidgetItem v-slot="{ computedAttrs }" name="icon">
								<KIcon v-bind="computedAttrs" name="frozen" />
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="amount">
								<KText v-bind="computedAttrs">
									{{ showBalance ? formatNumberAndFixedDecimals(activeWalletFrozenAmount, 16) : '*****' }} HOLD
								</KText>
							</WidgetItem>
						</Widget>
					</WidgetItem>

					<WidgetItem
						v-if="activeWallet && isScreenSizeLessMD"
						v-slot="{ computedAttrs }"
						key="balance-actions-card-currency-select"
						name="currency-select"
					>
						<KMenu
							v-if="!loadingWallets"
							v-model="currencySelectMenuValue"
							v-bind="computedAttrs"
							offsetY
							attach=""
						>
							<template #activator="{ on, attrs, value }">
								<Widget name="balance-actions-currency-select-activator" v-bind="attrs">
									<WidgetItem v-slot="{ computedAttrs }" name="currency-icon">
										<KIcon
											v-bind="computedAttrs"
											:key="iconName"
											:name="iconName"
										/>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="money-text">
										<KText v-bind="computedAttrs" v-on="on">
											{{ mobileHeaderText }}
										</KText>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="flicking-arrow">
										<KIcon
											v-if="!value"
											v-bind="computedAttrs"
											v-on="on"
										/>
									</WidgetItem>

									<WidgetItem v-slot="{ computedAttrs }" name="flicking-arrow-reverse">
										<KIcon
											v-if="value"
											v-bind="computedAttrs"
											v-on="on"
										/>
									</WidgetItem>
								</Widget>
							</template>

							<Widget name="balance-actions-currency-select-list">
								<WidgetItem v-slot="{ computedAttrs }" name="list">
									<KList v-bind="computedAttrs">
										<KListItemGroup :value="selectedCurrency">
											<KListItem
												v-for="wallet in wallets"
												:key="wallet.currencyTitle"
												color="var(--primary-lighten)"
												dense
												:to="{
													name: 'balance-activeForm',
													params: { currency: wallet.currencyTitle, activeForm: activeForm }
												}"
												@click="changeHandle(wallet)"
											>
												<Widget name="balance-actions-currency-select-icon-wrapper">
													<WidgetItem v-slot="{ computedAttrs }" name="icon-wrapper">
														<KListItemIcon
															class="k-list-item-icon"
															v-bind="computedAttrs"
															:style="{ marginRight: 0 }"
														>
															<Widget name="balance-actions-currency-select-item-icon">
																<WidgetItem v-slot="{ computedAttrs }" name="currency-icon">
																	<KIcon
																		v-bind="computedAttrs"
																		:key="getWalletIconName(wallet)"
																		:name="getWalletIconName(wallet)"
																	/>
																</WidgetItem>
															</Widget>
														</KListItemIcon>
													</WidgetItem>
												</Widget>
												<Widget name="balance-actions-currency-select-item">
													<WidgetItem name="item-content">
														<KListItemContent>
															<Widget name="balance-actions-currency-select-item-content">
																<WidgetItem v-slot="{ computedAttrs }" name="currency-title">
																	<KText v-bind="computedAttrs">
																		{{ wallet.currencyTitle }}
																	</KText>
																</WidgetItem>
																<WidgetItem
																	v-slot="{ computedAttrs }"
																	name="currency-name"
																	style="width: 100%"
																>
																	<KText
																		v-bind="computedAttrs"
																		style="
																			color: var(--tertiary-darken-3);
																			text-overflow: ellipsis;
																			white-space: nowrap;
																			overflow: hidden;

																			display: inline-block;
																			max-width: 100%;
																			vertical-align: middle;
																		"
																	>
																		{{ wallet.currencyName }}
																	</KText>
																</WidgetItem>

																<WidgetItem v-slot="{ computedAttrs }" name="available-funds">
																	<KText v-bind="computedAttrs">
																		{{
																			showBalance ? formatNumberAndFixedDecimals(wallet.availableFunds, 16) : '*****'
																		}}
																	</KText>
																</WidgetItem>
															</Widget>
														</KListItemContent>
													</WidgetItem>
												</Widget>
											</KListItem>
										</KListItemGroup>
									</KList>
								</WidgetItem>
							</Widget>
						</KMenu>

						<template v-else>
							<KSkeletonLoader
								type="card-heading"
								class="k-skeleton-loader-table-row-divider"
								:style="{
									'--skeleton-loader-card-heading-loader-heading-margin': '0px auto',
									'--skeleton-loader-container-bg-color': 'transparent'
								}"
							/>
						</template>
					</WidgetItem>

					<WidgetItem
						v-if="activeWallet"
						v-slot="{ computedAttrs }"
						key="balance-actions-card-prev-icon"
						name="prev-icon"
					>
						<Widget
							v-bind="computedAttrs"
							name="balance-actions-card-slide-prev-icon"
							@click.native="openWalletsScreen"
						/>
					</WidgetItem>

					<template v-if="!isCryptoCurrency && !loadingWallets">
						<Widget name="balance-actions-card-fiat-warning">
							<WidgetItem
								v-slot="{ computedAttrs, cardHeight }"
								:contentVariables="memoVariables"
								name="converion-warning"
								:style="{ zIndex: '6' }"
							>
								<KCard v-bind="computedAttrs" :style="{ height: cardHeight }">
									<Widget name="balance-actions-card-fiat-warning-card">
										<WidgetItem v-slot="{ computedAttrs }" name="warning-close">
											<KBtn
												v-if="isAutoViewAvailable"
												v-bind="computedAttrs"
												:to="{ name: 'auto-conversion-instant' }"
												@click.native="setActiveConversionWallet"
											>
												{{ okText }}
											</KBtn>
											<KBtn
												v-else
												v-bind="computedAttrs"
												disabled
											>
												{{ conversioNotAvailable }}
											</KBtn>
										</WidgetItem>
									</Widget>
								</KCard>
							</WidgetItem>
						</Widget>
					</template>

					<template v-else-if="isCryptoCurrency">
						<WidgetItem
							v-if="staking"
							:key="'balance-actions-staking-card' + activeWallet.currencyTitle"
							v-slot="{ computedAttrs }"
							name="staking-card"
						>
							<KCard v-bind="computedAttrs">
								<Widget name="balance-actions-staking-card">
									<WidgetItem v-slot="{ computedAttrs }" name="staking-label-with-tooltip">
										<Widget v-bind="computedAttrs" name="balance-actions-staking-card-label-with-tooltip">
											<WidgetItem v-slot="{ computedAttrs }" name="label">
												<KText v-bind="computedAttrs">
													{{ stakingLabel }}
												</KText>
											</WidgetItem>
											<WidgetItem
												key="balance-wallets-staking-tooltip"
												v-slot="{ computedAttrs }"
												name="staking-tooltip"
											>
												<KTooltip
													v-if="staking"
													v-bind="computedAttrs"
													class="k-tooltip-info-text-tooltip"
													attach=""
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
														<WidgetItem v-slot="{ computedAttrs }" name="plain">
															<KText v-bind="computedAttrs">
																{{ stakingTooltipText }}
															</KText>
														</WidgetItem>
														<WidgetItem v-slot="{ computedAttrs, href }" name="text-button">
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
											</WidgetItem>
										</Widget>
									</WidgetItem>
									<WidgetItem
										v-slot="{ computedAttrs, colorShowBalance, colorHideBalance }"
										name="staking"
										:contentVariables="stakingShowBalanceVariables"
									>
										<KText v-bind="computedAttrs" :style="{ color: showBalance ? colorShowBalance : colorHideBalance }">
											{{ showBalance ? stakingAmount : '*****' }}
										</KText>
									</WidgetItem>
									<WidgetItem v-slot="{ computedAttrs }" name="profit-label">
										<KText v-bind="computedAttrs" />
									</WidgetItem>
									<WidgetItem v-slot="{ computedAttrs }" name="perc">
										<KText v-bind="computedAttrs">
											{{ stakingPercValue }}
										</KText>
									</WidgetItem>
								</Widget>
							</KCard>
						</WidgetItem>

						<WidgetItem
							v-if="!seamlessStepsEnabled || isFirstStep"
							key="balance-actions-form-select"
							v-slot="{ computedAttrs }"
							name="form-select"
						>
							<KCard v-bind="computedAttrs">
								<FormSelect
									v-if="activeWallet && !loadingWallets"
									key="balance-actions-form-select-component"
									:actionForms="actionForms"
									:currentForm="activeForm"
									:currentFlowRecord="activeFlowRecord"
									:currentCurrency="activeWallet.currencyTitle"
									:seamlessIntegrationEnabled="seamlessIntegrationEnabled && !seamlessStepsEnabled"
									:fiatSecondCurrency="computedFiatSecondCurrency.title"
									:cryptoSecondCurrency="computedCryptoSecondCurrency.title"
									@setActiveForm="setActiveForm"
								/>
								<KSkeletonLoader
									v-else
									type="table-cell@2"
									class="k-skeleton-loader-table-row-divider"
									:style="{
										'--skeleton-loader-card-heading-loader-heading-margin': '0px auto',
										display: 'flex',
										'justify-content': 'space-around',
										'--skeleton-loader-table-cell-height': 'var(--spacing-10)'
									}"
								/>
							</KCard>
						</WidgetItem>

						<WidgetItem
							v-if="seamlessIntegrationEnabled && !seamlessStepsEnabled && !isExchangeForm"
							key="actions-card-flow-select"
							v-slot="{ computedAttrs }"
							name="flow-select"
						>
							<KCard v-bind="computedAttrs">
								<FormFlowSelect
									v-if="activeWallet && !loadingWallets"
									key="actions-card-flow-select-component"
									:currentForm="activeForm"
									:currentFlow="activeFlow"
									:currentCurrency="activeWallet.currencyTitle"
									:fiatSecondCurrency="computedFiatSecondCurrency.title"
									@setActiveFlow="setActiveFlow"
								/>
								<KSkeletonLoader
									v-else
									type="table-cell@2"
									class="k-skeleton-loader-table-row-divider"
									:style="{
										'--skeleton-loader-card-heading-loader-heading-margin': '0px auto',
										display: 'flex',
										'justify-content': 'space-around',
										'--skeleton-loader-table-cell-height': 'var(--spacing-10)'
									}"
								/>
							</KCard>
						</WidgetItem>

						<WidgetItem
							v-if="loadingWallets"
							key="balance-actions-card-wallets-list-loader"
							name="wallets-list-loader"
						>
							<KSkeletonLoader
								type="image"
								class="k-skeleton-loader-table-row-divider"
								style="
									--skeleton-loader-image-height: calc(var(--spacing-25) + var(--spacing-5));
									margin-top: var(--spacing-6);
									border-radius: 14px !important;
								"
							/>
							<KSkeletonLoader
								type="image"
								class="k-skeleton-loader-table-row-divider"
								style="
									--skeleton-loader-image-height: calc(var(--spacing-25) + var(--spacing-5));
									margin-top: var(--spacing-6);
									border-radius: 14px !important;
								"
							/>
						</WidgetItem>

						<WidgetItem
							v-if="seamlessIntegrationEnabled && seamlessStepsEnabled && isFirstStep"
							key="seamless-steps-first"
							name="seamless-steps-first"
						>
							<FormFirstStepSelect
								key="balance-actions-seamless-steps-first"
								:methods="firstStepTransports"
								:isDepositForm="isDepositForm"
								@setMethod="setSecondStep"
							/>
						</WidgetItem>

						<WidgetItem
							v-if="!loadingWallets && (!seamlessStepsEnabled || !isFirstStep) && isCryptoDeposit && !isExchangeForm"
							key="balance-actions-card-crypto-deposit"
							name="crypto-deposit"
						>
							<Widget
								v-if="seamlessIntegrationEnabled && !seamlessStepsEnabled && depositFlowIsBuy"
								key="balance-actions-seamless-deposit-buy-crypto"
								name="balance-actions-seamless-deposit-buy"
							>
								<WidgetItem
									v-slot="{ computedAttrs }"
									name="buy-give-amount"
									style="position: relative"
								>
									<KMenu
										v-model="menuBuyGiveStatusComputed"
										v-bind="computedAttrs"
										offsetY
										:closeOnContentClick="false"
										attach=""
										nudgeBottom="1"
										rounded="lg"
										minWidth="100%"
										maxHeight="352px"
									>
										<template #activator="{ attrs }">
											<FormAmount
												key="balance-actions-seamless-buy-give-amount"
												v-model="depositAmountValue"
												:useAdditionalAppend="true"
												:inputDecimals="activeWallet ? activeWallet.currencyDecimals : false"
												:amountTitle="amountTitle"
												amountLabel="Вы отдаете"
												:currencyTitle="activeWallet.currencyTitle"
												:errorMessages="errorsBalance"
												@handleCheckBlur="handleCheckDepositBalance"
												@amountChange="depositAmountHandler"
											>
												<template #additional-append>
													<div v-bind="attrs" @click="menuBuyGiveStatusComputed = true">
														<Widget name="balance-actions-amount-append-menu-activator">
															<WidgetItem v-slot="{ computedAttrs }" name="icon">
																<KIcon v-bind="computedAttrs" :name="getIconName(computedFiatSecondCurrency)" />
															</WidgetItem>

															<WidgetItem v-slot="{ computedAttrs }" name="title">
																<KText v-bind="computedAttrs">
																	{{ computedFiatSecondCurrency.title }}
																</KText>
															</WidgetItem>

															<WidgetItem v-slot="{ computedAttrs }" name="expand-icon">
																<KIcon
																	v-bind="computedAttrs"
																	:style="
																		menuBuyGiveStatus
																			? (style = 'transform: rotate(180deg); color: var(--primary-lighten)')
																			: ''
																	"
																/>
															</WidgetItem>
														</Widget>
													</div>
												</template>
											</FormAmount>
										</template>

										<Widget name="balance-actions-amount-append-menu-list">
											<WidgetItem name="previously-used">
												// previously used widget
											</WidgetItem>

											<WidgetItem v-slot="{ computedAttrs }" name="search">
												<KTextField
													v-model="menuBuyGiveSearch"
													v-bind="computedAttrs"
													autofocus
												/>
											</WidgetItem>

											<WidgetItem
												v-if="menuBuyGiveCurrencies.length"
												v-slot="{ computedAttrs }"
												name="list"
											>
												<KList v-bind="computedAttrs" style="--list-background-color: transparent">
													<KListItemGroup>
														<KListItem
															v-for="item in menuBuyGiveCurrencies"
															:key="item.id + 'append-menu-list-item'"
															dense
															@click="
																computedFiatSecondCurrency = item;
																walletsStore.validateSwapAmount();
															"
														>
															<KListItemContent>
																<Widget name="balance-actions-amount-append-menu-list-item">
																	<WidgetItem v-slot="{ computedAttrs }" name="icon">
																		<KIcon v-bind="computedAttrs" :name="getIconName(item)" />
																	</WidgetItem>

																	<WidgetItem v-slot="{ computedAttrs }" name="title">
																		<KText v-bind="computedAttrs">
																			{{ item.title }}
																		</KText>
																	</WidgetItem>

																	<WidgetItem v-slot="{ computedAttrs }" name="name">
																		<KText v-bind="computedAttrs">
																			{{ item.name }}
																		</KText>
																	</WidgetItem>

																	<WidgetItem
																		v-if="equivalentCurrenciesRatesRecord[item.currencyId || item.id]"
																		v-slot="{ computedAttrs }"
																		name="equivalent-rate"
																	>
																		<KText v-bind="computedAttrs">
																			1 {{ item.title || item.currencyTitle }}
																			{{ (item.title || item.currencyTitle) !== firstCurrencyTitleByForm ? '~' : '=' }}
																			{{
																				toFixedDecimals(
																					1 / equivalentCurrenciesRatesRecord[item.currencyId || item.id],
																					firstCurrencyDecimalsByForm
																				)
																			}}
																			{{ firstCurrencyTitleByForm }}
																		</KText>
																	</WidgetItem>
																</Widget>
															</KListItemContent>
														</KListItem>
													</KListItemGroup>
												</KList>
											</WidgetItem>

											<WidgetItem v-else name="no-data">
												<Widget name="balance-wallets-card-list-empty" :style="{ margin: 'var(--spacing-10) 0' }">
													<WidgetItem v-slot="{ computedAttrs, name }" name="icon">
														<KIcon
															v-bind="computedAttrs"
															:name="name"
															size="64"
														/>
													</WidgetItem>

													<WidgetItem v-slot="{ computedAttrs, title }" name="title">
														<KText v-bind="computedAttrs">
															{{ title }}
														</KText>
													</WidgetItem>
												</Widget>
											</WidgetItem>
										</Widget>
									</KMenu>
								</WidgetItem>

								<WidgetItem name="buy-get-amount">
									<FormAmount
										key="balance-actions-seamless-buy-get-amount"
										v-model="depositAmountValue"
										:inputDecimals="activeWallet ? activeWallet.currencyDecimals : false"
										:amountLabel="depositAmount"
										:currencyTitle="activeWallet.currencyTitle"
										:availableBalanceText="availableBalanceText"
										:maxLimitText="'Max'"
										:minLimitText="'Min'"
										:minLimit="activeTransport ? activeTransport.minAmount : ''"
										:feeFinal="activeWalletData.feeFinal"
										:minFee="activeWalletData.minFee"
										:maxFee="activeWalletData.maxFee"
										:availableFunds="availableFunds"
										:errorMessages="errorsBalance"
										@handleCheckBlur="handleCheckDepositBalance"
										@amountChange="depositAmountHandler"
									/>
								</WidgetItem>

								<WidgetItem name="buy-method-select">
									<FormPaymentMethodSelect
										:value="currentPaymentMethod"
										:methods="sharedDataPaymentMethods"
										:disableAutoOpen="true"
										:giveCurrencyTitle="computedFiatSecondCurrency.title"
										:getCurrencyName="activeWallet.currencyName"
										@setMethod="setActiveWithdrawalPaymentMethod"
									/>
								</WidgetItem>

								<WidgetItem name="tip-of-p2p">
									<Widget name="balance-form-seamless-p2p-promt">
										<WidgetItem v-slot="{ computedAttrs }" name="text">
											<KText v-bind="computedAttrs">
												{{
													$t('balance.seamlessP2pPrompt', {
														time: predictMinutes
															? `${predictMinutes} ${$t('system.minute', {
																time: predictMinutes,
																$plural: 'time'
															}).toLowerCase()}`
															: $t('balance.instantTime')
													})
												}}
											</KText>
										</WidgetItem>
										<WidgetItem v-slot="{ computedAttrs }" name="link">
											<KText
												v-bind="computedAttrs"
												:to="getP2pLink"
												target="_blank"
											/>
										</WidgetItem>
									</Widget>
								</WidgetItem>

								<WidgetItem v-slot="{ computedAttrs }" name="buy-button">
									<KBtn
										v-bind="computedAttrs"
										:disabled="isDepositBuyDisabled"
										@click="depositBuyAction"
									>
										<Widget
											v-if="depositBuyActionInProcess"
											:key="`balance-crypto-button-circular${blockchainInProcess}`"
											name="balance-crypto-button-circular"
										>
											<WidgetItem v-slot="{ computedAttrs }" name="circular">
												<KProgressCircular
													v-bind="computedAttrs"
													indeterminate
													style="color: inherit"
												/>
											</WidgetItem>
										</Widget>

										<template v-else>
											<span>{{ $t('balance.buyFlow') }} {{ activeWallet.currencyTitle }}</span>
										</template>
									</KBtn>
								</WidgetItem>

								<WidgetItem v-slot="{ computedAttrs }" name="cancel-button">
									<KBtn
										v-bind="computedAttrs"
										:to="toDepositGetObject"
										@click="seamlessDepositCancelHandler"
									>
										<Widget name="balance-seamless-cancel-button">
											<WidgetItem v-slot="{ computedAttrs }" name="text">
												<KText v-bind="computedAttrs">
													{{ $t('balance.toCancel') }}
												</KText>
											</WidgetItem>
										</Widget>
									</KBtn>
								</WidgetItem>
							</Widget>

							<Widget v-else name="balance-actions-crypto-deposit">
								<WidgetItem name="deposit-transport-select">
									<FormTransportSelect
										v-if="activeWallet"
										:key="activeWallet.currencyTitle"
										:value="lastActiveTransportId"
										:transports="actualDepositTransports"
										:seamlessIntegrationEnabled="seamlessIntegrationEnabled"
										@setTransport="setActiveDepositTransport"
									/>
								</WidgetItem>

								<WidgetItem
									v-if="isMemoWarningActive"
									key="balance-actions-crypto-memo-warning"
									v-slot="{ computedAttrs, cardHeight }"
									:contentVariables="memoVariables"
									name="memo-warning"
									:style="{ zIndex: '6' }"
								>
									<KCard v-bind="computedAttrs" :style="{ height: cardHeight }">
										<Widget name="balance-actions-memo-warning">
											<WidgetItem v-slot="{ computedAttrs }" name="warning-text">
												<KText v-bind="computedAttrs">
													{{ depositMemoWarning }}
												</KText>
											</WidgetItem>

											<WidgetItem v-slot="{ computedAttrs }" name="warning-close">
												<KBtn v-bind="computedAttrs" @click="toggleMemoWarning(false, isCheckBoxActive)">
													{{ okText }}
												</KBtn>
											</WidgetItem>

											<WidgetItem
												v-slot="{ computedAttrs, activeCheckBox, inactiveCheckBox }"
												name="check-box"
												:contentVariables="checkBoxIconVariables"
											>
												<KIcon
													v-bind="computedAttrs"
													:name="isCheckBoxActive ? activeCheckBox : inactiveCheckBox"
													@click="setCheckBox"
												/>
											</WidgetItem>
											<WidgetItem v-slot="{ computedAttrs }" name="check-box-title">
												<KText v-bind="computedAttrs" />
											</WidgetItem>
										</Widget>
									</KCard>
								</WidgetItem>
								<MemoWarningModal
									v-if="isMemoWarningActive"
									:setModalActive="toggleMemoWarning"
									:isOpen="memoWarningIsOpen"
									:textBody="depositMemoWarning"
								/>
								<WidgetItem name="deposit-address">
									<FormDepositInfo
										v-if="activeTransport && activeWalletData.address"
										key="balance-actions-crypto-deposit-address"
										:value="activeWalletData.address"
										:canRefresh="cryptoCurrency.addressMultiple && !cryptoCurrency.addressTagOnly"
										:titleText="addressTitle"
										:titleTooltipText="addressTitleTooltip"
										:titlePromtText="addressTitlePromt"
										:titlePromtNeeded="activeWalletData.tag"
										:subtitleText="addressSubtitle"
										:refreshText="addressRefresh"
										:qrCodeneeded="true"
										:qrCodeValue="activeWalletData.uri"
										:qrCodeModalText="addressQrCodeModal"
										@refreshClickHandler="generateNewAddress"
									/>
								</WidgetItem>

								<WidgetItem name="deposit-publicKey">
									<FormDepositInfo
										v-if="cryptoCurrency && cryptoCurrency.addressPublicKey"
										key="balance-actions-crypto-deposit-publicKey"
										:value="activeWalletData.publicKey"
										:titleText="publicKeyTitle"
										:titlePromtText="publicKeyTitlePromt"
										titlePromtPostfix="-orange"
										:subtitleText="publicKeySubtitle"
										:subtitleTooltipText="publicKeySubtitleTooltip"
									/>
								</WidgetItem>

								<WidgetItem name="deposit-tag">
									<FormDepositInfo
										v-if="cryptoCurrency && cryptoCurrency.tag && activeWalletData.tag"
										key="balance-actions-crypto-deposit-tag"
										:value="activeWalletData.tag"
										:canRefresh="cryptoCurrency.addressMultiple && cryptoCurrency.addressTagOnly"
										:titleText="$t(`balance.${cryptoCurrency.tagName}`)"
										:titlePromtText="tagTitlePromt"
										titlePromtPostfix="-orange"
										:subtitleText="tagSubtitle"
										:subtitleTooltipText="tagSubtitleTooltip"
										:refreshText="tagRefresh"
										:titlePromtNeeded="true"
										@refreshClickHandler="generateNewAddress"
									/>
								</WidgetItem>
								<InputWithCurrencyMenu
									v-if="activeWallet && cryptoCurrencyUriAmount"
									v-model="depositAmountValueWithEquivalent"
									nameWidget="deposit-amount-with-equivalent"
									keyWidget="deposit-amount-with-equivalent"
									:errorMessages="errorsBalance"
									:amountTitle="amountTitle"
									:amountLabel="depositAmount"
									@handleCheckBlur="handleCheckDepositBalanceWithEquivalent"
									@amountChange="depositAmountHandler"
								/>

								<WidgetItem key="deposit-amount-with-equivalent-and-fee" name="deposit-amount-with-equivalent-and-fee">
									<FormAmount
										v-if="isTransportActive && activeWalletData.feeRate && cryptoCurrencyUriAmount"
										key="deposit-amount-with-equivalent-and-fee"
										v-model="depositAmountValueWithFeeAndEquivalent"
										:inputDecimals="activeWallet ? activeWallet.currencyDecimals : false"
										:amountLabel="recieptAmount"
										:currencyTitle="activeWallet.currencyTitle"
										@amountChange="depositFeeAmountHandler"
										@handleCheckBlur="handleCheckDepositBalance"
									/>
								</WidgetItem>

								<WidgetItem name="deposit-amount">
									<FormAmount
										v-if="activeWallet && cryptoCurrencyUriAmount"
										key="balance-actions-crypto-deposit-amount"
										v-model="depositAmountValue"
										:inputDecimals="activeWallet ? activeWallet.currencyDecimals : false"
										:amountTitle="amountTitle"
										:amountLabel="depositAmount"
										:currencyTitle="activeWallet.currencyTitle"
										:availableBalanceText="availableBalanceText"
										:maxLimitText="'Max'"
										:minLimitText="'Min'"
										:minLimit="activeTransport ? activeTransport.minAmount : ''"
										:availableFunds="availableFunds"
										:errorMessages="errorsBalance"
										@handleCheckBlur="handleCheckDepositBalance"
										@amountChange="depositAmountHandler"
									/>
								</WidgetItem>

								<WidgetItem name="deposit-amount-withFee">
									<FormAmount
										v-if="isTransportActive && activeWalletData.feeRate && cryptoCurrencyUriAmount"
										key="balance-actions-crypto-deposit-amount-withFee"
										v-model="depositAmountValueWithFee"
										:inputDecimals="activeWallet ? activeWallet.currencyDecimals : false"
										:amountLabel="recieptAmount"
										:currencyTitle="activeWallet.currencyTitle"
										@amountChange="depositFeeAmountHandler"
										@handleCheckBlur="handleCheckDepositBalance"
									/>
								</WidgetItem>

								<WidgetItem v-if="isTransportActive" name="deposit-fee">
									<Widget name="balance-actions-crypto-deposit-fee-block">
										<WidgetItem v-slot="{ computedAttrs }" name="header">
											<KText v-bind="computedAttrs" />
										</WidgetItem>
										<WidgetItem name="value-row">
											<Widget name="balance-actions-crypto-deposit-fee-block-value">
												<WidgetItem v-slot="{ computedAttrs }" name="fee-value">
													<KText v-bind="computedAttrs">
														{{ depositFeeText }}
													</KText>
												</WidgetItem>
												<WidgetItem
													v-slot="{ tooltip }"
													name="fee-tooltip"
													:contentVariables="translationVariables"
												>
													<InfoTooltip>
														<Widget name="balance-text-body-2-regular">
															<WidgetItem v-slot="{ computedAttrs }" name="text">
																<KText v-bind="computedAttrs">
																	{{ tooltip }}
																</KText>
															</WidgetItem>
														</Widget>
													</InfoTooltip>
												</WidgetItem>
											</Widget>
										</WidgetItem>
									</Widget>
								</WidgetItem>

								<WidgetItem name="deposit-qr-code">
									<QrCodeModal
										v-if="activeWalletData && activeWallet"
										:isActive="isDepositQrActive"
										:qrCodeValue="qrCodeURI"
										:qrCodeModalText="addressQrCodeModal"
										:amount="activeWalletData.amountValue"
										:currencyTitle="activeWallet.currencyTitle"
										:equivalentValue="amountEquivalent"
										:equivalentTitle="favoriteCurrencySymbol"
										:address="activeWalletData.address"
										:tagName="cryptoTagName"
										:tagValue="activeWalletData.tag"
										:publicKeyTitle="publicKeyTitle"
										:publicKeyValue="activeWalletData.publicKey"
										:uriAmount="cryptoCurrencyUriAmount"
										@input="getCryptoDepositQrUri"
									/>
								</WidgetItem>
							</Widget>
						</WidgetItem>

						<WidgetItem
							v-if="!loadingWallets && (!seamlessStepsEnabled || !isFirstStep) && isCryptoWithdrawal && !isExchangeForm"
							key="balance-actions-card-crypto-withdrawal"
							name="crypto-withdrawal"
						>
							<Widget
								v-if="seamlessIntegrationEnabled && !seamlessStepsEnabled && withdrawalFlowIsSell"
								key="balance-actions-seamless-withdrawal-sell-crypto"
								name="balance-actions-seamless-withdrawal-sell"
							>
								<WidgetItem name="sell-give-amount">
									<FormAmount
										key="balance-actions-seamless-sell-give-amount"
										v-model="withdrawalAmountValue"
										:amountTitle="amountTitle"
										:amountLabel="$t('balance.uRGiving')"
										:currencyTitle="activeWallet.currencyTitle"
										:availableBalanceText="availableBalanceText"
										:availableFunds="availableFunds"
										:maxLimitText="'Max'"
										:minLimitText="'Min'"
										:inputDecimals="activeWallet ? activeWallet.currencyDecimals : false"
										:maxLimit="activeTransport ? activeTransport.maxAmount : ''"
										:errorMessages="errorsBalance"
										@handleCheckBlur="handleCheckBalance"
										@amountChange="withdrawalAmountHandler"
										@deposit="setDepositForm"
									/>
								</WidgetItem>

								<WidgetItem
									v-slot="{ computedAttrs }"
									name="sell-get-amount"
									style="position: relative"
								>
									<KMenu
										v-model="menuBuyGiveStatusComputed"
										v-bind="computedAttrs"
										offsetY
										:closeOnContentClick="false"
										attach=""
										nudgeBottom="1"
										rounded="lg"
										minWidth="100%"
										maxHeight="352px"
									>
										<template #activator="{ attrs }">
											<FormAmount
												key="balance-actions-seamless-sell-get-amount"
												v-model="withdrawalAmountValue"
												:useAdditionalAppend="true"
												:inputDecimals="activeWallet ? activeWallet.currencyDecimals : false"
												:amountLabel="$t('balance.uGetText')"
												:currencyTitle="activeWallet.currencyTitle"
												:errorMessages="errorsBalance"
												@handleCheckBlur="handleCheckBalance"
												@amountChange="depositAmountHandler"
											>
												<template #additional-append>
													<div v-bind="attrs" @click="menuBuyGiveStatusComputed = true">
														<Widget name="balance-actions-amount-append-menu-activator">
															<WidgetItem v-slot="{ computedAttrs }" name="icon">
																<KIcon v-bind="computedAttrs" :name="getIconName(computedFiatSecondCurrency)" />
															</WidgetItem>

															<WidgetItem v-slot="{ computedAttrs }" name="title">
																<KText v-bind="computedAttrs">
																	{{ computedFiatSecondCurrency.title }}
																</KText>
															</WidgetItem>

															<WidgetItem v-slot="{ computedAttrs }" name="expand-icon">
																<KIcon
																	v-bind="computedAttrs"
																	:style="
																		menuBuyGiveStatus
																			? (style = 'transform: rotate(180deg); color: var(--primary-lighten)')
																			: ''
																	"
																/>
															</WidgetItem>
														</Widget>
													</div>
												</template>
											</FormAmount>
										</template>

										<Widget name="balance-actions-amount-append-menu-list">
											<WidgetItem name="previously-used">
												// previously used widget
											</WidgetItem>

											<WidgetItem v-slot="{ computedAttrs }" name="search">
												<KTextField
													v-model="menuBuyGiveSearch"
													v-bind="computedAttrs"
													autofocus
												/>
											</WidgetItem>

											<WidgetItem
												v-if="menuBuyGiveCurrencies.length"
												v-slot="{ computedAttrs }"
												name="list"
											>
												<KList v-bind="computedAttrs" style="--list-background-color: transparent">
													<KListItemGroup>
														<KListItem
															v-for="item in menuBuyGiveCurrencies"
															:key="item.id + 'append-menu-list-item'"
															dense
															@click="
																computedFiatSecondCurrency = item;
																walletsStore.validateSwapAmount();
															"
														>
															<KListItemContent>
																<Widget name="balance-actions-amount-append-menu-list-item">
																	<WidgetItem v-slot="{ computedAttrs }" name="icon">
																		<KIcon v-bind="computedAttrs" :name="getIconName(item)" />
																	</WidgetItem>

																	<WidgetItem v-slot="{ computedAttrs }" name="title">
																		<KText v-bind="computedAttrs">
																			{{ item.title }}
																		</KText>
																	</WidgetItem>

																	<WidgetItem v-slot="{ computedAttrs }" name="name">
																		<KText v-bind="computedAttrs">
																			{{ item.name }}
																		</KText>
																	</WidgetItem>

																	<WidgetItem
																		v-if="equivalentCurrenciesRatesRecord[item.currencyId || item.id]"
																		v-slot="{ computedAttrs }"
																		name="equivalent-rate"
																	>
																		<KText v-bind="computedAttrs">
																			1 {{ item.title || item.currencyTitle }}
																			{{ (item.title || item.currencyTitle) !== firstCurrencyTitleByForm ? '~' : '=' }}
																			{{
																				toFixedDecimals(
																					1 / equivalentCurrenciesRatesRecord[item.currencyId || item.id],
																					firstCurrencyDecimalsByForm
																				)
																			}}
																			{{ firstCurrencyTitleByForm }}
																		</KText>
																	</WidgetItem>
																</Widget>
															</KListItemContent>
														</KListItem>
													</KListItemGroup>
												</KList>
											</WidgetItem>

											<WidgetItem v-else name="no-data">
												<Widget name="balance-wallets-card-list-empty" :style="{ margin: 'var(--spacing-10) 0' }">
													<WidgetItem v-slot="{ computedAttrs, name }" name="icon">
														<KIcon
															v-bind="computedAttrs"
															:name="name"
															size="64"
														/>
													</WidgetItem>

													<WidgetItem v-slot="{ computedAttrs, title }" name="title">
														<KText v-bind="computedAttrs">
															{{ title }}
														</KText>
													</WidgetItem>
												</Widget>
											</WidgetItem>
										</Widget>
									</KMenu>
								</WidgetItem>

								<WidgetItem name="sell-method-select">
									<FormPaymentMethodSelect
										:value="currentPaymentMethod"
										:methods="sharedDataPaymentMethods"
										:disableAutoOpen="true"
										:giveCurrencyTitle="computedFiatSecondCurrency.title"
										:getCurrencyName="activeWallet.currencyName"
										@setMethod="setActiveDepositPaymentMethod"
									/>
								</WidgetItem>

								<WidgetItem name="requisites">
									<FormAmount
										key="balance-actions-seamless-sell-give-requisites"
										v-model="withdrawalRequisites"
										:amountLabel="$t('system.requisites')"
										inputType="text"
										:counter="250"
										:errorMessages="errorCommentValue"
										@amountChange="requisitesWithdrawalHandler"
										@handleCheckBlur="handleCheckRequisites"
									/>
								</WidgetItem>

								<WidgetItem name="comment">
									<FormAmount
										key="balance-actions-seamless-sell-give-comment"
										v-model="localCommentValue"
										:amountLabel="$t('balance.modalDetailsTitle')"
										inputType="text"
										:counter="250"
										:errorMessages="errorCommentValue"
										@amountChange="commentWithdrawalHandler"
										@handleCheckBlur="handleCheckComment"
										@showInputChange="commentWithdrawalShowInputHandler"
									>
										<template #title-append>
											<InfoTooltip title="">
												<Widget name="balance-text-body-2-regular">
													<WidgetItem v-slot="{ computedAttrs }" name="text">
														<KText v-bind="computedAttrs">
															{{ tooltipCommentText }}
														</KText>
													</WidgetItem>
												</Widget>
											</InfoTooltip>
										</template>
									</FormAmount>
								</WidgetItem>

								<WidgetItem name="tip-of-p2p">
									<Widget name="balance-form-seamless-p2p-promt">
										<WidgetItem v-slot="{ computedAttrs }" name="text">
											<KText v-bind="computedAttrs">
												{{
													$t('balance.seamlessP2pPrompt', {
														time: predictMinutes
															? `${predictMinutes} ${$t('system.minute', {
																time: predictMinutes,
																$plural: 'time'
															}).toLowerCase()}`
															: $t('balance.instantTime')
													})
												}}
											</KText>
										</WidgetItem>
										<WidgetItem v-slot="{ computedAttrs }" name="link">
											<KText
												v-bind="computedAttrs"
												:to="getP2pLink"
												target="_blank"
											/>
										</WidgetItem>
									</Widget>
								</WidgetItem>

								<WidgetItem v-slot="{ computedAttrs }" name="sell-button">
									<KBtn
										v-bind="computedAttrs"
										:disabled="isWithdrawalSellDisabled"
										@click="withdrawalBuyAction"
									>
										<Widget
											v-if="withdrawalBuyActionInProcess"
											:key="`balance-crypto-button-circular${blockchainInProcess}`"
											name="balance-crypto-button-circular"
										>
											<WidgetItem v-slot="{ computedAttrs }" name="circular">
												<KProgressCircular
													v-bind="computedAttrs"
													indeterminate
													style="color: inherit"
												/>
											</WidgetItem>
										</Widget>

										<template v-else>
											<span>{{ $t('balance.sellFlow') }} {{ activeWallet.currencyTitle }}</span>
										</template>
									</KBtn>
								</WidgetItem>

								<WidgetItem v-slot="{ computedAttrs }" name="cancel-button">
									<KBtn
										v-bind="computedAttrs"
										:to="toWithdrawalTransferObject"
										@click="seamlessWithdrawalCancelHandler"
									>
										<Widget name="balance-seamless-cancel-button">
											<WidgetItem v-slot="{ computedAttrs }" name="text">
												<KText v-bind="computedAttrs">
													{{ $t('balance.toCancel') }}
												</KText>
											</WidgetItem>
										</Widget>
									</KBtn>
								</WidgetItem>
							</Widget>

							<Widget v-else name="balance-actions-crypto-withdrawal">
								<WidgetItem name="withdrawal-transport-select">
									<FormTransportSelect
										v-if="activeWallet"
										key="balance-actions-crypto-withdrawal-transport-select"
										:value="lastActiveTransportId"
										:transports="actualWithdrawalTransports"
										:seamlessIntegrationEnabled="seamlessIntegrationEnabled"
										@setTransport="setActiveWithdrawalTransport"
									/>
								</WidgetItem>
								<WidgetItem
									v-if="isWithdrawalMemoWarningActive"
									key="balance-actions-crypto-withdrawal-memo-warning"
									v-slot="{ computedAttrs, cardHeight }"
									:contentVariables="memoVariables"
									name="memo-warning"
									:style="{ zIndex: '6' }"
								>
									<KCard v-bind="computedAttrs" :style="{ height: cardHeight }">
										<Widget name="balance-actions-withdrawal-memo-warning">
											<WidgetItem v-slot="{ computedAttrs }" name="warning-text-1">
												<KText v-bind="computedAttrs">
													{{ withdrawalMemoWarning }}
												</KText>
											</WidgetItem>

											<WidgetItem v-slot="{ computedAttrs }" name="warning-text-2">
												<KText v-bind="computedAttrs">
													{{ withdrawalMemoWarningSecond }}
												</KText>
											</WidgetItem>

											<WidgetItem v-slot="{ computedAttrs }" name="warning-close">
												<KBtn v-bind="computedAttrs" @click="toggleMemoWarning(false)">
													{{ okText }}
												</KBtn>
											</WidgetItem>
										</Widget>
									</KCard>
								</WidgetItem>

								<WidgetItem name="withdrawal-address">
									<FormAmount
										v-if="isTransportActive"
										key="balance-actions-crypto-withdrawal-address"
										v-model.trim="withdrawalAddress"
										:amountTitle="writeAddress"
										:amountLabel="recipientAddress"
										inputType="text"
										:useTextArea="isScreenSizeLessMD"
										:errorMessages="errorAddressValue"
										:textAreaAppendIcon="true"
										@handleCheckBlur="handleCheckAddress"
										@amountChange="addressWithdrawalHandler"
										@handlePaste="handlePasteAddress"
									>
										<template #before-input>
											<Widget name="balance-actions-crypto-address-warning-wrapper">
												<WidgetItem name="address-promt">
													<Widget name="balance-actions-crypto-address-warning">
														<WidgetItem v-slot="{ computedAttrs, name }" name="icon">
															<KIcon v-bind="computedAttrs" :name="name" />
														</WidgetItem>

														<WidgetItem v-slot="{ computedAttrs }" name="text">
															<KText v-bind="computedAttrs">
																{{ withdrawalAddressBeforeInputPrompt }}
															</KText>
														</WidgetItem>
													</Widget>
												</WidgetItem>
											</Widget>
										</template>
									</FormAmount>
								</WidgetItem>

								<WidgetItem name="withdrawal-publicKey">
									<FormAmount
										v-if="cryptoCurrency && cryptoCurrency.addressPublicKey"
										key="balance-actions-crypto-withdrawal-publicKey"
										v-model="withdrawalPublicKey"
										:amountTitle="writePublicKey"
										:amountLabel="publicKeyTitle"
										inputType="text"
										:errorMessages="errorPublicKeyValue"
										@handleCheckBlur="handleCheckPublicKey"
										@amountChange="publicKeyWithdrawalHandler"
									>
										<template #before-input>
											<Widget name="balance-form-withdrawal-info-promt-orange">
												<WidgetItem v-slot="{ computedAttrs, name }" name="icon">
													<KIcon v-bind="computedAttrs" :name="name" />
												</WidgetItem>

												<WidgetItem v-slot="{ computedAttrs }" name="text">
													<KText v-bind="computedAttrs">
														{{ titlePromtText }}
													</KText>
												</WidgetItem>
											</Widget>
										</template>
									</FormAmount>
								</WidgetItem>

								<WidgetItem key="withdrawal-tag" name="withdrawal-tag">
									<FormAmount
										v-if="cryptoCurrency && cryptoCurrency.tag && getIsVisibleWithdrawalTag"
										key="balance-actions-crypto-withdrawal-tag"
										v-model="tagWithdrawal"
										:amountTitle="tagTitle"
										:amountLabel="memoPlaceholder"
										:amountValue="activeWalletData.withdrawalTag"
										inputType="text"
										:errorMessages="errorTagValue"
										@handleCheckBlur="handleCheckTag"
										@amountChange="tagWithdrawalHandler"
									>
										<template #before-input>
											<Widget name="balance-form-withdrawal-info-promt-orange">
												<WidgetItem v-slot="{ computedAttrs, name }" name="icon">
													<KIcon v-bind="computedAttrs" :name="name" />
												</WidgetItem>

												<WidgetItem v-slot="{ computedAttrs }" name="text">
													<KText v-bind="computedAttrs">
														{{ tagTitlePromt }}
													</KText>
												</WidgetItem>

												<WidgetItem v-slot="{ computedAttrs }" name="close-icon">
													<KIcon v-bind="computedAttrs" @click="closeWarningTagNote" />
												</WidgetItem>
											</Widget>
										</template>
									</FormAmount>
								</WidgetItem>

								<InputWithCurrencyMenu
									v-if="activeWallet && activeWallet.withdrawalTransactionMethods.length && isTransportActive"
									v-model="withdrawalAmountValueWithEquivalent"
									nameWidget="withdrawal-amount-with-equivalent"
									keyWidget="withdrawal-amount-with-equivalent"
									:errorMessages="errorsBalance"
									:amountTitle="amountTitle"
									:amountLabel="fundsWithdrawalSum"
									:maxLimitText="'Max'"
									:maxLimit="activeTransport ? activeTransport.maxAmount : ''"
									@handleCheckBlur="handleCheckDepositWithdrawalBalanceWithEquivalent"
									@amountChange="withdrawalAmountHandlerWithEquivalent"
									@deposit="setDepositForm"
								/>

								<WidgetItem
									key="withdrawal-amount-with-equivalent-and-fee"
									name="withdrawal-amount-with-equivalent-and-fee"
								>
									<FormAmount
										v-if="isTransportActive && activeWalletData.feeRate"
										key="balance-actions-crypto-buy-give-amount"
										v-model="withdrawalAmountValueWithFeeAndEquivalent"
										:amountLabel="withdrawalAmountLabel"
										:currencyTitle="activeWallet.currencyTitle"
										:feeRateText="$t(balanceText.commissionRate)"
										:feeRate="activeWalletData.feeRate"
										:inputDecimals="activeWallet ? activeWallet.currencyDecimals : false"
										:feeFinal="activeWalletData.feeFinal"
										:minFee="activeWalletData.minFee"
										:maxFee="activeWalletData.maxFee"
										:errorMessages="errorsBalance"
										:maxLimitText="'Max'"
										:maxLimit="getMaxLimitWithFee"
										:availableFunds="availableFunds"
										@handleCheckBlur="handleCheckDepositWithdrawalBalanceWithEquivalentAndFee"
										@amountChange="withdrawalAmountHandlerWithEquivalentAndFee"
									/>
								</WidgetItem>

								<WidgetItem name="withdrawal-amount">
									<FormAmount
										v-if="activeWallet && activeWallet.withdrawalTransactionMethods.length && isTransportActive"
										key="balance-actions-crypto-withdrawal-amount"
										v-model="withdrawalAmountValue"
										:amountTitle="amountTitle"
										:amountLabel="fundsWithdrawalSum"
										:currencyTitle="activeWallet.currencyTitle"
										:availableBalanceText="availableBalanceText"
										:maxLimitText="'Max'"
										:inputDecimals="activeWallet ? activeWallet.currencyDecimals : false"
										:availableFunds="availableFunds"
										:maxLimit="activeTransport ? activeTransport.maxAmount : ''"
										:errorMessages="errorsBalance"
										@handleCheckBlur="handleCheckBalance"
										@amountChange="withdrawalAmountHandler"
										@deposit="setDepositForm"
									/>
								</WidgetItem>

								<WidgetItem name="withdrawal-amount-withFee">
									<FormAmount
										v-if="isTransportActive && activeWalletData.feeRate"
										key="balance-actions-crypto-withdrawal-amount-withFee"
										v-model="withdrawalAmountValueWithFee"
										:amountLabel="withdrawalAmountLabel"
										:currencyTitle="activeWallet.currencyTitle"
										:feeRateText="$t(balanceText.commissionRate)"
										:feeRate="activeWalletData.feeRate"
										:inputDecimals="activeWallet ? activeWallet.currencyDecimals : false"
										:feeFinal="activeWalletData.feeFinal"
										:minFee="activeWalletData.minFee"
										:maxFee="activeWalletData.maxFee"
										:errorMessages="errorsBalance"
										:maxLimitText="'Max'"
										:maxLimit="getMaxLimitWithFee"
										:availableFunds="availableFunds"
										@handleCheckBlur="handleCheckBalance"
										@amountChange="withdrawalFeeAmountHandler"
									/>
								</WidgetItem>

								<WidgetItem name="withdrawal-comment" class="withdrawal-comment">
									<FormAmount
										v-if="cryptoCurrency && isTransportActive"
										key="balance-actions-crypto-withdrawal-comment"
										v-model="withdrawalComment"
										:amountTitle="$t('balance.modalDetailsTitle')"
										:amountLabel="commentLabel"
										inputType="text"
										:checkboxConditional="true"
										:useTextArea="true"
										:counter="250"
										:textareaProps="{ height: 104, noResize: true, maxlength: 250 }"
										:errorMessages="errorCommentValue"
										@amountChange="commentWithdrawalHandler"
										@handleCheckBlur="handleCheckComment"
										@showInputChange="commentWithdrawalShowInputHandler"
									>
										<template #title-append>
											<InfoTooltip title="">
												<Widget name="balance-text-body-2-regular">
													<WidgetItem v-slot="{ computedAttrs }" name="text">
														<KText v-bind="computedAttrs">
															{{ tooltipCommentText }}
														</KText>
													</WidgetItem>
												</Widget>
											</InfoTooltip>
										</template>
									</FormAmount>
								</WidgetItem>

								<WidgetItem name="fee">
									<FeeBlock v-if="isTransportActive" />
								</WidgetItem>

								<WidgetItem
									key="balance-actions-crypto-withdrawal-button"
									v-slot="{ computedAttrs }"
									name="withdrawal-button"
									class="withdrawal-button"
									:style="cryptoWithdrawalButtonStyle"
								>
									<KBtn
										v-bind="computedAttrs"
										:disabled="isWithdrawalDisabled"
										@click="withdrawalAction"
									>
										<Widget
											v-if="blockchainInProcess"
											:key="`balance-crypto-button-circular${blockchainInProcess}`"
											name="balance-crypto-button-circular"
										>
											<WidgetItem v-slot="{ computedAttrs }" name="circular">
												<KProgressCircular
													v-bind="computedAttrs"
													indeterminate
													style="color: inherit"
												/>
											</WidgetItem>
										</Widget>

										<template v-else>
											<span>{{ $t('balance.withdrawal') }} {{ activeWallet.currencyTitle }}</span>
										</template>
									</KBtn>
								</WidgetItem>

								<WidgetItem
									key="balance-actions-withdrawal-button-fixed-wrapper"
									v-slot="{ computedAttrs }"
									name="wrapper"
									class="withdrawal-button-fixed"
									:style="cryptoWithdrawalFixedButtonStyle"
								>
									<Widget name="balance-actions-withdrawal-button-fixed">
										<WidgetItem name="button">
											<KBtn
												v-bind="computedAttrs"
												:disabled="isWithdrawalDisabled"
												class="k-btn-primary v-btn--tile"
												@click="withdrawalAction"
											>
												<Widget
													v-if="blockchainInProcess"
													:key="`balance-crypto-button-circular${blockchainInProcess}`"
													name="balance-crypto-button-circular"
												>
													<WidgetItem v-slot="{ computedAttrs }" name="circular">
														<KProgressCircular v-bind="computedAttrs" indeterminate />
													</WidgetItem>
												</Widget>

												<template v-else>
													<span>{{ $t('balance.withdrawal') }} {{ activeWallet.currencyTitle }}</span>
												</template>
											</KBtn>
										</WidgetItem>
									</Widget>
								</WidgetItem>
							</Widget>
						</WidgetItem>

						<WidgetItem
							v-if="seamlessIntegrationEnabled && (!seamlessStepsEnabled || !isFirstStep) && isExchangeForm"
							key="balance-actions-card-crypto-exchange"
							name="crypto-exchange"
							style="position: relative"
						>
							<Widget name="balance-actions-seamless-exchange-swap">
								<WidgetItem v-slot="{ computedAttrs }" name="swap-give-amount">
									<FormAmount
										v-if="!seamlessStepsEnabled || isCryptoWithdrawal"
										key="actions-seamless-swap-give-amount-textfield"
										v-model="swapAmountValue"
										:amountTitle="amountTitle"
										:amountLabel="$t('balance.uRGiving')"
										:currencyTitle="activeWallet.currencyTitle"
										:availableFunds="availableFunds"
										:maxLimitText="'Max'"
										:minLimitText="'Min'"
										:maxLimit="bestSwapOffer ? bestSwapOffer.maximumLimit : 0"
										:minLimit="bestSwapOffer ? bestSwapOffer.minimumLimit : 0"
										:errorMessages="errorsExchange"
										@handleCheckBlur="handleCheckDepositBalanceGet"
										@amountChange="depositAmountHandlerGet"
									/>

									<KMenu
										v-else
										key="actions-seamless-swap-give-amount-menu"
										v-model="menuBuyGiveStatusComputed"
										v-bind="computedAttrs"
										offsetY
										:closeOnContentClick="false"
										attach=""
										nudgeBottom="1"
										rounded="lg"
										minWidth="100%"
										maxHeight="352px"
									>
										<template #activator="{ attrs }">
											<FormAmount
												key="balance-actions-seamless-swap-get-amount"
												v-model="swapAmountValue"
												:useAdditionalAppend="true"
												:amountTitle="amountTitle"
												:amountLabel="$t('balance.uRGiving')"
												:currencyTitle="computedEquivalentCurrency.title"
												:errorMessages="errorsExchange"
												:availableFunds="availableFundsCryptoSecondCurrency"
												:maxLimitText="'Max'"
												:minLimitText="'Min'"
												:maxLimit="swapMaxLimitInEquivalentCurrency"
												:minLimit="swapMinLimitInEquivalentCurrency"
												@handleCheckBlur="handleCheckDepositBalanceGet"
												@amountChange="depositAmountHandlerGet"
											>
												<template #additional-append>
													<div v-bind="attrs" @click="menuBuyGiveStatusComputed = true">
														<Widget name="balance-actions-amount-append-menu-activator">
															<WidgetItem v-slot="{ computedAttrs }" name="icon">
																<KIcon v-bind="computedAttrs" :name="getIconName(computedEquivalentCurrency)" />
															</WidgetItem>

															<WidgetItem v-slot="{ computedAttrs }" name="title">
																<KText v-bind="computedAttrs">
																	{{ activeWallet ? computedEquivalentCurrency.title : '' }}
																</KText>
															</WidgetItem>

															<WidgetItem v-slot="{ computedAttrs }" name="expand-icon">
																<KIcon
																	v-bind="computedAttrs"
																	:style="
																		menuBuyGiveStatus
																			? (style = 'transform: rotate(180deg); color: var(--primary-lighten)')
																			: ''
																	"
																/>
															</WidgetItem>
														</Widget>
													</div>
												</template>
											</FormAmount>
										</template>

										<Widget name="balance-actions-amount-append-menu-list">
											<WidgetItem name="previously-used">
												// previously used widget
											</WidgetItem>

											<WidgetItem v-slot="{ computedAttrs }" name="search">
												<KTextField
													v-model="menuBuyGiveSearch"
													v-bind="computedAttrs"
													autofocus
												/>
											</WidgetItem>

											<WidgetItem v-slot="{ computedAttrs }" name="title">
												<KText v-bind="computedAttrs" />
											</WidgetItem>

											<WidgetItem
												v-if="filterTags.length > 1"
												key="amount-append-menu-chip-group"
												v-slot="{ computedAttrs, chipClass, chipActiveClass }"
												name="chip-group"
												:contentVariables="equivalentMenuVariables"
											>
												<KChipGroup
													v-model="filterCurrencies"
													:showArrows="false"
													:mandatory="false"
													v-bind="computedAttrs"
												>
													<KChip
														v-for="tab in filterTags"
														:key="tab.value + '-chip-tag'"
														outlined
														:value="tab.value"
														:class="{
															[chipClass]: filterCurrencies != tab.value,
															[chipActiveClass]: filterCurrencies == tab.value
														}"
													>
														{{ tab.title }}
													</KChip>
												</KChipGroup>
											</WidgetItem>

											<WidgetItem
												v-if="menuBuyGiveCurrencies.length"
												v-slot="{ computedAttrs }"
												name="list"
											>
												<KList v-bind="computedAttrs" style="--list-background-color: transparent">
													<KListItemGroup>
														<KListItem
															v-for="item in menuBuyGiveCurrencies"
															:key="item.id + 'append-menu-list-item'"
															dense
															@click="
																computedEquivalentCurrency = item;
																walletsStore.validateSwapAmount();
															"
														>
															<KListItemContent>
																<Widget name="balance-actions-amount-append-menu-list-item">
																	<WidgetItem v-slot="{ computedAttrs }" name="icon">
																		<KIcon v-bind="computedAttrs" :name="getIconName(item)" />
																	</WidgetItem>

																	<WidgetItem v-slot="{ computedAttrs }" name="title">
																		<KText v-bind="computedAttrs">
																			{{ item.title || item.currencyTitle }}
																		</KText>
																	</WidgetItem>

																	<WidgetItem v-slot="{ computedAttrs }" name="name">
																		<KText v-bind="computedAttrs">
																			{{ item.name || item.currencyName }}
																		</KText>
																	</WidgetItem>

																	<WidgetItem
																		v-if="equivalentCurrenciesRatesRecord[item.currencyId || item.id]"
																		v-slot="{ computedAttrs }"
																		name="equivalent-rate"
																	>
																		<KText v-bind="computedAttrs">
																			1 {{ item.title || item.currencyTitle }}
																			{{ (item.title || item.currencyTitle) !== firstCurrencyTitleByForm ? '~' : '=' }}
																			{{
																				toFixedDecimals(
																					1 / equivalentCurrenciesRatesRecord[item.currencyId || item.id],
																					firstCurrencyDecimalsByForm
																				)
																			}}
																			{{ firstCurrencyTitleByForm }}
																		</KText>
																	</WidgetItem>
																</Widget>
															</KListItemContent>
														</KListItem>
													</KListItemGroup>
												</KList>
											</WidgetItem>

											<WidgetItem v-else name="no-data">
												<Widget name="balance-wallets-card-list-empty" :style="{ margin: 'var(--spacing-10) 0' }">
													<WidgetItem v-slot="{ computedAttrs, name }" name="icon">
														<KIcon
															v-bind="computedAttrs"
															:name="name"
															size="64"
														/>
													</WidgetItem>

													<WidgetItem v-slot="{ computedAttrs, title }" name="title">
														<KText v-bind="computedAttrs">
															{{ title }}
														</KText>
													</WidgetItem>
												</Widget>
											</WidgetItem>
										</Widget>
									</KMenu>
								</WidgetItem>

								<WidgetItem
									v-slot="{ computedAttrs, iconSize, iconName, iconStyle }"
									name="swap-direction"
									:contentVariables="swapDirectionVariables"
								>
									<KBtn
										v-bind="computedAttrs"
										icon
										exact
										@click.native="swapExchangeDirection"
									>
										<KIcon
											:name="iconName"
											:size="iconSize"
											:style="iconStyle"
										/>
									</KBtn>
								</WidgetItem>

								<WidgetItem
									v-slot="{ computedAttrs }"
									name="swap-get-amount"
									style="position: relative"
								>
									<KMenu
										v-if="!seamlessStepsEnabled || isCryptoWithdrawal"
										key="seamless-swap-get-amount-menu"
										v-model="menuBuyGiveStatusComputed"
										v-bind="computedAttrs"
										offsetY
										:closeOnContentClick="false"
										attach=""
										nudgeBottom="1"
										rounded="lg"
										minWidth="100%"
										maxHeight="352px"
									>
										<template #activator="{ attrs }">
											<FormAmount
												key="balance-actions-seamless-swap-get-amount"
												v-model="swapAmountValueToSend"
												:useAdditionalAppend="true"
												:amountLabel="$t('balance.uGetText')"
												:currencyTitle="computedEquivalentCurrency ? computedEquivalentCurrency.currencyTitle : ''"
												:errorMessages="errorsBalance"
												@handleCheckBlur="handleCheckDepositBalanceGive"
												@amountChange="depositAmountHandlerGive"
											>
												<template #additional-append>
													<div v-bind="attrs" @click="menuBuyGiveStatusComputed = true">
														<Widget name="balance-actions-amount-append-menu-activator">
															<WidgetItem v-slot="{ computedAttrs }" name="icon">
																<KIcon v-bind="computedAttrs" :name="getIconName(computedEquivalentCurrency)" />
															</WidgetItem>

															<WidgetItem v-slot="{ computedAttrs }" name="title">
																<KText v-bind="computedAttrs">
																	{{ activeWallet ? computedEquivalentCurrency.title : '' }}
																</KText>
															</WidgetItem>

															<WidgetItem v-slot="{ computedAttrs }" name="expand-icon">
																<KIcon
																	v-bind="computedAttrs"
																	:style="
																		menuBuyGiveStatus
																			? (style = 'transform: rotate(180deg); color: var(--primary-lighten)')
																			: ''
																	"
																/>
															</WidgetItem>
														</Widget>
													</div>
												</template>
											</FormAmount>
										</template>

										<Widget name="balance-actions-amount-append-menu-list">
											<WidgetItem name="previously-used">
												// previously used widget
											</WidgetItem>

											<WidgetItem v-slot="{ computedAttrs }" name="search">
												<KTextField
													v-model="menuBuyGiveSearch"
													v-bind="computedAttrs"
													autofocus
												/>
											</WidgetItem>

											<WidgetItem v-slot="{ computedAttrs }" name="title">
												<KText v-bind="computedAttrs" />
											</WidgetItem>

											<WidgetItem
												v-if="filterTags.length > 1"
												key="amount-append-menu-chip-group"
												v-slot="{ computedAttrs, chipClass, chipActiveClass }"
												name="chip-group"
												:contentVariables="equivalentMenuVariables"
											>
												<KChipGroup
													v-model="filterCurrencies"
													:showArrows="false"
													:mandatory="false"
													v-bind="computedAttrs"
												>
													<KChip
														v-for="tab in filterTags"
														:key="tab.value + '-chip-tag'"
														outlined
														:value="tab.value"
														:class="{
															[chipClass]: filterCurrencies != tab.value,
															[chipActiveClass]: filterCurrencies == tab.value
														}"
													>
														{{ tab.title }}
													</KChip>
												</KChipGroup>
											</WidgetItem>

											<WidgetItem
												v-if="menuBuyGiveCurrencies.length"
												v-slot="{ computedAttrs }"
												name="list"
											>
												<KList v-bind="computedAttrs" style="--list-background-color: transparent">
													<KListItemGroup>
														<KListItem
															v-for="item in menuBuyGiveCurrencies"
															:key="item.id + 'append-menu-list-item'"
															dense
															@click="
																computedEquivalentCurrency = item;
																walletsStore.validateSwapAmount();
															"
														>
															<KListItemContent>
																<Widget name="balance-actions-amount-append-menu-list-item">
																	<WidgetItem v-slot="{ computedAttrs }" name="icon">
																		<KIcon v-bind="computedAttrs" :name="getIconName(item)" />
																	</WidgetItem>

																	<WidgetItem v-slot="{ computedAttrs }" name="title">
																		<KText v-bind="computedAttrs">
																			{{ item.title || item.currencyTitle }}
																		</KText>
																	</WidgetItem>

																	<WidgetItem v-slot="{ computedAttrs }" name="name">
																		<KText v-bind="computedAttrs">
																			{{ item.name || item.currencyName }}
																		</KText>
																	</WidgetItem>

																	<WidgetItem
																		v-if="equivalentCurrenciesRatesRecord[item.currencyId || item.id]"
																		v-slot="{ computedAttrs }"
																		name="equivalent-rate"
																	>
																		<KText v-bind="computedAttrs">
																			1 {{ item.title || item.currencyTitle }}
																			{{ (item.title || item.currencyTitle) !== firstCurrencyTitleByForm ? '~' : '=' }}
																			{{
																				toFixedDecimals(
																					1 / equivalentCurrenciesRatesRecord[item.currencyId || item.id],
																					firstCurrencyDecimalsByForm
																				)
																			}}
																			{{ firstCurrencyTitleByForm }}
																		</KText>
																	</WidgetItem>
																</Widget>
															</KListItemContent>
														</KListItem>
													</KListItemGroup>
												</KList>
											</WidgetItem>

											<WidgetItem v-else name="no-data">
												<Widget name="balance-wallets-card-list-empty" :style="{ margin: 'var(--spacing-10) 0' }">
													<WidgetItem v-slot="{ computedAttrs, name }" name="icon">
														<KIcon
															v-bind="computedAttrs"
															:name="name"
															size="64"
														/>
													</WidgetItem>

													<WidgetItem v-slot="{ computedAttrs, title }" name="title">
														<KText v-bind="computedAttrs">
															{{ title }}
														</KText>
													</WidgetItem>
												</Widget>
											</WidgetItem>
										</Widget>
									</KMenu>

									<FormAmount
										v-else
										key="seamless-swap-get-amount-textfield"
										v-model="swapAmountValueToSend"
										:amountLabel="$t('balance.uGetText')"
										:currencyTitle="activeWallet.currencyTitle"
										:errorMessages="errorsBalance"
										@handleCheckBlur="handleCheckDepositBalanceGive"
										@amountChange="depositAmountHandlerGive"
									/>
								</WidgetItem>

								<WidgetItem name="swap-rate">
									<Widget name="balance-form-seamless-swap-rate">
										<WidgetItem v-slot="{ computedAttrs }" name="rate">
											<KText v-bind="computedAttrs" />
										</WidgetItem>

										<WidgetItem
											v-if="walletsStore.fiatSentConfirmationInProcess"
											v-slot="{ computedAttrs }"
											key="balance-form-seamless-swap-rate-loader"
											name="loader"
										>
											<KSkeletonLoader v-bind="computedAttrs" type="text" />
										</WidgetItem>

										<WidgetItem
											v-else
											v-slot="{ computedAttrs }"
											key="balance-form-seamless-swap-rate-text"
											name="text"
										>
											<KText v-bind="computedAttrs">
												{{ swapRateString }}
											</KText>
										</WidgetItem>
									</Widget>
								</WidgetItem>

								<WidgetItem name="tip-of-p2p">
									<Widget name="balance-form-seamless-p2p-promt">
										<WidgetItem v-slot="{ computedAttrs }" name="text">
											<KText v-bind="computedAttrs">
												{{
													$t('balance.seamlessP2pPrompt', {
														time: predictMinutes
															? `${predictMinutes} ${$t('system.minute', {
																time: predictMinutes,
																$plural: 'time'
															}).toLowerCase()}`
															: $t('balance.instantTime')
													})
												}}
											</KText>
										</WidgetItem>
										<WidgetItem v-slot="{ computedAttrs }" name="link">
											<KText
												v-bind="computedAttrs"
												:to="getP2pLink"
												target="_blank"
											/>
										</WidgetItem>
									</Widget>
								</WidgetItem>

								<WidgetItem v-slot="{ computedAttrs }" name="exchange-button">
									<KBtn
										v-bind="computedAttrs"
										:disabled="isSwapMainBtnDisabled"
										@click="swapStartTrade"
									>
										<Widget
											v-if="depositBuyActionInProcess"
											:key="`balance-crypto-button-circular${blockchainInProcess}`"
											name="balance-crypto-button-circular"
										>
											<WidgetItem v-slot="{ computedAttrs }" name="circular">
												<KProgressCircular
													v-bind="computedAttrs"
													indeterminate
													style="color: inherit"
												/>
											</WidgetItem>
										</Widget>

										<template v-else>
											<span>{{ swapPrimaryButton }} {{ activeWallet.currencyTitle }}</span>
										</template>
									</KBtn>
								</WidgetItem>

								<WidgetItem v-slot="{ computedAttrs }" name="cancel-button">
									<KBtn
										v-bind="computedAttrs"
										exact
										:to="{ name: 'balance-activeForm', params: { activeForm: activeForm } }"
										@click="seamlessDepositCancelHandler"
									>
										<Widget name="balance-seamless-cancel-button">
											<WidgetItem v-slot="{ computedAttrs }" name="text">
												<KText v-bind="computedAttrs">
													{{ $t('balance.back') }}
												</KText>
											</WidgetItem>
										</Widget>
									</KBtn>
								</WidgetItem>
							</Widget>
						</WidgetItem>
					</template>
				</Widget>
			</KCard>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import { Component, Watch } from 'vue-property-decorator';
	import { mixins } from 'vue-class-component';
	import {
		BALANCE_TEXT,
		CurrencyTypeIota,
		FormType,
		FlowType,
		STAKING_SHOW_BALANCE_VARIABLES,
		CurrencyTypeIconNamespace,
		CurrencyType,
		WalletCurrencyType,
		RouteName
	} from '@/const';
	import TranslateMixin from '@/mixins/translate';

	import FormSelect from '@/components/FormComponents/FormSelect.vue';
	import FormFlowSelect from '@/components/FormComponents/FormFlowSelect.vue';
	import FormTransportSelect from '@/components/FormComponents/FormTransportSelect.vue';
	import FormPaymentMethodSelect from '@/components/FormComponents/FormPaymentMethodSelect.vue';
	import FormFirstStepSelect from '@/components/FormComponents/FormFirstStepSelect.vue';
	import FormDepositInfo from '@/components/FormComponents/FormDepositInfo.vue';
	import FormAmount from '@/components/FormComponents/FormAmount.vue';
	import QrCodeModal from '@/components/QrCodeModal.vue';
	import FeeBlock from '@/components/FeeBlock.vue';
	import InfoTooltip from '@/components/InfoTooltip.vue';
	import MemoWarningModal from '@/components/ModalComponents/MemoWarningModal.vue';
	import InputWithCurrencyMenu from '@/components/BaseComponents/InputComponents/InputWithCurrencyMenu.vue';
	import {
		convertExponentialToDecimal,
		formatNumberAndFixedDecimals,
		toFixedDecimals,
		inputMask,
		inputDecimalsMask,
		getDepositFeeValue
	} from '@/utils/utils';

	import MyRootStore from '@/store/store';
	import { WalletsFields } from '@/const';
	import { SIMPLE_CRYPTO_REGEX_STRING, SIMPLE_MEMO_REGEX_STRING } from '@/validations';
	import { Location } from 'vue-router';
	import getRouter from '@/router/router';

	@Component({
		components: {
			FormSelect,
			FormFlowSelect,
			FormTransportSelect,
			FormPaymentMethodSelect,
			FormDepositInfo,
			FormAmount,
			QrCodeModal,
			FeeBlock,
			InfoTooltip,
			FormFirstStepSelect,
			MemoWarningModal,
			InputWithCurrencyMenu
		}
	})
	export default class FormView extends mixins(TranslateMixin) {
		protected appRootStore = MyRootStore.getInstance();
		protected walletsStore = this.appRootStore.wallets;
		protected withdrawalButtonFixed = true;
		protected readonly COMMENT_LENGTH_LIMIT = 250;
		protected currencySelectMenuValue = false;

		protected balanceText = BALANCE_TEXT;
		protected stakingShowBalanceVariables = STAKING_SHOW_BALANCE_VARIABLES;

		protected menuBuyGiveStatus = false;
		protected get menuBuyGiveStatusComputed(): boolean {
			return this.menuBuyGiveStatus;
		}
		protected set menuBuyGiveStatusComputed(newValue: boolean) {
			this.menuBuyGiveStatus = newValue;

			if (!newValue) {
				setTimeout(() => {
					this.menuBuyGiveSearch = '';
					this.filterCurrencies = '';
				}, 400);

				// This is triggered before the menu closes
				// this.$nextTick(() => (this.menuBuyGiveSearch = ''));
			}
		}
		protected menuBuyGiveSearch = '';
		protected get computedCryptoSecondCurrency(): Partial<HISTORY.Currencies> & { currencyType?: WalletCurrencyType } {
			return this.walletsStore.computedCryptoSecondCurrency;
		}
		protected set computedCryptoSecondCurrency(
			newValue: Partial<HISTORY.Currencies> & { currencyType?: WalletCurrencyType }
		) {
			this.menuBuyGiveStatusComputed = false;

			if (
				newValue.type &&
				(newValue.type === CurrencyType.Fiat ||
					(newValue.type as unknown as WalletCurrencyType) === WalletCurrencyType.Fiat)
			) {
				this.walletsStore.computedFiatSecondCurrency = newValue;
				this.setActiveForm(FormType.DEPOSIT);
				this.setActiveFlow(FlowType.BUY);

				this.$router.push({
					name: 'balance-buy-form',
					params: {
						currency: this.activeWallet?.currencyTitle as string,
						activeForm: FormType.DEPOSIT,
						giveCurrency: newValue.title as string
					}
				});
			} else {
				this.walletsStore.computedCryptoSecondCurrency = newValue;

				this.$router.push({
					name: 'balance-exchange-form',
					params: {
						currency: this.activeWallet?.currencyTitle as string,
						activeForm: FormType.EXCHANGE,
						secondCurrency: newValue.title as string
					}
				});
			}
		}

		public isCheckBoxActive = false;

		public setCheckBox(): void {
			this.isCheckBoxActive = !this.isCheckBoxActive;
		}

		public checkBoxIconVariables = [
			{
				name: 'activeCheckBox',
				type: 'icon',
				defaultValue: '$checkboxOn'
			},
			{
				name: 'inactiveCheckBox',
				type: 'icon',
				defaultValue: '$checkboxOff'
			}
		];

		protected get computedFiatSecondCurrency(): Partial<HISTORY.Currencies> & { currencyType?: WalletCurrencyType } {
			return this.walletsStore.computedFiatSecondCurrency;
		}
		protected set computedFiatSecondCurrency(
			newValue: Partial<HISTORY.Currencies> & { currencyType?: WalletCurrencyType }
		) {
			this.menuBuyGiveStatusComputed = false;

			if (
				newValue.type &&
				(newValue.type === CurrencyType.Cryptocurrency ||
					(newValue.type as unknown as WalletCurrencyType) === WalletCurrencyType.Cryptocurrency)
			) {
				this.walletsStore.computedCryptoSecondCurrency = newValue;
				this.setActiveForm(FormType.EXCHANGE);
				this.setActiveFlow(FlowType.SWAP);

				this.$router.push({
					name: 'balance-exchange-form',
					params: {
						currency: this.activeWallet?.currencyTitle as string,
						activeForm: FormType.EXCHANGE,
						secondCurrency: newValue.title as string
					}
				});
			} else {
				this.walletsStore.computedFiatSecondCurrency = newValue;

				if (this.activeForm === FormType.WITHDRAWAL) {
					this.$router.push({
						name: 'balance-sell-form',
						params: {
							currency: this.activeWallet?.currencyTitle as string,
							activeForm: FormType.WITHDRAWAL,
							getCurrency: newValue.title as string
						}
					});
				} else {
					this.$router.push({
						name: 'balance-buy-form',
						params: {
							currency: this.activeWallet?.currencyTitle as string,
							activeForm: FormType.DEPOSIT,
							giveCurrency: newValue.title as string
						}
					});
				}
			}
		}

		protected get menuBuyGiveCurrencies(): HISTORY.Currencies[] {
			return this.menuBuyGiveSearch || this.filterCurrencies
				? this.walletsStore.sharedDataCurrencies.filter(
						(item) =>
							item.title !== this.activeWallet?.currencyTitle &&
							(!this.filterCurrencies || item.type === this.filterCurrencies) &&
							(item.title?.toLowerCase().includes(this.menuBuyGiveSearch?.toLowerCase()) ||
								this.menuBuyGiveSearch?.toLowerCase().includes(item.title?.toLowerCase()) ||
								item.name?.toLowerCase().includes(this.menuBuyGiveSearch?.toLowerCase()) ||
								this.menuBuyGiveSearch?.toLowerCase().includes(item.name?.toLowerCase()) ||
								(item.aliases.length &&
									item.aliases.some(
										(alias: string) =>
											alias?.toLowerCase().includes(this.menuBuyGiveSearch?.toLowerCase()) ||
											this.menuBuyGiveSearch?.toLowerCase().includes(alias?.toLowerCase())
									)))
				  )
				: this.walletsStore.sharedDataCurrencies.filter((item) => item.title !== this.activeWallet?.currencyTitle);
		}

		protected get sharedDataPaymentMethods(): any[] {
			return this.walletsStore.sharedDataPaymentMethods;
		}

		protected get currentPaymentMethod(): any {
			return this.walletsStore.activePaymentMethod;
		}

		protected get predictMinutes(): number {
			if (this.isExchangeForm) return 0;
			const minutes = this.currentPaymentMethod?.predictTime?.split?.(':')[1] || 0;
			return Number(minutes);
		}

		protected setActiveDepositPaymentMethod(paymentMethod: any): void {
			this.walletsStore.setDepositBuyPaymentMethod(paymentMethod);
		}

		protected setActiveWithdrawalPaymentMethod(paymentMethod: any): void {
			this.walletsStore.setWithdrawalBuyPaymentMethod(paymentMethod);
		}

		protected depositBuyAction(): void {
			this.walletsStore.depositBuyCryptoAction();
		}

		protected get depositBuyActionInProcess(): boolean {
			return this.walletsStore.depositBuyActionInProcess;
		}

		protected withdrawalBuyAction(): void {
			this.walletsStore.withdrawalBuyCryptoAction();
		}

		protected get withdrawalBuyActionInProcess(): boolean {
			return this.walletsStore.withdrawalBuyActionInProcess;
		}

		protected get toDepositGetObject(): Location {
			return {
				name: 'balance-get-form',
				params: { currency: this.activeWallet?.currencyTitle || '', activeForm: 'deposit' }
			};
		}

		protected get toWithdrawalTransferObject(): Location {
			return {
				name: 'balance-transfer-form',
				params: { currency: this.activeWallet?.currencyTitle || '', activeForm: 'withdrawal' }
			};
		}

		public seamlessDepositCancelHandler(): void {
			this.setActiveFlow(this.activeForm === FormType.DEPOSIT ? FlowType.GET : FlowType.SELL);
			this.setActiveDepositPaymentMethod(null);
			this.walletsStore.computedFiatSecondCurrency = {
				type: CurrencyType.Fiat,
				currencyType: WalletCurrencyType.Fiat,
				title: ''
			};
		}

		protected withdrawalRequisites: string = '';
		@Watch('withdrawalRequisites')
		protected requisitesWithdrawalHandler(value: string): void {
			this.walletsStore.setWithdrawalRequisites(value);
		}

		public seamlessWithdrawalCancelHandler(): void {
			this.setActiveFlow(FlowType.TRANSFER);
			this.setActiveWithdrawalPaymentMethod(null);
			this.walletsStore.computedFiatSecondCurrency = {
				type: CurrencyType.Fiat,
				currencyType: WalletCurrencyType.Fiat,
				title: ''
			};
		}

		protected handleCheckRequisites(): void {
			// this.walletsStore.appendErrors(this.walletsStore.requisitesValidation(this.withdrawalRequisites));
		}

		public getIconName(item: HISTORY.Currencies): string {
			return `${
				CurrencyTypeIconNamespace[
					item.type ||
						WalletCurrencyType[(item as HISTORY.Currencies & { currencyType: WalletCurrencyType }).currencyType]
				]
			}.${item.title}`;
		}

		protected async swapExchangeDirection(): Promise<void> {
			const newSecondCurrency = this.walletsStore.sharedDataCurrencies.find(
				(currency) => currency.title === this.activeWallet?.currencyTitle
			);
			const newWallet = this.wallets.find((wallet) => wallet.currencyTitle === this.computedCryptoSecondCurrency.title);

			// swap amounts
			const routeParamForm = !this.seamlessStepsEnabled ? FormType.EXCHANGE : this.activeForm;
			this.$router.push({
				name: 'balance-exchange-form',
				params: {
					currency: this.computedCryptoSecondCurrency.title as string,
					activeForm: routeParamForm,
					secondCurrency: this.activeWallet?.currencyTitle as string
				}
			});

			if (newWallet) {
				this.walletsStore.setActiveWallet(newWallet);
			}
			if (newSecondCurrency) {
				this.walletsStore.computedCryptoSecondCurrency = newSecondCurrency;
				this.walletsStore.secondCurrencyStepFlow = newSecondCurrency;
			}

			await this.walletsStore.seamlessP2PExchangeSwapPreliminary();
		}

		protected isDepositBuyDisabled: boolean = false;
		protected isWithdrawalSellDisabled: boolean = false;

		protected get seamlessIntegrationEnabled(): boolean {
			return this.walletsStore.seamlessIntegrationEnabled;
		}

		protected get seamlessStepsEnabled(): boolean {
			return this.walletsStore.seamlessStepsEnabled;
		}

		protected get actionForms(): undefined | WALLETS.FormTypeList {
			return this.walletsStore.actionForms;
		}

		protected get isAutoViewAvailable(): boolean {
			return this.walletsStore.isAutoViewAvailable;
		}

		protected get activeWalletAmount(): string {
			return this.showBalance ? this.formatNumberAndFixedDecimals(Number(this.availableFunds || 0), 16) : '*****';
		}

		public get getMaxLimitWithFee(): number | string {
			const maxAmount =
				this.activeTransport?.maxAmount && this.activeTransport?.maxAmount > this.availableFunds
					? this.availableFunds
					: this.activeTransport?.maxAmount;
			if (maxAmount) {
				const maxFee = this.walletsStore.getFee(
					maxAmount,
					this.activeTransport,
					this.activeWallet?.currencyDecimals ?? 8
				);
				const maxLimitWithFee = maxAmount - Number(maxFee);
				return maxLimitWithFee > 0 ? maxLimitWithFee : 0;
			}
			return '';
		}

		protected get activeWalletFrozenAmount(): string {
			return this.showBalance ? this.formatNumberAndFixedDecimals(Number(this.frozenFunds || 0), 16) : '*****';
		}

		protected get showBalance(): boolean {
			return this.$store.state.sharedData.showBalance;
		}

		protected get stakingPercValue(): string {
			return this.staking?.perc + '%';
		}

		protected get qrCodeURI(): string {
			if (!this.activeTransport) return '';

			return (this.walletsStore.getActiveWalletData as any)?.uri;
		}

		protected get withdrawalAmountLabel(): string {
			return this.$t('balance.recieptAmount');
		}

		protected get staking(): any {
			return this.walletsStore.getStaking.find((entry: any) => entry.currencyId === this.activeWallet?.currencyId);
		}

		protected convertExponentialToDecimal(val: number): number | string {
			return convertExponentialToDecimal(val);
		}

		protected get isScreenSizeLessMD(): boolean {
			return this.appRootStore.isScreenSizeLessMD;
		}

		protected get stakingLabel(): string {
			return this.$t('balance.stakingInText') + ' ' + this.$t('balance.timeInHours', { time: 24 });
		}

		protected get cryptoWithdrawalButtonStyle(): COMMON.IMap<string | number> {
			if (this.isScreenSizeLessMD) {
				return this.isTransportActive && !this.withdrawalButtonFixed ? {} : { height: 0, visibility: 'hidden' };
			}
			return this.isTransportActive ? {} : { display: 'none' };
		}

		protected get cryptoWithdrawalFixedButtonStyle(): COMMON.IMap<string | number> {
			if (this.isScreenSizeLessMD) {
				return this.isTransportActive && this.withdrawalButtonFixed
					? {}
					: { height: 0, visibility: 'hidden', margin: 0 };
			}
			return {};
		}

		protected get tooltipCommentText(): string {
			return this.$t('balance.commentInfoTooltip');
		}

		protected scrollListener(): void {
			const shadowRoot = document?.querySelector('.remoteComponent')?.shadowRoot;
			const baseButtonPosition: number =
				shadowRoot?.querySelector('.withdrawal-button button')?.getBoundingClientRect().y || 0;
			const fixedButtonPosition: number =
				shadowRoot?.querySelector('.withdrawal-button-fixed button')?.getBoundingClientRect().y || 0;

			this.withdrawalButtonFixed = baseButtonPosition > fixedButtonPosition;
		}

		protected get isTransportActive(): boolean {
			return !!(this.activeWallet && this.activeTransport);
		}

		protected get stakingAmount(): string {
			return (
				String(
					this.formatNumberAndFixedDecimals(
						Number(Number(this.convertExponentialToDecimal(this.staking?.pBalance)).toFixed(9)),
						16
					)
				) +
				' ' +
				this.activeWallet?.currencyTitle
			);
		}

		protected get stakingTooltipText(): string {
			return this.$t('balance.tooltipStakingTextInForm', { currencyName: this.activeWallet?.currencyName });
		}

		protected namespaceByCurrencyTypeId: COMMON.IMap<string> = {
			[CurrencyTypeIota.Fiat]: 'fiat',
			[CurrencyTypeIota.Cryptocurrency]: 'currency'
		};

		protected get isCryptoCurrency(): boolean {
			return (this.activeWallet?.currencyType as number) === CurrencyTypeIota.Cryptocurrency;
		}

		public created(): void {
			window.addEventListener('scroll', this.scrollListener);
			window.addEventListener('wheel', this.scrollListener);
		}

		public mounted(): void {
			if (getRouter().currentRoute.name === RouteName.BalanceWallet) {
				this.walletsStore.initWallets();
			}

			this.$nextTick(() => {
				this.scrollListener();
			});
		}

		public beforeDestroy(): void {
			window.removeEventListener('scroll', this.scrollListener);
			window.removeEventListener('wheel', this.scrollListener);
		}

		protected get activeForm(): WALLETS.FormTypeValues {
			return this.walletsStore.getActiveForm;
		}

		public changeHandle(wallet: WALLETS.Wallet): void {
			this.walletsStore.setActiveWallet(wallet);
		}

		protected get iconName(): string {
			if (!this.activeWallet) return '';
			return this.getWalletIconName(this.activeWallet);
		}

		protected getWalletIconName(wallet: WALLETS.Wallet): string {
			return `${Boolean(wallet.currencyType) ? 'currency' : 'fiat'}.${wallet.currencyTitle}`;
		}

		protected get mobileHeaderText(): string {
			if (!this.activeWallet || this.availableFunds === null) return '';

			return `${this.showBalance ? this.formatNumberAndFixedDecimals(this.availableFunds, 16) : '*****'} ${
				this.activeWallet.currencyTitle
			}`;
		}

		protected get selectedCurrency(): number {
			if (!this.activeWallet) return 0;
			return this.wallets.findIndex(
				(wallet: WALLETS.Wallet) => wallet.currencyTitle === this.activeWallet?.currencyTitle
			);
		}

		protected get wallets(): WALLETS.WalletList {
			return this.walletsStore.wallets;
		}

		protected get activeWallet(): WALLETS.Wallet | undefined {
			return this.walletsStore.getActiveWallet;
		}

		protected get availableFunds(): number {
			return this.walletsStore.getCurrentCyrrencyAvailableFunds;
		}

		protected get frozenFunds(): number {
			return this.walletsStore.getCurrentCyrrencyFrozenFunds;
		}

		protected get currentLocale(): string {
			return this.$store.state.translator.currentLocale;
		}

		protected get favoriteCurrencySymbol(): string {
			return this.walletsStore.favoriteCurrency?.title || 'USD';
		}

		protected get currentRate(): number | undefined {
			return this.walletsStore.getActiveWallet?.rate;
		}

		protected get amountEquivalent(): number | string {
			if (this.currentRate && this.activeWalletData.amountValue) {
				return Math.round(this.currentRate * this.activeWalletData.amountValue * 10) / 10;
			}
			return 0;
		}

		protected get actualDepositTransports(): WALLETS.DepositTransactionMethodList {
			return this.activeWallet?.depositTransactionMethods
				? this.activeWallet.depositTransactionMethods
						.filter((transport) => {
							return transport.transactionMethodType == 24;
						})
						.map((item: any) => {
							item.currencyTitle = this.walletsStore.currencyTitleById(item.cryptoCurrencyId);
							item.iconName = `currency.${this.walletsStore.getCryptoCurrencyById(item.cryptoCurrencyId).title}`;
							return item;
						})
				: [];
		}

		protected get actualWithdrawalTransports(): WALLETS.WithdrawalTransactionMethodList {
			return this.activeWallet?.withdrawalTransactionMethods
				? this.activeWallet.withdrawalTransactionMethods
						.filter((transport) => {
							return transport.transactionMethodType == 24;
						})
						.map((item: any) => {
							item.currencyTitle = this.walletsStore.currencyTitleById(item.cryptoCurrencyId);
							item.iconName = `currency.${this.walletsStore.getCryptoCurrencyById(item.cryptoCurrencyId).title}`;
							return item;
						})
				: [];
		}

		protected get firstStepTransports(): COMMON.IMap<Array<any>> {
			const blockchainTransportList =
				this.isCryptoDeposit && !this.isCryptoWithdrawal
					? this.actualDepositTransports
					: this.actualWithdrawalTransports;

			const filtredFiatP2PCurrencies = this.walletsStore.fiatP2PCurrencies
				.filter((currency) => {
					const paymentMethod = this.walletsStore.paymentMethodInfo.find((paymentMethod: any) => {
						if (this.activeForm === FormType.DEPOSIT) {
							return (
								paymentMethod.giveCurrencyId === this.activeWallet?.currencyId &&
								paymentMethod.getCurrencyId === currency.id &&
								paymentMethod.sellOffers.length
							);
						}

						return (
							paymentMethod.getCurrencyId === this.activeWallet?.currencyId &&
							paymentMethod.giveCurrencyId === currency.id &&
							paymentMethod.buyOffers.length
						);
					});

					return Boolean(paymentMethod);
				})
				.sort(this.sortCurrenciesByAmountWeight);

			const filtredCryptoP2PCurrencies = this.walletsStore.cryptoP2PCurrencies
				.filter((currency) => {
					const offer = this.walletsStore.p2pExchangeOffers.find((offer: any) => {
						if (this.activeForm === FormType.DEPOSIT) {
							return offer.giveCurrency.id === this.activeWallet?.currencyId && offer.getCurrency.id === currency.id;
						}

						return offer.getCurrency.id === this.activeWallet?.currencyId && offer.giveCurrency.id === currency.id;
					});

					return Boolean(offer);
				})
				.sort(this.sortCurrenciesByAmountWeight);

			const resultObj: any = {};

			if (blockchainTransportList.length) resultObj.blockchain = blockchainTransportList;
			if (filtredFiatP2PCurrencies.length) resultObj.fiatCurrency = filtredFiatP2PCurrencies;
			if (filtredCryptoP2PCurrencies.length) resultObj.cryptoCurrency = filtredCryptoP2PCurrencies;

			return resultObj;
		}

		protected sortCurrenciesByAmountWeight(
			firstCurrency: HISTORY.Currencies,
			secondCurrency: HISTORY.Currencies
		): number {
			const currencyListEquivalentByRate = new Map();

			const getWeight = (currencyId: number): number => {
				if (currencyListEquivalentByRate.has(currencyId)) {
					return currencyListEquivalentByRate.get(currencyId);
				}

				const wallet = this.walletsStore.getCurrencyById(currencyId);
				const walletWeight = (wallet?.availableFunds || 0) * (wallet?.rate || 1);
				currencyListEquivalentByRate.set(currencyId, walletWeight);

				return walletWeight;
			};

			// Descending sort
			return getWeight(secondCurrency.id) - getWeight(firstCurrency.id);
		}

		protected get activeTransport():
			| WALLETS.DepositTransactionMethod
			| WALLETS.WithdrawalTransactionMethod
			| undefined {
			return this.walletsStore.getActiveTransport;
		}

		protected get lastActiveTransportId(): number | null | undefined {
			return this.walletsStore.lastActiveTransportId;
		}

		protected get activeWalletData(): any | undefined {
			return this.walletsStore.getActiveWalletData;
		}

		protected get isWithdrawalDisabled(): boolean {
			return this.walletsStore.isWithdrawalDisabled || this.blockchainInProcess;
		}

		protected get cryptoCurrency(): WALLETS.CryptoCurrency | undefined {
			return this.walletsStore.getCryptoCurrency;
		}

		protected get cryptoCurrencyUriAmount(): boolean | undefined {
			return this.cryptoCurrency?.uriAmount;
		}

		protected get CryptoToken(): WALLETS.CryptoToken | undefined {
			return this.walletsStore.getCryptoToken;
		}

		protected get cryptoTagName(): string {
			return this.cryptoCurrency && this.cryptoCurrency.tagName
				? this.$t(`balance.${this.cryptoCurrency.tagName}`)
				: '';
		}

		protected get isExchangeForm(): boolean {
			return this.walletsStore.getActiveFlow === FlowType.SWAP;
		}

		protected get isCryptoDeposit(): boolean {
			return this.walletsStore.getActiveForm === FormType.DEPOSIT && Number(this.activeWallet?.currencyType) === 1;
		}

		protected get depositFlowIsBuy(): boolean {
			return this.walletsStore.getActiveFlow === FlowType.BUY;
		}

		protected get withdrawalFlowIsSell(): boolean {
			return this.walletsStore.getActiveFlow === FlowType.SELL;
		}

		protected get isCryptoWithdrawal(): boolean {
			return this.walletsStore.getActiveForm === FormType.WITHDRAWAL && Number(this.activeWallet?.currencyType) === 1;
		}

		protected get isWithdrawalMemoWarningActive(): boolean {
			return Boolean(this.cryptoCurrency && this.cryptoCurrency.tagName) && this.memoWarningIsOpen;
		}

		protected get isMemoWarningActive(): boolean {
			return this.cryptoCurrency && this.cryptoCurrency.tag && this.activeWalletData.tag && this.memoWarningIsOpen;
		}

		protected get isDepositQrActive(): boolean {
			return Boolean(this.activeTransport) && !this.isMemoWarningActive;
		}

		protected memoWarningIsOpen: boolean = false;

		protected formatNumberAndFixedDecimals(value: number, decimals: number): string {
			return formatNumberAndFixedDecimals(value, this.currentLocale, decimals);
		}

		protected toFixedDecimals(price: number, decimals: number): number {
			return toFixedDecimals(price, decimals);
		}

		protected toggleMemoWarning(newVal: boolean, needRecordInLocalStorage = false): void {
			const localWarningMemo =
				JSON.parse(this.walletsStore.getLocalStorageItems(`warningsHidden-${this.walletsStore.userName}`)) || {};
			const currentString = `warningsHidden-${this.cryptoCurrency?.tagName?.toUpperCase().replaceAll(' ', '')}`;

			if (localWarningMemo[currentString]) {
				this.memoWarningIsOpen = false;
				return;
			} else if (needRecordInLocalStorage) {
				localWarningMemo[currentString] = true;
				this.walletsStore.setLocalStorageItem(
					`warningsHidden-${this.walletsStore.userName}`,
					JSON.stringify(localWarningMemo)
				);
			}
			this.memoWarningIsOpen = newVal;
		}

		public get getIsVisibleWithdrawalTag(): boolean {
			return this.walletsStore.getIsVisibleWithdrawalTag;
		}

		public closeWarningTagNote(): void {
			this.walletsStore.closeWarningTagNote();
		}

		protected setActiveFirstStepMethod(): void {
			//
		}

		protected get isFirstStep(): boolean {
			return this.walletsStore.isFirstStep;
		}

		protected setSecondStep(methodKey: string, transport: WALLETS.DepositTransactionMethod | HISTORY.Currencies): void {
			if (methodKey === 'blockchain') {
				if (this.activeForm === FormType.DEPOSIT) {
					this.setActiveFlow(FlowType.GET);
					this.setActiveDepositTransport(transport as WALLETS.DepositTransactionMethod);
					this.$router.push({
						name: RouteName.BalanceGetForm,
						params: {
							currency: this.activeWallet?.currencyTitle as string,
							activeForm: FormType.DEPOSIT
						}
					});
				} else {
					this.setActiveFlow(FlowType.TRANSFER);
					this.setActiveWithdrawalTransport(transport as WALLETS.DepositTransactionMethod);
					this.$router.push({
						name: RouteName.BalanceTransferForm,
						params: {
							currency: this.activeWallet?.currencyTitle as string,
							activeForm: FormType.WITHDRAWAL
						}
					});
				}
			}

			if (methodKey === 'fiatCurrency') {
				this.walletsStore.secondCurrencyStepFlow = transport;

				if (this.activeForm === FormType.DEPOSIT) {
					this.walletsStore.getFromRates(transport.id);
					this.setActiveFlow(FlowType.BUY);
					this.$router.push({
						name: RouteName.BalanceBuyForm,
						params: {
							currency: this.activeWallet?.currencyTitle as string,
							activeForm: FormType.DEPOSIT,
							giveCurrency: (transport as HISTORY.Currencies).title
						}
					});
				} else {
					this.setActiveFlow(FlowType.SELL);
					this.$router.push({
						name: RouteName.BalanceSellForm,
						params: {
							currency: this.activeWallet?.currencyTitle as string,
							activeForm: FormType.WITHDRAWAL,
							getCurrency: (transport as HISTORY.Currencies).title
						}
					});
				}
			}

			if (methodKey === 'cryptoCurrency') {
				this.setActiveFlow(FlowType.SWAP);

				this.walletsStore.computedCryptoSecondCurrency = transport as HISTORY.Currencies;
				this.walletsStore.secondCurrencyStepFlow = transport as HISTORY.Currencies;

				this.walletsStore.seamlessP2PExchangeSwapPreliminary();

				this.$router.push({
					name: RouteName.BalanceExchangeForm,
					params: {
						currency: this.activeWallet?.currencyTitle as string,
						activeForm: this.activeForm,
						secondCurrency: (transport as HISTORY.Currencies).title
					}
				});
			}
		}

		protected filterCurrencies: string = '';

		protected filterCategories: Array<COMMON.IMap<string>> = [
			{ title: 'cryptoCurrencyText', value: CurrencyType.Cryptocurrency, type: CurrencyType.Cryptocurrency },
			{ title: 'fiatCurrencyText', value: CurrencyType.Fiat, type: CurrencyType.Fiat }
		];

		protected get filterTags(): Array<COMMON.IMap<string>> {
			return this.filterCategories
				.map((tag) => ({
					title: this.$t(`balance.${tag.title}`),
					type: tag.type,
					value: tag.value
				}))
				.filter((category) => {
					return this.walletsStore.sharedDataCurrencies.some((currency) => currency.type === category.type);
				});
		}

		protected get isSwapMainBtnDisabled(): any {
			return (
				this.walletsStore.fiatSentConfirmationInProcess ||
				!Boolean(this.swapAmountValue) ||
				!Boolean(this.swapAmountValueToSend) ||
				Boolean(this.errorsExchange.length)
			);
		}

		protected swapStartTrade(): void {
			this.walletsStore.swapStartTrade();
		}

		protected get bestSwapOffer(): any {
			return this.walletsStore.bestSwapOffer;
		}

		protected get swapPrimaryButton(): string {
			return this.activeForm === FormType.DEPOSIT ? this.$t('balance.buyFlow') : this.$t('balance.sellFlow');
		}

		protected get swapRateString(): string {
			if (
				!this.activeWallet?.currencyTitle ||
				!this.walletsStore.secondCurrencyStepFlow?.title ||
				!this.bestSwapOffer.exchangeRate
			)
				return this.$t('balance.nothingFound');

			if (this.activeForm === FormType.DEPOSIT) {
				return `1 ${this.activeWallet.currencyTitle} ~ ${this.bestSwapOffer?.exchangeRate || 1} ${
					this.walletsStore.secondCurrencyStepFlow.title
				}`;
			}

			const revertRateForWithdrawal = this.formatNumberAndFixedDecimals(
				1 / Number(this.bestSwapOffer?.exchangeRate || 1),
				8
			);
			return `1 ${this.activeWallet.currencyTitle} ~ ${revertRateForWithdrawal} ${this.walletsStore.secondCurrencyStepFlow.title}`;
		}

		protected get isDepositForm(): boolean {
			return this.activeForm === FormType.DEPOSIT;
		}

		protected get availableFundsCryptoSecondCurrency(): number {
			if (
				this.computedEquivalentCurrency.title &&
				this.computedEquivalentCurrency.title !== this.computedCryptoSecondCurrency.title
			) {
				return toFixedDecimals(
					(this.walletsStore.getCryptoSecondCurrencyAvailableFunds || 0) * this.equivalentCurrencyRate,
					this.isDepositForm ? this.activeWallet?.currencyDecimals || 8 : this.secondCurrencyStepFlowDecimals
				);
			}

			return this.walletsStore.getCryptoSecondCurrencyAvailableFunds;
		}

		protected get swapMaxLimitInEquivalentCurrency(): number {
			if (
				this.computedEquivalentCurrency.title &&
				this.computedEquivalentCurrency.title !== this.computedCryptoSecondCurrency.title
			) {
				return toFixedDecimals(
					(this.bestSwapOffer?.maximumLimit || 0) * this.equivalentCurrencyRate,
					this.isDepositForm
						? this.computedEquivalentCurrency.decimals || this.activeWallet?.currencyDecimals || 8
						: this.secondCurrencyStepFlowDecimals
				);
			}
			return this.bestSwapOffer?.maximumLimit || 0;
		}

		protected get swapMinLimitInEquivalentCurrency(): number {
			if (
				this.computedEquivalentCurrency.title &&
				this.computedEquivalentCurrency.title !== this.computedCryptoSecondCurrency.title
			) {
				return toFixedDecimals(
					(this.bestSwapOffer?.minimumLimit || 0) * this.equivalentCurrencyRate,
					this.isDepositForm
						? this.computedEquivalentCurrency.decimals || this.activeWallet?.currencyDecimals || 8
						: this.secondCurrencyStepFlowDecimals
				);
			}
			return this.bestSwapOffer?.minimumLimit || 0;
		}

		@Watch('equivalentCurrencyRate')
		protected changeAmountToSendHendler(): void {
			this.swapAmountValue = String(this.walletsStore.amountSwapGive);
		}

		protected get exchangeError(): Array<COMMON.TranslateMeta | undefined> {
			return [
				this.walletsStore.currentSeamlessErrors[WalletsFields.AvailableBalance],
				this.walletsStore.currentSeamlessErrors[WalletsFields.MinimumLimit],
				this.walletsStore.currentSeamlessErrors[WalletsFields.MaximumLimit]
			];
		}

		protected get errorsExchange(): Array<string> {
			return this.exchangeError
				.reduce((acc: Array<string>, exchangeError: COMMON.TranslateMeta | undefined) => {
					if (exchangeError) {
						return [...acc, this.translateMessage(exchangeError)];
					}
					return acc;
				}, [])
				.filter((errorText: string) => Boolean(errorText));
		}

		protected depositAmountHandlerGet(value: string): void {
			this.swapAmountValue = String(convertExponentialToDecimal(Number(value)));
		}
		protected get swapAmountValue(): string {
			if (this.isNeedShowValueAsString(String(this.walletsStore.amountSwapGive))) {
				return String(this.walletsStore.amountSwapGive);
			}

			return String(convertExponentialToDecimal(Number(this.walletsStore.amountSwapGive)));
		}
		protected set swapAmountValue(value: string) {
			this.walletsStore.amountSwapGive = value;

			this.$nextTick(() => {
				this.walletsStore.amountSwapGive = this.getFormattedValueForSwap(
					value,
					this.isDepositForm
						? this.computedEquivalentCurrency.decimals || this.secondCurrencyStepFlowDecimals
						: this.activeWallet?.currencyDecimals || 8
				);

				const exchangeRate =
					this.activeForm === FormType.DEPOSIT
						? this.bestSwapOffer?.exchangeRate || 1
						: 1 / Number(this.bestSwapOffer?.exchangeRate || 1);

				const amountToSend = this.isDepositForm
					? Number(this.walletsStore.amountSwapGive) / this.equivalentCurrencyRate / exchangeRate
					: Number(this.walletsStore.amountSwapGive) * this.equivalentCurrencyRate * exchangeRate;
				this.walletsStore.amountSwapGet = this.formatNumberAndFixedDecimals(
					amountToSend,
					this.isDepositForm
						? this.activeWallet?.currencyDecimals || 8
						: this.computedEquivalentCurrency.decimals || this.secondCurrencyStepFlowDecimals
				);
			});
		}
		protected handleCheckDepositBalanceGet(): void {
			this.walletsStore.validateSwapAmount();
		}

		protected depositAmountHandlerGive(value: string): void {
			this.swapAmountValueToSend = String(convertExponentialToDecimal(Number(value)));
		}
		protected get swapAmountValueToSend(): string {
			if (this.isNeedShowValueAsString(String(this.walletsStore.amountSwapGet))) {
				return String(this.walletsStore.amountSwapGet);
			}

			return String(convertExponentialToDecimal(Number(this.walletsStore.amountSwapGet)));
		}
		protected set swapAmountValueToSend(value: string) {
			this.walletsStore.amountSwapGet = value;

			this.$nextTick(() => {
				this.walletsStore.amountSwapGet = this.getFormattedValueForSwap(
					value,
					this.isDepositForm
						? this.activeWallet?.currencyDecimals || 8
						: this.computedEquivalentCurrency.decimals || this.secondCurrencyStepFlowDecimals
				);

				const exchangeRate =
					this.activeForm === FormType.DEPOSIT
						? this.bestSwapOffer?.exchangeRate || 1
						: 1 / Number(this.bestSwapOffer?.exchangeRate || 1);

				const amount = this.isDepositForm
					? Number(this.walletsStore.amountSwapGet) * exchangeRate * this.equivalentCurrencyRate
					: Number(this.walletsStore.amountSwapGet) / exchangeRate / this.equivalentCurrencyRate;
				this.walletsStore.amountSwapGive = this.formatNumberAndFixedDecimals(
					amount,
					this.isDepositForm
						? this.computedEquivalentCurrency.decimals || this.secondCurrencyStepFlowDecimals
						: this.activeWallet?.currencyDecimals || 8
				);
			});
		}
		protected handleCheckDepositBalanceGive(): void {
			this.walletsStore.validateSwapAmount();
		}

		protected get secondCurrencyStepFlowDecimals(): number {
			return this.walletsStore.secondCurrencyStepFlow?.decimals || 8;
		}

		protected get equivalentCurrencyRate(): number {
			return this.walletsStore.equivalentCurrencyRate;
		}

		public get equivalentCurrenciesRatesRecord(): Record<number, number> {
			return this.walletsStore.equivalentCurrenciesRatesRecord;
		}

		protected get activeWalletDecimals(): number {
			return this.activeWallet?.currencyDecimals || 8;
		}

		protected get firstCurrencyTitleByForm(): string {
			return this.activeWallet?.currencyTitle || '';
		}

		protected get firstCurrencyDecimalsByForm(): number {
			return this.activeWalletDecimals > this.secondCurrencyStepFlowDecimals
				? this.activeWalletDecimals
				: this.secondCurrencyStepFlowDecimals;
		}

		protected get baseCurrencyId(): number | undefined {
			return this.walletsStore.baseCurrencyId;
		}

		protected get secondCurrencyStepFlow(): any {
			return this.walletsStore.secondCurrencyStepFlow;
		}

		protected get computedEquivalentCurrency(): any {
			if (!this.walletsStore.equivalentCurrency.title) {
				return { ...this.secondCurrencyStepFlow, title: this.walletsStore.secondCurrencyStepFlow.title || '' };
			}
			return this.walletsStore.equivalentCurrency;
		}
		protected set computedEquivalentCurrency(currency: any) {
			this.menuBuyGiveStatusComputed = false;
			this.walletsStore.equivalentCurrency = currency;

			if (currency?.id && this.baseCurrencyId) {
				this.walletsStore.getRates(currency.id, this.baseCurrencyId);
			}
		}

		protected getFormattedValueForSwap(value: string, decimails: number | null | undefined): string {
			let newValue = value;
			if (newValue.includes('-')) {
				newValue = newValue.replace(/-/g, '');
			}
			newValue = newValue.replace(' ', '');
			newValue = decimails ? inputDecimalsMask(newValue, decimails) : inputMask(newValue);
			return newValue;
		}

		protected setActiveForm(type: WALLETS.FormTypeValues): void {
			this.walletsStore.setActiveForm(type);

			if (this.seamlessIntegrationEnabled) {
				this.setActiveFlow(this.activeFlowRecord[type as FormType.DEPOSIT | FormType.WITHDRAWAL]);
			}
		}

		protected get activeFlowRecord(): Record<FormType.DEPOSIT | FormType.WITHDRAWAL, WALLETS.FlowTypeValues> {
			return this.walletsStore.activeFlow;
		}

		protected get activeFlow(): WALLETS.FlowTypeValues {
			return this.walletsStore.getActiveFlow;
		}

		protected setActiveFlow(flow: WALLETS.FlowTypeValues): void {
			this.walletsStore.setActiveFlow(flow);
		}

		protected setDepositForm(): void {
			this.$router.push({
				name: this.seamlessIntegrationEnabled ? 'balance-get-form' : 'balance-activeForm',
				params: { currency: this.activeWallet?.currencyTitle as string, activeForm: FormType.DEPOSIT }
			});
			this.setActiveForm(FormType.DEPOSIT);
		}

		protected clearInputAndSetDefault(): void {
			this.amountInField = '';
			this.walletsStore.setEquivalentToInitial();
			this.walletsStore.setDepositAmount('');
			this.walletsStore.setDepositFeeAmount('');
			this.walletsStore.setWithdrawalAmount('');
			this.walletsStore.setWithdrawalFeeAmount('');
			this.walletsStore.secondCurrencyStepFlow = {
				...this.activeWallet,
				id: this.activeWallet?.currencyId,
				title: this.activeWallet?.currencyTitle || ''
			};
		}

		protected setActiveDepositTransport(transport?: WALLETS.DepositTransactionMethod): void {
			this.walletsStore.setActiveDepositTransport(transport);
			this.toggleMemoWarning(true);
			this.clearInputAndSetDefault();
		}
		protected setActiveWithdrawalTransport(transport?: WALLETS.WithdrawalTransactionMethod): void {
			this.walletsStore.setActiveWithdrawalTransport(transport);
			this.toggleMemoWarning(true);
			this.clearInputAndSetDefault();
		}

		protected getFormattedValueForAmountValue(value: string): string {
			let newValue = value;
			if (newValue.includes('-')) {
				newValue = newValue.replace(/-/g, '');
			}
			newValue = newValue.replace(' ', '');
			newValue = this.activeWallet?.currencyDecimals
				? inputDecimalsMask(newValue, this.activeWallet.currencyDecimals)
				: inputMask(newValue);
			return newValue;
		}

		protected isNeedShowValueAsString(value: string): boolean {
			return (
				isNaN(Number(value)) ||
				value[value.length - 1] === '.' ||
				value.includes(' ') ||
				(String(value).includes('.') && String(value)[String(value).length - 1] === '0')
			);
		}

		protected depositAmountHandler(value: number, debounceTime: number): void {
			this.walletsStore.setDepositAmount(value, debounceTime);
		}
		protected get depositAmountValue(): string {
			if (this.isNeedShowValueAsString(String(this.activeWalletData.amountValue))) {
				return this.activeWalletData.amountValue;
			}

			return String(convertExponentialToDecimal(Number(this.activeWalletData.amountValue)));
		}
		protected set depositAmountValue(value: string) {
			this.walletsStore.setDepositAmount(value);

			this.$nextTick(() => {
				this.walletsStore.setDepositAmount(this.getFormattedValueForAmountValue(value));
			});
		}

		protected amountInField = '';
		protected get depositAmountValueWithEquivalent(): string {
			if (this.isNeedShowValueAsString(String(this.amountInField))) {
				return this.amountInField;
			}

			return String(convertExponentialToDecimal(Number(this.amountInField)));
		}

		protected set depositAmountValueWithEquivalent(value: string) {
			this.amountInField = value;
			const equivalentValue =
				this.formatNumberAndFixedDecimals(
					(1 / this.equivalentCurrencyRate) * Number(value),
					this.activeWallet?.currencyDecimals || 8
				) || '';
			this.walletsStore.setDepositAmount(equivalentValue);
			this.$nextTick(() => {
				this.walletsStore.setDepositAmount(this.getFormattedValueForAmountValue(equivalentValue));
			});
		}

		protected get depositAmountValueWithFeeAndEquivalent(): string {
			if (this.isNeedShowValueAsString(String(this.activeWalletData.valueWithFee))) {
				return this.activeWalletData.valueWithFee;
			}

			return String(convertExponentialToDecimal(Number(this.activeWalletData.valueWithFee)));
		}

		protected set depositAmountValueWithFeeAndEquivalent(value: string) {
			const amountFee = this.walletsStore.getFeeValue(value, this.walletsStore.activeTransport);
			const equivalentValue =
				this.formatNumberAndFixedDecimals(
					this.equivalentCurrencyRate * (Number(value) + Number(amountFee)),
					this.activeWallet?.currencyDecimals || 8
				) || '';
			this.amountInField = this.getFormattedValueForAmountValue(equivalentValue);
			this.walletsStore.setDepositFeeAmount(value);

			this.$nextTick(() => {
				this.walletsStore.setDepositFeeAmount(this.getFormattedValueForAmountValue(value));
			});
		}

		protected handleCheckDepositBalanceWithEquivalent(): void {
			const equivalentValue =
				this.formatNumberAndFixedDecimals(
					(1 / this.equivalentCurrencyRate) * Number(this.amountInField),
					this.activeWallet?.currencyDecimals || 8
				) || '';

			this.walletsStore.setDepositAmount(equivalentValue);
			this.$nextTick(() => {
				this.walletsStore.setDepositAmount(this.getFormattedValueForAmountValue(equivalentValue));
				this.walletsStore.validateDepositAmount();
			});
		}

		protected depositFeeAmountHandler(value: number, debounceTime: number): void {
			this.walletsStore.setDepositFeeAmount(value, debounceTime);
		}
		protected get depositAmountValueWithFee(): string {
			if (this.isNeedShowValueAsString(String(this.activeWalletData.valueWithFee))) {
				return this.activeWalletData.valueWithFee;
			}

			return String(convertExponentialToDecimal(Number(this.activeWalletData.valueWithFee)));
		}
		protected set depositAmountValueWithFee(value: string) {
			this.walletsStore.setDepositFeeAmount(value);

			this.$nextTick(() => {
				this.walletsStore.setDepositFeeAmount(this.getFormattedValueForAmountValue(value));
			});
		}

		protected withdrawalAmountHandler(value: number): void {
			this.walletsStore.setWithdrawalAmount(value);
		}

		protected get withdrawalAmountValueWithEquivalent(): string {
			if (this.isNeedShowValueAsString(String(this.amountInField))) {
				return this.amountInField;
			}

			return String(convertExponentialToDecimal(Number(this.amountInField)));
		}

		protected set withdrawalAmountValueWithEquivalent(value: string) {
			this.amountInField = value;
			const equivalentValue =
				this.formatNumberAndFixedDecimals(
					(1 / this.equivalentCurrencyRate) * Number(value),
					this.activeWallet?.currencyDecimals || 8
				) || '';

			this.walletsStore.setWithdrawalAmount(equivalentValue);
			this.$nextTick(() => {
				this.walletsStore.setWithdrawalAmount(this.getFormattedValueForAmountValue(equivalentValue));
			});
		}

		protected get withdrawalAmountValueWithFeeAndEquivalent(): string {
			if (this.isNeedShowValueAsString(String(this.activeWalletData.valueWithFee))) {
				return this.activeWalletData.valueWithFee;
			}

			return String(convertExponentialToDecimal(Number(this.activeWalletData.valueWithFee)));
		}

		protected set withdrawalAmountValueWithFeeAndEquivalent(value: string) {
			const amountFee = this.walletsStore.getFeeValue(value, this.walletsStore.activeTransport);
			const equivalentValue =
				this.formatNumberAndFixedDecimals(
					this.equivalentCurrencyRate * (Number(value) + Number(amountFee)),
					this.activeWallet?.currencyDecimals || 8
				) || '';
			this.amountInField = this.getFormattedValueForAmountValue(equivalentValue);
			this.walletsStore.setWithdrawalFeeAmount(value);

			this.$nextTick(() => {
				this.walletsStore.setWithdrawalFeeAmount(this.getFormattedValueForAmountValue(value));
			});
		}

		protected handleCheckDepositWithdrawalBalanceWithEquivalent(): void {
			const equivalentValue =
				this.formatNumberAndFixedDecimals(
					(1 / this.equivalentCurrencyRate) * Number(this.amountInField),
					this.activeWallet?.currencyDecimals || 8
				) || '';

			this.walletsStore.setWithdrawalAmount(equivalentValue);
			this.$nextTick(() => {
				this.walletsStore.setWithdrawalAmount(this.getFormattedValueForAmountValue(equivalentValue));
				this.walletsStore.validateAmount();
			});
		}

		protected handleCheckDepositWithdrawalBalanceWithEquivalentAndFee(): void {
			this.$nextTick(() => {
				this.walletsStore.validateAmount();
			});
		}

		protected withdrawalAmountHandlerWithEquivalent(value: string): void {
			this.withdrawalAmountValueWithEquivalent = value;
		}

		protected withdrawalAmountHandlerWithEquivalentAndFee(value: string): void {
			this.withdrawalAmountValueWithFeeAndEquivalent = value;
		}

		protected get withdrawalAmountValue(): string {
			if (this.isNeedShowValueAsString(String(this.activeWalletData.amountValue))) {
				return this.activeWalletData.amountValue;
			}

			return String(convertExponentialToDecimal(Number(this.activeWalletData.amountValue)));
		}
		protected set withdrawalAmountValue(value: string) {
			this.walletsStore.setWithdrawalAmount(value);

			this.$nextTick(() => {
				this.walletsStore.setWithdrawalAmount(this.getFormattedValueForAmountValue(value));
			});
		}

		protected withdrawalFeeAmountHandler(value: number): void {
			this.walletsStore.setWithdrawalFeeAmount(value);
		}
		protected get withdrawalAmountValueWithFee(): string {
			if (this.isNeedShowValueAsString(String(this.activeWalletData.valueWithFee))) {
				return this.activeWalletData.valueWithFee;
			}

			if (
				String(convertExponentialToDecimal(Number(this.activeWalletData.valueWithFee))) ||
				this.activeWalletData.valueWithFee === 0
			) {
				return String(convertExponentialToDecimal(Number(this.activeWalletData.valueWithFee)));
			}

			return this.withdrawalAmountValue === '' ? '' : '0';
		}
		protected set withdrawalAmountValueWithFee(value: string) {
			this.walletsStore.setWithdrawalFeeAmount(value);

			this.$nextTick(() => {
				this.walletsStore.setWithdrawalFeeAmount(this.getFormattedValueForAmountValue(value));
			});
		}

		protected addressWithdrawalHandler(value: string): void {
			this.walletsStore.setWithdrawalAddress(value);
		}
		protected get withdrawalAddress(): string {
			return this.activeWalletData.withdrawalAddress;
		}
		protected set withdrawalAddress(value: string) {
			this.walletsStore.setWithdrawalAddress(value);
		}

		protected get withdrawalComment(): string {
			return this.activeWalletData.comment;
		}

		protected publicKeyWithdrawalHandler(value: string): void {
			this.walletsStore.setWithdrawalPublicKey(value);
		}
		protected get withdrawalPublicKey(): string {
			return this.activeWalletData.withdrawalPublicKey;
		}
		protected set withdrawalPublicKey(value: string) {
			this.walletsStore.setWithdrawalPublicKey(value);
		}

		protected tagWithdrawalHandler(value: string): void {
			this.walletsStore.setWithdrawalTag(value);
		}
		protected get tagWithdrawal(): string {
			return this.activeWalletData.withdrawalTag;
		}
		protected set tagWithdrawal(value: string) {
			this.walletsStore.setWithdrawalTag(value);
		}
		@Watch('localCommentValue')
		protected commentWithdrawalHandler(value: string): void {
			this.walletsStore.setWithdrawalComment(value);
		}
		protected commentWithdrawalShowInputHandler(value: boolean): void {
			this.walletsStore.setUseCommentWithdrawal(value);
		}

		protected async withdrawalAction(): Promise<void> {
			await this.walletsStore.withdrawalAction();
		}

		protected async generateNewAddress(): Promise<void> {
			await this.walletsStore.generateNewAddress();
		}

		protected get blockchainInProcess(): boolean {
			return this.walletsStore.blockchainInProcess;
		}

		protected get balanceError(): Array<COMMON.TranslateMeta | undefined> {
			return [
				this.walletsStore.currentErrors[WalletsFields.AvailableBalance],
				this.walletsStore.currentErrors[WalletsFields.MinimumLimit] && {
					message: this.walletsStore.currentErrors[WalletsFields.MinimumLimit].message,
					options: {
						minLimit: this.activeTransport ? String(this.activeTransport.minAmount) || '' : '',
						currency: this.activeWallet?.currencyTitle || ''
					}
				},
				this.walletsStore.currentErrors[WalletsFields.MaximumLimit] && {
					message: this.walletsStore.currentErrors[WalletsFields.MaximumLimit].message,
					options: {
						maxLimit: this.activeTransport ? String(this.activeTransport.maxAmount) || '' : '',
						currency: this.activeWallet?.currencyTitle || ''
					}
				},
				this.walletsStore.currentErrors[WalletsFields.LessThanFee]
			];
		}

		protected get errorsBalance(): Array<string> {
			return this.balanceError
				.reduce((acc: Array<string>, balanceError: COMMON.TranslateMeta | undefined) => {
					if (balanceError) {
						return [...acc, this.translateMessage(balanceError)];
					}
					return acc;
				}, [])
				.filter((errorText: string) => Boolean(errorText));
		}

		protected get addressValueError(): COMMON.TranslateMeta {
			return this.walletsStore.currentErrors[WalletsFields.AddressIsEmpty] &&
				this.walletsStore.currentErrors[WalletsFields.AddressIsEmpty].message
				? this.walletsStore.currentErrors[WalletsFields.AddressIsEmpty]
				: this.walletsStore.currentErrors[WalletsFields.AddressWrongNetwork];
		}

		protected get errorAddressValue(): string {
			return this.addressValueError ? this.translateMessage(this.addressValueError) : '';
		}

		protected get publicKeyValueError(): COMMON.TranslateMeta {
			return this.walletsStore.currentErrors[WalletsFields.PublicKeyIsEmpty];
		}

		protected get loadingWallets(): boolean {
			return this.walletsStore.loadingWallets;
		}

		protected get errorPublicKeyValue(): string {
			return this.publicKeyValueError ? this.translateMessage(this.publicKeyValueError) : '';
		}

		protected get tagValueError(): COMMON.TranslateMeta {
			return this.walletsStore.currentErrors[WalletsFields.TagIsEmpty]?.message
				? this.walletsStore.currentErrors[WalletsFields.TagIsEmpty]
				: this.walletsStore.currentErrors[WalletsFields.TagWrong];
		}

		protected get errorTagValue(): string {
			return this.tagValueError ? this.translateMessage(this.tagValueError) : '';
		}

		protected get commentValueError(): COMMON.TranslateMeta {
			return this.walletsStore.currentErrors[WalletsFields.CommentIsEmpty];
		}

		protected get errorCommentValue(): string {
			return this.commentValueError ? this.translateMessage(this.commentValueError) : '';
		}

		public get getP2pLink(): string {
			return this.walletsStore.getP2pLink;
		}

		protected handleCheckBalance(): void {
			this.walletsStore.validateAmount();
		}

		protected handleCheckDepositBalance(): void {
			this.walletsStore.validateDepositAmount();
		}

		protected handlePasteAddress(): void {
			setTimeout(() => {
				this.handleCheckAddress();
			}, 0);
		}

		protected handleCheckAddress(): void {
			if (!this.activeWalletData.withdrawalAddress) {
				this.walletsStore.setWithdrawalAddress('');
			}

			this.walletsStore.appendErrors(
				this.walletsStore.notEmtyAddressValidation(this.activeWalletData.withdrawalAddress)
			);

			this.walletsStore.appendErrors(
				this.walletsStore.addressValidationByNetworkRegex(
					this.activeWalletData.withdrawalAddress,
					this.cryptoCurrency?.addressRegex || SIMPLE_CRYPTO_REGEX_STRING
				)
			);
		}

		protected handleCheckPublicKey(): void {
			this.walletsStore.appendErrors(
				this.walletsStore.notEmtyPublicKeyValidation(this.activeWalletData.withdrawalPublicKey)
			);
		}

		protected handleCheckTag(): void {
			if (!this.activeWalletData.withdrawalTag) {
				this.walletsStore.setWithdrawalTag('');
			}

			this.walletsStore.appendErrors(this.walletsStore.notEmtyTagValidation(this.activeWalletData.withdrawalTag));

			this.walletsStore.appendErrors(
				this.walletsStore.tagValidationByTagRegex(
					this.activeWalletData.withdrawalTag,
					this.cryptoCurrency?.tagRegex || SIMPLE_MEMO_REGEX_STRING
				)
			);
		}
		@Watch('localCommentValue')
		protected handleCheckComment(): void {
			this.walletsStore.appendErrors(this.walletsStore.notEmptyCommentValidation(this.activeWalletData.comment));
		}

		protected openWalletsScreen(): void {
			this.currencySelectMenuValue = false;
			this.$router.push({ name: 'balance-wallets' });
		}

		protected getCryptoDepositQrUri(): void {
			this.walletsStore.getCryptoDepositQrUri();
		}

		protected setActiveConversionWallet(): void {
			if (this.activeWallet) {
				this.walletsStore.instantConversionFromWallet = this.activeWallet;
			}
		}

		protected get titleStepsFlow(): string {
			if (this.isExchangeForm) {
				const firstCurrency = this.isDepositForm
					? this.computedCryptoSecondCurrency.title
					: this.activeWallet?.currencyTitle;
				const secondCurrency = this.isDepositForm
					? this.activeWallet?.currencyTitle
					: this.computedCryptoSecondCurrency.title;
				return this.$t('balance.p2pSwapCurrencies', { firstCurrency, secondCurrency });
			}
			return this.$t(`balance.${this.activeForm}`) + ' ' + (this.activeWallet?.currencyTitle || '');
		}

		protected get recipientAddress(): string {
			return this.$t('balance.recipientAddress');
		}

		protected get writeAddress(): string {
			return this.$t('balance.writeAddress');
		}

		protected get commentLabel(): string {
			return this.$t('balance.commentInputLabel');
		}

		protected get writePublicKey(): string {
			return this.$t('balance.writePublicKey');
		}

		protected get titlePromtText(): string {
			return this.$t('balance.titlePromtText');
		}

		protected get fundsWithdrawalSum(): string {
			return this.$t('balance.fundsWithdrawalSum');
		}

		protected get recieptAmount(): string {
			return this.$t('balance.recieptAmount');
		}

		protected get depositAmount(): string {
			return this.$t('balance.depositAmount');
		}

		protected get availableBalanceText(): string {
			return this.$t('balance.availableBalanceText');
		}

		protected get amountTitle(): string {
			return this.$t('balance.amountTitle');
		}
		protected get addressTitle(): string {
			return this.$t('balance.depositAddressTitle');
		}
		protected get addressTitleTooltip(): string {
			return this.$t('balance.depositAddressTitleTooltip', {
				network: this.activeTransport?.name ?? this.$t('balance.network')
			});
		}
		protected get addressTitlePromt(): string {
			return this.cryptoCurrency?.tagName
				? this.$t('balance.depositAddressTitlePromt', {
						currency: this.activeWallet?.currencySymbol,
						tag: this.$t(`balance.${this.cryptoCurrency?.tagName}`) || 'tagMessage'
				  })
				: this.$t('balance.depositAddressTitlePromtNoTag', { currency: this.activeWallet?.currencyTitle });
		}

		protected get withdrawalAddressBeforeInputPrompt(): string {
			return this.$t('balance.withdrawalAddressBeforeInputPrompt', { transport: this.activeTransport?.name });
		}

		protected get addressSubtitle(): string {
			return this.$t('balance.depositAddressSubtitle');
		}
		protected get addressRefresh(): string {
			return this.$t('balance.depositAddressRefresh');
		}
		protected get addressQrCodeModal(): string {
			return this.$t('balance.depositAddressQrCodeModal');
		}

		protected get memoPlaceholder(): string {
			return this.$t(`balance.${this.cryptoCurrency?.tagName}`) || 'MEMO';
		}

		protected get okText(): string {
			return this.$t('balance.ok').toUpperCase();
		}
		protected get conversioNotAvailable(): string {
			return this.$t('balance.conversioNotAvailable');
		}
		protected get warningText(): string {
			return this.$t('balance.warning');
		}
		protected get withdrawalMemoWarning(): string {
			return this.$t('balance.withdrawalMemoWarning', {
				tag: this.cryptoCurrency?.tagName?.toUpperCase() || 'tagMessage'
			});
		}

		protected get memoOrTagText(): string {
			return this.cryptoCurrency?.tagName?.toUpperCase() === 'MEMO' ? this.$t('balance.tag') : this.$t('balance.Memo');
		}

		protected get withdrawalMemoWarningSecond(): string {
			return this.$t('balance.withdrawalMemoWarningSecond', {
				tag: this.cryptoCurrency?.tagName?.toUpperCase() || 'tagMessage',
				nextTag: this.memoOrTagText
			});
		}
		protected get depositMemoWarning(): string {
			return this.$t('balance.depositMemoWarning', {
				tag: this.cryptoCurrency?.tagName?.toUpperCase() || 'tagMessage'
			});
		}
		protected get tagTitle(): string {
			return this.$t('balance.depositTagTitle', {
				tag: this.$t(`balance.${this.cryptoCurrency?.tagName}`) || 'tagMessage'
			});
		}
		protected get tagTitleTooltip(): string {
			return this.$t('balance.depositTagTitleTooltip');
		}
		protected get tagTitlePromt(): string {
			return this.$t('balance.depositTagTitlePromt', {
				tag: this.$t(`balance.${this.cryptoCurrency?.tagName}`) || 'tagMessage'
			});
		}
		protected get tagSubtitle(): string {
			return this.$t('balance.depositTagSubtitle', { tag: this.cryptoCurrency?.tagName || 'tagMessage' });
		}
		protected get tagRefresh(): string {
			return this.$t('balance.depositTagRefresh', { tag: this.cryptoCurrency?.tagName || 'tagMessage' });
		}
		protected get tagSubtitleTooltip(): string {
			return this.$t('balance.depositTagSubtitleTooltip');
		}

		protected get publicKeyTitle(): string {
			return this.$t('balance.publicKeyTitle');
		}
		protected get publicKeyTitleTooltip(): string {
			return this.$t('balance.publicKeyTitleTooltip');
		}
		protected get publicKeyTitlePromt(): string {
			return this.$t('balance.publicKeyTitlePromt');
		}
		protected get publicKeySubtitle(): string {
			return this.$t('balance.publicKeySubtitle');
		}
		protected get publicKeySubtitleTooltip(): string {
			return this.$t('balance.publicKeySubtitleTooltip');
		}

		protected get depositFeeText(): string {
			if (this.activeTransport && this.activeWallet) {
				//@ts-ignore
				return getDepositFeeValue(this.activeTransport, this.activeWallet?.currencyTitle);
			} else {
				return '';
			}
		}

		protected memoVariables = [
			{
				name: 'cardHeight',
				type: 'string',
				defaultValue: '100%'
			}
		];

		protected balanceVariables = [
			{
				name: 'currencyTitleColor',
				type: 'string',
				defaultValue: '#C9CCCF'
			}
		];

		protected cardWrapperVariables = [
			{
				name: 'styleString',
				type: 'string',
				defaultValue: ''
			}
		];

		protected equivalentMenuVariables = [
			{
				name: 'chipClass',
				type: 'string',
				defaultValue: 'k-chip-p2p-currencies-filters'
			},
			{
				name: 'chipActiveClass',
				type: 'string',
				defaultValue: 'k-chip-p2p-methods-history-active'
			}
		];

		protected backBtnVariables = [
			{
				name: 'iconSize',
				type: 'string',
				defaultValue: '14'
			},
			{
				name: 'iconStyle',
				type: 'string',
				defaultValue: '--icon-color:var(--tertiary-darken)'
			}
		];

		protected swapDirectionVariables = [
			{
				name: 'iconSize',
				type: 'string',
				defaultValue: '24'
			},
			{
				name: 'iconName',
				type: 'string',
				defaultValue: 'swap-icon'
			},
			{
				name: 'iconStyle',
				type: 'string',
				defaultValue: '' // --icon-color:var(--primary-lighten)
			}
		];

		protected translationVariables = [
			{
				name: 'tooltip',
				type: 'translation',
				defaultValue: 'balance.feeTooltipText'
			}
		];
	}
</script>
