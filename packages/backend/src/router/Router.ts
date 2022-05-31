import {Response} from '@web-std/fetch'
import {File} from '@web-std/file'
import {parse} from 'regexparam'

// web-std/io#63
globalThis.File = File

type Handle<In, Out> = {
  (input: In): Out | undefined | Promise<Out | undefined>
}

type Handler<In, Out> = Handle<In, Out> | Route<In, Out>

function callHandler<In, Out>(handler: Handler<In, Out>, input: In) {
  return typeof handler === 'function' ? handler(input) : handler.handle(input)
}

export class Route<In, Out> {
  constructor(public handle: Handle<In, Out>) {}
  map<T>(next: Handle<Out, T>): Route<In, T>
  map<T>(next: Route<Out, T>): Route<In, T>
  map<T>(next: Handler<Out, T>): Route<In, T> {
    return new Route(input => {
      const result = this.handle(input)
      if (result instanceof Promise)
        return result.then(v => {
          return v === undefined ? undefined : callHandler(next, v)
        })
      if (result !== undefined) return callHandler(next, result)
    })
  }
  notFound(handler: (input: In) => Out | Promise<Out>) {
    return new Route(async (input: In) => {
      let result = this.handle(input)
      if (result instanceof Promise) result = await result
      if (result === undefined) return handler(input)
      return result
    })
  }
  recover(handler: (error: Error) => Out | Promise<Out>) {
    return new Route(async (input: In) => {
      try {
        let result = this.handle(input)
        if (result instanceof Promise) result = await result
        return result
      } catch (e) {
        const error =
          e instanceof Error ? e : new Error(`Could not serve request: ${e}`)
        return handler(error)
      }
    })
  }
}

export function router(...routes: Array<Route<Request, Response | undefined>>) {
  return new Route(async (request: Request) => {
    for (const handler of routes) {
      let result = callHandler(handler, request)
      if (result instanceof Promise) result = await result
      if (result !== undefined) return result
    }
  })
}

export namespace router {
  function withMethod(method: string) {
    return new Route((request: Request) => {
      if (request.method !== method) return undefined
      return request
    })
  }

  function withPath(path: string, getPathname: (url: URL) => string) {
    const matcher = parse(path)
    return new Route((request: Request) => {
      const url = new URL(request.url)
      const match = matcher.pattern.exec(getPathname(url))
      if (match === null) return undefined
      const params: Record<string, unknown> = {}
      if (matcher.keys)
        for (let i = 0; i < matcher.keys.length; i++)
          params[matcher.keys[i]] = match[i + 1]
      return {request, url, params}
    })
  }

  export function matcher(getPathname = (url: URL) => url.pathname) {
    return {
      get(path: string) {
        return withMethod('GET').map(withPath(path, getPathname))
      },
      post(path: string) {
        return withMethod('POST').map(withPath(path, getPathname))
      },
      put(path: string) {
        return withMethod('PUT').map(withPath(path, getPathname))
      },
      delete(path: string) {
        return withMethod('DELETE').map(withPath(path, getPathname))
      },
      all(path: string) {
        return withPath(path, getPathname)
      }
    }
  }

  export async function parseFormData<In extends {request: Request}>(
    input: In
  ): Promise<In & {body: FormData}> {
    const body = await input.request.formData()
    return {...input, body}
  }

  export async function parseBuffer<In extends {request: Request}>(
    input: In
  ): Promise<In & {body: ArrayBuffer}> {
    const body = await input.request.arrayBuffer()
    return {...input, body}
  }

  export async function parseJson<In extends {request: Request}>(
    input: In
  ): Promise<In & {body: unknown}> {
    const body = await input.request.json()
    return {...input, body}
  }

  export function jsonResponse<Out>(output: Out, init?: ResponseInit) {
    return new Response(JSON.stringify(output), {
      ...init,
      headers: {'content-type': 'application/json', ...init?.headers}
    })
  }
}
