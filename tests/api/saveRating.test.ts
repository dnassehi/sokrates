import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/saveRating';
import { authAdmin, firestoreAdmin, FieldValue } from '../../lib/firebaseAdmin';

jest.mock('../../lib/firebaseAdmin', () => ({
  authAdmin: { verifyIdToken: jest.fn() },
  firestoreAdmin: { collection: jest.fn().mockReturnThis(), add: jest.fn() },
  FieldValue: { serverTimestamp: jest.fn() }
}));

describe('/api/saveRating', () => {
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

  it('400 on missing fields', async () => {
    (authAdmin.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'd1' });
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer t' },
      body: {}
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('200 on valid', async () => {
    (authAdmin.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'd1' });
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer t' },
      body: { sessionId:'s1', patientId:'p1', score:5, comment:'OK' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(firestoreAdmin.add).toHaveBeenCalled();
  });
});
