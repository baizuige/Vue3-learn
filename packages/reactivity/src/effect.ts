export function effect(fn, options?) {
  // 创建一个响应式 effect 数据变化后重新执行
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run()
  })
  _effect.run()

  if (options) {
    Object.assign(_effect, options)
  }
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

function preCleanEffect(effect) {
  effect._depsLength = 0
  effect._trackId++
}

function postCleanEffect(effect) {
  const newDeps = effect.deps.slice(0, effect._depsLength)
  // if (effect.deps.length > effect._depsLength) {
  for (let i = effect._depsLength; i < effect.deps.length; i++) {
    // 删除映射表中的依赖
    const dep = effect.deps[i]
    if (!newDeps.includes(dep)) {
      cleanDepEffect(effect.deps[i], effect)
    }
  }
  // }
  // 更新依赖列表长度
  effect.deps.length = effect._depsLength
}

export let activeEffect

class ReactiveEffect {
  // 用于记录当前 effect 执行了几次
  _trackId = 0
  // 记录当前 effect 的依赖长度
  _depsLength = 0
  _running = 0
  deps = []
  // 默认 effect 是响应式的
  public active = true
  // fn 是传入的函数 scheduler 是调度器
  constructor(public fn, public scheduler) {}
  run() {
    if (!this.active) {
      // 不是激活状态，直接执行 fn
      return this.fn()
    }
    // 每次执行前保存当前 effect
    let lastEffect = activeEffect
    try {
      activeEffect = this
      // 重新执行前，先清空依赖
      preCleanEffect(this)
      this._running++
      return this.fn()
    } finally {
      this._running--
      postCleanEffect(this)
      activeEffect = lastEffect
    }
  }
}

/**
 *  1. _trackId 用于记录 effect 执行了几次, 防止一个属性在当前 effect 中多次触发
 *  2. 拿到上一次依赖与这次比较，如果不一样，则更新依赖
 *  {flag, age}
 *  {flag, name}
 * */

function cleanDepEffect(dep, effect) {
  dep.delete(effect)
  // 删除依赖后，如果当前属性的依赖为空，则删除当前属性收集
  if (dep.size === 0) {
    dep.cleanup()
  }
}

export function trackEffect(effect, dep) {
  if (dep.get(effect) !== effect._trackId) {
    // 更新 id, 表示当前 effect 已经执行过
    dep.set(effect, effect._trackId)

    let oldDep = effect.deps[effect._depsLength]
    if (oldDep !== dep) {
      if (oldDep) {
        cleanDepEffect(oldDep, effect)
      }
      // 双向记忆 effect 记录 dep
      effect.deps[effect._depsLength++] = dep
    } else {
      effect._depsLength++
    }
  }
}

export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    if (effect.scheduler && effect._running === 0) {
      effect.scheduler()
    }
  }
}
