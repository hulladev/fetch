export type Methods =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'
  | 'CONNECT'
  | 'TRACE'

export type RInit<U extends string, M extends Methods> = RequestInit & {
  readonly url: U
  readonly method?: M | Lowercase<M>
}

export type HRequest<R extends RInit<string, Methods>> = Omit<R, 'method'> & {
  readonly method: R['method'] extends string
    ? Uppercase<R['method']> extends Methods
      ? R['method']
      : 'GET'
    : 'GET'
} & (R extends { data: any } ? { readonly body: BodyInit } : {})

export type InstanceConfig<
  B extends string,
  RI extends Omit<RInit<string, Methods>, 'url'>,
  RF = Promise<Response>,
  RP = Promise<unknown>,
> = {
  readonly baseURL?: B
  readonly defaults?: RI
  readonly serialize?: (data: unknown) => BodyInit
  readonly fetch?: (url: string, req: RequestInit) => RF
  readonly transform?: (res: Awaited<RF>) => RP
  readonly interceptors?: {
    readonly request?: <RX extends RInit<string, Methods>>(req: RX) => RInit<string, Methods>
    readonly response?: (res: RP) => RP
  }
}

export type InstanceRequest<
  I extends InstanceConfig<string, Omit<RInit<string, Methods>, 'url'>>,
  RQ extends RInit<string, Methods>,
> = Omit<RQ, 'url' | 'method'> & Omit<I['defaults'], 'method' | 'url'> & {
  url: I extends { baseURL: infer B } ? B extends string ? `${B}${RQ['url']}` : RQ['url'] : RQ['url']
  method: RQ extends { method: infer M } ? M extends Methods | Lowercase<Methods> ? Uppercase<M> : I extends { defaults: { method: infer DM } } ? DM : 'GET' : 'GET'
}

export type ResponseConfig<T, F> = {
  transform?: (res: Awaited<F>) => T
  fetch: (url: string, req: RequestInit) => F
}