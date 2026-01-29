import { vi } from 'vitest';
import * as React from 'react';

// Polyfill React.act for React 19 compatibility with @testing-library/react
// @ts-ignore
if (!React.act) {
  // @ts-ignore
  React.act = async (callback: () => void | Promise<void>) => {
    const result = callback();
    if (result instanceof Promise) {
      await result;
    }
    return result;
  };
}
