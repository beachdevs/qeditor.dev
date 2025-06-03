const storage = (() => {
  const obj = Object.create(null);

  obj.get = (type, key) => {
    if (type == '' || key == '') throw new Error('Invalid type or key');
    if (key === '*') {
      const arr = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith(`${type}:`)) {
          const value = localStorage.getItem(k);
          arr.push(JSON.parse(value));
        }
      }
      return arr;
    }
    const value = localStorage.getItem(`${type}:${key}`);
    return value ? JSON.parse(value) : null;
  };

  obj.set = (type, key, value) => {
    if (typeof value !== 'object') throw new Error('Value must be an object');
    localStorage.setItem(`${type}:${key}`, JSON.stringify(value));
    return value;
  };

  obj.delete = (type, key) => {
    localStorage.removeItem(`${type}:${key}`);
    return localStorage.getItem(`${type}:${key}`) == null;
  };

  obj.saveSetting = (key, value) => {
    const clientSettings = obj.get("Settings", "Client") || {};
    clientSettings[key] = value;
    obj.set("Settings", "Client", clientSettings);
    return value;
  };

  obj.getSetting = (key) => {
    if (key === '*') {
      return obj.get("Settings", "Client");
    }
    return obj.get("Settings", "Client")?.[key];
  };

  return obj;
})();

globalThis.storage = storage;
export default storage;