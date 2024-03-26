<template>
	<Widget name="balance-actions-seamless-steps-first">
		<WidgetItem v-slot="{ computedAttrs }" name="search">
			<KTextField
				v-model="search"
				v-bind="computedAttrs"
				hideDetails
				backgroundColor="var(--card-bg-secondary)"
				style="--special-size: 16px; --input-icon-height: 16px; --input-icon-min-width: 16px; --input-icon-width: 16px"
				@input="$emit('search-handle-input', $event)"
				@blur="$emit('search-handle-blur', $event)"
				@click:clear="$emit('search-handle-input', '')"
			>
				<template #label>
					<Widget name="balance-text-body-2-regular">
						<WidgetItem v-slot="{ computedAttrs }" name="text">
							<KText v-bind="computedAttrs" style="color: var(--text-secondary)">
								{{ searchBalanceTitle }}
							</KText>
						</WidgetItem>
					</Widget>
				</template>
			</KTextField>
		</WidgetItem>

		<WidgetItem
			v-if="Object.keys(needToShowRecord).length"
			v-slot="{ computedAttrs }"
			name="transport-list"
		>
			<template v-for="(method, methodKey) in methods">
				<Widget
					v-if="needToShowRecord[methodKey]"
					:key="'step-first-transport-type' + methodKey"
					v-bind="computedAttrs"
					name="balance-actions-seamless-step-first-transport-type"
				>
					<WidgetItem v-slot="{ computedAttrs }" name="title">
						<KText v-bind="computedAttrs">
							{{ $t(`balance.${methodKey}Text`) }}
						</KText>
					</WidgetItem>

					<WidgetItem v-slot="{ computedAttrs }" name="list">
						<template v-for="transport in method">
							<KCard
								v-show="!search || needToShowRecord[methodKey][transport.name]"
								:key="transport.name + 'transport-item'"
								v-bind="computedAttrs"
								style="--card-sheet-border-radius: 0;"
								@click="setComputedMethod(methodKey, transport)"
							>
								<FormTransportSelectItem
									:transportIconName="transport.iconName"
									:transportName="transport.name"
									:transportTitle="transport.title"
									style="padding: 0 8px"
								/>
							</KCard>
						</template>
					</WidgetItem>
				</widget>
			</template>
		</WidgetItem>

		<WidgetItem
			v-else
			key="seamless-step-first-card-list-empty"
			name="no-data"
		>
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
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import FormTransportSelectItem from '@/components/FormComponents/FormTransportSelectItem.vue';

	@Component({
		components: { FormTransportSelectItem }
	})
	export default class FormFirstStepSelect extends Vue {
		@Prop({ required: true })
		protected methods!: any;
		@Prop({ required: true })
		protected isDepositForm!: boolean;

		protected search: string = '';

		protected get needToShowRecord(): any {
			return Object.keys(this.methods).reduce((acc, methodKey) => {
				const included = this.methods[methodKey].reduce((acc2: any, transport: any) => {
					const intermediate =
						transport?.name.toLocaleLowerCase().includes(this.search.toLocaleLowerCase()) ||
						this.search.toLocaleLowerCase().includes(transport?.name.toLocaleLowerCase()) ||
						(transport?.title
							? transport?.title.toLocaleLowerCase().includes(this.search.toLocaleLowerCase()) ||
							  this.search.toLocaleLowerCase().includes(transport?.title.toLocaleLowerCase())
							: false);
					if (intermediate) acc2[transport.name] = intermediate;

					return acc2;
				}, {});
				if (Object.keys(included).length > 0) acc[methodKey] = included;

				return acc;
			}, {} as COMMON.IMap<any>);
		}

		public get searchBalanceTitle(): string {
			return this.isDepositForm
				? this.$t('balance.chooseRechargeMethod')
				: this.$t('balance.chooseRechargeMethodOutput');
		}

		protected setComputedMethod(
			methodKey: string,
			transport: WALLETS.DepositTransactionMethod | HISTORY.Currencies
		): void {
			this.$emit('setMethod', methodKey, transport);
		}
	}
</script>
