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
	() => import('./nodes/27'),
	() => import('./nodes/28'),
	() => import('./nodes/29'),
	() => import('./nodes/30'),
	() => import('./nodes/31'),
	() => import('./nodes/32'),
	() => import('./nodes/33')
];

export const server_loads = [3,4,5];

export const dictionary = {
		"/": [6],
		"/actions/cancel": [~7],
		"/actions/deposit": [~8],
		"/actions/dispatch": [~9],
		"/actions/receive": [~10],
		"/actions/withdraw": [~11],
		"/help/dashboard": [12],
		"/home": [13],
		"/mines": [14],
		"/process/screen": [~15],
		"/process/sort": [16],
		"/settings": [17],
		"/stations/abs": [18,[2,3]],
		"/stations/abs/abs_screened": [~19,[2,3]],
		"/stations/abs/abs_unscreened_raw": [~20,[2,3]],
		"/stations/abs/dispatch_kef_screened": [~21,[2,3]],
		"/stations/abs/dispatch_pss_screened": [~22,[2,3]],
		"/stations/abs/purchase_screened": [~23,[2,3]],
		"/stations/abs/purchase_unscreened": [~24,[2,3]],
		"/stations/kef": [25,[2,4]],
		"/stations/pss": [26,[2,5]],
		"/stations/pss/dispatch_sorted_to_kef": [~27,[2,5]],
		"/stations/pss/pss_screened": [~28,[2,5]],
		"/stations/pss/pss_sorted": [~29,[2,5]],
		"/stations/pss/receive_abs_screened": [~30,[2,5]],
		"/stations/pss/sort": [~31,[2,5]],
		"/stock/unscreened": [~32],
		"/suppliers": [~33]
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