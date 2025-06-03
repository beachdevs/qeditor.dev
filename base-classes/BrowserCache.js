globalThis.BrowserCache ??= class BrowserCache {
  static cacheName = "dp-browser-image-cache";

  static async getImage(name, url) {
    try {
      const cache = await caches.open(this.cacheName);
      const match = await cache.match(name);
      if (match) {
        return {
          fromCache: true,
          file: URL.createObjectURL(await match.blob())
        };
      }
  
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  
      await cache.put(name, response.clone());
      return {
        fromCache: false,
        file: URL.createObjectURL(await response.blob())
      };
    } catch (e) {
      console.error('Failed to fetch image', e);
      return {
        fromCache: false,
        file: url,
        error: e
      };
    }
  }

  static async deleteCache(name) {
    const cache = await caches.open(this.cacheName);

    if (name === "*") {
      await caches.delete(this.cacheName);
    } else {
      await cache.delete(name);
    }
  }
  static async listCache() {
    const cache = await caches.open(this.cacheName);
    const keys = await cache.keys();
    return Promise.all(keys.map(async req => ({
      name: req.url,
      blob: 'someblob'
    })));
  }
}
export default BrowserCache;