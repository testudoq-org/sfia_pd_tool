module.exports = {
  search: {
    queries: {
      valid: 'SUST',
      nonExistent: 'BPTS'
    }
  },
  endpoints: {
    local: 'local',
    dist: 'dist',
    production: 'production'
  },
  retry: {
    retries: 3,
    minTimeout: 1000
  },
  timeouts: {
    waitFor: 10000
  }
};
