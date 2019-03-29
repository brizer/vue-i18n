import { warn } from './util'
import extend from './extend'
import mixin from './mixin'
import interpolationComponent from './components/interpolation'
import numberComponent from './components/number'
import { bind, update, unbind } from './directive'

export let Vue
//单独封装install方法，vue插件标配
export function install (_Vue) {
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && install.installed && _Vue === Vue) {
    warn('already installed.')
    return
  }
  install.installed = true

  Vue = _Vue

  const version = (Vue.version && Number(Vue.version.split('.')[0])) || -1
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && version < 2) {
    warn(`vue-i18n (${install.version}) need to use Vue 2.0 or later (Vue: ${Vue.version}).`)
    return
  }
  //对Vue原型的修改
  extend(Vue)
  Vue.mixin(mixin)
  Vue.directive('t', { bind, update, unbind })
  Vue.component(interpolationComponent.name, interpolationComponent)
  Vue.component(numberComponent.name, numberComponent)

  // use simple mergeStrategies to prevent i18n instance lose '__proto__'
  //自定义合并策略，这样就可以在new Vue时传入了。
  const strats = Vue.config.optionMergeStrategies
  strats.i18n = function (parentVal, childVal) {
    return childVal === undefined
      ? parentVal
      : childVal
  }
}
