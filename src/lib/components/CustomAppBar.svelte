<script>
	import Icon from 'svelte-awesome';
	import bars from 'svelte-awesome/icons/bars';
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import AppList from '$lib/components/AppList.svelte';
	import { beforeNavigate } from '$app/navigation';
	import { AppBar, Drawer, initializeStores, LightSwitch } from '@skeletonlabs/skeleton';

	initializeStores();
	const drawerStore = getDrawerStore();
	/**
	 * @typedef {Object} DrawerSettings
	 * @property {string} id - The ID of the drawer.
	 * @property {'bottom' | 'left' | 'right' | 'top'} position - The position of the drawer.
	 * @property {string} width - Width of the drawer
	 */
	/** @type {DrawerSettings} */
	const drawerSettings = {
		id: 'drawer',
		position: 'right',
		width: 'w-[280px] md:w-[480px]'
	};
	const openDrawer = () => {
		drawerStore.open(drawerSettings);
	};
	beforeNavigate(() => {
		drawerStore.close();
	});
</script>

<AppBar>
	<svelte:fragment slot="lead">
		<!-- <a href="/"><strong class="text-xl uppercase">iheb.tn</strong></a> -->
		<slot />
	</svelte:fragment>
	<svelte:fragment slot="trail">
		<LightSwitch />
		<button class="btn btn-sm variant-ghost-surface" on:click={openDrawer}>
			<Icon data={bars} />
		</button>
	</svelte:fragment>
</AppBar>

<Drawer>
	<div class="p-4 space-y-4">
		<h1 class="h1 mb-4 text-center"><a href="/">iheb.tn</a></h1>
		<div class="buttons btn-group-vertical bg-initial w-full">
			<AppList />
		</div>
	</div>
</Drawer>
