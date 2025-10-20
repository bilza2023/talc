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
	() => import('./nodes/33'),
	() => import('./nodes/34'),
	() => import('./nodes/35'),
	() => import('./nodes/36'),
	() => import('./nodes/37'),
	() => import('./nodes/38')
];

export const server_loads = [4,5,6];

export const dictionary = {
		"/": [7],
		"/help": [8],
		"/mines": [9],
		"/procurement": [~10],
		"/reports": [~11,[2]],
		"/reports/in-transit": [~12,[2]],
		"/reports/process/overview": [~13,[2]],
		"/reports/process/screening": [~14,[2]],
		"/reports/process/sorting": [~15,[2]],
		"/reports/reconciliation": [~16,[2]],
		"/reports/screening": [~17,[2]],
		"/reports/slot": [~18,[2]],
		"/reports/sorting": [~19,[2]],
		"/reports/stock": [~20,[2]],
		"/reports/supplier_ledger": [~21,[2]],
		"/settings": [22],
		"/stations/abs": [23,[3,4]],
		"/stations/abs/abs_screened": [~24,[3,4]],
		"/stations/abs/abs_unscreened_raw": [~25,[3,4]],
		"/stations/abs/dispatch_kef_screened": [~26,[3,4]],
		"/stations/abs/dispatch_pss_screened": [~27,[3,4]],
		"/stations/abs/screening": [~28,[3,4]],
		"/stations/kef": [29,[3,5]],
		"/stations/kef/kef_sorted": [~30,[3,5]],
		"/stations/kef/receive": [~31,[3,5]],
		"/stations/pss": [32,[3,6]],
		"/stations/pss/dispatch_kef_sorted": [~33,[3,6]],
		"/stations/pss/pss_screened": [~34,[3,6]],
		"/stations/pss/pss_sorted": [~35,[3,6]],
		"/stations/pss/receive": [~36,[3,6]],
		"/stations/pss/sort": [~37,[3,6]],
		"/suppliers": [~38]
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