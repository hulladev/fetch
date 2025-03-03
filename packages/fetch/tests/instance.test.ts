import { afterAll, beforeAll, beforeEach, describe, expect, expectTypeOf, test } from 'vitest'
import { instance } from '../src/instance'
import { Instance } from '../src/types'
import { createServer, User, users } from './mockserver'

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
  test('different default method', () => {
    const i = instance({ defaults: { method: 'POST' } })
    expect(i.config.defaults?.method).toStrictEqual('POST')
    expectTypeOf(i.config.defaults?.method).toEqualTypeOf<'POST'>()
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

test('passing instance as a function generic', () => {
  const i = instance({ defaults: { method: 'POST' }, baseURL: 'https://api.com' })
  const i2 = instance()

  const withInstance = <I extends Instance<any>>(instance: I) => {
    return instance
  }

  const r1 = withInstance(i).request({ url: '/users' })
  const r2 = withInstance(i).request({ url: '/users', method: 'PUT' })
  expect(r1).toStrictEqual({ url: 'https://api.com/users', method: 'POST' })
  expectTypeOf(r1.url).toEqualTypeOf<'https://api.com/users'>()
  expectTypeOf(r1.method).toEqualTypeOf<'POST'>()
  expect(r2).toStrictEqual({ url: 'https://api.com/users', method: 'PUT' })
  expectTypeOf(r2.url).toEqualTypeOf<'https://api.com/users'>()
  expectTypeOf(r2.method).toEqualTypeOf<'PUT'>()
  const r3 = withInstance(i2).request({ url: 'https://api.com/users' })
  expect(r3).toStrictEqual({ url: 'https://api.com/users', method: 'GET' })
  expectTypeOf(r3.url).toEqualTypeOf<'https://api.com/users'>()
  expectTypeOf(r3.method).toEqualTypeOf<'GET'>()
})

test('instance resolve method', () => {
  const i = instance({
    baseURL: 'https://api.com',
    transform: (res) => res.json() as Promise<{ users: User[] }>,
  })
  expect(i.resolve({ url: '/users' })).resolves.toStrictEqual({
    users,
  })
  expectTypeOf(i.resolve({ url: '/users' })).resolves.toEqualTypeOf<{ users: User[] }>()
})
