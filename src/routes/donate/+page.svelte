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

	/**
	 * @type {boolean[]}
	 */
	let expandedstates = [true, false, false, false];
</script>

<div class="mx-autp">
	<h1 class="h1 p-4 text-center w-full">Soutenir ce site web</h1>
	<p class="p-4 text-center mx-auto w-full">
		Ce site est gratuit à utiliser pour tout le monde mais coûte du temps de de l'argent pour
		maintenir de ma part. Si vous trouvez ce site web utile, pensez à faire un don pour aider à sa
		maintenance et son développement.
	</p>
	<div class="p-4 space-y-2 max-w-5xl mx-auto">
		<h2 class="h2 text-center my-4">Moyens de dons</h2>
		<div class="card">
			<button
				class="text-left card-header cursor-pointer w-full py-2"
				on:click={() => (expandedstates[0] = !expandedstates[0])}
			>
				<b class="text-lg">
					1. Par Paiement bancaire/postal/flouci direct en ligne :
					<span class="ml-auto end-0">
						<Icon
							data={expandedstates[0] ? angleUp : angleDown}
							class={`transition-transform duration-200 ${expandedstates[0] ? 'rotate-180' : 'rotate-0'}`}
						/>
					</span>
				</b>
			</button>

			{#if expandedstates[0]}
				<div transition:slide>
					<section class="p-4">
						<ol class="list">
							<li>
								<span class="badge-icon p-4 variant-soft-primary">{1}</span>
								<span class="flex-auto">
									<a
										class="underline"
										href="https://gateway.konnect.network/me/66d518dc0e581535c3cdfb0d"
										>Ouvrir ce lien</a
									>.
								</span>
							</li>
							<li>
								<span class="badge-icon p-4 variant-soft-primary">{2}</span>
								<span class="flex-auto"> Choisir n'importe quel montant</span>
							</li>
						</ol>
					</section>
				</div>
			{/if}
		</div>
		<div class="card">
			<button
				class="text-left card-header cursor-pointer w-full py-2"
				on:click={() => (expandedstates[1] = !expandedstates[1])}
			>
				<b class="text-lg">
					2. Par E-dinar à travers l'application D17 :
					<span class="ml-auto end-0">
						<Icon
							data={expandedstates[1] ? angleUp : angleDown}
							class={`transition-transform duration-200 ${expandedstates[1] ? 'rotate-180' : 'rotate-0'}`}
						/>
					</span>
				</b>
			</button>

			{#if expandedstates[1]}
				<div transition:slide>
					<section class="p-4">
						<ol class="list">
							<li>
								<span class="badge-icon p-4 variant-soft-primary">{1}</span>
								<span class="flex-auto">
									<a class="underline" href="https://www.d17.tn/">Télécharger l'application D17</a>.
								</span>
							</li>
							<li>
								<span class="badge-icon p-4 variant-soft-primary">{2}</span>
								<span class="flex-auto"> Connecter avec vos informations. </span>
							</li>
							<li>
								<span class="badge-icon p-4 variant-soft-primary">{3}</span>
								<span class="flex-auto">
									<span>Cliquez sur "Transfert" comme dans l'image ci-dessous.</span>
								</span>
							</li>
							<li><img class="h-20 mx-auto" src="/d17.png" alt="D17" /></li>
							<li>
								<span class="badge-icon p-4 variant-soft-primary">{4}</span>
								<span class="flex-auto">
									<span>Destinataire: 20046303 </span>
								</span>
							</li>
						</ol>
					</section>
				</div>
			{/if}
		</div>

		<div class="card">
			<button
				class="text-left card-header cursor-pointer w-full py-2"
				on:click={() => (expandedstates[2] = !expandedstates[2])}
			>
				<b class="text-lg">
					3. Par l'application Flouci :
					<span class="ml-auto end-0">
						<Icon
							data={expandedstates[2] ? angleUp : angleDown}
							class={`transition-transform duration-200 ${expandedstates[2] ? 'rotate-180' : 'rotate-0'}`}
						/>
					</span>
				</b>
			</button>

			{#if expandedstates[2]}
				<div transition:slide>
					<section class="p-4">
						<ol class="list">
							<li>
								<span class="badge-icon p-4 variant-soft-primary">{1}</span>
								<span class="flex-auto">
									<a class="underline" href="https://fr.flouci.com/"
										>Télécharger l'application Flouci</a
									>.
								</span>
							</li>
							<li>
								<span class="badge-icon p-4 variant-soft-primary">{2}</span>
								<span class="flex-auto"> Connecter avec vos informations. </span>
							</li>
							<li>
								<span class="badge-icon p-4 variant-soft-primary">{3}</span>
								<span class="flex-auto">
									<span>Suivre les étapes dans cette page web :</span>
									<a class="underline" href="https://fr.flouci.com/feature/envoi-argent"
										>https://fr.flouci.com/feature/envoi-argent</a
									>.
								</span>
							</li>
							<li>
								<span class="badge-icon p-4 variant-soft-primary">{4}</span>
								<span class="flex-auto">
									<span>Destinataire: </span>
								</span>
							</li>
							<img class="h-52 mx-auto" src="/flouci.png" alt="flouci" />
						</ol>
					</section>
				</div>
			{/if}
		</div>

		<div class="card">
			<div class="text-left card-header pointer-events-none w-full py-2">
				<b class="text-lg"> 4. ken tchoufni fi sbitar, echrili 9ahwa wala gaufrettes chocotom </b>
			</div>
		</div>
	</div>
	<p class="text-center py-4">Tout don est grandement apprécié ! Merci de votre soutien ❤</p>
</div>

<svelte:head>
	<title>Soutenir iheb.tn</title>
	<meta
		name="description"
		content="Soutenir ce site web"
	/>
</svelte:head>