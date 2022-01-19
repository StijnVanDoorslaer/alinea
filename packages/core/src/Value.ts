import * as Y from 'yjs'
import {ListValue} from './value/ListValue'
import {RecordValue} from './value/RecordValue'
import {RichTextValue} from './value/RichTextValue'
import {ScalarValue} from './value/ScalarValue'

type YType = Y.AbstractType<any>

export interface Value<T = any> {
  create(): T
  typeOfChild<C>(yValue: any, child: string): Value<C>
  toY(value: T): any
  fromY(yValue: any): T
  watch(parent: YType, key: string): (fun: () => void) => void
  mutator(parent: YType, key: string): any // Todo: infer type
}

export namespace Value {
  // Todo: type this
  export type Mutator<T> = any
  export const Scalar: Value<any> = ScalarValue.inst
  export function RichText(shapes?: Record<string, RecordValue<any>>) {
    return new RichTextValue(shapes)
  }
  export function List(shapes: Record<string, RecordValue<any>>) {
    return new ListValue(shapes)
  }
  export function Record(shape: Record<string, Value>) {
    return new RecordValue(shape)
  }
}
