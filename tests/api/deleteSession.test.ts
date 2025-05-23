import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/deleteSession';
import { firestoreAdmin } from '../../lib/firebaseAdmin';

jest.mock('../../lib/firebaseAdmin', () => ({
  firestoreAdmin: {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn(),
    Timestamp: { fromDate: jest.fn() }
  }
}));

describe('/api/deleteSession', () => {
  it('405 on GET', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it('401 on bad key', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: { 'x-admin-key': 'wrong' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  it('400 on invalid body', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: { 'x-admin-key': process.env.ADMIN_API_KEY },
      body: {}
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('404 when no session', async () => {
    (firestoreAdmin.get as jest.Mock).mockResolvedValue({ empty: true });
    const { req, res } = createMocks({
      method: 'POST',
      headers: { 'x-admin-key': process.env.ADMIN_API_KEY },
      body: { clinicCode: 'C', timestamp: new Date().toISOString() }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(404);
  });

  it('200 on delete', async () => {
    (firestoreAdmin.get as jest.Mock).mockResolvedValue({ empty: false, docs: [{ ref: { delete: jest.fn() } }] });
    const { req, res } = createMocks({
      method: 'POST',
      headers: { 'x-admin-key': process.env.ADMIN_API_KEY },
      body: { clinicCode: 'C', timestamp: new Date().toISOString() }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});
