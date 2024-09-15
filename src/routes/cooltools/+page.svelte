<script>
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import Icon from 'svelte-awesome';
	import android from 'svelte-awesome/icons/android';
	import apple from 'svelte-awesome/icons/apple';
	import globe from 'svelte-awesome/icons/globe';
</script>

<svelte:head>
	<title>Autres Outils</title>
	<meta name="description" content="Autres Outils utiles pour tout jeune médecin" />
</svelte:head>

<div class="container mx-auto">
	<h1 class="h1 text-center p-4">Autres Outils</h1>
	<h2 class="h2 text-center p-4">Medicalcul</h2>
	<div class="text-center p-2">La meilleure application pour calculer n'importe quel score</div>
	<div class="flex justify-center p-2">
		<div class="btn-group-vertical variant-ghost-surface w-full max-w-fit">
			<a href="http://medicalcul.free.fr/" target="_blank" rel="noopener noreferrer" class="btn">
				<Icon data={globe} class="mr-4" /> Medicalcul sur le Web
			</a>
			<a href="http://medicalcul.free.fr/" target="_blank" rel="noopener noreferrer" class="btn">
				<Icon data={android} class="mr-4" /> Medicalcul sur Android
			</a>
		</div>
	</div>
	<h2 class="h2 text-center p-4">AnthroCalc</h2>
	<div class="text-center p-2">Pour calculer les déviations standards en pédiatrie</div>
	<div class="flex justify-center p-2">
		<div class="btn-group-vertical variant-ghost-surface w-full max-w-fit">
			<a
				href="https://play.google.com/store/apps/details?id=appinventor.ai_dlmetzger58.AnthroCalc"
				target="_blank"
				rel="noopener noreferrer"
				class="btn"
			>
				<Icon data={android} class="mr-4" />
				AnthroCalc sur Android
			</a>
			<a
				href="https://apps.apple.com/us/app/anthrocalc/id1521729239"
				target="_blank"
				rel="noopener noreferrer"
				class="btn"
			>
				<Icon data={apple} class="mr-4" />
				AnthroCalc sur Apple App Store
			</a>
		</div>
	</div>
</div>
