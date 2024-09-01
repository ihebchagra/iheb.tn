<script>
	import search from 'svelte-awesome/icons/search';
	import Icon from 'svelte-awesome';
	import { onMount } from 'svelte';
	import { ProgressBar } from '@skeletonlabs/skeleton';
	import MiniSearch from 'minisearch';
	import {
		polysearchEcnSearchValue,
		polysearchEcnSearchResults,
		polysearchEcnMinisearch
	} from '$lib/stores';
	import highlightKeywords from '$lib/highlightKeywords';

	/**@type {string}*/
	let messageElement = '';

	const runSearch = () => {
		if ($polysearchEcnSearchValue.length > 0) {
			$polysearchEcnSearchResults = $polysearchEcnMinisearch
				.search($polysearchEcnSearchValue)
				.slice(0, 20);
			if ($polysearchEcnSearchResults.length === 0) {
				messageElement = 'Aucun résultat trouvé (╯°□°）╯︵ ┻━┻';
			}
		} else {
				messageElement = 'Entrez un terme puis recherchez! ;)';
		}
	};

	/**@type {Object[]}*/
	let courscommuns = [];
	let isLoading = true;
	onMount(async () => {
		if ($polysearchEcnMinisearch == undefined) {
			try {
				const response = await import('$lib/courscommuns.json');

				courscommuns = response.default;
			} catch (error) {
				console.error('Failed to load JSON:', error);
			} finally {
				$polysearchEcnMinisearch = new MiniSearch({
					fields: ['title', 'page', 'content', 'id'],
					storeFields: ['title', 'page', 'content', 'id'],
					searchOptions: {
						boost: { title: 3 },
						fuzzy: 0.2,
						prefix: true
					}
				});
				$polysearchEcnMinisearch.addAll(courscommuns);
				isLoading = false;
			}
		} else {
			isLoading = false;
		}
	});
</script>

<div class="w-full space-y-8 px-4 py-8 grid">
	{#if isLoading}
		<p class="p-4 text-center">Chargement de Polysearch ECN</p>
		<ProgressBar value={undefined} meter="bg-secondary-500" track="bg-secondary-500/30" />
	{:else}
		<h1 class="h1 text-center">Polysearch ECN</h1>
		<p class="text-sm text-center">
			Moteur de recherche pour les objectifs de l'examen classant national (ECN/résidanat)
		</p>
		<div class="input-group input-group-divider grid-cols-[1fr_auto] xl:w-2/3 mx-auto">
			<input
				type="search"
				bind:value={$polysearchEcnSearchValue}
				on:keydown={(event) => {
					if (event.key === 'Enter') {
						runSearch();
					}
				}}
				placeholder="Rechercher les objectifs"
			/>
			<button class="variant-filled-secondary" on:click={runSearch}
				><Icon data={search}></Icon></button
			>
		</div>
		<div class="space-y-4 grid">
			{#if $polysearchEcnSearchResults.length > 0}
				{#each $polysearchEcnSearchResults as result}
					<a
						href={`/viewer?title=${result.title}&page=${result.page}&query=${$polysearchEcnSearchValue}&goBack=/ecn/polysearch`}
					>
						<div class="card text-left">
							<header class="card-header"><h3 class="h3">{result.title}</h3></header>
							<section class="p-4">{@html highlightKeywords(result.terms, result.content)}</section>
							<footer class="card-footer text-sm italic">Page {result.page}</footer>
						</div>
					</a>
				{/each}
			{:else}
				<p class="text-center">{@html messageElement}</p>
			{/if}
		</div>
	{/if}
</div>

<svelte:head>
	<title>Polysearch ECN</title>
	<meta
		name="description"
		content="Moteur de recherche pour les objectifs de l'examen classant national (ECN/résidanat)"
	/>
</svelte:head>
