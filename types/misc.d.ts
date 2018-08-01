type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type Constructor<T> = new (...args: any[]) => T

type AnyConstructor  = Constructor<any>

interface AnyFunction {
  (...args: any[]): any
}
interface AnyObject {
  [key: string]: any
}

declare type Primitive = string | number | boolean