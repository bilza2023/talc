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
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25'),
	() => import('./nodes/26')
];

export const server_loads = [2,3];

export const dictionary = {
		"/": [4],
		"/actions/cancel": [~5],
		"/actions/deposit": [~6],
		"/actions/dispatch": [~7],
		"/actions/receive": [~8],
		"/actions/withdraw": [~9],
		"/help/dashboard": [10],
		"/home": [11],
		"/mines": [12],
		"/process/screen": [~13],
		"/process/sort": [14],
		"/settings": [15],
		"/stations/abs": [16,[2]],
		"/stations/abs/abs_screened": [~17,[2]],
		"/stations/abs/abs_unscreened_raw": [~18,[2]],
		"/stations/abs/dispatch_kef_screened": [~19,[2]],
		"/stations/abs/dispatch_pss_screened": [~20,[2]],
		"/stations/abs/purchase_screened": [~21,[2]],
		"/stations/abs/purchase_unscreened": [~22,[2]],
		"/stations/pss": [23,[3]],
		"/stations/pss/receive_abs_screened": [~24,[3]],
		"/stock/unscreened": [~25],
		"/suppliers": [~26]
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