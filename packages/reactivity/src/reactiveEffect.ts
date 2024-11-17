/**
 * Map: {obj, {key: [effect1, effect2]}}
 * {
 *  {name: '张三', age: 18}: {
 *    name: [effect1, effect2],
 *   age: [effect]
 *  }
 * }
 */
import { activeEffect, trackEffect, triggerEffects } from './effect'

function createDep(cleanup, key) {
  const dep = new Map() as any
  dep.cleanup = cleanup
  dep.name = key
  return dep
}
const targetMap = new WeakMap()
export function track(target, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, depsMap = new Map())
  }

  let dep = depsMap.get(key)
  if (!dep) {
    // 之前是 set ，新版本用于清理不需要的属性改为 map
    depsMap.set(key, dep = createDep(() => depsMap.delete(key), key))
  }
  trackEffect(activeEffect, dep)
}

export function trigger(target, key, newValue, oldValue) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep = depsMap.get(key)
  if (dep) {
    triggerEffects(dep)
  }
}


