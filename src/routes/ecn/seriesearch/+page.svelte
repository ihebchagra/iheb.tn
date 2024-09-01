<script>
	import search from 'svelte-awesome/icons/search';
	import Icon from 'svelte-awesome';
	import { onMount } from 'svelte';
	import { ProgressBar } from '@skeletonlabs/skeleton';
	import MiniSearch from 'minisearch';
	import {
		seriesearchSearchValue,
		seriesearchSearchResults,
		seriesearchMinisearch
	} from '$lib/stores';

	/**@type {string}*/
	let messageElement = '';

	const runSearch = () => {
		if ($seriesearchSearchValue.length > 0) {
			$seriesearchSearchResults = $seriesearchMinisearch
				.search($seriesearchSearchValue)
				.slice(0, 30);
			if ($seriesearchSearchResults.length === 0) {
				messageElement = 'Aucun résultat trouvé (╯°□°）╯︵ ┻━┻';
			}
		} else {
			messageElement = 'Entrez un terme puis recherchez! ;)';
		}
	};

	/**@type {Object[]}*/
	let questions = [];
	let isLoading = true;
	onMount(async () => {
		if ($seriesearchMinisearch == undefined) {
			try {
				const response = await import('$lib/questions.json');

				questions = response.default;
			} catch (error) {
				console.error('Failed to load JSON:', error);
			} finally {
				$seriesearchMinisearch = new MiniSearch({
					fields: ['questionString', 'title', 'cours'],
					storeFields: ['title', 'cours', 'questionJson', 'type'],
					searchOptions: {
						boost: { cours: 3, title: 2 },
						fuzzy: 0.2,
						prefix: true
					}
				});
				$seriesearchMinisearch.addAll(questions);
				isLoading = false;
			}
		} else {
			isLoading = false;
		}
	});
</script>

<svelte:head>
	<title>Sériesearch</title>
	<meta
		name="description"
		content="Moteur de recherche pour les séries des cycles de préparation de l'examen classant national (ECN/résidanat)"
	/>
</svelte:head>

<div class="w-full space-y-8 px-4 py-8 grid">
	{#if isLoading}
		<p class="p-4 text-center">Chargement de Sériesearch</p>
		<ProgressBar value={undefined} meter="bg-secondary-500" track="bg-secondary-500/30" />
	{:else}
		<h1 class="h1 text-center">Sériesearch</h1>
		<p class="text-sm text-center">
			Moteur de recherche pour le séries des cycles de préparation de l'examen classant national
			(ECN/résidanat)
		</p>
		<div class="input-group input-group-divider grid-cols-[1fr_auto] xl:w-2/3 mx-auto">
			<input
				type="search"
				bind:value={$seriesearchSearchValue}
				on:keydown={(event) => {
					if (event.key === 'Enter') {
						runSearch();
					}
				}}
				placeholder="Rechercher les séries"
			/>
			<button class="variant-filled-secondary" on:click={runSearch}
				><Icon data={search}></Icon></button
			>
		</div>
		<div class="space-y-4 grid">
			{#each $seriesearchSearchResults as result}
				<a href={`/ecn/serie?cours=${result.cours}&serie=${result.title}&id=${result.id}`}>
					<div class="card text-left">
						<header class="mb-4 card-header"><h3 class="h3">{result.cours}</h3></header>
						<section class="p-4 pt-0">
							{#each result.questionJson as question}
								<div class="mt-2">
									<div>{@html question.enonce}</div>
									{#each question.answers as answer}
										<div class="my-2" class:font-bold={answer.answer}>{@html answer.string}</div>
									{/each}
								</div>
							{/each}
						</section>
						<footer class="card-footer text-sm italic">
							<span class="chip variant-filled-surface">{result.title}</span>
						</footer>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
