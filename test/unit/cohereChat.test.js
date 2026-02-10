
const { beforeEach, afterEach, describe, test, expect } = require('@jest/globals');

let moduleUnderTest;

beforeEach(() => {
  // Use require so Jest + babel-jest transforms the MJS to CommonJS for testing
  // This avoids experimental vm modules dynamic import issues
  moduleUnderTest = require('../../src/modules/cohereChat.js');
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('parseCohereAssistantText', () => {
  test('parses text field', () => {
    expect(moduleUnderTest.parseCohereAssistantText({ text: 'hello' })).toBe('hello');
  });

  test('parses generations field', () => {
    expect(moduleUnderTest.parseCohereAssistantText({ generations: [{ text: 'gen' }] })).toBe('gen');
  });

  test('parses choices.message.content', () => {
    expect(moduleUnderTest.parseCohereAssistantText({ choices: [{ message: { content: 'choice' } }] })).toBe('choice');
  });

  test('parses output[0].content', () => {
    expect(moduleUnderTest.parseCohereAssistantText({ output: [{ content: 'out' }] })).toBe('out');
  });

  test('parses message.content array', () => {
    expect(moduleUnderTest.parseCohereAssistantText({ message: { content: ['a', 'b'] } })).toBe('a\nb');
  });

  test('returns empty string for unknown shape', () => {
    expect(moduleUnderTest.parseCohereAssistantText(null)).toBe('');
  });
});

describe('sendCohereChatRequest', () => {
  test('sends fetch to correct endpoint and returns parsed text', async () => {
    const fakeResponse = { ok: true, json: async () => ({ text: 'from api' }) };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(fakeResponse);

    const res = await moduleUnderTest.sendCohereChatRequest('MY_KEY', 'user content', { model: 'mini' });

    expect(res).toBe('from api');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.cohere.ai/chat');
    expect(options.headers.Authorization).toBe('Bearer MY_KEY');
    expect(options.headers['Content-Type']).toBe('application/json');
    const body = JSON.parse(options.body);
    expect(body.model).toBe('mini');
    expect(body.messages.some(m => m.content.includes('user content'))).toBe(true);
  });

  test('throws on non-ok response', async () => {
    const fakeResponse = { ok: false, status: 401, text: async () => 'unauthorized' };
    jest.spyOn(global, 'fetch').mockResolvedValue(fakeResponse);

    await expect(moduleUnderTest.sendCohereChatRequest('BAD', 'x')).rejects.toThrow(/Cohere API returned status 401/);
  });
});
