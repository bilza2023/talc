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
	() => import('./nodes/38'),
	() => import('./nodes/39')
];

export const server_loads = [4,5,6];

export const dictionary = {
		"/": [7],
		"/help": [8],
		"/mines": [9],
		"/process/screen": [~10],
		"/process/sort": [11],
		"/procurement": [~12],
		"/reports": [~13,[2]],
		"/reports/in-transit": [~14,[2]],
		"/reports/process/overview": [~15,[2]],
		"/reports/process/screening": [~16,[2]],
		"/reports/process/sorting": [~17,[2]],
		"/reports/reconciliation": [~18,[2]],
		"/reports/stock": [~19,[2]],
		"/reports/supplier_ledger": [~20,[2]],
		"/settings": [21],
		"/stations/abs": [22,[3,4]],
		"/stations/abs/abs_screened": [~23,[3,4]],
		"/stations/abs/abs_unscreened_raw": [~24,[3,4]],
		"/stations/abs/dispatch_kef_screened": [~25,[3,4]],
		"/stations/abs/dispatch_pss_screened": [~26,[3,4]],
		"/stations/abs/screening": [~27,[3,4]],
		"/stations/kef": [28,[3,5]],
		"/stations/kef/kef_sorted": [~29,[3,5]],
		"/stations/kef/receive_pss_sorted": [~31,[3,5]],
		"/stations/kef/receive": [~30,[3,5]],
		"/stations/pss": [32,[3,6]],
		"/stations/pss/dispatch_kef_sorted": [~33,[3,6]],
		"/stations/pss/pss_screened": [~34,[3,6]],
		"/stations/pss/pss_sorted": [~35,[3,6]],
		"/stations/pss/receive_abs_screened": [~37,[3,6]],
		"/stations/pss/receive": [~36,[3,6]],
		"/stations/pss/sort": [~38,[3,6]],
		"/suppliers": [~39]
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