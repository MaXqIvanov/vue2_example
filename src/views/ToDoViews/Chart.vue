<template>
	<k-card :style="{ marginBottom: '2rem' }" v-on="$listeners">
		<div>График</div>
	</k-card>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component } from 'vue-property-decorator';

	@Component
	export default class Chart extends Vue {}
</script>
