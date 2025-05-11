<script>
	import AppList from '$lib/components/AppList.svelte';
</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-8 text-center flex flex-col items-center mt-4">
		<h1 class="h1">Les Outils IHEB.TN</h1>
		<!-- Animated Logo -->
		<!-- <figure>
			<section class="img-bg" />
			<svg id="emoji" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<mask id="cutout-mask">
						<rect x="0" y="0" width="72" height="72" fill="white" />
						<rect x="43.425" y="31" width="3.6" height="6" fill="black" />
						<rect x="25.175" y="31" width="3.6" height="6" fill="black" />
					</mask>
				</defs>
				<g id="color" mask="url(#cutout-mask)">
					<polygon
						fill="currentColor"
						points="10,21 10,35 13,35 13,38 16,38 16,45 22,45 22,51 27,51 28,51 28,45 44,45 44,51 50,51 50,45 56,45 56,38 59,38 59,35 62,35 62,20 56,20 56,24 56,25 49,25 49,20 45,20 45,14 39,14 39,20 32,20 32,14 26,14 26,20 22,20 22,25 16,25 16,20 10,20"
					/>
					<rect x="16" y="51" width="6" height="6" fill="currentColor" />
					<rect x="50" y="51" width="6" height="6" fill="currentColor" />
				</g>
			</svg>
		</figure> -->
		<!-- / -->
		<p class="max-w-prose">
			Salut! Je suis <b>Iheb Chagra</b>, médecin résident en microbiologie. Je programme et maintient des sites web pour passer le
			temps. Ce site contient quelques applications utile pour les jeunes médecins.
		</p>
		<h2 class="h2">Voici une liste de mes projets, cliquez pour en ouvrir un :</h2>

		<div class="btn-group-vertical variant-ghost-surface w-80">
			<AppList />
		</div>

		<h2 class="h2">Devenir un Supporteur:</h2>
		<p class="">
			Mes projets coûtent du temps et de l'argent de ma part pour maintenir, considérez me supportez <a
				href="/donate"
				class="underline text-primary-500">sur ce lien</a
			>
		</p>
		<footer class="text-sm pb-4">Made with ❤️ By Iheb Chagra</footer>
	</div>
</div>

<svelte:head>
	<title>iheb.tn</title>
	<meta
		name="description"
		content="Site web d'Iheb Chagra contenant plusieurs applications pour les jeunes médecins"
	/>
</svelte:head>

<style lang="postcss">
	figure {
		@apply flex relative flex-col;
	}
	figure svg,
	.img-bg {
		@apply w-52 h-52;
	}
	.img-bg {
		@apply absolute z-[-1] rounded-full blur-[50px] transition-all;
	}
	/* animation:
			pulse 5s cubic-bezier(0, 0, 0, 0.5) infinite,
			glow 5s linear infinite;
	}
	@keyframes glow {
		0% {
			@apply bg-primary-400/50;
		}
		33% {
			@apply bg-secondary-400/50;
		}
		66% {
			@apply bg-tertiary-400/50;
		}
		100% {
			@apply bg-primary-400/50;
		}
	}
	@keyframes pulse {
		50% {
			transform: scale(1.5);
		}
	} */
</style>
