import { afterAll, beforeAll, beforeEach, expect, expectTypeOf, test } from 'vitest'
import { resolve } from '../src/resolve'
import { createServer, User, users } from './mockserver'

const server = createServer()
beforeAll(() => server.listen())
beforeEach(() => server.resetHandlers())
afterAll(() => server.close())

// since this is just a wrapper around request & response, we dont do indepth testing
// since both methods are thested throoughly in their respective test files
test('resolve', () => {
  const r = resolve(
    { url: 'https://api.com/users' },
    { transform: (res) => res.json() as Promise<{ users: User[] }> }
  )
  expect(r).resolves.toStrictEqual({ users })
  expectTypeOf(r).resolves.toEqualTypeOf<{ users: User[] }>()
})
