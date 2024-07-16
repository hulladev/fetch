import { afterAll, beforeAll, beforeEach, describe, expect, expectTypeOf, test } from 'vitest'
import { response } from '../src/response'
import { type User, createServer, users } from './mockserver'
import { r1, r2, r3, r4 } from './request.test'

const server = createServer()
beforeAll(() => server.listen())
beforeEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('response', () => {
  test('get requests', async () => {
    const rs1 = response(r1).then((r) => r.json() as Promise<{ users: User[] }>)
    expect(rs1).resolves.toStrictEqual({ users })
    expectTypeOf(rs1).toEqualTypeOf<Promise<{ users: User[] }>>()
  })
  test('path params', async () => {
    const rs4 = response(r4).then((r) => r.json())
    expect(rs4).resolves.toEqual(users[1])
  })
  test('post', async () => {
    const rs2 = response(r2).then((r) => r.json())
    const rs3 = response(r3).then((r) => r.json())
    expect(rs2).resolves.toEqual({ id: 4, name: 'Bob' })
    expect(rs3).resolves.toEqual({ id: 4, name: 'Bob' })
  })
  test('transform', () => {
    const rs1 = response(r1, {
      transform: (res) => res.json().then((data) => ({ custom: data.users as User[] })),
    })
    expect(rs1).resolves.toStrictEqual({ custom: users })
    expectTypeOf(rs1).toEqualTypeOf<Promise<{ custom: User[] }>>()
  })
})
