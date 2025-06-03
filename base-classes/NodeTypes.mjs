import TypeTrigger from '../components/TypeTrigger.mjs';

const TriggerNode = {
  name: 'Trigger',
  description: 'Trigger',
  icon: 'fa-solid fa-bolt',
  propertiesHTML: `<type-trigger type='now' propname="trigger_time" class="propvalue"></type-trigger>`,
  load: function (node, propertiesBox) {
    const tt = propertiesBox.querySelector('type-trigger');
    const settings = node.data.settings;
    if(!settings?.trigger_time) settings.trigger_time = {type: 'now'};
    tt.attrType(settings.trigger_time.type);
  },
  execute: async function (data) {
    function toISO8601(input) {
      const [datetime, meridian, tzName, gmtOffset] = input.split(' ', 4);
      const [datePart, timePart] = datetime.split('T');

      let [hour, minute, second] = timePart.split(':').map(Number);
      if (meridian === 'AM') {
        if (hour === 12) hour = 0;
      } else if (meridian === 'PM') {
        if (hour !== 12) hour += 12;
      }

      const hh = String(hour).padStart(2, '0');
      const mm = String(minute).padStart(2, '0');
      const ss = String(second).padStart(2, '0');

      const match = gmtOffset.match(/GMT([+-])(\d{2})(\d{2})/);
      const offset = `${match[1]}${match[2]}:${match[3]}`;

      return `${datePart}T${hh}:${mm}:${ss}${offset}`;
    }

    function parseDelayToMs(input) {
      const regex = /^(\d+)(s|m|h|d)$/;
      const match = input.trim().toLowerCase().match(regex);
      if (!match) throw new Error('Invalid delay format (use s, m, h, d)');
      const value = parseInt(match[1], 10);
      const unit = match[2];
      const unitToMs = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
      return value * unitToMs[unit];
    }

    try {
      if (data.trigger_time.type == 'now') {
        return { data: { message: 'Triggered immediately', triggered: true, nodeId: data.nodeId } };
      }
      if (data.trigger_time.type === 'at-time-input') {
        const { date, hours, minutes, seconds, ampm, timezone } = data.trigger_time;
        const fmttime = toISO8601(`${date}T${hours}:${minutes}:${seconds} ${ampm} ${timezone}`);
        const targetDate = new Date(fmttime);
        if (isNaN(targetDate.getTime())) throw new Error('Invalid date format');

        const now = new Date();
        const timeDiff = targetDate.getTime() - now.getTime();
        if (timeDiff <= 0) {
          return {
            message: 'Trigger time has already passed',
            triggered: true,
            nodeId: data.nodeId
          };
        }

        const interval = setInterval(() => {
          const timeDiff = targetDate.getTime() - new Date().getTime();
          Base.dispatch('onTriggerRunning', { targetDate: targetDate, diff: timeDiff, nodeId: data.nodeId });
        }, 1000);

        await new Promise(resolve => setTimeout(resolve, timeDiff));
        clearInterval(interval);
        return {
          data: { message: `Triggered at ${new Date().toISOString()}`, triggered: true, nodeId: data.nodeId }
        };
      }

      if (data.trigger_time.type === 'wait-input') {
        const hours = +data.trigger_time.hours;
        const minutes = +data.trigger_time.minutes;
        const seconds = +data.trigger_time.seconds;
        const delayMs = (hours * 3600000) + (minutes * 60000) + (seconds * 1000);
        if (delayMs <= 0) throw new Error('Delay must be a positive duration');

        let remaining = delayMs;
        const interval = setInterval(() => {
          remaining -= 1000;
          Base.dispatch('onTriggerRunning', { targetMs: delayMs, remainingMs: remaining, nodeId: data.nodeId });
        }, 1000);

        await new Promise(resolve => setTimeout(resolve, delayMs));

        clearInterval(interval);
        return {
          message: `Triggered after delay (${delayMs}ms)`,
          triggered: true,
          nodeId: data.nodeId
        };
      }

      throw new Error(`Unknown trigger type: ${data.trigger_time.type}`);
    } catch (error) {
      return {
        statusText: 'Bad Request',
        data: { error: error.message },
        error: true
      };
    }
  }
};

const GlobalsNode = {
  name: 'Globals',
  description: 'Globals',
  icon: 'fa-solid fa-globe',
  propertiesHTML: `<set-globals></set-globals>`,
  execute: async ({ name, value, operation }) => {
    if (!name) {
      return { error: true, message: `Global name is required` };
    }
    try {
      if (operation == 'set') {
        Engine.setGlobal(name, value);
      } else if (operation == 'increment') {
        Engine.setGlobal(name, Engine.getGlobal(name) + 1);
      } else if (operation == 'remove') {
        Engine.removeGlobal(name);
      }
      return { set_global_success: true };
    } catch (e) {
      return { error: true, message: e.message };
    }
  }
};

const LogicNode = {
  name: 'Logic',
  description: 'Logic',
  icon: 'fa-solid',
  propertiesHTML: `<logic-box></logic-box>`,
  execute: async function (data) {
    const callingNode = data.callingNode;
    delete data.callingNode;
    const nodeId = data.nodeId;
    const node = editor.getNode(nodeId);

    if (data.runWhen == "first" && node.data.inputs?.length > 1) {
      engine.execution.steps.forEach(step => {
        if (step.node == nodeId && step?.type == "first" && step?.status != "completed" && step?.dont_run[callingNode.id]) {
          step.dont_run[callingNode.id].status = "cancelled";
          abort = true;
          step.status = "completed";
          for (const key in step?.dont_run) {
            if (step.dont_run[key].status == "running") {
              step.status = "running"
            }
          }
        }
      });

      if (!abort && data.runWhen == "first") {
        const dont_run = {};
        node.data.inputs.forEach(input => {
          dont_run[input] = { status: input != callingNode.id ? "running" : "completed" };
        });

        engine.execution.steps.push({
          node: nodeId,
          type: "first",
          status: node.data.inputs.length > 1 ? "running" : "completed",
          dont_run: dont_run
        });
      }
      if (abort) return { nodeId: data.nodeId, message: `Not running ${callingNode.id} because it was cancelled` };
    }

    if (data.runWhen == "every" && node.data.inputs?.length > 1) {
      let has_every = false;
      engine.execution.steps.forEach(step => {
        if (step.node == nodeId && step?.type == "every" && step?.status != "completed" && step?.wait_for[callingNode.id]) {
          step.wait_for[callingNode.id].status = "completed";
          has_every = true;
          step.status = "completed";
          for (const key in step.wait_for) {
            if (step.wait_for[key].status == "running") {
              step.status = "running";
            }
          }
          if (step.status == "running") {
            step.store = data;
            return { nodeId: data.nodeId, message: `Not running ${callingNode.id} because it is awaiting` };
          } else {
            data = { ...data, ...step.store };
          }
        }
      });

      if (!has_every) {
        const wait_for = {};
        node.data.inputs.forEach(input => {
          wait_for[input] = { status: input != callingNode.id ? "running" : "completed" };
        });

        engine.execution.steps.push({
          node: nodeId,
          type: "every",
          status: node.data.inputs.length > 1 ? "running" : "completed",
          wait_for: wait_for
        });
      }
    }

    if (data.logic.conditions.length == 0) return { message: "No conditions" };
    const run_only = [];
    data.logic.conditions.forEach(condition => {
      const { logic1, operator, logic2, targetNode } = condition;
      if (!logic1 || !operator || !logic2 || !targetNode) return { error: true, message: "Fields not present" };
      try {
        if (operator === 'IS' && logic1 == logic2) {
          run_only.push(targetNode);
        }
        if (operator === 'IS NOT' && logic1 != logic2) {
          run_only.push(targetNode);
        }
        if (operator === 'CONTAINS' && logic1.includes(logic2)) {
          run_only.push(targetNode);
        }
        if (operator === 'MATCH REGEX' && logic1.match(new RegExp(logic2))) {
          run_only.push(targetNode);
        }
      } catch (error) {
        return {
          error: true,
          message: error.message
        };
      }
    });
    return {
      run_only: run_only
    };
  }
};

const WebNode = {
  name: 'Web',
  description: 'Web',
  icon: 'fa-solid fa-bolt',
  requiredFields: ['url'],
  propertiesHTML: `<div class="node-content" style="display: flex; flex-direction: column; gap: 10px; padding: 10px;">
    <select propname="method" class="propvalue" style="padding: 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px;">
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
        <option value="PATCH">PATCH</option>
        <option value="HEAD">HEAD</option>
        <option value="OPTIONS">OPTIONS</option>
    </select>

    <u-box 
        no-new-entries="true"
        default-value="https://echo.free.beeceptor.com"
        onkeyup="this.validate()"
        validity="^https?\:\/\/" 
        propname="url" 
        class="propvalue" 
        type="text" 
        placeholder="URL"
        style="border: 1px solid #ccc; border-radius: 6px; font-size: 14px;"
    ></u-box>
        <two-col-inputs 
            placeholder1="Header" 
            placeholder2="Value"
        style="display: block;"
    ></two-col-inputs>

    <textarea 
        propname="body" 
        class="propvalue" 
        placeholder="Body"
        style="padding: 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; resize: vertical; min-height: 80px;"
    ></textarea>

    <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
        <checkbox-super propname="follow_redirects" class="propvalue" id="follow_redirects"></checkbox-super>
        <label for="follow_redirects" style="font-size: 14px;">Follow Redirects</label>
    </div>
</div>`,
  execute: async function (data) {
    const validateResponse = async (res, schema) => {
      if (res.status !== schema.status) throw new Error("Invalid status");

      for (const [key, pattern] of Object.entries(schema.headers || {})) {
        const val = res.headers.get(key);
        if (!val || !pattern.test(val)) throw new Error(`Invalid header ${key}: ${val}`);
      }

      const json = await res.json();

      for (const [key, rule] of Object.entries(schema.body || {})) {
        const val = json[key];
        const valid = typeof rule === "function" ? rule(val) : val === rule;
        if (!valid) throw new Error(`Invalid body.${key}`);
      }

      return json;
    };

    const { method, url, headers = {}, body, response: schema } = data;

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      if (schema) await validateResponse(res, schema);

      return {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers),
        data: await res.json()
      };
    } catch (err) {
      return err.response ? {
        status: err.response.status,
        statusText: err.response.statusText,
        headers: err.response.headers,
        data: err.response.data,
        error: true
      } : { error: true, message: err.message };
    }
  }
};

const LLM = {
  name: 'LLM',
  description: 'LLM',
  icon: 'fa-solid fa-robot',
  requiredFields: ['prompt'],
  propertiesHTML: `<api-box></api-box>`
};

const APINode = {
  name: 'API',
  description: 'API',
  icon: 'fa-solid fa-robot',
  propertiesHTML: `<api-box></api-box>`,
  execute: async function (data) {
    const useProxy = !!data.api.apitype.match(/gemini/);

    Object.keys(data.api).forEach(key => {
      if (data.api[key] == "") {
        delete data.api[key];
      }
    });

    const resp = await api[data.api.apitype](data.api, useProxy ? proxy : undefined);
    console.log(resp);
    return resp;
  }
};

const DownloadFileNode = {
  name: 'Download file',
  description: 'Download file',
  icon: 'fa-solid fa-download',
  requiredFields: ['url'],
  propertiesHTML: `<div class="node-content" style="display: flex; flex-direction: column; gap: 10px; padding: 10px;">
    <label for="url" style="font-size: 14px; margin-bottom: 2px;">URL:</label>
    <u-box 
        propname="url" 
        class="propvalue" 
        id="url" 
        type="text" 
        placeholder="URL"
        no-new-entries="true"
        style="width: 300px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px;"
    ></u-box>
    <label for="filename" style="font-size: 14px; margin-bottom: 2px;">Filename:</label>
    <u-box 
        propname="filename" 
        class="propvalue" 
        id="filename" 
        type="text" 
        placeholder="Filename"
        no-new-entries="true"
        style="width: 300px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px;"
    ></u-box>
</div>`,
  execute: async function (data) {
    const { url, filename } = data;
    if (!url) {
      throw new Error('URL is required');
    }
    const resp = await fetch(url, {
      method: 'GET',
      responseType: 'blob'
    });
    if(!resp.ok) {
      return { error: true, message: 'Failed to download file', status: resp.status, statusText: resp.statusText };
    }
    const blob = new Blob([resp.data], { type: resp.headers['content-type'] });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    return resp;
  }
};

const EmailNode = {
  name: 'Email',
  description: 'Email',
  icon: 'fa-solid fa-envelope',
  requiredFields: ['from', 'to', 'subject', 'htmlContent'],
  propertiesHTML: `<div class="node-content" style="display: flex; flex-direction: column; gap: 10px; padding: 10px;">
    <label for="from" style="font-size: 14px; margin-bottom: 2px;">From:</label>
    <input 
        propname="from" 
        class="propvalue" 
        id="from" 
        type="email" 
        placeholder="From"
        style="padding: 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px;"
    >

    <label for="to" style="font-size: 14px; margin-bottom: 2px;">To:</label>
    <input 
        propname="to" 
        class="propvalue" 
        id="to" 
        type="email" 
        placeholder="To"
        style="padding: 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px;"
    >

    <label for="subject" style="font-size: 14px; margin-bottom: 2px;">Subject:</label>
    <input 
        propname="subject" 
        class="propvalue" 
        id="subject" 
        type="text" 
        placeholder="Subject"
        style="padding: 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px;"
    >

    <label for="htmlContent" style="font-size: 14px; margin-bottom: 2px;">HTML Content:</label>
    <textarea 
        propname="htmlContent" 
        class="propvalue" 
        id="htmlContent"
        placeholder="HTML Content"
        style="padding: 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; resize: vertical; min-height: 100px;"
    ></textarea>
</div>`,
  execute: async function (data) {
    const { from, to, subject, htmlContent } = data;
    if (!from || !to || !subject || !htmlContent) {
      throw new Error('All fields are required');
    }
    const resp = await api.email(data);
    return resp;
  }
};

export const NodeTypes = {
  'Trigger': TriggerNode,
  'Globals': GlobalsNode,
  'Logic': LogicNode,
  'Web': WebNode,
  'LLM': LLM,
  'API': APINode,
  'Download file': DownloadFileNode,
  'Email': EmailNode
};

export default NodeTypes;