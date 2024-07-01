import type { HRequest, Methods, RInit } from './types'

export function request<const RI extends RInit<string, Methods> & { data?: unknown }>(
  rq: RI,
  serialize: (data: unknown) => BodyInit = JSON.stringify
): HRequest<RI> {
  if (rq.url === undefined) {
    throw new Error('[@hulla/fetch]: Missing mandatory property url in request config')
  }
  return {
    ...rq,
    ...(rq.body ?? rq.data ? { body: rq.body ?? serialize(rq.data) } : {}),
    method: rq.method ?? ('GET' as RI['method']),
  } as HRequest<RI>
}
