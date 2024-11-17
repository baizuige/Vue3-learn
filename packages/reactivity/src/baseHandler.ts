import { isObject } from '@study/shared'
import { activeEffect } from './effect'
import { track, trigger } from './reactiveEffect'
import { reactive } from './reactive'

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

// proxy 需要搭配 reflect 使用
export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    // 取值时收集依赖 让响应式属性与 effect 关联起来
    track(target, key)
    let res = Reflect.get(target, key, receiver)
    // 如果 res 是对象，则递归调用 reactive
    if (isObject(res)) {
      return reactive(res)
    }
    return res
  },
  set(target, key, value, receiver) {
    // 设置值时触发依赖

    let oldValue = target[key]
    let result = Reflect.set(target, key, value, receiver)
    if (oldValue !== value) {
      // 需要触发页面更新
      trigger(target, key, value, oldValue)
    }
    return result
  }
}
