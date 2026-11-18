import { api } from './api.js';

const makeId = (category, name, order) =>
  `${encodeURIComponent(category)}:${encodeURIComponent(name)}:${order}`;

const normalizeStack = (groups) =>
  (Array.isArray(groups) ? groups : [])
    .filter((group) => group && typeof group.name === 'string')
    .map((group) => ({
      id: String(group.id || ''),
      name: String(group.name || '').trim(),
      side: group.side === 'front' ? 'front' : 'back',
      items: Array.isArray(group.items)
        ? group.items.map((item) => String(item).trim()).filter(Boolean)
        : [],
    }))
    .filter((group) => group.name);

const flattenTools = (groups) => {
  let order = 0;
  return normalizeStack(groups).flatMap((group) =>
    group.items.map((name) => ({
      id: makeId(group.name, name, order),
      name,
      category: group.name,
      side: group.side,
      order: order++,
      published: true,
    })),
  );
};

const buildStack = (tools) => {
  const categories = [];

  tools
    .slice()
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    .forEach((tool) => {
      let category = categories.find((group) => group.name === tool.category);
      if (!category) {
        category = {
          id: '',
          name: tool.category,
          side: tool.side === 'front' ? 'front' : 'back',
          items: [],
        };
        categories.push(category);
      }
      category.items.push(tool.name);
    });

  return categories;
};

export async function getTools() {
  const groups = await api('/api/admin/stack');
  return flattenTools(groups);
}

export async function getPublicTools() {
  const result = await api('/api/tools');
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.tools)) return result.tools;
  return [];
}

export async function createTool(payload) {
  const groups = await api('/api/admin/stack');
  const tools = flattenTools(groups);
  const nextTool = {
    name: String(payload.name || '').trim(),
    category: String(payload.category || 'Tools').trim() || 'Tools',
    side: payload.side === 'front' ? 'front' : 'back',
    order: Number.isInteger(payload.order) ? payload.order : tools.length,
  };

  if (!nextTool.name) throw new Error('Tool name is required.');
  if (tools.some((tool) => tool.name.toLowerCase() === nextTool.name.toLowerCase())) {
    throw new Error(`${nextTool.name} already exists.`);
  }

  tools.splice(Math.min(Math.max(nextTool.order, 0), tools.length), 0, nextTool);
  tools.forEach((tool, index) => {
    tool.order = index;
  });

  return api('/api/admin/stack', {
    method: 'PUT',
    body: JSON.stringify(buildStack(tools)),
  });
}

export async function updateTool(id, payload) {
  const groups = await api('/api/admin/stack');
  const tools = flattenTools(groups);
  const index = tools.findIndex((tool) => tool.id === id);
  if (index < 0) throw new Error('Tool not found.');

  const name = String(payload.name || '').trim();
  if (!name) throw new Error('Tool name is required.');
  if (
    tools.some(
      (tool, toolIndex) =>
        toolIndex !== index && tool.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    throw new Error(`${name} already exists.`);
  }

  const next = {
    ...tools[index],
    name,
    category: String(payload.category || 'Tools').trim() || 'Tools',
    side: payload.side === 'front' ? 'front' : 'back',
  };
  tools.splice(index, 1);
  const order = Number.isInteger(payload.order)
    ? Math.min(Math.max(payload.order, 0), tools.length)
    : index;
  tools.splice(order, 0, next);
  tools.forEach((tool, toolIndex) => {
    tool.order = toolIndex;
  });

  return api('/api/admin/stack', {
    method: 'PUT',
    body: JSON.stringify(buildStack(tools)),
  });
}

export async function deleteTool(id) {
  const groups = await api('/api/admin/stack');
  const tools = flattenTools(groups).filter((tool) => tool.id !== id);
  tools.forEach((tool, index) => {
    tool.order = index;
  });

  return api('/api/admin/stack', {
    method: 'PUT',
    body: JSON.stringify(buildStack(tools)),
  });
}
