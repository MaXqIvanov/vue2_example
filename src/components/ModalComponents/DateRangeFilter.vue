<template>
	<Widget :name="menuNameWidget">
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="menu"
		>
			<KMenu
				v-model="isShow"
				v-bind="computedAttrs"
			>
				<template #activator="{ on, attrs }">
					<Widget :name="activatorNameWidget">
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="input"
						>
							<span v-on="on">
								<KTextField
									v-bind="{ ...computedAttrs, ...attrs }"
									:value="computedValue"
									readonly
									:label="title"
								/>
							</span>
						</WidgetItem>
					</Widget>
				</template>
				<Widget :name="pickerNameWidget">
					<WidgetItem
						v-slot="{ computedAttrs }"
						name="picker"
					>
						<KDatePicker
							v-model="model"
							v-bind="computedAttrs"
							range
							noTitle
							:locale="getFormattedLocale"
							:max="getTodayDate"
						/>
					</WidgetItem>
				</Widget>
			</KMenu>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';
	import { getDateFullShort } from '@/utils/utils';

	enum LocaleCompatability {
		ru = 'ru-RU',
		en = 'en-GB'
	}

	@Component({
		name: 'ModalDateRangeFilterComponent'
	})
	export default class ModalDateRangeFilterComponent extends Vue {
		@Prop({ default: 'balance-modal-date-range-filter-menu-component' }) menuNameWidget!: string;
		@Prop({ default: 'balance-modal-date-range-filter-component' }) activatorNameWidget!: string;
		@Prop({ default: 'balance-modal-date-range-filter-picker-component' }) pickerNameWidget!: string;
		@Prop({ default: '' }) title!: string;
		@Prop({ default: '' }) fromValue!: string;
		@Prop({ default: '' }) toValue!: string;
		@Prop({ default: '' }) locale!: string;

		protected get model(): Array<string> {
			if (this.fromValue) {
				if (this.toValue) {
					return new Date(this.fromValue) < new Date(this.toValue)
						? [this.fromValue, this.toValue]
						: [this.toValue, this.fromValue];
				}
				return [this.fromValue];
			}
			return [];
		}
		protected set model(value) {
			const result =
				value.length > 1
					? new Date(value[0]) < new Date(value[1])
						? [value[0], value[1]]
						: [value[1], value[0]]
					: value;

			this.$emit('input', result);
			if (value.length > 1) {
				this.isShow = false;
			}
		}

		protected get getFormattedLocale(): string {
			return LocaleCompatability[this.locale as unknown as keyof typeof LocaleCompatability];
		}

		protected isShow: boolean = false;

		protected get currentLocale(): string {
			return this.$store.state.translator.currentLocale;
		}

		protected get computedValue(): string {
			return this.model.map((e: string) => getDateFullShort(e, this.currentLocale)).join(' — ');
		}

		protected get getTodayDate(): string {
			return new Date().toISOString().slice(0, 10);
		}
	}
</script>
