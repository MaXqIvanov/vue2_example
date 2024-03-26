<template>
	<k-sheet v-on="$listeners">
		<span>Часто используемые</span>
	</k-sheet>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { Component } from 'vue-property-decorator';

	@Component
	export default class Balance extends Vue {}
</script>
