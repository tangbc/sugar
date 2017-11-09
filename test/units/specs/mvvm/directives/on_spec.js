import MVVM from 'mvvm'
import * as util from 'src/util'
import { triggerEvent } from '../../../test_util'

describe('v-on >', function () {
    let element

    beforeEach(function () {
        element = document.createElement('div')
        document.body.appendChild(element)
    })

    afterEach(function () {
        document.body.removeChild(element)
    })


    it('normal', function () {
        let count = 0
        let cb = function () {
            count++
        }

        element.innerHTML = '<span id="el" v-on:click="test"></span>'

        new MVVM({
            view: element,
            model: {
                test: cb
            }
        })
        let el = element.querySelector('#el')

        triggerEvent(el, 'click')
        expect(count).toBe(1)

        triggerEvent(el, 'click')
        triggerEvent(el, 'click')
        triggerEvent(el, 'click')
        expect(count).toBe(4)
    })


    it('a propagation situation', function () {
        element.innerHTML =
            '<div id="outer" v-on:click="outer">' +
                '<span id="inner" v-on:click="inner"></span>' +
            '</div>'

        let outerCount = 0, innerCount = 0
        new MVVM({
            view: element,
            model: {
                outer: function () {
                    outerCount++
                },
                inner: function () {
                    innerCount++
                }
            }
        })
        let outer = element.querySelector('#outer')
        let inner = element.querySelector('#inner')

        triggerEvent(outer, 'click')
        expect(outerCount).toBe(1)
        expect(innerCount).toBe(0)

        triggerEvent(inner, 'click')
        expect(outerCount).toBe(2)
        expect(innerCount).toBe(1)

        triggerEvent(inner, 'click')
        expect(outerCount).toBe(3)
        expect(innerCount).toBe(2)

        triggerEvent(outer, 'click')
        triggerEvent(inner, 'click')
        expect(outerCount).toBe(5) // outer+1 and bubbling by inner+1, so is 5
        expect(innerCount).toBe(3)
    })


    it('use .stop to stopPropagation', function () {
        element.innerHTML =
            '<div id="outer" v-on:click="outer">' +
                '<span id="inner" v-on:click.stop="inner"></span>' +
            '</div>'

        let outerCount = 0, innerCount = 0
        new MVVM({
            view: element,
            model: {
                outer: function () {
                    outerCount++
                },
                inner: function () {
                    innerCount++
                }
            }
        })
        let outer = element.querySelector('#outer')
        let inner = element.querySelector('#inner')

        triggerEvent(outer, 'click')
        expect(outerCount).toBe(1)
        expect(innerCount).toBe(0)

        triggerEvent(inner, 'click')
        expect(outerCount).toBe(1)
        expect(innerCount).toBe(1)

        triggerEvent(inner, 'click')
        expect(outerCount).toBe(1)
        expect(innerCount).toBe(2)

        triggerEvent(inner, 'click')
        expect(outerCount).toBe(1)
        expect(innerCount).toBe(3)

        triggerEvent(outer, 'click')
        triggerEvent(inner, 'click')
        expect(outerCount).toBe(2)
        expect(innerCount).toBe(4)
    })


    it('use .self to trigger event on self node', function () {
        element.innerHTML =
            '<div id="outer" v-on:click.self="outer">' +
                '<span id="inner" v-on:click="inner"></span>' +
            '</div>'

        let outerCount = 0, innerCount = 0
        new MVVM({
            view: element,
            model: {
                outer: function () {
                    outerCount++
                },
                inner: function () {
                    innerCount++
                }
            }
        })
        let outer = element.querySelector('#outer')
        let inner = element.querySelector('#inner')

        triggerEvent(outer, 'click')
        expect(outerCount).toBe(1)
        expect(innerCount).toBe(0)

        triggerEvent(inner, 'click')
        expect(outerCount).toBe(1) // if not set .self, here should be 2 becasue propagation
        expect(innerCount).toBe(1)
    })


    it('a default situation', function () {
        element.innerHTML = '<a id="el" href="#abc" v-on:click="test"></a>'

        let hasPrevent
        new MVVM({
            view: element,
            model: {
                test: function (e) {
                    // this feature is base on greater than or equal to ie9
                    hasPrevent = e.defaultPrevented
                }
            }
        })
        let el = element.querySelector('#el')

        triggerEvent(el, 'click')
        expect(hasPrevent).toBeFalsy()

        // there's no use hash to test default event because
        // in Firefox use triggerEvent for <a href="#abc"></a>
        // will not change window.location.hash, maybe it's a bug of Firefox 40.0
    })


    it('use .prevent to preventDefault', function () {
        element.innerHTML = '<a id="el" href="#abc" v-on:click.prevent="test"></a>'

        let hasPrevent
        new MVVM({
            view: element,
            model: {
                test: function (e) {
                    hasPrevent = e.defaultPrevented
                }
            }
        })
        let hash = window.location.hash
        let el = element.querySelector('#el')

        triggerEvent(el, 'click')
        expect(hasPrevent).toBeTruthy()
        expect(window.location.hash).toBe(hash) // no change hash
    })


    it('use .prevent & has no inline statement', function () {
        element.innerHTML = '<a id="el" v-on:click.prevent href="#abc"></a>'

        new MVVM({
            view: element,
            model: {}
        })
        let hash = window.location.hash
        let el = element.querySelector('#el')

        triggerEvent(el, 'click')
        expect(window.location.hash).toBe(hash) // no change hash
    })


    it('setup keyCode', function () {
        element.innerHTML = '<input id="el" type="text" v-on:keyup.13="test">'

        let isEnter13 = false
        new MVVM({
            view: element,
            model: {
                test: function (e) {
                    isEnter13 = e.keyCode === 13
                }
            }
        })
        let el = element.querySelector('#el')

        triggerEvent(el, 'keyup', function (e) {
            e.keyCode = 11
        })
        expect(isEnter13).toBeFalsy()

        triggerEvent(el, 'keyup', function (e) {
            e.keyCode = 12
        })
        expect(isEnter13).toBeFalsy()

        triggerEvent(el, 'keyup', function (e) {
            e.keyCode = 13
        })
        expect(isEnter13).toBeTruthy()
    })


    it('passing multi arguments', function () {
        element.innerHTML = '<div id="el" v-on:mouseenter="test(123, \'sugar\', $event)"></div>'

        let args
        new MVVM({
            view: element,
            model: {
                test: function () {
                    args = Array.prototype.slice.call(arguments)
                }
            }
        })
        let el = element.querySelector('#el')

        triggerEvent(el, 'mouseenter')
        expect(args && args.length).toBe(3)
        expect(args && args[0]).toBe(123)
        expect(args && args[1]).toBe('sugar')
        expect(args && (args[2] instanceof Event)).toBeTruthy()
    })


    it('change event callback', function () {
        element.innerHTML = '<div id="el" v-on:click="test"></div>'

        let flag
        let vm = new MVVM({
            view: element,
            model: {
                test: function () {
                    flag = 'first callback'
                }
            }
        })
        let el = element.querySelector('#el')

        triggerEvent(el, 'click')
        expect(flag).toBe('first callback')

        // change callback for binding
        vm.set('test', function () {
            flag = 'secound callback'
        })
        triggerEvent(el, 'click')
        expect(flag).toBe('secound callback')
    })


    it('multi events', function () {
        element.innerHTML = '<div id="el" v-on="{click: clickTest, mouseout: mouseoutTest}"></div>'

        let args, storeArgs = function () {
            args = Array.prototype.slice.call(arguments)
        }
        new MVVM({
            view: element,
            model: {
                clickTest: storeArgs,
                mouseoutTest: storeArgs
            }
        })
        let el = element.querySelector('#el')

        triggerEvent(el, 'click')
        expect(args.length).toBe(1)
        expect(args[0].type).toBe('click')

        triggerEvent(el, 'mouseout')
        expect(args.length).toBe(1)
        expect(args[0].type).toBe('mouseout')
    })


    it('change arguments with letiable', function () {
        element.innerHTML = '<input id="el" v-on:focus="test(text, \'xxdk\')"/>'

        let args
        let vm = new MVVM({
            view: element,
            model: {
                text: 'aaa',
                test: function (txt, num) {
                    args = Array.prototype.slice.call(arguments)
                }
            }
        })
        let el = element.querySelector('#el')

        triggerEvent(el, 'focus')
        expect(args.length).toBe(2)
        expect(args[0]).toBe('aaa')
        expect(args[1]).toBe('xxdk')

        // change data
        vm.set('text', 'AAA')
        triggerEvent(el, 'focus')
        expect(args.length).toBe(2)
        expect(args[0]).toBe('AAA')
        expect(args[1]).toBe('xxdk')
    })


    it('in v-for', function () {
        element.innerHTML =
            '<ul>' +
                '<li v-for="item in items">' +
                    '<span class="el" v-on:click="test($index, $event)">{{ item }}</span>' +
                '</li>' +
            '</ul>'

        let index, evt
        let vm = new MVVM({
            view: element,
            model: {
                items: [
                    'aaa',
                    'bbb',
                    'ccc'
                ],
                test: function (i, e) {
                    index = i
                    evt = e
                }
            }
        })
        let data = vm.$data
        let els = element.querySelectorAll('.el')

        triggerEvent(els[0], 'click')
        expect(index).toBe(0)
        expect(evt.target.textContent).toBe('aaa')

        triggerEvent(els[2], 'click')
        expect(index).toBe(2)
        expect(evt.target.textContent).toBe('ccc')

        // change array data
        expect(els[1].textContent).toBe('bbb')
        data.items.$set(1, 'BBB')
        // $set will recover original DOM
        els = element.querySelectorAll('.el')
        triggerEvent(els[1], 'click')
        expect(index).toBe(1)
        expect(evt.target.textContent).toBe('BBB')

        // test $index change with array method
        data.items.shift()
        els = element.querySelectorAll('.el')
        expect(data.items).toEqual([
            'BBB',
            'ccc'
        ])
        triggerEvent(els[0], 'click')
        expect(index).toBe(0)
        expect(evt.target.textContent).toBe('BBB')

        triggerEvent(els[1], 'click')
        expect(index).toBe(1)
        expect(evt.target.textContent).toBe('ccc')
    })


    it('use $remove event in v-for', function () {
        element.innerHTML =
            '<ul>' +
                '<li v-for="item in items" v-on:dblclick="$remove">' +
                    '{{ $index }}{{ item }}_' +
                '</li>' +
            '</ul>'

        let vm = new MVVM({
            view: element,
            model: {
                items: ['a', 'b', 'c']
            }
        })

        let data = vm.$data
        let ul = element.firstChild

        expect(ul.textContent).toBe('0a_1b_2c_')

        let lis = ul.childNodes
        triggerEvent(lis[1], 'dblclick')
        expect(ul.textContent).toBe('0a_1c_')

        lis = ul.childNodes
        triggerEvent(lis[0], 'dblclick')
        expect(ul.textContent).toBe('0c_')

        lis = ul.childNodes
        triggerEvent(lis[0], 'dblclick')
        expect(ul.textContent).toBe('')

        // push new data
        data.items.push('b')
        data.items.unshift('a')
        data.items.push('c')
        expect(ul.textContent).toBe('0a_1b_2c_')

        // come again above action
        lis = ul.childNodes
        triggerEvent(lis[1], 'dblclick')
        expect(ul.textContent).toBe('0a_1c_')

        lis = ul.childNodes
        triggerEvent(lis[0], 'dblclick')
        expect(ul.textContent).toBe('0c_')

        lis = ul.childNodes
        triggerEvent(lis[0], 'dblclick')
        expect(ul.textContent).toBe('')

        // cover new data
        data.items = ['n', 'b', 'a']
        expect(ul.textContent).toBe('0n_1b_2a_')

        // come again above action
        lis = ul.childNodes
        triggerEvent(lis[1], 'dblclick')
        expect(ul.textContent).toBe('0n_1a_')

        lis = ul.childNodes
        triggerEvent(lis[0], 'dblclick')
        expect(ul.textContent).toBe('0a_')

        lis = ul.childNodes
        triggerEvent(lis[0], 'dblclick')
        expect(ul.textContent).toBe('')
    })


    it('use $remove outside v-for', function () {
        element.innerHTML = '<div v-on="{click: $remove}"></div>'

        new MVVM({
            view: element,
            model: {}
        })

        expect(util.warn).toHaveBeenCalledWith('The specify event $remove must be used in v-for scope')
    })


    it('use .one to handler event only first trigger', function () {
        element.innerHTML =
            '<a id="test" v-on:click="test"></a>' +
            '<a id="one" v-on:click.one="testOne"></a>'

        let testCount = 0
        let oneCount = 0

        new MVVM({
            view: element,
            model: {},
            methods: {
                test: function () {
                    testCount++
                },
                testOne: function () {
                    oneCount++
                }
            }
        })

        let testEl = element.querySelector('#test')
        let oneEl = element.querySelector('#one')

        triggerEvent(testEl, 'click')
        expect(testCount).toBe(1)

        triggerEvent(testEl, 'click') // 2
        triggerEvent(testEl, 'click') // 3
        triggerEvent(testEl, 'click') // 4
        expect(testCount).toBe(4)

        // when use .one dress, event just trigger one, then auto unbind
        expect(oneCount).toBe(0)
        triggerEvent(oneEl, 'click')
        expect(oneCount).toBe(1)

        triggerEvent(oneEl, 'click')
        expect(oneCount).toBe(1)

        triggerEvent(oneEl, 'click')
        triggerEvent(oneEl, 'click')
        triggerEvent(oneEl, 'click')
        triggerEvent(oneEl, 'click')
        expect(oneCount).toBe(1)
    })


    it('use inline statement 1', function () {
        element.innerHTML =
            '<button v-on:click="value = \'bbb\'"></button>' +
            '<a v-on:click="value = \'ccc-\' + getStr()"></a>'

        let vm = new MVVM({
            view: element,
            model: {
                value: 'aaa'
            },
            methods: {
                getStr: function () {
                    return 'xxdk'
                }
            }
        })

        let data = vm.$data

        let button = document.querySelector('button')
        let anchor = document.querySelector('a')

        expect(data.value).toBe('aaa')

        triggerEvent(button, 'click')
        expect(data.value).toBe('bbb')

        triggerEvent(anchor, 'click')
        expect(data.value).toBe('ccc-xxdk')
    })


    it('use inline statement 2', function () {
        element.innerHTML =
            '<button v-on:click="$event.target.textContent = Math.random()"></button>'

        new MVVM({
            view: element,
            model: {}
        })

        let text
        let button = document.querySelector('button')

        text = button.textContent
        expect(text.length).toBe(0)

        triggerEvent(button, 'click')
        text = button.textContent
        expect(text.length !== 0).toBe(true)

        triggerEvent(button, 'click')
        expect(text !== button.textContent).toBe(true)
    })


    it('use inline statement 3', function () {
        element.innerHTML =
            '<button v-on:click="value = 123; $event.target.textContent = Date.now() + Math.random()"></button>'

        let vm = new MVVM({
            view: element,
            model: {
                value: 0
            }
        })

        let data = vm.$data

        let text
        let button = document.querySelector('button')

        text = button.textContent
        expect(data.value).toBe(0)
        expect(text.length).toBe(0)

        triggerEvent(button, 'click')
        text = button.textContent
        expect(data.value).toBe(123)
        expect(text.length !== 0).toBe(true)

        triggerEvent(button, 'click')
        expect(text !== button.textContent).toBe(true)
    })


    it('use inline statement more logic', function () {
        element.innerHTML =
            '<button v-on:click="if (ok) { title = 123 } else { title = 456 }"></button>' +
            '<span>{{ title }}</span>'

        let vm = new MVVM({
            view: element,
            model: {
                ok: true,
                title: 0
            }
        })

        let data = vm.$data

        let button = document.querySelector('button')
        let span = document.querySelector('span')

        expect(data.title).toBe(0)
        expect(span.textContent).toBe('0')

        triggerEvent(button, 'click')
        expect(data.title).toBe(123)
        expect(span.textContent).toBe('123')

        // change ok to false
        data.ok = false
        triggerEvent(button, 'click')
        expect(data.title).toBe(456)
        expect(span.textContent).toBe('456')
    })


    it('use inline statement inside v-for scope', function () {
        element.innerHTML =
            '<ul>' +
                '<li v-for="item in items" v-on:mouseenter="item.value = 123">' +
                    '{{ item.value }}' +
                '</li>' +
            '</ul>'

        let vm = new MVVM({
            view: element,
            model: {
                items: [
                    { value: 'aaa' },
                    { value: 'bbb' },
                    { value: 'ccc' }
                ]
            }
        })

        let data = vm.$data

        let ul = document.querySelector('ul')
        let lis = ul.childNodes

        expect(ul.textContent).toBe('aaabbbccc')

        triggerEvent(lis[0], 'mouseenter')
        expect(ul.textContent).toBe('123bbbccc')
        expect(data.items[0].value).toBe(123)

        data.items.splice(1, 1)
        expect(ul.textContent).toBe('123ccc')
        expect(data.items[1].value).toBe('ccc')

        triggerEvent(lis[1], 'mouseenter')
        expect(ul.textContent).toBe('123123')
        expect(data.items[1].value).toBe(123)
    })


    it('use inline statement break error', function () {
        element.innerHTML = '<button v-on:click="value = 1 ++ foo()"></button>'

        new MVVM({
            view: element,
            model: {
                value: 123
            }
        })

        expect(util.error).toHaveBeenCalledWith('Invalid generated expression: [value = 1 ++ foo()]')
    })
})