import {CMSApi} from '../CMS.js'
import {Config} from '../Config.js'
import {User} from '../User.js'
import {DefaultDriver} from './DefaultDriver.js'

export interface NextApi extends CMSApi {
  user(): Promise<User | null>
  previews(): Promise<JSX.Element | null>
  backendHandler(request: Request): Promise<Response>
  previewHandler(request: Request): Promise<Response>
}

export function createNextCMS<Definition extends Config>(
  config: Definition
): Definition & NextApi {
  return new DefaultDriver(config) as any
}
