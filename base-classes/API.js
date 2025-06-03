import APIDEF from './APIDEF.js';

globalThis.API ??= class API {
  constructor() {
    // create api methods
    Object.entries(APIDEF).forEach(([key]) => this[key] = (vars, proxy) => this.exec(key, vars, proxy));
  }

  static async fetch(options, proxy) {
    const r = await fetch(proxy || options.url, proxy ? { method: 'POST', body: JSON.stringify(options) } : options);
    return { response: r, request: options, proxy, json: await r.json() };
  }

  static exec(name, vars = {}, proxy) {
    if (!APIDEF[name]) throw new Error(`Unknown command: ${name}`);
    if (typeof vars === 'string') return { def: APIDEF[name], params: this.getParams(name) };
    return this.fetch(this.parse(APIDEF[name], vars), proxy);
  }

  static getDef(name) {
    return name ? { command: APIDEF[name], params: APIDEF[name].match(/\$(\w+)/g) ?? [] } : APIDEF;
  }

  static parse(command, vars) {
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
}

export default globalThis.API;
