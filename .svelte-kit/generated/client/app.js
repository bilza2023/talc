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
	() => import('./nodes/21')
];

export const server_loads = [2];

export const dictionary = {
		"/": [3],
		"/dashboards-old/ore_dashboard": [~4],
		"/ore/deposit": [~5],
		"/ore/dispatch": [~6],
		"/ore/unload": [~7],
		"/settings": [8],
		"/stations": [~9,[2]],
		"/stations/bs1": [~10,[2]],
		"/stations/bs2": [~11,[2]],
		"/stations/bs3": [~12,[2]],
		"/stations/jss": [~13,[2]],
		"/stations/kef": [~14,[2]],
		"/stations/pss": [~15,[2]],
		"/suppliers": [~16],
		"/suppliers/new": [18],
		"/suppliers/[id]/edit": [17],
		"/talc/deposit": [~19],
		"/talc/dispatch": [~20],
		"/talc/unload": [~21]
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