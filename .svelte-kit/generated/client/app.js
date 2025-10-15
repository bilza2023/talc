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
	() => import('./nodes/39'),
	() => import('./nodes/40'),
	() => import('./nodes/41'),
	() => import('./nodes/42'),
	() => import('./nodes/43'),
	() => import('./nodes/44'),
	() => import('./nodes/45')
];

export const server_loads = [4,5,6];

export const dictionary = {
		"/": [7],
		"/help/dashboard": [8],
		"/mines": [9],
		"/process/screen": [~10],
		"/process/sort": [11],
		"/procurement": [~12],
		"/reports": [~13,[2]],
		"/reports/in-transit": [~14,[2]],
		"/reports/logistics/in-transit": [~15,[2]],
		"/reports/logistics/overview": [~16,[2]],
		"/reports/process/overview": [~17,[2]],
		"/reports/process/screening": [~18,[2]],
		"/reports/process/sorting": [~19,[2]],
		"/reports/procurement/overview": [~20,[2]],
		"/reports/procurement/suppliers": [~21,[2]],
		"/reports/procurement/trends": [~22,[2]],
		"/reports/reconciliation": [~23,[2]],
		"/reports/stocks/overview": [~24,[2]],
		"/reports/stocks/slots": [~25,[2]],
		"/reports/stocks/suppliers": [~26,[2]],
		"/reports/supplier_ledger1": [~28,[2]],
		"/reports/supplier_ledger": [~27,[2]],
		"/settings": [29],
		"/stations/abs": [30,[3,4]],
		"/stations/abs/abs_screened": [~31,[3,4]],
		"/stations/abs/abs_unscreened_raw": [~32,[3,4]],
		"/stations/abs/dispatch_kef_screened": [~33,[3,4]],
		"/stations/abs/dispatch_pss_screened": [~34,[3,4]],
		"/stations/abs/screening": [~35,[3,4]],
		"/stations/kef": [36,[3,5]],
		"/stations/kef/kef_sorted": [~37,[3,5]],
		"/stations/kef/receive_pss_sorted": [~38,[3,5]],
		"/stations/pss": [39,[3,6]],
		"/stations/pss/dispatch_kef_sorted": [~40,[3,6]],
		"/stations/pss/pss_screened": [~41,[3,6]],
		"/stations/pss/pss_sorted": [~42,[3,6]],
		"/stations/pss/receive_abs_screened": [~43,[3,6]],
		"/stations/pss/sort": [~44,[3,6]],
		"/suppliers": [~45]
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