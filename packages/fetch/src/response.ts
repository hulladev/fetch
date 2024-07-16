import type { Methods, RInit, ResponseConfig } from './types'

export function response<
  const R extends RInit<string, Methods> & { data?: unknown },
  F extends Promise<any> = Promise<Response>,
  T extends Promise<any> = F,
>(
  request: R,
  config: ResponseConfig<T, F> = {
    fetch: fetch as (url: string, req: RequestInit) => F,
  }
): T {
  if (request.url === undefined) {
    throw new Error('[@hulla/fetch]: Missing mandatory property url in request config')
  }
  const fetchFn = config.fetch ?? fetch
  return fetchFn(request.url, request).then((res) =>
    config.transform ? config.transform(res) : res
  ) as T
}
