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
	() => import('./nodes/28')
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
		"/ore/deposit": [~13],
		"/ore/dispatch": [~14],
		"/ore/receive": [~15],
		"/settings": [16],
		"/stations": [~17],
		"/stations/abs": [~18],
		"/stations/bs1": [~19],
		"/stations/bs2": [~20],
		"/stations/bs3": [~21],
		"/stations/jss": [~22],
		"/stations/kef": [~23],
		"/stations/pss": [~24],
		"/suppliers": [~25],
		"/talc/deposit": [~26],
		"/talc/dispatch": [~27],
		"/talc/receive": [~28]
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