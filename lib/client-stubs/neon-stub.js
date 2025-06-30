// Stub file for @neondatabase/serverless on client side
// This prevents 'self is not defined' errors

module.exports = {
  neon: () => ({
    query: async () => [],
  }),
  Pool: class MockPool {
    constructor() {}
    connect() { return Promise.resolve({ query: async () => ({ rows: [] }) }); }
    query() { return Promise.resolve({ rows: [] }); }
    end() { return Promise.resolve(); }
  },
  Client: class MockClient {
    constructor() {}
    connect() { return Promise.resolve(); }
    query() { return Promise.resolve({ rows: [] }); }
    end() { return Promise.resolve(); }
  },
};
