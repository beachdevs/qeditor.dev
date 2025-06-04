import APIDEF from 'https://qeditor.dev/base-classes/APIDEF.js';
const API = Object.create(null);
Object.entries(APIDEF).forEach(([key]) => API[key] = (vars, proxy) => API.exec(key, vars, proxy));

API._fetch = async (options, proxy) => {
    const r = await fetch(proxy || options.url, proxy ? { method: 'POST', body: JSON.stringify(options) } : options);
    return { response: r, request: options, proxy, json: await r.json() };
}

API._exec = (name, vars = {}, proxy) => {
    if (!APIDEF[name]) throw new Error(`Unknown command: ${name}`);
    if (typeof vars === 'string') return { def: APIDEF[name], params: this.getParams(name) };
    return this.fetch(this.parse(APIDEF[name], vars), proxy);
 }

API._getDef = (name) => {
    return name ? { command: APIDEF[name], params: APIDEF[name].match(/\$(\w+)/g) ?? [] } : APIDEF;
}

API._parse = (command, vars) => {
    try {
      command = command.replace(/\$(\w+)/g, (_, v) => v in vars ? (typeof vars[v] === 'object' ? JSON.stringify(vars[v]) : vars[v]) : `$${v}`);
      const [method, url, headers, body] = command.split('\n');
      return {
        method,
        url,
        headers: headers ? Object.fromEntries(headers.split(',').map(h => h.split(':').map(s => s.trim()))) : undefined,
        body
      };
    } catch (e) {
      console.error('Parse error:', command, vars);
      throw e;
    }
}
window.API = API;
export default API;