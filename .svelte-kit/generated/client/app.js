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
	() => import('./nodes/42')
];

export const server_loads = [3];

export const dictionary = {
		"/": [4],
		"/charts": [5],
		"/dashboard/ore_batches": [~7,[2]],
		"/dashboard/ore": [~6,[2]],
		"/dashboard/talc": [~8,[2]],
		"/dashboard/transportation": [~9,[2]],
		"/forms/cancel": [~10,[3]],
		"/forms/deposit": [~11,[3]],
		"/forms/dispatch": [~12,[3]],
		"/forms/receive": [~13,[3]],
		"/forms/screen": [~14,[3]],
		"/forms/sort": [~15,[3]],
		"/help/dashboard": [16],
		"/home": [17],
		"/logs": [18],
		"/mines": [19],
		"/mma4s": [20],
		"/mma4s/deposit": [~21],
		"/mma4s/dispatch": [~22],
		"/mma4s/receive": [~23],
		"/mma4s/slots": [~24],
		"/ore/deposit": [~25],
		"/ore/dispatch": [~26],
		"/ore/receive": [~27],
		"/process/screen": [~28],
		"/process/sort": [29],
		"/settings": [30],
		"/stations-old": [~31],
		"/stations-old/abs": [~32],
		"/stations-old/bs1": [~33],
		"/stations-old/bs2": [~34],
		"/stations-old/bs3": [~35],
		"/stations-old/jss": [~36],
		"/stations-old/kef": [~37],
		"/stations-old/pss": [~38],
		"/suppliers": [~39],
		"/talc/deposit": [~40],
		"/talc/dispatch": [~41],
		"/talc/receive": [~42]
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