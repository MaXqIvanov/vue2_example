<template>
	<Widget :name="menuNameWidget">
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="menu"
		>
			<KMenu v-bind="computedAttrs">
				<template #activator="{ on, attrs }">
					<Widget :name="activatorNameWidget">
						<WidgetItem
							v-slot="{ computedAttrs }"
							name="activator"
						>
							<KBtn
								v-bind="{ ...computedAttrs, ...attrs }"
								v-on="on"
							>
								{{ activatorText }}
							</KBtn>
						</WidgetItem>
					</Widget>
				</template>
				<Widget :name="listNameWidget">
					<WidgetItem
						v-slot="{ computedAttrs }"
						name="list"
					>
						<KCard v-bind="computedAttrs">
							<template
								v-for="item in items"
							>
								<div :key="itemValue(item)">
									<slot
										name="item"
										:item="item"
									/>
								</div>
							</template>
						</KCard>
					</WidgetItem>
				</Widget>
			</KMenu>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';

	@Component({
		name: 'QuickFilterComponent'
	})
	export default class QuickFilterComponent extends Vue {
		@Prop({ default: 'balance-quick-filter-menu-component' }) menuNameWidget!: string;
		@Prop({ default: 'balance-quick-filter-activator-component' }) activatorNameWidget!: string;
		@Prop({ default: 'balance-quick-filter-list-component' }) listNameWidget!: string;
		@Prop({ default: '' }) title!: string;
		@Prop({ default: () => [] }) items!: any[];
		@Prop({ default: '' }) defaultValue!: any;
		@Prop({ default: false }) multiple!: boolean;
		@Prop({ default: false }) filter!: boolean;
		@Prop({ required: true }) filterFunction!: any;
		@Prop({ required: true }) itemValue!: any;
		@Prop({ required: true }) itemText!: any;

		protected get selected(): any {
			return;
		}

		protected get activatorText(): string {
			return this.title;
		}

		protected iconVariables = [
			{
				name: 'iconName',
				type: 'icon',
				defaultValue: 'share'
			}
		];
	}
</script>
