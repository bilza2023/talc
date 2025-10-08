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
	() => import('./nodes/50')
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
		"/home": [14],
		"/mines": [15],
		"/process/screen": [~16],
		"/process/sort": [17],
		"/reports": [~18,[2]],
		"/reports/process/overview": [~19,[2]],
		"/reports/process/screening": [~20,[2]],
		"/reports/process/sorting": [~21,[2]],
		"/reports/procurement/overview": [~22,[2]],
		"/reports/procurement/suppliers": [~23,[2]],
		"/reports/procurement/trends": [~24,[2]],
		"/reports/stocks/overview": [~25,[2]],
		"/reports/stocks/slots": [~26,[2]],
		"/reports/stocks/suppliers": [~27,[2]],
		"/reports/transport/in-transit": [~28,[2]],
		"/reports/transport/overview": [~29,[2]],
		"/reports/transport/reconciliation": [~30,[2]],
		"/settings": [31],
		"/stations/abs": [32,[3,4]],
		"/stations/abs/abs_screened": [~33,[3,4]],
		"/stations/abs/abs_unscreened_raw": [~34,[3,4]],
		"/stations/abs/dispatch_kef_screened": [~35,[3,4]],
		"/stations/abs/dispatch_pss_screened": [~36,[3,4]],
		"/stations/abs/purchase_screened": [~37,[3,4]],
		"/stations/abs/purchase_unscreened": [~38,[3,4]],
		"/stations/abs/screening": [~39,[3,4]],
		"/stations/kef": [40,[3,5]],
		"/stations/kef/kef_sorted": [~41,[3,5]],
		"/stations/kef/receive_pss_sorted": [~42,[3,5]],
		"/stations/pss": [43,[3,6]],
		"/stations/pss/dispatch_kef_sorted": [~44,[3,6]],
		"/stations/pss/pss_screened": [~45,[3,6]],
		"/stations/pss/pss_sorted": [~46,[3,6]],
		"/stations/pss/receive_abs_screened": [~47,[3,6]],
		"/stations/pss/sort": [~48,[3,6]],
		"/stock/unscreened": [~49],
		"/suppliers": [~50]
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