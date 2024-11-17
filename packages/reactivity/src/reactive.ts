import { isObject } from '@study/shared'
import { ReactiveFlags, mutableHandlers } from './baseHandler'
// 用于记录代理后的结果
const reactiveMap = new WeakMap()

function createReactiveObject(target) {
  // 响应式对象必须是对象
  if (!isObject(target)) {
    return target
  }
  // 避免代理 代理对象本身
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  // 避免重复代理
  const existingProxy = reactiveMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  let proxy = new Proxy(target, mutableHandlers)
  reactiveMap.set(target, proxy)
  return proxy
}

export function reactive(target) {
  return createReactiveObject(target)
}