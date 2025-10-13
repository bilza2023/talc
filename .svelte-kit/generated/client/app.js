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
	() => import('./nodes/45'),
	() => import('./nodes/46')
];

export const server_loads = [4,5,6];

export const dictionary = {
		"/": [7],
		"/help/dashboard": [8],
		"/mines": [9],
		"/process/screen": [~10],
		"/process/sort": [11],
		"/procurement": [~12],
		"/procurement/screened": [~13],
		"/procurement/unscreened": [~14],
		"/reports": [~15,[2]],
		"/reports/logistics/in-transit": [~16,[2]],
		"/reports/logistics/overview": [~17,[2]],
		"/reports/logistics/reconciliation": [~18,[2]],
		"/reports/process/overview": [~19,[2]],
		"/reports/process/screening": [~20,[2]],
		"/reports/process/sorting": [~21,[2]],
		"/reports/procurement/overview": [~22,[2]],
		"/reports/procurement/suppliers": [~23,[2]],
		"/reports/procurement/trends": [~24,[2]],
		"/reports/stocks/overview": [~25,[2]],
		"/reports/stocks/slots": [~26,[2]],
		"/reports/stocks/suppliers": [~27,[2]],
		"/reports/supplier_ledger1": [~29,[2]],
		"/reports/supplier_ledger": [~28,[2]],
		"/settings": [30],
		"/stations/abs": [31,[3,4]],
		"/stations/abs/abs_screened": [~32,[3,4]],
		"/stations/abs/abs_unscreened_raw": [~33,[3,4]],
		"/stations/abs/dispatch_kef_screened": [~34,[3,4]],
		"/stations/abs/dispatch_pss_screened": [~35,[3,4]],
		"/stations/abs/screening": [~36,[3,4]],
		"/stations/kef": [37,[3,5]],
		"/stations/kef/kef_sorted": [~38,[3,5]],
		"/stations/kef/receive_pss_sorted": [~39,[3,5]],
		"/stations/pss": [40,[3,6]],
		"/stations/pss/dispatch_kef_sorted": [~41,[3,6]],
		"/stations/pss/pss_screened": [~42,[3,6]],
		"/stations/pss/pss_sorted": [~43,[3,6]],
		"/stations/pss/receive_abs_screened": [~44,[3,6]],
		"/stations/pss/sort": [~45,[3,6]],
		"/suppliers": [~46]
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