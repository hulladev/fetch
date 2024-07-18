import { request as _request } from './request'
import { response as _response } from './response'
import type {
  HRequest,
  Instance,
  InstanceConfig,
  InstanceRequest,
  Methods,
  RInit,
  ResponseConfig,
} from './types'

export function instance<
  const I extends InstanceConfig<string, Omit<RInit<string, Methods>, 'url'>>,
>(instanceConfig?: I): Instance<I> {
  const cfg = instanceConfig ?? ({} as I)
  return {
    request: <const RQ extends RInit<string, Methods>>(
      request: RQ,
      serialize: (data: unknown) => BodyInit = cfg.serialize ?? JSON.stringify
    ) => {
      const rq = _request(
        {
          ...cfg.defaults,
          ...request,
          url: `${cfg.baseURL ?? ''}${request.url}`,
        },
        serialize
      ) as InstanceRequest<I, RQ>
      return (cfg.interceptors?.request?.(rq) ?? rq) as I['interceptors'] extends {
        readonly request: (req: any) => infer RY
      }
        ? RY extends Omit<HRequest<any>, 'url' | 'method'>
          ? InstanceRequest<I, RQ> & RY
          : never
        : InstanceRequest<I, RQ>
    },
    response: <
      const R extends RInit<string, Methods> & { data?: unknown },
      F extends Promise<any> = Promise<Response>,
      T extends Promise<any> = F,
    >(
      request: R,
      config: ResponseConfig<T, F> = {
        ...(cfg.transform ? { transform: cfg.transform } : {}),
        fetch: (cfg.fetch ?? fetch) as (url: string, req: RequestInit) => F,
      } as ResponseConfig<T, F> // Add type assertion here
    ) => {
      const res = _response(request, config)
      return (cfg.interceptors?.response?.(res) ?? res) as I['interceptors'] extends {
        readonly response: (res: any) => infer RY
      }
        ? RY
        : I['transform'] extends (res: any) => infer RY
          ? RY
          : Promise<Response>
    },
    config: cfg,
  } as const
}
