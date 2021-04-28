/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";
import Hook from "./Hook"
import HookCodeFactory from "./HookCodeFactory"

class AsyncSeriesHookCodeFactory extends HookCodeFactory {
	content({ onError, onDone }) {
		return this.callTapsSeries({
			onError: (i, err, next, doneBreak) => onError(err) + doneBreak(true),
			onDone
		});
	}
}

const factory = new AsyncSeriesHookCodeFactory();

//异步串行执行的。和我们上面的 AsyncParallelHook一样，通过使用 tapAsync注册事件，通过callAsync触发事件，也可以通过 tapPromise注册事件，使用promise来触发。
class AsyncSeriesHook extends Hook {
	compile(options) {
		factory.setup(this, options);
		return factory.create(options);
	}
}

Object.defineProperties(AsyncSeriesHook.prototype, {
	_call: { value: undefined, configurable: true, writable: true }
});

export default AsyncSeriesHook;
