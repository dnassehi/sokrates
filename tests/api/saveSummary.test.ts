import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/saveSummary';
import { authAdmin, firestoreAdmin, FieldValue } from '../../lib/firebaseAdmin';

jest.mock('../../lib/firebaseAdmin', () => ({
  authAdmin: { verifyIdToken: jest.fn() },
  firestoreAdmin: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    update: jest.fn()
  },
  FieldValue: { serverTimestamp: jest.fn() }
}));

describe('/api/saveSummary', () => {
  it('405 on GET', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it('401 without token', async () => {
    const { req, res } = createMocks({ method: 'POST', headers: {} });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  it('404 on missing session', async () => {
    (authAdmin.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'u1' });
    (firestoreAdmin.get as jest.Mock).mockResolvedValue({ exists: false });
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer t' },
      body: { sessionId: 's1', summary: {} }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(404);
  });

  it('403 if wrong patient', async () => {
    (authAdmin.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'u1' });
    (firestoreAdmin.get as jest.Mock).mockResolvedValue({ exists: true, data: () => ({ patientId: 'u2' }) });
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer t' },
      body: { sessionId: 's1', summary: {} }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(403);
  });

  it('200 on success', async () => {
    (authAdmin.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'u1' });
    (firestoreAdmin.get as jest.Mock).mockResolvedValue({ exists: true, data: () => ({ patientId: 'u1' }) });
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer t' },
      body: { sessionId: 's1', summary: { foo: 'bar' } }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(firestoreAdmin.update).toHaveBeenCalled();
  });
});
