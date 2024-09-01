<script>
	// @ts-nocheck

	import PDFViewer from '$lib/components/PDFViewer.svelte';
	import { AppBar } from '@skeletonlabs/skeleton';
	import { viewerGoBack, viewerTitle } from '$lib/stores';
	import { onMount } from 'svelte';

	let title = null;
	let pageNumber = null;
	let query = null;

	onMount(() => {
		const url = new URL(window.location.href);
		title = url.searchParams.get('title');
		pageNumber = url.searchParams.get('page');
		query = url.searchParams.get('query');
		$viewerGoBack = url.searchParams.get('goBack');
		$viewerTitle = title;
	});
</script>

<svelte:head>
	<title>Polysearch ECN</title>
	<meta
		name="description"
		content="Moteur de recherche pour les séries des cycles de préparation de l'examen classant national (ECN/résidanat)"
	/>
</svelte:head>

{#if title !== null && pageNumber !== null && query !== null}
	<PDFViewer {title} {pageNumber} {query} />
{:else}
	<p class="text-center">Une Erreur est survenue (╯°□°）╯︵ ┻━┻</p>
{/if}
