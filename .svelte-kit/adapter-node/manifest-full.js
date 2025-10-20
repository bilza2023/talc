export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","favicon.svg","images/batch_n_edge.png","images/log.webp","images/logo.svg","images/northwest_banner.png","images/putin.webp","images/screened.jpeg","images/transport_diagram.png","images/unscreened.jpeg"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml",".webp":"image/webp",".jpeg":"image/jpeg"},
	_: {
		client: {start:"_app/immutable/entry/start.DVjytt3i.js",app:"_app/immutable/entry/app.DuLKWGVL.js",imports:["_app/immutable/entry/start.DVjytt3i.js","_app/immutable/chunks/CRYz92Wr.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/CCnCa0Il.js","_app/immutable/entry/app.DuLKWGVL.js","_app/immutable/chunks/BCQUcm9Y.js","_app/immutable/chunks/IHki7fMi.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js')),
			__memo(() => import('./nodes/13.js')),
			__memo(() => import('./nodes/14.js')),
			__memo(() => import('./nodes/15.js')),
			__memo(() => import('./nodes/16.js')),
			__memo(() => import('./nodes/17.js')),
			__memo(() => import('./nodes/18.js')),
			__memo(() => import('./nodes/19.js')),
			__memo(() => import('./nodes/20.js')),
			__memo(() => import('./nodes/21.js')),
			__memo(() => import('./nodes/22.js')),
			__memo(() => import('./nodes/23.js')),
			__memo(() => import('./nodes/24.js')),
			__memo(() => import('./nodes/25.js')),
			__memo(() => import('./nodes/26.js')),
			__memo(() => import('./nodes/27.js')),
			__memo(() => import('./nodes/28.js')),
			__memo(() => import('./nodes/29.js')),
			__memo(() => import('./nodes/30.js')),
			__memo(() => import('./nodes/31.js')),
			__memo(() => import('./nodes/32.js')),
			__memo(() => import('./nodes/33.js')),
			__memo(() => import('./nodes/34.js')),
			__memo(() => import('./nodes/35.js')),
			__memo(() => import('./nodes/36.js')),
			__memo(() => import('./nodes/37.js')),
			__memo(() => import('./nodes/38.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/api/audit-process",
				pattern: /^\/api\/audit-process\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/audit-process/_server.js'))
			},
			{
				id: "/api/deposit",
				pattern: /^\/api\/deposit\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/deposit/_server.js'))
			},
			{
				id: "/api/dispatch",
				pattern: /^\/api\/dispatch\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/dispatch/_server.js'))
			},
			{
				id: "/api/inbound",
				pattern: /^\/api\/inbound\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/inbound/_server.js'))
			},
			{
				id: "/api/onhand",
				pattern: /^\/api\/onhand\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/onhand/_server.js'))
			},
			{
				id: "/api/receive",
				pattern: /^\/api\/receive\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/receive/_server.js'))
			},
			{
				id: "/api/slots",
				pattern: /^\/api\/slots\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/slots/_server.js'))
			},
			{
				id: "/api/suppliers",
				pattern: /^\/api\/suppliers\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/suppliers/_server.js'))
			},
			{
				id: "/api/withdraw",
				pattern: /^\/api\/withdraw\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/withdraw/_server.js'))
			},
			{
				id: "/help",
				pattern: /^\/help\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/mines",
				pattern: /^\/mines\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/procurement",
				pattern: /^\/procurement\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/reports",
				pattern: /^\/reports\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/reports/in-transit",
				pattern: /^\/reports\/in-transit\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/reports/process/overview",
				pattern: /^\/reports\/process\/overview\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/reports/process/screening",
				pattern: /^\/reports\/process\/screening\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/reports/process/sorting",
				pattern: /^\/reports\/process\/sorting\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/reports/reconciliation",
				pattern: /^\/reports\/reconciliation\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/reports/screening",
				pattern: /^\/reports\/screening\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/reports/slot",
				pattern: /^\/reports\/slot\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/reports/sorting",
				pattern: /^\/reports\/sorting\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/reports/stock",
				pattern: /^\/reports\/stock\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/reports/supplier_ledger",
				pattern: /^\/reports\/supplier_ledger\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/settings",
				pattern: /^\/settings\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/stations/abs",
				pattern: /^\/stations\/abs\/?$/,
				params: [],
				page: { layouts: [0,3,4,], errors: [1,,,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/stations/abs/abs_screened",
				pattern: /^\/stations\/abs\/abs_screened\/?$/,
				params: [],
				page: { layouts: [0,3,4,], errors: [1,,,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/stations/abs/abs_unscreened_raw",
				pattern: /^\/stations\/abs\/abs_unscreened_raw\/?$/,
				params: [],
				page: { layouts: [0,3,4,], errors: [1,,,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/stations/abs/dispatch_kef_screened",
				pattern: /^\/stations\/abs\/dispatch_kef_screened\/?$/,
				params: [],
				page: { layouts: [0,3,4,], errors: [1,,,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/stations/abs/dispatch_pss_screened",
				pattern: /^\/stations\/abs\/dispatch_pss_screened\/?$/,
				params: [],
				page: { layouts: [0,3,4,], errors: [1,,,], leaf: 27 },
				endpoint: null
			},
			{
				id: "/stations/abs/screening",
				pattern: /^\/stations\/abs\/screening\/?$/,
				params: [],
				page: { layouts: [0,3,4,], errors: [1,,,], leaf: 28 },
				endpoint: null
			},
			{
				id: "/stations/kef",
				pattern: /^\/stations\/kef\/?$/,
				params: [],
				page: { layouts: [0,3,5,], errors: [1,,,], leaf: 29 },
				endpoint: null
			},
			{
				id: "/stations/kef/kef_sorted",
				pattern: /^\/stations\/kef\/kef_sorted\/?$/,
				params: [],
				page: { layouts: [0,3,5,], errors: [1,,,], leaf: 30 },
				endpoint: null
			},
			{
				id: "/stations/kef/receive",
				pattern: /^\/stations\/kef\/receive\/?$/,
				params: [],
				page: { layouts: [0,3,5,], errors: [1,,,], leaf: 31 },
				endpoint: null
			},
			{
				id: "/stations/pss",
				pattern: /^\/stations\/pss\/?$/,
				params: [],
				page: { layouts: [0,3,6,], errors: [1,,,], leaf: 32 },
				endpoint: null
			},
			{
				id: "/stations/pss/dispatch_kef_sorted",
				pattern: /^\/stations\/pss\/dispatch_kef_sorted\/?$/,
				params: [],
				page: { layouts: [0,3,6,], errors: [1,,,], leaf: 33 },
				endpoint: null
			},
			{
				id: "/stations/pss/pss_screened",
				pattern: /^\/stations\/pss\/pss_screened\/?$/,
				params: [],
				page: { layouts: [0,3,6,], errors: [1,,,], leaf: 34 },
				endpoint: null
			},
			{
				id: "/stations/pss/pss_sorted",
				pattern: /^\/stations\/pss\/pss_sorted\/?$/,
				params: [],
				page: { layouts: [0,3,6,], errors: [1,,,], leaf: 35 },
				endpoint: null
			},
			{
				id: "/stations/pss/receive",
				pattern: /^\/stations\/pss\/receive\/?$/,
				params: [],
				page: { layouts: [0,3,6,], errors: [1,,,], leaf: 36 },
				endpoint: null
			},
			{
				id: "/stations/pss/sort",
				pattern: /^\/stations\/pss\/sort\/?$/,
				params: [],
				page: { layouts: [0,3,6,], errors: [1,,,], leaf: 37 },
				endpoint: null
			},
			{
				id: "/suppliers",
				pattern: /^\/suppliers\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 38 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
