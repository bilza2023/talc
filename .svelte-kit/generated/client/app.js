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
	() => import('./nodes/20')
];

export const server_loads = [];

export const dictionary = {
		"/": [2],
		"/dashboards/ore_dashboard": [~3],
		"/ore/deposit": [~4],
		"/ore/dispatch": [~5],
		"/ore/unload": [~6],
		"/settings": [7],
		"/stations": [~8],
		"/stations/bs1": [~9],
		"/stations/bs2": [~10],
		"/stations/bs3": [~11],
		"/stations/jss": [~12],
		"/stations/kef": [~13],
		"/stations/pss": [~14],
		"/suppliers": [~15],
		"/suppliers/new": [17],
		"/suppliers/[id]/edit": [16],
		"/talc/deposit": [~18],
		"/talc/dispatch": [~19],
		"/talc/unload": [~20]
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