/* eslint-env jest, node */
/* global jest, global, require */

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

  test('parses v2 response shape: message.content array of {type, text} objects', () => {
    const v2Response = {
      id: 'test-id',
      finish_reason: 'COMPLETE',
      message: {
        role: 'assistant',
        content: [{ type: 'text', text: 'Hello from Cohere v2' }]
      }
    };
    expect(moduleUnderTest.parseCohereAssistantText(v2Response)).toBe('Hello from Cohere v2');
  });

  test('returns empty string for unknown shape', () => {
    expect(moduleUnderTest.parseCohereAssistantText(null)).toBe('');
  });
});

describe('sendCohereChatRequest', () => {
  test('sends fetch to Cohere v2 Chat endpoint with correct body shape', async () => {
    // Simulate the v2 Chat API response shape: { message: { content: [{ type: 'text', text: '...' }] } }
    const fakeResponse = {
      ok: true,
      json: async () => ({
        id: 'test-id',
        finish_reason: 'COMPLETE',
        message: {
          role: 'assistant',
          content: [{ type: 'text', text: 'AI response here' }]
        }
      })
    };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(fakeResponse);

    const res = await moduleUnderTest.sendCohereChatRequest('MY_KEY', 'user content', { model: 'command-a-03-2025' });

    expect(res).toBe('AI response here');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    // Must use the v2 endpoint
    expect(url).toBe('https://api.cohere.com/v2/chat');
    expect(options.headers.Authorization).toBe('Bearer MY_KEY');
    expect(options.headers['Content-Type']).toBe('application/json');
    const body = JSON.parse(options.body);
    expect(body.model).toBe('command-a-03-2025');
    // v2 API: messages[].content is a plain string, NOT an array
    const userMsg = body.messages.find(m => m.role === 'user');
    expect(typeof userMsg.content).toBe('string');
    expect(userMsg.content).toContain('user content');
    // system message should also be a plain string
    const sysMsg = body.messages.find(m => m.role === 'system');
    expect(typeof sysMsg.content).toBe('string');
  });

  test('uses default model command-a-03-2025 when none specified', async () => {
    const fakeResponse = { ok: true, json: async () => ({ text: 'fallback' }) };
    jest.spyOn(global, 'fetch').mockResolvedValue(fakeResponse);

    await moduleUnderTest.sendCohereChatRequest('KEY', 'hello');
    const [, opts] = global.fetch.mock.calls[0];
    const parsed = JSON.parse(opts.body);
    expect(parsed.model).toBe('command-a-03-2025');
  });

  test('throws on non-ok response', async () => {
    const fakeResponse = { ok: false, status: 401, text: async () => 'unauthorized' };
    jest.spyOn(global, 'fetch').mockResolvedValue(fakeResponse);

    await expect(moduleUnderTest.sendCohereChatRequest('BAD', 'x')).rejects.toThrow(/Cohere API returned status 401/);
  });

  test('throws when userContent is empty', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');

    await expect(moduleUnderTest.sendCohereChatRequest('KEY', '')).rejects.toThrow(/No content provided/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
