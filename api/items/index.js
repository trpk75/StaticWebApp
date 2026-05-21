let items = [];
let nextId = 1;

function json(status, body) {
  return {
    status,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
}

function parseBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "object") {
    return req.body;
  }

  try {
    return JSON.parse(req.body);
  } catch (error) {
    return null;
  }
}

module.exports = async function (context, req) {
  const method = req.method.toUpperCase();
  const id = req.params.id ? Number(req.params.id) : null;

  if (req.params.id && !Number.isInteger(id)) {
    context.res = json(400, { error: "Item id must be a number." });
    return;
  }

  if (method === "GET" && id === null) {
    context.res = json(200, items);
    return;
  }

  if (method === "GET") {
    const item = items.find((entry) => entry.id === id);
    context.res = item ? json(200, item) : json(404, { error: "Item not found." });
    return;
  }

  if (method === "POST") {
    const body = parseBody(req);
    if (body === null) {
      context.res = json(400, { error: "Request body must be valid JSON." });
      return;
    }

    const item = {
      id: nextId++,
      name: body.name || "Untitled item",
      description: body.description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    items.push(item);
    context.res = json(201, item);
    return;
  }

  if (method === "PUT") {
    if (id === null) {
      context.res = json(400, { error: "Item id is required." });
      return;
    }

    const body = parseBody(req);
    if (body === null) {
      context.res = json(400, { error: "Request body must be valid JSON." });
      return;
    }

    const index = items.findIndex((entry) => entry.id === id);
    if (index === -1) {
      context.res = json(404, { error: "Item not found." });
      return;
    }

    items[index] = {
      ...items[index],
      ...body,
      id,
      updatedAt: new Date().toISOString()
    };

    context.res = json(200, items[index]);
    return;
  }

  if (method === "DELETE") {
    if (id === null) {
      context.res = json(400, { error: "Item id is required." });
      return;
    }

    const index = items.findIndex((entry) => entry.id === id);
    if (index === -1) {
      context.res = json(404, { error: "Item not found." });
      return;
    }

    const [deletedItem] = items.splice(index, 1);
    context.res = json(200, deletedItem);
    return;
  }

  context.res = json(405, { error: "Method not allowed." });
};
