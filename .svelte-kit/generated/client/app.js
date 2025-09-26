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
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19')
];

export const server_loads = [2];

export const dictionary = {
		"/": [3],
		"/actions/cancel": [~4],
		"/actions/deposit": [~5],
		"/actions/dispatch": [~6],
		"/actions/receive": [~7],
		"/actions/withdraw": [~8],
		"/help/dashboard": [9],
		"/home": [10],
		"/mines": [11],
		"/process/screen": [~12],
		"/process/sort": [13],
		"/settings": [14],
		"/stations/abs": [15,[2]],
		"/stations/abs/purchase_screened": [16,[2]],
		"/stations/abs/purchase_unscreened": [17,[2]],
		"/suppliers": [~18],
		"/unscreened": [~19]
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