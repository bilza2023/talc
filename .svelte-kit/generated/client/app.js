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

export const server_loads = [];

export const dictionary = {
		"/": [3],
		"/dashboard/ore_batches": [~5,[2]],
		"/dashboard/ore": [~4,[2]],
		"/dashboard/talc": [~6,[2]],
		"/dashboard/transportation": [~7,[2]],
		"/help/dashboard": [8],
		"/home": [9],
		"/logs": [10],
		"/mines": [11],
		"/ore/deposit": [~12],
		"/ore/dispatch": [~13],
		"/ore/receive": [~14],
		"/settings": [15],
		"/stations": [~16],
		"/stations/abs": [~17],
		"/stations/bs1": [~18],
		"/stations/bs2": [~19],
		"/stations/bs3": [~20],
		"/stations/jss": [~21],
		"/stations/kef": [~22],
		"/stations/pss": [~23],
		"/suppliers": [~24],
		"/talc/deposit": [~25],
		"/talc/dispatch": [~26],
		"/talc/receive": [~27]
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