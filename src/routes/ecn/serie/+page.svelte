<script>
	// @ts-nocheck

	import SerieViewer from '$lib/components/serieViewer.svelte';
	import { page } from '$app/stores';
	import { viewerGoBack } from '$lib/stores';
	import { onMount } from 'svelte';

	let cours = null;
	let serie = null;
	let id = null;

	$viewerGoBack = '/ecn/seriesearch';

	onMount(() => {
		const url = new URL(window.location.href);
		cours = url.searchParams.get('cours');
		serie = url.searchParams.get('serie');
		const parsedId = url.searchParams.get('id');
		id = parsedId ? parseInt(parsedId, 10) : null;
	});
</script>

<svelte:head>
	<title>Sériesearch</title>
	<meta
		name="description"
		content="Moteur de recherche pour les séries des cycles de préparation de l'examen classant national (ECN/résidanat)"
	/>
</svelte:head>

{#if cours !== null && serie !== null && id !== null}
	<SerieViewer {serie} {cours} {id} />
{:else}
	<p class="text-center">Une Erreur est survenue (╯°□°）╯︵ ┻━┻</p>
{/if}
