import { c as create_ssr_component, b as subscribe, f as escape } from './ssr-YOuSP3iu.js';
import { p as page } from './stores-BEVufx3D.js';
import './exports-DKuYoYKl.js';
import './state.svelte-ChAriFL2.js';

const Error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_page();
  return `<h1>${escape($page.status)}</h1> <p>${escape($page.error?.message)}</p>`;
});

export { Error as default };
//# sourceMappingURL=error.svelte-gwr62A_d.js.map
