<template>
	<Widget name="balance-history-wrapper">
		<WidgetItem
			v-slot="{ computedAttrs, iconSpecialSize }"
			name="back-button"
			:contentVariables="backButtonVariables"
		>
			<KBtn
				v-if="activeCurrency"
				v-bind="computedAttrs"
				key="balance-history-wrapper-back-button"
				icon
				:ripple="false"
				:to="goToBalanceObject"
				@click.native="setActiveFlow"
			>
				<KIcon name="$prev" :size="iconSpecialSize" />
			</KBtn>
		</WidgetItem>

		<WidgetItem name="header">
			<HeaderView key="balance-wallets-header-main-key" />
		</WidgetItem>

		<WidgetItem v-slot="{ computedAttrs, title }" name="title">
			<KText v-bind="computedAttrs">
				{{ title }}
			</KText>
		</WidgetItem>
		<WidgetItem
			v-slot="{ computedAttrs, name, size }"
			name="load-history"
			:contentVariables="xsLoadIconVars"
		>
			<KIcon
				v-bind="computedAttrs"
				:name="name"
				:size="size"
				@click="showDownloadHistoryModal"
			/>
		</WidgetItem>

		<WidgetItem
			v-slot="{ computedAttrs, hideSliderValue, enabledTabStyles, disabledTabStyles, tabsHeight, tabsGroupBackground }"
			name="tabs"
			:contentVariables="tabsVariables"
		>
			<KTabs
				v-bind="computedAttrs"
				centerActive
				:centered="true"
				:height="tabsHeight"
				:backgroundColor="tabsGroupBackground"
				:hideSlider="getBooleanValueFromString(hideSliderValue)"
			>
				<KTab
					v-for="name in tabs"
					:key="name"
					:to="{ name: 'balance-historyType', params: { historyType: name }}"
					:style="name === historyType ? enabledTabStyles : disabledTabStyles"
					@change="tabChangeHandler(name)"
				>
					{{ $t(`balance.${name}`) }}
				</KTab>
			</KTabs>
		</WidgetItem>

		<WidgetItem name="filters">
			<Widget name="balance-history-filters-transactions">
				<WidgetItem name="currency">
					<CurrencyQuickFilter
						v-if="isTransactionHistory"
						:value="transactionsCurrencyValue"
						@input="currencyInputHandler"
					/>
					<CurrencyQuickFilter
						v-if="isAddressesHistory"
						:value="addressesCurrencyValue"
						@input="currencyInputHandler"
					/>
				</WidgetItem>

				<WidgetItem name="operation-type">
					<EventQuickFilter
						v-if="isTransactionHistory"
						:value="transactionsEventValue"
						@input="eventInputHandler"
					/>
					<EventQuickFilter
						v-if="isAddressesHistory"
						:value="addressesCryptoCurrencyValue"
						:list="allNetworkCurrency"
						:title="BALANCE_TEXT.networkFilterTitle"
						@input="eventInputHandler"
					/>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs, name }" name="expand-filters">
					<KIcon
						v-bind="computedAttrs"
						:name="name"
						@click="showFilters"
					/>
				</WidgetItem>

				<WidgetItem v-slot="{ computedAttrs, name }" name="load-history">
					<KIcon
						v-bind="computedAttrs"
						:name="name"
						@click="showDownloadHistoryModal"
					/>
				</WidgetItem>
			</Widget>
		</WidgetItem>

		<WidgetItem
			v-if="isTableNotEmpty"
			key="data-table-xs"
			name="data-table-xs"
		>
			<HistoryTableXS @loadMore="loadMore(currentPage + 1)" />
		</WidgetItem>

		<WidgetItem
			v-if="isTableNotEmpty"
			v-slot="{
				computedAttrs,
				paginationPrevIcon,
				paginationNextIcon,
				headerRowStyle,
				firstHeaderCellStyle,
				firstRowCellStyle,
				lastHeaderCellStyle,
				lastRowCellStyle,
				commonHeaderCellStyle,
				backgroundColorList,
				statusHeaderCellStyle,
				colorActivePage,
				statusAddressesHeaderCellStyle
			}"
			:key="tableKey"
			name="data-table"
			:contentVariables="tableVariables"
		>
			<template v-if="!operationsLoading && isTransactionHistory">
				<KTable
					key="balance-history-wrapper-data-table-transactions"
					:itemsPerPage="HISTORY_TABLE_LIMIT"
					:headers="transactionsHeaders"
					:items="operations"
					v-bind="computedAttrs"
					:page="currentPage"
					height="552px"
					hideDefaultHeader
					:serverItemsLength="totalOperations"
					loadingComponent="KProgressLinear"
					paginationClass="k-pagination-secondary"
					:style="{ '--data-table-regular-row-height': '56px' }"
					:totalVisiblePagination="paginationTotalAmount"
					:paginationShowPerPage="false"
					:paginationAttrs="{ color: colorActivePage, circle: true, prevIcon: paginationPrevIcon, nextIcon: paginationNextIcon }"
					@pagination-change="paginationChange($event)"
					@click:row="showTransactionsModal($event)"
				>
					<template #header="{ props: { headers } }">
						<thead class="v-data-table-header" :style="headerRowStyle">
							<tr>
								<th
									v-for="header in headers"
									:key="'table-header-' + header.value"
									role="columnheader"
									scope="col"
									:aria-label="header.text"
									:class="`text-${header.align}`"
									:style="`
										width: ${header.width};
										min-width: ${header.width};
										${commonHeaderCellStyle}
										${header.value === 'dateCreated' ? firstHeaderCellStyle : ''}
										${header.value === 'icon' ? lastHeaderCellStyle : ''}
										${header.value === 'status' ? statusHeaderCellStyle : ''}
									`"
								>
									<span>{{ header.text }}</span>
								</th>
							</tr>
						</thead>
					</template>
					<template #item.dateCreated="{ item }">
						<Widget name="balance-history-table-date-cell" :style="firstRowCellStyle">
							<WidgetItem v-slot="{ computedAttrs }" name="date">
								<KText v-bind="computedAttrs">
									{{ getDate(item.dateCreated) }}
								</KText>
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="time">
								<KText v-bind="computedAttrs">
									{{ getTime(item.dateCreated) }}
								</KText>
							</WidgetItem>
						</Widget>
					</template>
					<template #item.currencyTitle="{ item }">
						<Widget name="balance-history-table-currency-cell">
							<WidgetItem v-slot="{ computedAttrs }" name="icon">
								<KIcon v-bind="computedAttrs" :name="currencyIconNameById(item.currencyId)" />
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="currency">
								<KText v-bind="computedAttrs">
									{{ getCurrencyNameById(item.currencyId) }}
								</KText>
							</WidgetItem>
						</Widget>
					</template>
					<template #item.operationType="{ item }">
						<Widget name="balance-history-table-operationType-cell">
							<WidgetItem
								v-if="Boolean(item.p2PTransactionData)"
								key="balance-history-table-operationType-cell-currency-pair"
								name="currency-pair"
							>
								<Widget name="balance-history-table-currencyPair-cell">
									<WidgetItem v-slot="{ computedAttrs }" name="give-currency-icon">
										<KIcon
											v-bind="computedAttrs"
											:name="p2pCurrencyIconNameById(item.p2PTransactionData.tradeInfo && item.p2PTransactionData.tradeInfo.giveCurrencyId)"
										/>
									</WidgetItem>
									<WidgetItem v-slot="{ computedAttrs }" name="get-currency-icon">
										<KIcon
											v-bind="computedAttrs"
											:name="p2pCurrencyIconNameById(item.p2PTransactionData.tradeInfo && item.p2PTransactionData.tradeInfo.getCurrencyId)"
										/>
									</WidgetItem>
								</Widget>
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="operationType">
								<KText
									v-if="isTransaction(item.operationType)"
									v-bind="computedAttrs"
								>
									{{ isTransactionIn(item.side) ? $t(`balance.operationType-deposit`) : $t(`balance.operationType-withdrawal`) }}
								</KText>
								<KText
									v-else
									v-bind="computedAttrs"
								>
									{{ $t(`balance.operationType-${item.operationType}`) }}
								</KText>
							</WidgetItem>
						</Widget>
					</template>
					<template #item.amount="{ item }">
						<Widget name="balance-history-table-amount-cell">
							<WidgetItem
								v-slot="{ computedAttrs, positive, negative }"
								:contentVariables="colorVariables"
								name="amount"
							>
								<KText v-bind="computedAttrs" :style="{ color: item.side ? negative : positive }">
									{{
										getAmount(item)
									}}
								</KText>
							</WidgetItem>
						</Widget>
					</template>
					<template #item.fee="{ item }">
						<Widget name="balance-history-table-fee-cell">
							<WidgetItem v-slot="{ computedAttrs }" name="fee">
								<KText v-bind="computedAttrs" :style="{ color: 'inherit' }">
									{{ Boolean(item.fee) ? `-${formatNumberAndFixedDecimals(Math.abs(item.fee), 16)}` : 0 }}
								</KText>
							</WidgetItem>
						</Widget>
					</template>
					<template #item.balanceChange="{ item }">
						<Widget name="balance-history-table-balanceChange-cell">
							<WidgetItem
								v-slot="{ computedAttrs, positive, negative }"
								:contentVariables="colorVariables"
								name="amount"
							>
								<KText v-bind="computedAttrs" :style="{ color: item.side ? negative : positive }">
									{{
										getAmountChange(item)
									}}
								</KText>
							</WidgetItem>
						</Widget>
					</template>
					<template #item.status="{ item }">
						<Widget name="balance-history-table-status-cell">
							<WidgetItem
								v-slot="{ computedAttrs, codeStatus }"
								name="text"
								:contentVariables="statusColorVariables"
								:style="{
									background: item.transactionData
										? mapBackgroundsFromString(backgroundColorList)[item.transactionData.transactionStatus]
										: codeStatus && !isTransaction(item.operationType)
											? mapBackgroundsFromString(backgroundColorList)[2]
											: 'inherit'
								}"
							>
								<KText
									v-bind="computedAttrs"
									:style="{ color: getColorStatus(item, codeStatus)}"
								>
									{{ getTextStatus(item) }}
								</KText>
							</WidgetItem>
						</Widget>
					</template>
					<template #item.icon="{ item }">
						<Widget name="balance-history-table-repeat-cell" :style="lastRowCellStyle">
							<WidgetItem
								v-slot="{ computedAttrs, repeatIcon }"
								name="icon"
								:contentVariables="iconVariables"
							>
								<KIcon
									v-if="isWithdrawal(item)"
									v-bind="computedAttrs"
									:name="repeatIcon"
									@click.stop="repeatTransaction(item)"
								/>
							</WidgetItem>
						</Widget>
					</template>
				</KTable>
			</template>

			<template v-else-if="!addressesLoading && isAddressesHistory">
				<KTable
					key="balance-history-wrapper-data-table-addresses"
					:itemsPerPage="HISTORY_TABLE_LIMIT"
					:headers="addressesHeaders"
					:headerProps="addressesHeaderProps"
					:options="addressesOptions"
					:items="addresses"
					v-bind="computedAttrs"
					:page="currentPage"
					height="552px"
					hideDefaultHeader
					:serverItemsLength="totalAddresses"
					loadingComponent="KProgressLinear"
					paginationClass="k-pagination-secondary"
					:style="{ '--data-table-regular-row-height': '56px' }"
					:totalVisiblePagination="paginationTotalAmount"
					:paginationShowPerPage="false"
					:paginationAttrs="{ color: colorActivePage, circle: true, prevIcon: paginationPrevIcon, nextIcon: paginationNextIcon }"
					@pagination-change="paginationChange($event)"
					@click:row="showAddressesModal($event)"
					@update:sort-by="addressesUpdateSortBy"
					@update:sort-desc="addressesUpdateSortDesc"
				>
					<template #header="{ props: { headers, options: { sortDesc } }, on: { sort } }">
						<thead class="v-data-table-header" :style="headerRowStyle">
							<tr>
								<th
									v-for="header in headers"
									:key="'table-header-' + header.value"
									role="columnheader"
									scope="col"
									:aria-label="header.text"
									:class="`
										text-${header.align}
										${header.sortable && 'active' || ''}
										${sortDesc[0] && 'desc' || 'asc'}
									`"
									:style="`
										width: ${header.width};
										min-width: ${header.width};
										${commonHeaderCellStyle}
										${header.value === 'dateCreated' ? firstHeaderCellStyle : ''}
										${header.value === 'active' ? statusAddressesHeaderCellStyle : ''}
									`"
									@click="sort(header.value)"
								>
									<span>{{ header.text }}</span>
									<span
										v-if="header.sortable"
										:aria-hidden="true"
										class="v-icon notranslate v-data-table-header__icon theme--light"
										style="--special-size:18px;"
									>
										<svg
											class="v-icon__svg theme--light"
											style="--special-size:18px;margin-left:var(--spacing-1)"
										>
											<use href="#system--default--expand-close-gray" />
										</svg>
									</span>
								</th>
							</tr>
						</thead>
					</template>
					<template #item.dateCreated="{ item }">
						<Widget name="balance-history-table-date-cell" :style="firstRowCellStyle">
							<WidgetItem v-slot="{ computedAttrs }" name="date">
								<KText v-bind="computedAttrs">
									{{ getDate(item.dateCreated) }}
								</KText>
							</WidgetItem>

							<WidgetItem v-slot="{ computedAttrs }" name="time">
								<KText v-bind="computedAttrs">
									{{ getTime(item.dateCreated) }}
								</KText>
							</WidgetItem>
						</Widget>
					</template>
					<template #item.network="{ item }">
						<Widget name="balance-history-table-network-cell">
							<WidgetItem v-slot="{ computedAttrs }" name="network">
								<KText v-bind="computedAttrs">
									{{ item.network }}
								</KText>
							</WidgetItem>
						</Widget>
					</template>
					<template #item.address="{ item }">
						<Widget name="balance-history-table-address-tooltip-cell">
							<WidgetItem v-slot="{ computedAttrs }" name="address-tooltip">
								<KTooltip
									v-bind="computedAttrs"
									maxWidth="auto"
								>
									<template #activator="{ on, attrs }">
										<Widget name="balance-history-table-address-cell">
											<WidgetItem v-slot="{ computedAttrs }" name="address">
												<KText v-bind="{ ...attrs, ...computedAttrs }" v-on="on">
													{{ ellipsisString(item.address) }}
												</KText>
											</WidgetItem>
										</Widget>
									</template>
									<Widget name="balance-history-table-address-tooltip-content-cell">
										<WidgetItem v-slot="{ computedAttrs }" name="title">
											<KText v-bind="computedAttrs" />
										</WidgetItem>
										<WidgetItem v-slot="{ computedAttrs }" name="address-full">
											<KText v-bind="computedAttrs">
												{{ item.address }}
											</KText>
										</WidgetItem>
									</Widget>
								</KTooltip>
							</WidgetItem>
						</Widget>
					</template>
					<template #item.tag="{ item }">
						<Widget name="balance-history-table-address-cell">
							<WidgetItem v-slot="{ computedAttrs }" name="address">
								<KText v-bind="computedAttrs">
									{{ ellipsisString(item.tag) }}
								</KText>
							</WidgetItem>
						</Widget>
					</template>
					<template #item.currencies="{ item }">
						<Widget name="balance-history-table-currencies-cell">
							<WidgetItem
								v-for="(currency, index) in item.currencyWhichUseAddress"
								v-slot="{ computedAttrs }"
								:key="currency.currencyId"
								name="address"
								:style="getCurrencyIconStyle(index, item.currencyWhichUseAddress.length)"
							>
								<KIcon
									v-bind="computedAttrs"
									:name="`${currency.currencyType}.${currency.currencyTitle}`"
									size="16"
								/>
							</WidgetItem>
						</Widget>
					</template>
					<template #item.transactionsCount="{ item }">
						<Widget name="balance-history-table-transactionsCount-cell">
							<WidgetItem v-slot="{ computedAttrs }" name="transactionsCount">
								<KText v-bind="computedAttrs">
									{{ formatNumberAndFixedDecimals(item.transactionsCount, 2) }}
								</KText>
							</WidgetItem>
						</Widget>
					</template>
					<template #item.active="{ item }">
						<Widget name="balance-history-table-address-active-cell">
							<WidgetItem
								v-if="checkBasicAddress(item.address)"
								key="address-active-cell-basic"
								v-slot="{ computedAttrs, title }"
								name="basic"
							>
								<KText v-bind="computedAttrs">
									{{ title }}
								</KText>
							</WidgetItem>

							<WidgetItem
								v-else
								key="address-active-cell-pinned"
								v-slot="{ computedAttrs, title }"
								name="pinned"
							>
								<KText v-bind="computedAttrs">
									{{ title }}
								</KText>
							</WidgetItem>
						</Widget>
					</template>
					<template #item.icon>
						<span />
					</template>
				</KTable>
			</template>

			<KTable
				v-else-if="!dealsLoading && isDealsHistory"
				key="balance-history-wrapper-data-table-my-deals"
				:itemsPerPage="HISTORY_TABLE_LIMIT"
				:headers="myDealsHeaders"
				:items="myDeals"
				v-bind="computedAttrs"
				:page="currentPage"
				height="552px"
				:serverItemsLength="totalDeals"
				loadingComponent="KProgressLinear"
				paginationClass="k-pagination-secondary"
				:style="{ '--data-table-regular-row-height': '56px' }"
				:paginationShowPerPage="false"
				:paginationAttrs="{ color: colorActivePage, circle: true, prevIcon: paginationPrevIcon, nextIcon: paginationNextIcon }"
				@pagination-change="paginationChange($event)"
			>
				<template #item.type="{ item }">
					<TableDirectionIcon
						:buyerCurrency="item.buyerCurrency"
						:sellerCurrency="item.sellerCurrency"
						:cryptoSellerName="item.cryptoSeller.username"
						:currentUserName="currentCustomerName"
					/>
				</template>
				<template #item.date="{ item }">
					<Widget name="balance-history-table-date-cell">
						<WidgetItem v-slot="{ computedAttrs }" name="date">
							<KText v-bind="computedAttrs">
								{{ getDate(item.createdAt) }}
							</KText>
						</WidgetItem>

						<WidgetItem v-slot="{ computedAttrs }" name="time">
							<KText v-bind="computedAttrs">
								{{ getTime(item.createdAt) }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>
				<template #item.id="{ item }">
					<Widget name="balance-history-table-p2p-id-cell">
						<WidgetItem v-slot="{computedAttrs}" name="text">
							<KText v-bind="computedAttrs">
								{{ item.id }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>
				<template #item.username="{ item }">
					<Widget name="balance-history-table-p2p-author-cell">
						<WidgetItem v-slot="{computedAttrs}" name="text">
							<KText v-bind="computedAttrs">
								{{ item.advertisement.author }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>
				<template #item.pair="{ item }">
					<TablePairCurrencyMyDeal
						:buyerCurrency="item.buyerCurrency"
						:sellerCurrency="item.sellerCurrency"
						:cryptoSellerName="item.cryptoSeller.username"
						:currentUserName="currentCustomerName"
					/>
				</template>
				<template #item.paymentMethods="{ item }">
					<TablePaymentMethods
						:paymentMethods="item.paymentMethods"
						:paymentMethod="item.paymentMethod"
					/>
				</template>
				<template #item.price="{ item }">
					<TableDealInfo
						:buyerCurrency="item.buyerCurrency"
						:sellerCurrency="item.sellerCurrency"
						:cryptoSellerName="item.cryptoSeller.username"
						:currentUserName="currentCustomerName"
						:exchangeRate="item.exchangeRate"
						:locale="currentLocale"
					/>
				</template>
				<template #item.status="{ item }">
					<TableDealsStatus
						:availableUntil="item.availableUntil"
						:rsgActiveUntil="item.rsgActiveUntil"
						:dealStatus="item.status"
						@update-data="$emit('update-data')"
					/>
				</template>
			</KTable>

			<KSkeletonLoader
				v-else
				class="k-skeleton-loader-table-row-divider"
				:style="{ '--skeleton-loader-table-cell-height': '56px' }"
				:type="`table-thead, table-row-divider@${9}`"
			/>
		</WidgetItem>

		<WidgetItem
			v-if="!isTableNotEmpty"
			key="no-data"
			name="no-data"
		>
			<EmptyTableScreen
				:type="historyType"
				:isFiltered="isFilteredTable"
			/>
		</WidgetItem>

		<AddressesInfoModal />
		<TransactionsIOModal
			@repeat="repeatTransaction"
		/>
		<TransactionConversionModal />
		<TransactionsStakingModal />
		<TransactionsReferralModal />
		<TransactionsP2pModal />
		<TransactionsFilterModal />
		<AddressesFilterModal />
		<ConfirmModal />
		<CancelWithdrawalModal @cancel="setOperations" />
		<DownloadHistory :isLoading="isLoading" @downloadHistory="loadRaport" />
	</Widget>
</template>

<script lang="ts">
	import { Component } from 'vue-property-decorator';
	import { mixins } from 'vue-class-component';
	import {
		headersTransactionsHistory,
		headersAddressesHistory,
		headersMyDealsHistory
	} from '@/config/configHistoryTable';
	import { csvGenerator, getFullDate, getDate, getTime, ellipsisString } from '@/utils/utils';
	import TableDirectionIcon from '@/components/TableComponents/MyDealsComponents/TableDirectionIcon.vue';
	import TablePairCurrencyMyDeal from '@/components/TableComponents/MyDealsComponents/TablePairCurrencyMyDeal.vue';
	import TablePaymentMethods from '@/components/TableComponents/MyDealsComponents/TablePaymentMethods.vue';
	import TableDealInfo from '@/components/TableComponents/MyDealsComponents/TableDealInfo.vue';
	import TableDealsStatus from '@/components/TableComponents/MyDealsComponents/TableDealsStatus.vue';
	import HistoryTableXS from '@/components/HistoryTable/TableXS.vue';
	import AddressesInfoModal from '@/components/HistoryTable/Addresses/AddressesInfoModal.vue';
	import TransactionsIOModal from '@/components/HistoryTable/Transactions/TransactionsIOModal.vue';
	import TransactionConversionModal from '@/components/HistoryTable/Transactions/TransactionConversionModal.vue';
	import TransactionsStakingModal from '@/components/HistoryTable/Transactions/TransactionsStakingModal.vue';
	import TransactionsReferralModal from '@/components/HistoryTable/Transactions/TransactionsReferralModal.vue';
	import TransactionsP2pModal from '@/components/HistoryTable/Transactions/TransactionsP2pModal.vue';
	import TransactionsFilterModal from '@/components/HistoryTable/Transactions/TransactionsFilterModal.vue';
	import AddressesFilterModal from '@/components/HistoryTable/Addresses/AddressesFilterModal.vue';
	import ConfirmModal from '@/views/ModalViews/ConfirmModal.vue';
	import CancelWithdrawalModal from '@/views/ModalViews/CancelWithdrawalModal.vue';
	import CurrencyQuickFilter from '@/components/ModalComponents/CurrencyQuickFilter.vue';
	import EventQuickFilter from '@/components/ModalComponents/EventQuickFilter.vue';
	import CurrencyIcons from '@/components/HistoryTable/common/CurrencyIcons.vue';
	import { formatNumberAndFixedDecimals } from '@/utils/utils';
	import {
		HISTORY_TABLE_LIMIT,
		HISTORY_TABLE_TYPE,
		positiveNegativecolorVariables,
		statusColorVariables,
		OperationType,
		OperationSide,
		OperationTypeFilter,
		FormType,
		FlowType,
		TransactionsFilterData,
		AddressesFilterData,
		SCREENSIZE
	} from '@/const';
	import EmptyTableScreen from '@/components/HistoryTable/common/EmptyTableScreen.vue';
	import HeaderView from '@/views/HeaderView.vue';
	import BalanceAddressesFilter from '@/mixins/balanceAddressesFilter';
	import DownloadHistory from '@/components/ModalComponents/DownloadHistory.vue';
	import FormatNumberDecimals from '@/mixins/formatNumberDecimals';

	@Component({
		components: {
			DownloadHistory,
			EmptyTableScreen,
			HeaderView,
			TableDirectionIcon,
			TablePairCurrencyMyDeal,
			TablePaymentMethods,
			TableDealInfo,
			TableDealsStatus,
			HistoryTableXS,
			AddressesInfoModal,
			TransactionsIOModal,
			TransactionConversionModal,
			TransactionsStakingModal,
			TransactionsReferralModal,
			TransactionsP2pModal,
			TransactionsFilterModal,
			AddressesFilterModal,
			ConfirmModal,
			CancelWithdrawalModal,
			CurrencyQuickFilter,
			EventQuickFilter,
			CurrencyIcons
		}
	})
	export default class HistoryView extends mixins(BalanceAddressesFilter, FormatNumberDecimals) {
		protected HISTORY_TABLE_LIMIT = HISTORY_TABLE_LIMIT;

		protected statusColorVariables = statusColorVariables;

		protected readonly colorVariables = positiveNegativecolorVariables;

		protected isP2PLoadRaport = false;

		protected isLoading = false;

		protected readonly xsLoadIconVars = [
			{
				name: 'size',
				type: 'number',
				defaultValue: '20'
			}
		];

		protected readonly iconVariables = [
			{
				name: 'repeatIcon',
				type: 'icon',
				defaultValue: 'system.repeat'
			}
		];

		protected mounted(): void {
			if (this.isTransactionHistory) {
				this.initTransactionsFilter();
			} else {
				this.initAddressesFilter();
			}
		}

		protected get isTableNotEmpty(): boolean {
			return (
				(this.isTransactionHistory && (Boolean(this.operations?.length) || this.operationsLoading)) ||
				(this.isAddressesHistory && (Boolean(this.addresses?.length) || this.addressesLoading))
			);
		}

		protected get isFilteredTable(): boolean {
			return (
				(this.isTransactionHistory && this.isTransactionsFiltered) ||
				(this.isAddressesHistory && this.isAddressesFiltered)
			);
		}

		protected get tableKey(): string {
			if (!this.operationsLoading && this.isTransactionHistory) {
				if (this.operations.length) {
					return 'TransactionHistoryTable';
				}
				return 'TransactionHistoryTableNoData';
			}
			if (!this.operationsLoading && this.isTransactionHistory) {
				if (this.addresses.length) {
					return 'TransactionAddressTable';
				}
				return 'TransactionAddressTableNoData';
			}
			if (!this.dealsLoading && this.isDealsHistory) {
				if (this.myDeals.length) {
					return 'TransactionDealsTable';
				}
				return 'TransactionDealsTableNoData';
			}
			return 'TransactionLoading';
		}

		protected get operations(): any {
			return this.historyStore.getOperations;
		}

		protected get operationsFrozen(): HISTORY.Transaction[] {
			return this.historyStore.getOperationsFrozen;
		}

		protected get addresses(): any {
			return this.historyStore.formattedAddressList;
		}

		protected get basicAddressList(): Array<HISTORY.Address> {
			return this.historyStore.basicAddressList;
		}

		protected checkBasicAddress(address: string): boolean {
			const basicAddress = this.basicAddressList.find((item: HISTORY.Address) => item.address === address);
			return !!basicAddress;
		}

		protected get myDeals(): any {
			return this.historyStore.myDeals;
		}

		protected get activeForm(): string {
			return this.walletsStore.activeForm;
		}

		protected get activeCurrency(): string | undefined {
			return this.walletsStore.getActiveWallet?.currencyTitle;
		}

		protected get currentLocale(): string {
			return this.$store.state.translator.currentLocale;
		}

		protected get currentCustomerName(): string {
			return this.$store.state.auth.authenticatedUser?.userName;
		}

		protected get isDealsHistory(): boolean {
			return this.historyType === HISTORY_TABLE_TYPE.DEALS;
		}

		protected get csvName(): string {
			switch (true) {
				case this.isTransactionHistory:
					return 'Operations_list';
				case this.isAddressesHistory:
					return 'Addresses_list';
				case this.isDealsHistory:
					return 'Deals_list';
				default:
					return 'List';
			}
		}

		protected get csvDataGetter(): () => Promise<string[]> {
			switch (true) {
				case this.isTransactionHistory:
					return this.loadOperationsRaport;
				case this.isAddressesHistory:
					return this.loadAddressesRaport;
				case this.isDealsHistory:
					return this.loadDealsRaport;
				default:
					return async (): Promise<string[]> => [];
			}
		}

		protected get isTransactionsFiltered(): boolean {
			return this.historyStore.isTransactionsFiltered;
		}

		protected get isAddressesFiltered(): boolean {
			return this.historyStore.isAddressesFiltered;
		}

		protected get transactionsHeaders(): Array<any> {
			return (headersTransactionsHistory as Array<any>).map((item) => {
				return { ...item, text: item.text ? this.$t(`balance.${item.text}`) : '' };
			});
		}

		protected get addressesHeaders(): Array<any> {
			return (headersAddressesHistory as Array<any>).map((item) => {
				return { ...item, text: item.text ? this.$t(`balance.${item.text}`) : '' };
			});
		}

		protected get myDealsHeaders(): Array<any> {
			return (headersMyDealsHistory as Array<any>).map((item) => {
				return { ...item, text: item.text ? this.$t(`balance.${item.text}`) : '' };
			});
		}

		protected get currentPage(): any {
			return this.historyStore.currentPage;
		}

		protected get totalOperations(): any {
			return this.historyStore.totalOperations;
		}

		protected get operationsLoading(): boolean {
			return this.historyStore.operationsLoading;
		}

		protected get totalAddresses(): any {
			return this.historyStore.totalAddresses;
		}

		protected get addressesLoading(): boolean {
			return this.historyStore.addressesLoading;
		}

		protected get totalDeals(): any {
			return this.historyStore.totalDeals;
		}

		protected get dealsLoading(): boolean {
			return this.historyStore.dealsLoading;
		}

		protected get transactionsCurrencyValue(): number | null {
			return this.historyStore.transactionsFilterData.currencyId;
		}

		protected get addressesCurrencyValue(): number | null {
			return this.historyStore.addressesFilterData.currencyId;
		}

		protected get transactionsEventValue(): OperationTypeFilter | null {
			return this.historyStore.transactionsFilterData.operationType;
		}

		protected get goToBalanceObject(): any {
			if (!this.walletsStore.seamlessIntegrationEnabled || this.walletsStore.seamlessStepsEnabled) {
				return {
					name: 'balance-activeForm',
					params: { activeForm: this.activeForm, currency: this.activeCurrency }
				};
			}

			const newRouteName = this.activeForm === FormType.DEPOSIT ? 'balance-get-form' : 'balance-transfer-form';
			return { name: newRouteName, params: { activeForm: this.activeForm, currency: this.activeCurrency } };
		}

		public getAmount(item: HISTORY.Transaction): number | string {
			return this.historyStore.getAmountTransaction(item, this.getFormatNumberAndFixedDecimals);
		}

		public getAmountChange(item: HISTORY.Transaction | undefined): string | number {
			return this.historyStore.getAmountTransactionChange(item, this.getFormatNumberAndFixedDecimals);
		}

		protected setActiveFlow(): void {
			const flowName = this.activeForm === FormType.DEPOSIT ? FlowType.GET : FlowType.BUY;
			this.walletsStore.setActiveFlow(flowName);
		}

		public async activated(): Promise<void> {
			this.queryParams();
			this.setOperations();
			this.setAddresses();
		}

		public setOperations(): void {
			this.historyStore.setOperations();
		}

		public async setOperationsFrozen(): Promise<void> {
			await this.historyStore.setOperationsFrozen();
		}

		public async setAddresses(): Promise<void> {
			await this.historyStore.setAddresses();
		}

		protected mapBackgroundsFromString(backgroundListString: string): string[] {
			return backgroundListString.split(',').map((background) => background.trim());
		}

		public currencyInputHandler(value: number): void {
			let currencyId: keyof HISTORY.TransactionsFilter | keyof HISTORY.AddressesFilter =
				TransactionsFilterData.CurrencyId;
			if (this.isTransactionHistory) {
				this.historyStore.setTransactionsFilterValue(currencyId, value);
				this.historyStore.setOperations();
			}
			if (this.isAddressesHistory) {
				currencyId = AddressesFilterData.CurrencyId;
				this.historyStore.setAddressesFilterValue(currencyId, value);
				this.historyStore.setAddresses();
			}
			this.setRouteQuery(currencyId, value);
		}

		public p2pCurrencyIconNameById(id: number): string {
			return this.historyStore.p2pCurrencyIconNameById(id);
		}

		public isTransaction(operationType: number): boolean {
			return operationType === OperationType.Transaction;
		}

		public isP2P(operationType: number): boolean {
			return operationType === OperationType.P2P;
		}

		public isTransactionIn(side: OperationSide): boolean {
			return side === OperationSide.In;
		}

		public currencyIconNameById(currencyId: number): string {
			return this.walletsStore.currencyIconNameById(currencyId);
		}

		protected ellipsisString(value: string): string {
			return ellipsisString({ value, ellipsisLength: 10, replacement: '***' });
		}

		protected tabChangeHandler(name: string): void {
			this.paginationChange(1);
			this.historyStore.currentHistory = name;
		}

		protected loadMore(page: number): void {
			if (this.currentPage !== page) {
				this.historyStore.setCurrentPage(page);
				const offset = HISTORY_TABLE_LIMIT * (page - 1);

				switch (this.historyType) {
					case HISTORY_TABLE_TYPE.ADDRESSES:
						this.historyStore.setAddressesXS(offset);
						break;
					case HISTORY_TABLE_TYPE.DEALS:
						this.historyStore.setMyDeals(offset);
						break;
					case HISTORY_TABLE_TYPE.TRANSACTIONS:
					default:
						this.historyStore.setOperationsXS(offset);
						break;
				}
			}
		}

		protected paginationChange(page: number): void {
			if (this.currentPage !== page) {
				this.historyStore.setCurrentPage(page);
				const offset = HISTORY_TABLE_LIMIT * (page - 1);

				switch (this.historyType) {
					case HISTORY_TABLE_TYPE.ADDRESSES:
						this.historyStore.setAddresses(offset);
						break;
					case HISTORY_TABLE_TYPE.DEALS:
						this.historyStore.setMyDeals(offset);
						break;
					case HISTORY_TABLE_TYPE.TRANSACTIONS:
					default:
						this.historyStore.setOperations(offset);
						break;
				}
			}
		}

		protected formatNumberAndFixedDecimals(value: number, decimals: number): string {
			return formatNumberAndFixedDecimals(value, this.currentLocale, decimals);
		}

		protected getCurrencyIconStyle(index: number, iconsListLength: number): string {
			const startColumn = 1 + index * 13;
			const endColumn = startColumn + 16;
			return `grid-area: 1 / ${startColumn} / 2 / ${endColumn}; z-index: ${iconsListLength - index};`;
		}

		protected getDate(val: string): string {
			return getDate(val, this.currentLocale);
		}

		protected getTime(val: string): string {
			return getTime(val, this.currentLocale);
		}

		protected getCurrencyNameById(id: number): string {
			return this.walletsStore.currencyNameById(id);
		}

		protected pad(val: number): any {
			return val < 10 ? '0' + val : val;
		}

		protected createOffset(date: Date): string {
			const sign = date.getTimezoneOffset() > 0 ? '-' : '+';
			const offset = Math.abs(date.getTimezoneOffset());
			const hours = this.pad(Math.floor(offset / 60));
			const minutes = this.pad(offset % 60);
			return sign + hours + ':' + minutes;
		}

		protected async loadOperationsRaport(): Promise<string[]> {
			let intermedaiteCsvData = await this.historyStore.loadOperationsRaport();
			if (!this.isP2PLoadRaport)
				intermedaiteCsvData = intermedaiteCsvData.filter(
					(operation: HISTORY.Operation) => operation.operationType !== OperationType.P2P
				);

			const csvData = intermedaiteCsvData.map((el: any) => [
				getFullDate(el.dateCreated, this.currentLocale) + ' UTC' + this.createOffset(new Date(el.dateCreated)),
				this.getCurrencyNameById(el.currencyId),
				el.currencyTitle,
				el.method,
				el.id,
				this.$t(`balance.operationType-${el.operationType}`),
				el.transactionData ? el.transactionData.cryptoTxId : '',
				el.transactionData ? el.transactionData.destination : '',
				el.transactionData ? this.$t(`balance.codeStatus-${el.transactionData.transactionStatus}`) : '',
				`${Boolean(el.side) ? '-' : '+'}${el.amount}`,
				el.transactionData ? el.transactionData.details : '',
				el.transactionData ? el.transactionData.comment : ''
			]);
			csvData.unshift([
				`${this.$t('balance.date')}:`,
				`${this.$t('balance.currencyTitle')}:`,
				`${this.$t('balance.codeCurrency')}:`,
				`${this.$t('balance.blockchainText')}:`,
				`${this.$t('balance.id')}:`,
				`${this.$t('balance.type')}:`,
				`${this.$t('balance.modalTxIdTitle')}:`,
				`${this.$t('balance.recipient')}:`,
				`${this.$t('balance.status')}:`,
				`${this.$t('balance.sumText')}:`,
				`${this.$t('balance.modalDetailsTitle')}:`,
				`${this.$t('balance.blockchainComment')}`
			]);

			return csvData;
		}

		protected async loadAddressesRaport(): Promise<string[]> {
			const intermedaiteCsvData = await this.historyStore.loadAddressesRaport();

			const csvData = intermedaiteCsvData.map((el: any) => [
				getFullDate(el.dateCreated, this.currentLocale) + ' UTC' + this.createOffset(new Date(el.dateCreated)),
				el.network,
				el.address,
				el.tag,
				this.getCurrencyNameById(el.currencyId) || el.currencyTitle,
				el.transactionsCount,
				el.notPinned ? this.$t('balance.basic') : this.$t('balance.pinned')
			]);
			csvData.unshift([
				`${this.$t('balance.dateAndTime')}:`,
				`${this.$t('balance.network')}:`,
				`${this.$t('balance.address')}:`,
				`${this.$t('balance.memo')}:`,
				`${this.$t('balance.usedForCurrencies')}:`,
				`${this.$t('balance.operations')}:`,
				`${this.$t('balance.status')}:`
			]);

			return csvData;
		}

		protected async loadDealsRaport(): Promise<string[]> {
			return await [];
		}

		protected showDownloadHistoryModal(): void {
			this.historyStore.setDownloadHistoryModal(true);
		}

		protected async loadRaport(isP2P: boolean = false): Promise<void> {
			this.isLoading = true;
			this.isP2PLoadRaport = isP2P;
			const d = new Date();
			const time = `${`0${d.getDate()}`.slice(-2)}.${`0${d.getMonth() + 1}`.slice(-2)}.${`0${d.getFullYear()}`.slice(
				-2
			)}-${`0${d.getHours()}`.slice(-2)}:${`0${d.getMinutes()}`.slice(-2)}`;

			const csvData = await this.csvDataGetter();

			csvGenerator({
				dataArrayInit: csvData,
				fileName: `${this.csvName}-${time}.csv`,
				separatorInit: ';',
				addQuotes: true,
				removeAfterDownload: true
			});
			this.isLoading = false;
		}

		protected showTransactionsModal(item: HISTORY.Transaction): void {
			this.historyStore.showTransactionsModal(item);
		}

		protected showAddressesModal(item: HISTORY.Address): void {
			this.historyStore.showAddressesModal(item);
		}

		protected showFilters(): void {
			if (this.isTransactionHistory) {
				this.historyStore.showTransactionsFiltersModal(true);
			}
			if (this.isAddressesHistory) {
				this.historyStore.showAddressesFiltersModal(true);
			}
		}

		protected isWithdrawal(item: HISTORY.Transaction): boolean {
			return item.operationType === OperationType.Transaction && item.side === OperationSide.Out;
		}

		protected repeatTransaction(item: HISTORY.Transaction): void {
			this.historyStore.showTransactionsIOModal(false);
			this.walletsStore.setRepeatTransactionData(item);

			this.$router.push({
				name: this.walletsStore.seamlessIntegrationEnabled ? 'balance-transfer-form' : 'balance-activeForm',
				params: {
					currency: item.currencyTitle,
					activeForm: 'withdrawal'
				}
			});
		}

		readonly addressesHeaderProps: COMMON.IMap<any> = {
			'sort-icon': 'expand-close-gray'
		};

		protected get addressesOptions(): COMMON.IMap<any> {
			return {
				sortBy: [this.historyStore.addressesSortData.sort],
				sortDesc: [this.historyStore.addressesSortData.sortDesc],
				mustSort: true
			};
		}

		protected addressesUpdateSortBy(sortBy: string[]): void {
			this.historyStore.setAddressesSortValue('sort', sortBy[0]);
			this.historyStore.setAddresses();
		}

		protected addressesUpdateSortDesc(sortDesc: boolean[]): void {
			this.historyStore.setAddressesSortValue('sortDesc', sortDesc[0]);
			this.historyStore.setAddresses();
		}

		protected getBooleanValueFromString(value: string): boolean {
			return value === 'true';
		}

		protected async queryParams(): Promise<void> {
			if (this.$route.query.frozen) {
				await this.openTransactionsFrozen();
			}
		}

		protected async openTransactionsFrozen(): Promise<void> {
			const frozenId = this.$route.query.frozen;
			this.historyStore.transactionsFilterData.currencyId = Number(frozenId);
			await this.setOperationsFrozen();
			const transactionFrozen = this.operationsFrozen.find(
				(item: HISTORY.Transaction) => String(item.currencyId) === frozenId
			);
			if (transactionFrozen) {
				this.showTransactionsModal(transactionFrozen);
				this.historyStore.transactionsModalData = transactionFrozen;
			}
		}

		protected getTextStatus(item: HISTORY.Transaction): string {
			if (item.transactionData) {
				return this.$t(`balance.codeStatus-${item.transactionData.transactionStatus}`);
			} else if (this.isP2P(item.operationType)) {
				return item.frozen ? this.$t('balance.pending') : this.$t('balance.codeStatus-2');
			} else if (!this.isTransaction(item.operationType)) {
				return this.$t('balance.codeStatus-2');
			}
			return '';
		}

		protected getColorStatus(item: HISTORY.Transaction, codeStatus: string[]): string {
			if (item.transactionData) {
				return codeStatus[item.transactionData.transactionStatus];
			} else if (this.isP2P(item.operationType)) {
				return item.frozen ? codeStatus[5] : codeStatus[2];
			} else if (!this.isTransaction(item.operationType)) {
				return codeStatus[2];
			}
			return 'inherit';
		}

		protected get currentScreenSize(): string {
			return this.$store.state.appLayout.screenSize;
		}

		protected get paginationTotalAmount(): number {
			return this.currentScreenSize === SCREENSIZE.XS ? 5 : 7;
		}

		protected tabsVariables = [
			{ name: 'hideSliderValue', type: 'string', defaultValue: 'false' },
			{
				name: 'enabledTabStyles',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'disabledTabStyles',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'tabsGroupBackground',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'tabsHeight',
				type: 'string',
				defaultValue: '40'
			}
		];

		protected tableVariables = [
			{
				name: 'paginationPrevIcon',
				type: 'string',
				defaultValue: 'arrow-left'
			},
			{
				name: 'paginationNextIcon',
				type: 'string',
				defaultValue: 'arrow-right'
			},
			{
				name: 'firstHeaderCellStyle',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'firstRowCellStyle',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'lastHeaderCellStyle',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'statusHeaderCellStyle',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'statusAddressesHeaderCellStyle',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'lastRowCellStyle',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'commonHeaderCellStyle',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'headerRowStyle',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'backgroundColorList',
				type: 'string',
				defaultValue: ''
			},
			{
				name: 'colorActivePage',
				type: 'string',
				defaultValue: 'var(--controls-secondary-2)'
			}
		];

		protected backButtonVariables = [
			{
				name: 'iconSpecialSize',
				type: 'string',
				defaultValue: '12'
			}
		];
	}
</script>
