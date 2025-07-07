import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/getSession'
import { authAdmin, firestoreAdmin } from '../../lib/firebaseAdmin'

jest.mock('../../lib/firebaseAdmin', () => ({
  authAdmin: { verifyIdToken: jest.fn() },
  firestoreAdmin: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn()
  }
}))

describe('/api/getSession', () => {
  it('405 on GET', async () => {
    const { req, res } = createMocks({ method: 'GET' })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(405)
  })

  it('401 without token', async () => {
    const { req, res } = createMocks({ method: 'POST', headers: {} })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(401)
  })

  it('404 when session missing', async () => {
    ;(authAdmin.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'd1' })
    ;(firestoreAdmin.get as jest.Mock).mockResolvedValue({ exists: false })
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer t' },
      body: { sessionId: 's1' }
    })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(404)
  })

  it('403 if wrong doctor', async () => {
    ;(authAdmin.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'd1' })
    ;(firestoreAdmin.get as jest.Mock).mockResolvedValue({
      exists: true,
      data: () => ({ doctorId: 'd2' })
    })
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer t' },
      body: { sessionId: 's1' }
    })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(403)
  })

  it('200 on success', async () => {
    ;(authAdmin.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'd1' })
    ;(firestoreAdmin.get as jest.Mock).mockResolvedValue({
      exists: true,
      data: () => ({
        doctorId: 'd1',
        patientId: 'p1',
        summary: { foo: 'bar' },
        status: 'done'
      })
    })
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer t' },
      body: { sessionId: 's1' }
    })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(200)
    expect(res._getJSONData()).toEqual({
      session: { patientId: 'p1', summary: { foo: 'bar' }, status: 'done' }
    })
  })
})
