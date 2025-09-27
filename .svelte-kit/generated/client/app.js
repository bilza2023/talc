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
	() => import('./nodes/26'),
	() => import('./nodes/27')
];

export const server_loads = [3,4];

export const dictionary = {
		"/": [5],
		"/actions/cancel": [~6],
		"/actions/deposit": [~7],
		"/actions/dispatch": [~8],
		"/actions/receive": [~9],
		"/actions/withdraw": [~10],
		"/help/dashboard": [11],
		"/home": [12],
		"/mines": [13],
		"/process/screen": [~14],
		"/process/sort": [15],
		"/settings": [16],
		"/stations/abs": [17,[2,3]],
		"/stations/abs/abs_screened": [~18,[2,3]],
		"/stations/abs/abs_unscreened_raw": [~19,[2,3]],
		"/stations/abs/dispatch_kef_screened": [~20,[2,3]],
		"/stations/abs/dispatch_pss_screened": [~21,[2,3]],
		"/stations/abs/purchase_screened": [~22,[2,3]],
		"/stations/abs/purchase_unscreened": [~23,[2,3]],
		"/stations/pss": [24,[2,4]],
		"/stations/pss/receive_abs_screened": [~25,[2,4]],
		"/stock/unscreened": [~26],
		"/suppliers": [~27]
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