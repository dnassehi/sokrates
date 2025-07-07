import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/listSession'
import { authAdmin, firestoreAdmin } from '../../lib/firebaseAdmin'

jest.mock('../../lib/firebaseAdmin', () => ({
  authAdmin: { verifyIdToken: jest.fn() },
  firestoreAdmin: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    get: jest.fn()
  }
}))

describe('/api/listSession', () => {
  it('405 on POST', async () => {
    const { req, res } = createMocks({ method: 'POST' })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(405)
  })

  it('401 without token', async () => {
    const { req, res } = createMocks({ method: 'GET', headers: {} })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(401)
  })

  it('403 if doctor not found', async () => {
    ;(authAdmin.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'd1' })
    ;(firestoreAdmin.get as jest.Mock).mockResolvedValue({ exists: false })
    const { req, res } = createMocks({
      method: 'GET',
      headers: { authorization: 'Bearer t' }
    })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(403)
  })

  it('200 on success', async () => {
    ;(authAdmin.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'd1' })
    ;(firestoreAdmin.get as jest.Mock)
      .mockResolvedValueOnce({ exists: true, data: () => ({ clinicCode: 'C' }) })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 's1',
            data: () => ({
              patientId: 'p1',
              status: 'done',
              startedAt: { toDate: () => new Date('2025-01-01T00:00:00Z') }
            })
          }
        ]
      })
    const { req, res } = createMocks({
      method: 'GET',
      headers: { authorization: 'Bearer t' }
    })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(200)
    expect(res._getJSONData()).toEqual({
      sessions: [
        {
          id: 's1',
          patientId: 'p1',
          status: 'done',
          startedAt: '2025-01-01T00:00:00.000Z'
        }
      ]
    })
  })
})
