<script>
	import questions from '$lib/questions.json';
	import { onMount } from 'svelte';
	import { viewerTitle } from '$lib/stores';
	/**@type {string}*/
	export let serie;
	/**@type {string}*/
	export let cours;
	/**@type {number}*/
	export let id;

	/**@type {any}*/
	let targetElement;

	function scrollToElement() {
		if (targetElement) {
			targetElement.scrollIntoView();
		}
	}

	onMount(() => {
		scrollToElement();
	});

	$viewerTitle = serie;

	const serieQuestions = questions
		.filter((question) => question.cours === cours)
		.filter((question) => question.title === serie);
</script>

<div class="text-center pt-8 pb-16">
	<h1 class="h1">{@html cours}</h1>
	<h2 class="h2">{@html serie}</h2>
</div>
<div class="space-y-4">
	{#each serieQuestions as questionObj}
		{#if questionObj.id === id}
			<div class="card m-4 p-4 leading-relaxed variant-outline-primary" bind:this={targetElement}>
				{#each questionObj.questionJson as question}
					<div class="mt-2">
						<div>{@html question.enonce}</div>
						{#each question.answers as answer}
							<div class:font-bold={answer.answer}>{@html answer.string}</div>
						{/each}
					</div>
				{/each}
			</div>
		{:else}
			<div class="card m-4 p-4 leading-relaxed">
				{#each questionObj.questionJson as question}
					<div class="mt-2">
						<div>{@html question.enonce}</div>
						{#each question.answers as answer}
							<div class:font-bold={answer.answer}>{@html answer.string}</div>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	{/each}
</div>
