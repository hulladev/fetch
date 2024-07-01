import { afterAll, beforeAll, beforeEach, describe, expect, expectTypeOf, test } from 'vitest'
import { instance } from '../src/instance'
import { createServer, users } from './mockserver'

const server = createServer()
beforeAll(() => server.listen())
beforeEach(() => server.resetHandlers())
afterAll(() => server.close())

// these tests do not focus on functionality of request, these are done in separate request.test.ts file
// but we do check for differences in createRequest controller
describe('requests', () => {
  test('create instance', () => {
    const i = instance({})
    expect(i.request).toBeTypeOf('function')
    const r = i.request({ url: 'https://api.com' })
    expect(r).toStrictEqual({ url: 'https://api.com', method: 'GET' })
    expectTypeOf(r.url).toEqualTypeOf<'https://api.com'>()
    expectTypeOf(r.method).toEqualTypeOf<'GET'>()
  })
  test('baseURL is appended', () => {
    const i = instance({ baseURL: 'https://api.com' })
    const r = i.request({ url: '/users' })
    expect(r).toStrictEqual({ url: 'https://api.com/users', method: 'GET' })
    expectTypeOf(r.url).toEqualTypeOf<'https://api.com/users'>()
    expectTypeOf(r.method).toEqualTypeOf<'GET'>()
  })
  test('defaults are merged', () => {
    const i = instance({ defaults: { cache: 'force-cache' } })
    const r = i.request({ url: 'https://api.com' })
    expect(r).toStrictEqual({
      url: 'https://api.com',
      method: 'GET',
      cache: 'force-cache',
    })
    expectTypeOf(r.url).toEqualTypeOf<'https://api.com'>()
    expectTypeOf(r.method).toEqualTypeOf<'GET'>()
    expectTypeOf(r.cache).toEqualTypeOf<'force-cache'>()
  })
  test('request interceptor', () => {
    const i = instance({
      interceptors: {
        request: (req) => ({ ...req, headers: { 'X-Test': 'true' } }),
      },
    })
    const r = i.request({ url: 'https://api.com' })
    expect(r).toStrictEqual({
      url: 'https://api.com',
      method: 'GET',
      headers: { 'X-Test': 'true' },
    })
    expectTypeOf(r.url).toEqualTypeOf<'https://api.com'>()
    expectTypeOf(r.method).toEqualTypeOf<'GET'>()
    expectTypeOf(r.headers['X-Test']).toEqualTypeOf<string>()
  })
})

describe('response', () => {
  test('get requests', async () => {
    const i = instance()
    const rs1 = i
      .response(i.request({ url: 'https://api.com/users' }))
      .then((r) => r.json() as Promise<{ users: typeof users }>)
    expect(rs1).resolves.toStrictEqual({ users })
    expectTypeOf(rs1).toEqualTypeOf<Promise<{ users: typeof users }>>()
  })
  test('with transform', async () => {
    const i = instance({
      transform: (res) => res.json(),
    })
    const rs1 = i
      .response(i.request({ url: 'https://api.com/users' }))
      .then((r) => r as Promise<{ users: typeof users }>)
    expect(rs1).resolves.toStrictEqual({ users })
    expectTypeOf(rs1).toEqualTypeOf<Promise<{ users: typeof users }>>()
  })
})
