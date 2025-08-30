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
	() => import('./nodes/26')
];

export const server_loads = [];

export const dictionary = {
		"/": [2],
		"/dashboard/ore": [~3],
		"/dashboard/overview": [~4],
		"/dashboard/talc": [~5],
		"/dashboard/traceability": [~6],
		"/dashboard/transit": [~7],
		"/dashboard/trucks": [~8],
		"/logs": [9],
		"/mines": [10],
		"/ore/deposit": [~11],
		"/ore/dispatch": [~12],
		"/ore/unload": [~13],
		"/settings": [14],
		"/stations": [~15],
		"/stations/abs": [~16],
		"/stations/bs1": [~17],
		"/stations/bs2": [~18],
		"/stations/bs3": [~19],
		"/stations/jss": [~20],
		"/stations/kef": [~21],
		"/stations/pss": [~22],
		"/suppliers": [~23],
		"/talc/deposit": [~24],
		"/talc/dispatch": [~25],
		"/talc/unload": [~26]
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