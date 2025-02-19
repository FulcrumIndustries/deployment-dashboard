export const debug = {
  enabled: localStorage.getItem('debug') === 'true',
  log: (...args: any[]) => {
    if (debug.enabled) {
      console.debug('[DEBUG]', new Date().toISOString(), ...args);
    }
  },
  error: (...args: any[]) => {
    if (debug.enabled) {
      console.error('[ERROR]', new Date().toISOString(), ...args);
    }
  }
}; 