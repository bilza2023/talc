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
	() => import('./nodes/22')
];

export const server_loads = [];

export const dictionary = {
		"/": [2],
		"/dashboard/ore": [~3],
		"/dashboard/talc": [~4],
		"/logs": [5],
		"/mines": [6],
		"/ore/deposit": [~7],
		"/ore/dispatch": [~8],
		"/ore/unload": [~9],
		"/settings": [10],
		"/stations": [~11],
		"/stations/abs": [~12],
		"/stations/bs1": [~13],
		"/stations/bs2": [~14],
		"/stations/bs3": [~15],
		"/stations/jss": [~16],
		"/stations/kef": [~17],
		"/stations/pss": [~18],
		"/suppliers": [~19],
		"/talc/deposit": [~20],
		"/talc/dispatch": [~21],
		"/talc/unload": [~22]
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