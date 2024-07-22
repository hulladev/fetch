import { request } from './request'
import { response } from './response'
import type { Methods, ResponseConfig, RInit } from './types'

export function resolve<
  RQ extends RInit<string, Methods> & { data?: unknown },
  F extends Promise<any> = Promise<Response>,
  T extends Promise<any> = F,
>(
  requestBody: RQ,
  config: {
    serialize?: (data: unknown) => BodyInit
  } & ResponseConfig<T, F> = {
    serialize: JSON.stringify,
    fetch: fetch as (url: string, req: RequestInit) => F,
  } as { serialize: (data: unknown) => BodyInit } & ResponseConfig<T, F>
): T {
  return response(request(requestBody, config.serialize), config)
}
