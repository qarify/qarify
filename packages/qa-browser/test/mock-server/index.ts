import { setupServer } from 'msw/node'
import { handlers as mockHandlers } from './handlers'
import { HttpHandler } from 'msw';

export * from './handlers';

export const setup = (handlers?: HttpHandler[]) => {
  return setupServer(...(handlers ? handlers : mockHandlers));
};
