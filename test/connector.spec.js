import { expect } from 'chai'
import Vue from 'vue/dist/vue.common'
import connector from '../src/connector'
import store from './mocks/store'

describe('Connector', () => {
  it('should inject store from parent Provider', () => {
    let injected

    const connectedComponent = connector()({
      created () {
        injected = this.$$store
      },
      render () {}
    })

    new Vue({
      template: `<connected />`,
      provide: {
        $$store: store
      },
      components: {
        connected: {
          template: `<connected-component/>`,
          components: {
            connectedComponent
          }
        }
      }
    }).$mount()

    expect(injected).to.deep.eql(store)
  })

  it('should map state to data on connected component', () => {
    let data
    const currentState = store.getState()

    const baseComponent = {
      created () {
        data = this.$data
      },
      render () {}
    }

    const mapState = state => {
      const { foo, bar } = state.test
      return {
        foo,
        bar
      }
    }

    new Vue({
      template: `<connected />`,
      provide: {
        $$store: store
      },
      components: {
        connected: {
          template: `<connected-component/>`,
          components: {
            connectedComponent: connector(mapState)(baseComponent)
          }
        }
      }
    }).$mount()

    expect(data).to.have.keys('foo', 'bar')
    expect(data.foo).to.eql(currentState.test.foo)
    expect(data.bar).to.deep.eql(currentState.test.bar)

  })

  it('should map actions to data on connected component', () => {
    let actions, vm

    const baseComponent = {
      created () {
        actions = this.$data
        vm = this
      },
      render () {}
    }

    const mapActions = {
      doThis: () => ({type: 'DO_THIS'})
    }

    new Vue({
      template: `<connected />`,
      provide: {
        $$store: store
      },
      components: {
        connected: {
          template: `<connected-component/>`,
          components: {
            connectedComponent: connector(() => ({}), mapActions)(baseComponent)
          }
        }
      }
    }).$mount()

    expect(actions).to.have.keys('doThis')
    expect(vm.doThis()).to.deep.eql({type: 'DO_THIS'})

  })
})
