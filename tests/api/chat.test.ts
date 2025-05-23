import { createMocks } from 'node-mocks-http';
import handler, { config } from '../../pages/api/chat';
import OpenAI from 'openai';

describe('/api/chat', () => {
  it('config disables bodyParser', () => {
    expect(config.api.bodyParser).toBe(false);
  });

  it('405 on GET', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it('400 on invalid JSON', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: 'not-json'
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('streams SSE on valid request', async () => {
    // Mock OpenAI streaming
    const fakeStream = {
      [Symbol.asyncIterator]: function* () {
        yield { choices: [{ delta: { content: '{"foo":"bar"}' } }] };
        yield { choices: [{ delta: {} }] };
      }
    };
    jest.spyOn(OpenAI.prototype.chat.completions, 'create')
      .mockResolvedValue(fakeStream as any);

    const messages = [{ role: 'user', content: 'Hello' }];
    const { req, res } = createMocks({
      method: 'POST',
      body: JSON.stringify({ messages, isEdit: false })
    });
    await handler(req, res);
    expect(res._getHeaders()['content-type']).toMatch('text/event-stream');
    const data = res._getData();
    expect(data).toContain('data: '); 
    expect(data).toContain('[DONE]');
  });
});
