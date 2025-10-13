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
	() => import('./nodes/46'),
	() => import('./nodes/47'),
	() => import('./nodes/48'),
	() => import('./nodes/49'),
	() => import('./nodes/50'),
	() => import('./nodes/51'),
	() => import('./nodes/52')
];

export const server_loads = [4,5,6];

export const dictionary = {
		"/": [7],
		"/actions/cancel": [~8],
		"/actions/deposit": [~9],
		"/actions/dispatch": [~10],
		"/actions/receive": [~11],
		"/actions/withdraw": [~12],
		"/help/dashboard": [13],
		"/mines": [14],
		"/process/screen": [~15],
		"/process/sort": [16],
		"/procurement/screened": [~17],
		"/procurement/unscreened": [~18],
		"/reports": [~19,[2]],
		"/reports/logistics/in-transit": [~20,[2]],
		"/reports/logistics/overview": [~21,[2]],
		"/reports/logistics/reconciliation": [~22,[2]],
		"/reports/process/overview": [~23,[2]],
		"/reports/process/screening": [~24,[2]],
		"/reports/process/sorting": [~25,[2]],
		"/reports/procurement/overview": [~26,[2]],
		"/reports/procurement/suppliers": [~27,[2]],
		"/reports/procurement/trends": [~28,[2]],
		"/reports/stocks/overview": [~29,[2]],
		"/reports/stocks/slots": [~30,[2]],
		"/reports/stocks/suppliers": [~31,[2]],
		"/reports/supplier_ledger1": [~33,[2]],
		"/reports/supplier_ledger": [~32,[2]],
		"/settings": [34],
		"/stations/abs": [35,[3,4]],
		"/stations/abs/abs_screened": [~36,[3,4]],
		"/stations/abs/abs_unscreened_raw": [~37,[3,4]],
		"/stations/abs/dispatch_kef_screened": [~38,[3,4]],
		"/stations/abs/dispatch_pss_screened": [~39,[3,4]],
		"/stations/abs/purchase_screened": [~40,[3,4]],
		"/stations/abs/purchase_unscreened": [~41,[3,4]],
		"/stations/abs/screening": [~42,[3,4]],
		"/stations/kef": [43,[3,5]],
		"/stations/kef/kef_sorted": [~44,[3,5]],
		"/stations/kef/receive_pss_sorted": [~45,[3,5]],
		"/stations/pss": [46,[3,6]],
		"/stations/pss/dispatch_kef_sorted": [~47,[3,6]],
		"/stations/pss/pss_screened": [~48,[3,6]],
		"/stations/pss/pss_sorted": [~49,[3,6]],
		"/stations/pss/receive_abs_screened": [~50,[3,6]],
		"/stations/pss/sort": [~51,[3,6]],
		"/suppliers": [~52]
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