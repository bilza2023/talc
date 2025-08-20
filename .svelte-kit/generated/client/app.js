export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16')
];

export const server_loads = [2];

export const dictionary = {
		"/": [3],
		"/dashboards/ore_dashboard": [~4],
		"/ore/deposit": [~5],
		"/ore/dispatch": [~6],
		"/ore/unload": [~7],
		"/settings": [8],
		"/stations": [~9,[2]],
		"/stations/jss": [10,[2]],
		"/stations/jss/ore_deposit": [11,[2]],
		"/stations/jss/ore_dispatch": [12,[2]],
		"/stations/jss/ore_unload": [13,[2]],
		"/suppliers": [~14],
		"/suppliers/new": [16],
		"/suppliers/[id]/edit": [15]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.svelte';