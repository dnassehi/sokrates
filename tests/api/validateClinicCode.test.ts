import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/validateClinicCode';
import { firestoreAdmin } from '../../lib/firebaseAdmin';

jest.mock('../../lib/firebaseAdmin', () => ({
  firestoreAdmin: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
  }
}));

describe('/api/validateClinicCode', () => {
  it('405 on GET', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it('400 on missing body', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('404 when code not found', async () => {
    (firestoreAdmin.get as jest.Mock).mockResolvedValue({ exists: false });
    const { req, res } = createMocks({
      method: 'POST',
      body: { clinicCode: 'UNKNOWN' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(404);
  });

  it('200 when code exists', async () => {
    (firestoreAdmin.get as jest.Mock).mockResolvedValue({ exists: true });
    const { req, res } = createMocks({
      method: 'POST',
      body: { clinicCode: 'EXISTING' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ valid: true });
  });
});
