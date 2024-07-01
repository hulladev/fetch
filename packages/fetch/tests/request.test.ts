import { describe, expect, expectTypeOf, test } from 'vitest'
import { request } from '../src/request'

export const r1 = request({ url: 'https://api.com/users' })
export const r2 = request({ url: 'https://api.com/users', method: 'POST' })
export const r3 = request({
  url: 'https://api.com/users',
  data: { id: 4, name: 'Bob' },
  method: 'POST',
})
export const r4 = request({ url: 'https://api.com/users/1', cache: 'force-cache' })
export const r5 = request({
  url: 'https://api.com/users',
  method: 'PUT',
  cache: 'force-cache',
  data: { id: 4, name: 'Bob' },
})

describe('requests', () => {
  test('just url (implicit method)', () => {
    expect(request(r1)).toStrictEqual({ url: 'https://api.com/users', method: 'GET' })
    expectTypeOf(r1.method).toEqualTypeOf<'GET'>()
    expectTypeOf(r1.url).toEqualTypeOf<'https://api.com/users'>()
  })
  test('config with explicit method', () => {
    expect(request(r2)).toStrictEqual({ url: 'https://api.com/users', method: 'POST' })
    expectTypeOf(r2.method).toEqualTypeOf<'POST'>()
    expectTypeOf(r2.url).toEqualTypeOf<'https://api.com/users'>()
  })
  test('request with data', () => {
    expect(request(r3)).toStrictEqual({
      url: 'https://api.com/users',
      method: 'POST',
      body: '{"id":4,"name":"Bob"}',
      data: { id: 4, name: 'Bob' },
    })
    expectTypeOf(r3.method).toEqualTypeOf<'POST'>()
    expectTypeOf(r3.url).toEqualTypeOf<'https://api.com/users'>()
    expectTypeOf(r3.data).toEqualTypeOf<{ readonly id: 4; readonly name: 'Bob' }>()
    expectTypeOf(r3.body).toEqualTypeOf<BodyInit>()
  })
  test('custom init properties', () => {
    expect(request(r4)).toStrictEqual({
      url: 'https://api.com/users/1',
      method: 'GET',
      cache: 'force-cache',
    })
    expectTypeOf(r4.method).toEqualTypeOf<'GET'>()
    expectTypeOf(r4.url).toEqualTypeOf<'https://api.com/users/1'>()
    expectTypeOf(r4.cache).toEqualTypeOf<'force-cache'>()
  })
  test('mix of data and init properties', () => {
    expect(request(r5)).toStrictEqual({
      url: 'https://api.com/users',
      method: 'PUT',
      cache: 'force-cache',
      data: { id: 4, name: 'Bob' },
      body: '{"id":4,"name":"Bob"}',
    })
    expectTypeOf(r5.method).toEqualTypeOf<'PUT'>()
    expectTypeOf(r5.url).toEqualTypeOf<'https://api.com/users'>()
    expectTypeOf(r5.cache).toEqualTypeOf<'force-cache'>()
    expectTypeOf(r5.data).toEqualTypeOf<{ readonly id: 4; readonly name: 'Bob' }>()
    expectTypeOf(r5.body).toEqualTypeOf<BodyInit>()
  })
  test('url is mandatory', () => {
    // @ts-expect-error error on purpose
    expect(() => request({ cache: 'force-cache' })).toThrowError(
      '[@hulla/fetch]: Missing mandatory property url in request config'
    )
  })
  test('serialize', () => {
    const r = request({ url: 'https://api.com/users', data: { id: 4, name: 'Bob' } }, (d) =>
      JSON.stringify(d)
    )
    expect(r).toStrictEqual({
      url: 'https://api.com/users',
      method: 'GET',
      data: { id: 4, name: 'Bob' },
      body: '{"id":4,"name":"Bob"}',
    })
    expectTypeOf(r.method).toEqualTypeOf<'GET'>()
    expectTypeOf(r.url).toEqualTypeOf<'https://api.com/users'>()
    expectTypeOf(r.data).toEqualTypeOf<{ readonly id: 4; readonly name: 'Bob' }>()
    expectTypeOf(r.body).toEqualTypeOf<BodyInit>()
  })
})
