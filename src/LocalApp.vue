<template>
	<AppView
		widgetName="$app-widget"
		data-app="true"
	>
		<template #default="{ gridItem }">
			<Widget
				name="$app-widget"
				:gridItem="gridItem"
			>
				<template #viewport="{ gridItem }">
					<App id="attach_modal_balance" :gridItem="gridItem" />
				</template>
			</Widget>
		</template>
	</appview>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component } from 'vue-property-decorator';
	import App from './App.vue';

	@Component({
		components: {
			App
		}
	})
	export default class LocalApp extends Vue {
		//
	}
</script>
