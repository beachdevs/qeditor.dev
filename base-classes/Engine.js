import { NodeTypes } from './NodeTypes.mjs';

const runningNodes = {},
  MAX_TRIGGER_TIMEOUT = 86400000,
  MAX_LOGIC_TIMEOUT = 5000;

globalThis.Engine ??= class Engine {
  static executions = [];

  static getObjectPath(obj, path) {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }

  static isReplaceable(setting) {
    return typeof setting === 'string' && setting.startsWith('$');
  }

  static updateInputSettings(settings, result) {
    // No result object
    if(Object.keys(result).length === 0) return settings;

    // Update settings with result (or globals, whatever) values
    for(const [key, value] of Object.entries(settings)) {
      if(!Engine.isReplaceable(value)) continue;
      const resultKey = value.slice(1);
      const newResult = Engine.getObjectPath(result, resultKey);
      settings[key] = newResult;
    }
    return settings;
  }

  // Run an individual node
  static async run(nodeId, def, result = null) {
    let execution = null;

    // Get the node definition
    let { type, inputs, settings, outputs } = def[nodeId];

    // If the node is inactive, don't run it
    if (settings?.inactive) return;

    // If no result is provided, create a new execution
    if (!result) {
      const id = await Guid.create();
      execution = { exec_id: id, started: Guid.decode(id), globals: {}, steps: [] };
      Engine.executions.push(execution);
    } else {
      // Update input settings with result from last node
      settings = Engine.updateInputSettings(settings, result);
      execution = this.executions.at(-1);
    }

    // Update settings with saved values from Globals
    settings = Engine.updateInputSettings(settings, Engine.getGlobals());

    // Create an object for the node execution log
    const step = { node_exec_id: await Guid.create(), nodeId, type: type.name, settings, inputs, outputs };
    execution.steps.push(step);

    // Get any saved values from EncryptedSettings
    const savedValues = await EncryptedSettings.getValues(settings.password);
    // TODO
    function collectDollarVals(obj, vals = []) {
      Object.keys(obj).forEach(key => {
        if (key.startsWith('$')) {
          vals.push(key.slice(1));
        }

        const val = obj[key];
        if (typeof val === 'string' && val.startsWith('$')) {
          vals.push(val.slice(1));
        } else if (val && typeof val === 'object') {
          collectDollarVals(val, vals); // recursive for nested objects
        }
      });
      return vals;
    }

    const vals = collectDollarVals(settings).join(',');

    // Dispatch startevents
    Base.dispatch('onNodeShowStatus', execution);
    Base.dispatch('onNodeRunStart', step);

    // Execute the node
    result = await Engine.execute(type.name, settings, nodeId);
    execution.steps.at(-1).result = result;

    // Dispatch result events
    result.nodeId = nodeId;
    Base.dispatch('onNodeResult', result);
    Base.dispatch('onNodeRunEnd', execution);
    Base.dispatch('onNodeShowStatus', execution);

    // If the node has a run_only output, run only the nodes in the run_only array
    if (result?.hasOwnProperty('run_only')) outputs = result.run_only;

    // Run the subsequent nodes
    outputs.forEach(nextId => {
      Engine.run(nextId, def, result);
    });
  }

  // Execution of a node
  static async execute(type, data, nodeId, callingNode = null) {
    if (!type) throw new Error('Missing node type');
    const executor = NodeTypes[type]?.execute;
    if (!executor) throw new Error(`Unknown node type: ${type}`);

    Object.assign(data, {
      nodeId,
      ...(type === 'Logic' && { callingNode }),
    });

    const timeout = (p, ms) =>
      Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('Timeout')), ms))]);

    try {
      runningNodes[nodeId] = type;
      const ms = type === 'Trigger' ? MAX_TRIGGER_TIMEOUT : MAX_LOGIC_TIMEOUT;
      return await timeout(executor(data), ms);
    } catch (err) {
      return { error: true, message: err.message };
    } finally {
      delete runningNodes[nodeId];
    }
  }

  static setGlobal(name, value) {
    this.executions.at(-1).globals[name] = value;
  }

  static getGlobal(name) {
    return this.executions.at(-1).globals[name];
  }

  static getGlobals() {
    if (this.executions.length === 0) return {};
    return this.executions.at(-1).globals;
  }

  static removeGlobal(name) {
    delete this.executions.at(-1).globals[name];
  }
}
export default Engine;