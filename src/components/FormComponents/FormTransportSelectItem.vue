<template>
	<Widget name="balance-actions-transport-list-item">
		<WidgetItem v-slot="{ computedAttrs }" name="transport-icon">
			<KIcon
				v-bind="computedAttrs"
				:name="transportIconName"
			/>
		</WidgetItem>

		<WidgetItem v-slot="{ computedAttrs }" name="transport-name">
			<KText v-bind="computedAttrs">
				{{ transportTitle ? transportTitle : transportName }}
			</KText>
		</WidgetItem>

		<WidgetItem
			v-if="Boolean(transportTitle)"
			:key="'transport-title' + transportTitle"
			v-slot="{ computedAttrs }"
			name="transport-title"
		>
			<KText v-bind="computedAttrs">
				{{ transportName }}
			</KText>
		</WidgetItem>

		<WidgetItem v-slot="{ computedAttrs }" name="next-icon">
			<KIcon v-bind="computedAttrs" />
		</WidgetItem>
	</Widget>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component, Prop } from 'vue-property-decorator';

	@Component
	export default class FormTransportSelectItem extends Vue {
		@Prop({ required: true })
		protected transportIconName!: string;
		@Prop({ required: true })
		protected transportName!: string;
		@Prop({ default: '' })
		protected transportTitle?: string;
	}
</script>
