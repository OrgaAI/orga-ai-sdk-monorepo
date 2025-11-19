import nock from 'nock';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: fetch } = require('cross-fetch');

(global as any).fetch = fetch;

afterEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});