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
	() => import('./nodes/35')
];

export const server_loads = [];

export const dictionary = {
		"/": [3],
		"/charts": [4],
		"/dashboard/ore_batches": [~6,[2]],
		"/dashboard/ore": [~5,[2]],
		"/dashboard/talc": [~7,[2]],
		"/dashboard/transportation": [~8,[2]],
		"/help/dashboard": [9],
		"/home": [10],
		"/logs": [11],
		"/mines": [12],
		"/mma4s": [13],
		"/mma4s/deposit": [~14],
		"/mma4s/dispatch": [~15],
		"/mma4s/receive": [~16],
		"/mma4s/slots": [~17],
		"/ore/deposit": [~18],
		"/ore/dispatch": [~19],
		"/ore/receive": [~20],
		"/process/screen": [~21],
		"/process/sort": [22],
		"/settings": [23],
		"/stations-old": [~24],
		"/stations-old/abs": [~25],
		"/stations-old/bs1": [~26],
		"/stations-old/bs2": [~27],
		"/stations-old/bs3": [~28],
		"/stations-old/jss": [~29],
		"/stations-old/kef": [~30],
		"/stations-old/pss": [~31],
		"/suppliers": [~32],
		"/talc/deposit": [~33],
		"/talc/dispatch": [~34],
		"/talc/receive": [~35]
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