<script>
	import search from 'svelte-awesome/icons/search';
	import Icon from 'svelte-awesome';
	import { onMount } from 'svelte';
	import { ProgressBar, ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import MiniSearch from 'minisearch';
	import {
		MedicasearchSearchResults,
		MedicasearchMinisearch,
		MedicasearchSearchValue
	} from '$lib/stores';
	import { slide } from 'svelte/transition';
	import angleDown from 'svelte-awesome/icons/angleDown';
	import angleUp from 'svelte-awesome/icons/angleUp';
	import medAutocomplete from '$lib/medicaments_autocomplete.json';

	/**@type {string}*/
	let messageElement = '';

	const runSearch = () => {
		showAutocomplete = false;
		if ($MedicasearchSearchValue.length > 0) {
			$MedicasearchSearchResults = $MedicasearchMinisearch
				.search($MedicasearchSearchValue)
				.slice(0, 300);
			if ($MedicasearchSearchResults.length === 0) {
				messageElement = 'Aucun résultat trouvé (╯°□°）╯︵ ┻━┻';
			}
		} else {
			messageElement = 'Entrez un terme puis recherchez! ;)';
		}
	};

	/**@type {any[]}*/
	let medicaments = [];
	let isLoading = true;
	let fields = [
		'Spécialité',
		'Dosage',
		'Présentation',
		'Conditionnement Primaire',
		'Spécification',
		'Forme',
		'DCI',
		'Classement VEIC',
		'Classe Thérapeutique',
		'Sous Classe',
		'Laboratoire',
		'Tableau',
		'Durée de conservation',
		'Indication',
		'AMM',
		'Date AMM',
		'rcp',
		'Notice'
	];
	onMount(async () => {
		if ($MedicasearchMinisearch == undefined) {
			try {
				const response = await import('$lib/medicaments.json');

				medicaments = response.default;
			} catch (error) {
				console.error('Failed to load JSON:', error);
			} finally {
				$MedicasearchMinisearch = new MiniSearch({
					fields: [
						'Spécialité',
						'Dosage',
						'Forme',
						'Présentation',
						'DCI',
						'Sous Classe',
						'Indication',
						'Laboratoire'
					],
					storeFields: [
						'Spécialité',
						'Dosage',
						'Présentation',
						'Conditionnement Primaire',
						'Spécification',
						'Forme',
						'DCI',
						'Classement VEIC',
						'Classe Thérapeutique',
						'Sous Classe',
						'Laboratoire',
						'Tableau',
						'Durée de conservation',
						'Indication',
						'AMM',
						'Date AMM',
						'rcp',
						'Notice'
					],
					searchOptions: {
						boost: { DCI: 3, Spécialité: 3 },
						fuzzy: 0.2,
						prefix: true
					}
				});
				$MedicasearchMinisearch.addAll(medicaments);
				isLoading = false;
			}
		} else {
			isLoading = false;
		}
	});

	/**@type {boolean}*/
	let showAutocomplete = false;

	/**@type {number}*/
	let autocompleteIndex = 0;

	const handleInput = () => {
		if ($MedicasearchSearchValue.length > 0) {
			showAutocomplete = true;
		}
	};

	const handleChangeAutocomplete = () => {
		$MedicasearchSearchValue = autocompleteItems[autocompleteIndex];
		showAutocomplete = false;
		runSearch();
	};

	/**
	 * Removes diacritics from a string.
	 * @param {string} str - The input string.
	 * @returns {string} The string without diacritics.
	 */
	const removeDiacritics = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

	/**
	 * Filters an array of strings based on a search string, ignoring case and diacritics.
	 * @param {string[]} array - The array of strings to filter.
	 * @param {string} searchString - The string to search for.
	 * @returns {string[]} An array of strings that include the search string.
	 */
	function filterStrings(array, searchString) {
		const normalizedSearch = removeDiacritics(searchString.toLowerCase());

		return array
			.map((item) => ({
				original: item,
				normalized: removeDiacritics(item.toLowerCase())
			}))
			.filter((item) => item.normalized.startsWith(normalizedSearch))
			.sort((a, b) => {
				const indexA = a.normalized.indexOf(normalizedSearch);
				const indexB = b.normalized.indexOf(normalizedSearch);
				return indexA - indexB || a.normalized.length - b.normalized.length;
			})
			.slice(0, 4)
			.map((item) => item.original);
	}

	$: expandedstates = $MedicasearchSearchResults.map(() => false);
	$: autocompleteItems = filterStrings(medAutocomplete, $MedicasearchSearchValue);
</script>

<svelte:head>
	<title>Médicasearch</title>
	<meta
		name="description"
		content="Medicasearch est un petit moteur de recherche de médicaments."
	/>
</svelte:head>

<div class="w-full space-y-8 px-4 py-8 grid">
	{#if isLoading}
		<p class="p-4 text-center">Chargement de Médicasearch</p>
		<ProgressBar value={undefined} meter="bg-secondary-500" track="bg-secondary-500/30" />
	{:else}
		<h1 class="h1 text-center">Médicasearch</h1>
		<p class="text-sm text-center">
			Un petit moteur de recherche de médicaments disponibles en Tunisie.
		</p>
		<div>
			<div class="input-group input-group-divider grid-cols-[1fr_auto] xl:w-2/3 mx-auto">
				<input
					type="search"
					bind:value={$MedicasearchSearchValue}
					on:keydown={(event) => {
						if (event.key === 'Enter') {
							runSearch();
						}
					}}
					on:input={handleInput}
					placeholder="Rechercher les médicaments"
				/>
				<button class="variant-filled-secondary" on:click={runSearch}
					><Icon data={search}></Icon></button
				>
			</div>
			<div class="xl:w-2/3 mx-auto">
				{#if $MedicasearchSearchValue.length > 0 && showAutocomplete && autocompleteItems.length > 1}
					<ListBox
						size={Math.min(4, autocompleteItems.length)}
						on:change={handleChangeAutocomplete}
						on:click={handleChangeAutocomplete}
						active="variant-filled-primary"
						hover="hover:variant-soft-primary"
						class="bg-surface-100-800-token"
					>
						{#each autocompleteItems as autocompleteItem, index}
							<ListBoxItem
								bind:group={autocompleteIndex}
								name="medium"
								value={index}
								on:click={handleChangeAutocomplete}>{autocompleteItem}</ListBoxItem
							>
						{/each}
					</ListBox>
				{/if}
			</div>
		</div>

		<div class="space-y-4 grid">
			{#if $MedicasearchSearchResults.length > 0}
				{#each $MedicasearchSearchResults as result, index}
					<div class="card text-left">
						<button
							class="text-left card-header cursor-pointer w-full py-2"
							on:click={() => (expandedstates[index] = !expandedstates[index])}
						>
							<b class="text-lg">
								{#each ['Spécialité', 'Dosage', 'Présentation'] as field}
									{#if result[field] !== undefined}
										{result[field]}{@html ' '}
									{/if}
								{/each}
								<span class="ml-auto end-0">
									<Icon
										data={expandedstates[index] ? angleUp : angleDown}
										class={`transition-transform duration-200 ${expandedstates[index] ? 'rotate-180' : 'rotate-0'}`}
									/>
								</span>
							</b>
						</button>

						{#if expandedstates[index]}
							<div transition:slide>
								<section class="p-4">
									<ul class="list">
										{#each fields as field}
											{#if result[field] !== undefined}
												{#if field === 'rcp' || field === 'Notice'}
													<li>
														<p>
															<b>{field} : </b>
															<a class="underline" href={result[field]}>{result[field]}</a>
														</p>
													</li>
												{:else}
													<li>
														<p><b>{field} : </b> {result[field]}</p>
													</li>
												{/if}
											{/if}
										{/each}
									</ul>
								</section>
								<footer class="card-footer text-sm italic"></footer>
							</div>
						{/if}
					</div>
				{/each}
			{:else}
				<p class="text-center">{@html messageElement}</p>
			{/if}
		</div>
	{/if}
</div>
