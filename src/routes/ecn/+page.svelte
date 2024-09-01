<script>
	import Icon from 'svelte-awesome';
	import book from 'svelte-awesome/icons/book';
	import graduationCap from 'svelte-awesome/icons/graduationCap';
	import random from 'svelte-awesome/icons/random';
</script>

<svelte:head>
	<title>Iheb's ECN Tools</title>
	<meta name="description" content="Outils pour les candidats de l'examen classant national" />
</svelte:head>

<div class="container h-full mx-auto flex justify-center items-center mb-4">
	<div class="space-y-10 text-center flex flex-col items-center">
		<h1 class="h1 p-4">Iheb's Résidanat Tools</h1>
		<!-- Animated Logo -->
		<div class="btn-group-vertical variant-ghost-surface max-w-sm w-full">
			<a href="/ecn/polysearch">
				<Icon data={graduationCap} />
				<span>Polysearch ECN</span>
			</a>
			<a href="/ecn/seriesearch">
				<Icon data={book} />
				<span>Sériesearch</span>
			</a>
			<a href="/ecn/3altayer">
				<Icon data={random} />
				<span>ECN 3al Tayer</span>
			</a>
		</div>
		<footer class="text-sm">Made with ❤️ By Iheb Chagra</footer>
	</div>
</div>
