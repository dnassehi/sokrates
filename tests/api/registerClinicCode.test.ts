import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/registerClinicCode';
import { authAdmin, firestoreAdmin } from '../../lib/firebaseAdmin';

jest.mock('../../lib/firebaseAdmin', () => ({
  authAdmin: { verifyIdToken: jest.fn() },
  firestoreAdmin: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn(),
  }
}));

describe('/api/registerClinicCode', () => {
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

  it('404 when clinic not exists', async () => {
    (authAdmin.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'uid1' });
    (firestoreAdmin.get as jest.Mock).mockResolvedValue({ exists: false });
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body: { clinicCode: 'BAD' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(404);
  });

  it('200 on success', async () => {
    (authAdmin.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'uid1' });
    (firestoreAdmin.get as jest.Mock).mockResolvedValue({ exists: true });
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body: { clinicCode: 'OK' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(firestoreAdmin.set).toHaveBeenCalled();
  });
});
