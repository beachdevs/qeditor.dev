class NodeTypesServer {
  static async Trigger(data) {
    return {"status": "ok"};
  }
}

// TEST TEST TEST
const f = await fetch('https://dp-server.deno.dev', {method: 'POST', body: '{"some":"test"}'});
console.log(await f.json());