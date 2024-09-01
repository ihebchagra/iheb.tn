// src/stores.js
import { writable } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

/**
 * A writable store that holds a string value.
 * @type {import('svelte/store').Writable<any[]>}
 */
export const polysearchEcnSearchResults = writable([]);
/** @type {import('svelte/store').Writable<string>}*/
export const polysearchEcnSearchValue = writable('');
/** @type {import('svelte/store').Writable<any>}*/
export const polysearchEcnMinisearch = writable(undefined);

/** @type {import('svelte/store').Writable<string>}*/
export const viewerGoBack = writable('/ecn/polysearch');
/** @type {import('svelte/store').Writable<string>}*/
export const viewerTitle = writable('');

/**
 * A writable store that holds a string value.
 * @type {import('svelte/store').Writable<any[]>}
 */
export const seriesearchSearchResults = writable([]);
/** @type {import('svelte/store').Writable<string>}*/
export const seriesearchSearchValue = writable('');
/** @type {import('svelte/store').Writable<any>}*/
export const seriesearchMinisearch = writable(undefined);

/**
 * A writable store that holds a string value.
 * @type {import('svelte/store').Writable<any[]>}
 */
export const MedicasearchSearchResults = writable([]);
/** @type {import('svelte/store').Writable<string>}*/
export const MedicasearchSearchValue = writable('');
/** @type {import('svelte/store').Writable<any>}*/
export const MedicasearchMinisearch = writable(undefined);

/**
 * A writable store that holds a string value.
 * @type {import('svelte/store').Writable<any[]>}
 */
export const MedicavetSearchResults = writable([]);
/** @type {import('svelte/store').Writable<string>}*/
export const MedicavetSearchValue = writable('');
/** @type {import('svelte/store').Writable<any>}*/
export const MedicavetMinisearch = writable(undefined);

export const cours = persisted('cours', []);
export const type = persisted('type','QCM');
export const progress = persisted('progress',0);