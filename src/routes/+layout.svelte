<script>
	/**
	 * @typedef {Object} DrawerSettings
	 * @property {string} id - The ID of the drawer.
	 * @property {'bottom' | 'left' | 'right' | 'top'} position - The position of the drawer.
	 * @property {string} width - Width of the drawer
	 */

	import '../app.postcss';
	import { AppShell, AppBar, Drawer, initializeStores, LightSwitch } from '@skeletonlabs/skeleton';
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import AppList from '$lib/components/AppList.svelte';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import Icon from 'svelte-awesome';
	import bars from 'svelte-awesome/icons/bars';
	import chevronLeft from 'svelte-awesome/icons/chevronLeft';
	import { page } from '$app/stores';
	import { viewerGoBack, viewerTitle } from '$lib/stores';

	initializeStores();
	const drawerStore = getDrawerStore();

	/** @type {DrawerSettings} */
	const drawerSettings = {
		id: 'drawer',
		// Property Overrides
		position: 'right',
		width: 'w-[280px] md:w-[480px]'
	};
	const openDrawer = () => {
		drawerStore.open(drawerSettings);
	};

	beforeNavigate(() => {
		drawerStore.close();
	});

	// Highlight JS
	import hljs from 'highlight.js/lib/core';
	import 'highlight.js/styles/github-dark.css';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';
	import xml from 'highlight.js/lib/languages/xml'; // for HTML
	import css from 'highlight.js/lib/languages/css';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';

	hljs.registerLanguage('xml', xml); // for HTML
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	storeHighlightJs.set(hljs);

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { draw } from 'svelte/transition';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<svelte:head>
	<!-- Google tag (gtag.js) -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-88ZE7LC1ZE"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag('js', new Date());

		gtag('config', 'G-88ZE7LC1ZE');
	</script>
</svelte:head>

<Drawer>
	<div class="p-4 space-y-4">
		<h1 class="h1 mb-4 text-center"><a href="/">iheb.tn</a></h1>
		<div class="buttons btn-group-vertical bg-initial w-full">
			<AppList />
		</div>
	</div>
	<div class="mt-4 mx-auto w-full flex items-center justify-center">
		<a class="btn variant-filled-primary" href="/donate">Devenir un Supporteur</a>
	</div>
</Drawer>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				{#if $page.url.toString().includes('/viewer') || $page.url
						.toString()
						.includes('/ecn/serie/')}
					<a href={$viewerGoBack}><Icon data={chevronLeft} class="mr-4" /></a>
					<strong>{$viewerTitle}</strong>
				{:else}
					<a href="/"><strong class="text-xl uppercase">iheb.tn</strong></a>
				{/if}
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<LightSwitch />
				<button class="btn btn-sm variant-ghost-surface" on:click={openDrawer}>
					<Icon data={bars} />
				</button>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
