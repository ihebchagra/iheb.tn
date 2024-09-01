<script>
	import { ProgressBar } from '@skeletonlabs/skeleton';
	import { cours, type } from '$lib/stores';
	import { onMount } from 'svelte';

	/**@typedef {Object} QuestionJson
	 * @property {string} enonce
	 * @property {Answer[]} answers
	 */

	/**@typedef {Object} Answer
	 * @property {string} string
	 * @property {boolean} answer
	 */

	/**@typedef {Object} Question
	 * @property {number} id
	 * @property {QuestionJson[]} questionJson
	 * @property {string} questionString
	 * @property {string} cours
	 * @property {string} type
	 * @property {string} title
	 */

	/**@type {boolean}*/
	let showAnswers = false;

	/**@type {boolean}*/
	let showOptions = false;

	/**@type {string[]}*/
	let objectifs = [];

	/**@type {Question[]}*/
	let questions = [];
	/**@type {boolean}*/
	let isLoading = true;

	/**
	 * @param {string[]} arr
	 * @returns {string[]}
	 */
	function alphabeticalSort(arr) {
		return arr.sort((a, b) => {
			return a.localeCompare(b, 'en', { sensitivity: 'base' });
		});
	}
	onMount(async () => {
		if (questions.length === 0) {
			try {
				const response = await import('$lib/questions.json');

				questions = response.default;
				questions.forEach((question) => {
					if (!objectifs.includes(question.cours)) {
						objectifs.push(question.cours);
					}
				});
				objectifs = alphabeticalSort(objectifs);
			} catch (error) {
				console.error('Failed to load JSON:', error);
			} finally {
				isLoading = false;
			}
		} else {
			isLoading = false;
		}
	});

	$: filteredQuestions = questions
		.filter((question) => {
			if ($type === 'all') return true;
			return $type === question.type;
		})
		.filter((question) => {
			if ($cours.length === 0) return true;
			return $cours.includes(question.cours);
		});

	/**
	 * @param {Question[]} arr
	 * @returns {Question}
	 */
	function getRandomQuestion(arr) {
		const randomIndex = Math.floor(Math.random() * arr.length);
		showAnswers = false;
		selectedAnswers = [];
		return arr[randomIndex];
	}

	/**@type {Question}*/
	$: randomQuestion = getRandomQuestion(filteredQuestions);

	/**@type {string[]}*/
	let selectedAnswers = [];
</script>

<svelte:head>
	<title>ECN 3al Tayer</title>
	<meta name="description" content="Faire des exercices au hazard pour préparer à l'ECN " />
</svelte:head>

{#if isLoading}
	<div class="w-full space-y-8 px-4 py-8 grid">
		<p class="p-4 text-center">Chargement de ECN 3al Tayer</p>
		<ProgressBar value={undefined} meter="bg-secondary-500" track="bg-secondary-500/30" />
	</div>
{:else}
	<div class="container mx-auto space-y-2 w-screen py-8 mb-16 p-8">
		{#if showOptions}
			<h3 class="h3 text-center mb-8">Options</h3>
			<p>Choisir le type des questions:</p>
			<div class="space-y-2">
				<label class="flex items-center space-x-2">
					<input class="radio" type="radio" name="type" bind:group={$type} value="QCM" />
					<p>QCM</p>
				</label>
				<label class="flex items-center space-x-2">
					<input class="radio" type="radio" name="type" bind:group={$type} value="CC" />
					<p>Cas Cliniques</p>
				</label>
				<label class="flex items-center space-x-2">
					<input class="radio" type="radio" name="type" bind:group={$type} value="all" />
					<p>QCM + Cas Cliniques</p>
				</label>
			</div>
			<br />
			<p>Choisir un ou plusieurs objectifs:</p>
			<p class="text-sm">aucun choisi = n'importe quel cours</p>
			<div class="space-y-2">
				{#each objectifs as objectif}
					<label class="flex items-center space-x-2">
						<input class="checkbox" type="checkbox" value={objectif} bind:group={$cours} />
						<p>{objectif}</p>
					</label>
				{/each}
			</div>
		{:else if randomQuestion !== null}
			<span class="chip variant-filled-surface pointer-events-none">{randomQuestion.cours}</span>
			<span class="chip variant-filled-surface pointer-events-none">{randomQuestion.title}</span>

			{#each randomQuestion.questionJson as question, qIndex}
				<div class="mt-2">
					<div class="mb-4">{@html question.enonce}</div>
					<div class=" ">
						{#each question.answers as answer, aIndex}
							{@const index = `${qIndex}-${aIndex}`}
							<label
								class="rounded-sm my-2 p-4 flex items-center space-x-2"
								class:hover:variant-outline-surface={!showAnswers}
								class:pointer-events-none={showAnswers}
								class:variant-filled-surface={selectedAnswers.includes(index) && !showAnswers}
								class:variant-filled-success={selectedAnswers.includes(index) &&
									answer.answer &&
									showAnswers}
								class:variant-filled-error={selectedAnswers.includes(index) &&
									!answer.answer &&
									showAnswers}
								class:variant-filled-warning={!selectedAnswers.includes(index) &&
									answer.answer &&
									showAnswers}
							>
								<input
									class="mr-2 checkbox"
									class:input-success={selectedAnswers.includes(index) &&
										answer.answer &&
										showAnswers}
									class:input-error={selectedAnswers.includes(index) &&
										!answer.answer &&
										showAnswers}
									class:input-warning={!selectedAnswers.includes(index) &&
										answer.answer &&
										showAnswers}
									type="checkbox"
									value={index}
									disabled={showAnswers}
									bind:group={selectedAnswers}
								/>
								<p>{@html answer.string}</p>
							</label>
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</div>
	<div class="bottom-0 w-screen absolute bg-surface-100-800-token h-20">
		<div class="mx-auto w-screen flex items-center justify-center space-x-4 h-full">
			<button on:click={() => (showOptions = !showOptions)} class="btn variant-filled-secondary"
				>{@html showOptions ? 'Confirmer' : 'Options'}</button
			>
			{#if !showOptions}
				{#if !showAnswers}
					<button
						class="btn variant-filled-secondary"
						on:click={() => {
							showAnswers = true;
						}}>Répondre</button
					>
				{:else}
					<button
						class="btn variant-filled-secondary"
						on:click={() => {
							randomQuestion = getRandomQuestion(filteredQuestions);
						}}>Suivant</button
					>
				{/if}
			{/if}
		</div>
	</div>
{/if}
