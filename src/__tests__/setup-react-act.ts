// Polyfill for React 19 + @testing-library/react compatibility
// React 19 changed the act API and @testing-library/react needs this polyfill

import { afterEach } from 'vitest';

// Add React.act polyfill for React 19
const React = require('react');
if (!React.act) {
  React.act = (callback: () => void | Promise<void>) => {
    const result = callback();
    if (result && typeof result.then === 'function') {
      return result.then(() => undefined);
    }
    return Promise.resolve(undefined);
  };
}

// Cleanup after each test
afterEach(() => {
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
  }
});
