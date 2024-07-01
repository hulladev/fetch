import type { Methods, RInit, ResponseConfig } from './types'

export function response<
  const R extends RInit<string, Methods> & { data?: unknown },
  T = unknown,
  F extends Promise<any> = Promise<Response>,
>(
  request: R,
  config: ResponseConfig<T, F> = {
    fetch: fetch as (url: string, req: RequestInit) => F,
  }
) {
  if (request.url === undefined) {
    throw new Error('[@hulla/fetch]: Missing mandatory property url in request config')
  }
  return config
    .fetch(request.url, request)
    .then((res) => (config.transform ? config.transform(res) : res))
}
