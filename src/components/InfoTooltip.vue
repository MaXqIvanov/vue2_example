<template>
	<Widget :name="nameWidget">
		<WidgetItem
			v-slot="{ computedAttrs }"
			name="tooltip"
		>
			<KTooltip
				v-bind="computedAttrs"
				style="z-index: 15;"
			>
				<template #activator="{ on, attrs }">
					<Widget :name="nameWidget + '-icon'">
						<WidgetItem
							v-slot="{ computedAttrs, iconNameVar }"
							name="info-icon"
							:contentVariables="variables"
						>
							<KIcon
								:name="iconName || iconNameVar"
								v-bind="{ ...attrs, ...computedAttrs }"
								:style="iconColor ? `--icon-color: ${iconColor}` : ''"
								v-on="on"
								@click.stop.prevent
							/>
						</WidgetItem>
					</Widget>
				</template>
				<slot>
					{{ text }}
				</slot>
			</KTooltip>
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';

	@Component({
		name: 'InfoTooltip'
	})
	export default class InfoTooltip extends Vue {
		@Prop({ default: '' }) text?: string;
		@Prop({ default: 'balance-info-tooltip' }) nameWidget!: string;
		@Prop({ default: '' }) iconName!: string;
		@Prop({ default: '' }) iconColor!: string;

		protected variables = [
			{
				name: 'iconNameVar',
				type: 'icon',
				defaultValue: 'info'
			},
			{
				name: 'tooltipColor',
				type: 'string',
				defaultValue: 'var(--tertiary-darken)'
			}
		];
	}
</script>
<style></style>
