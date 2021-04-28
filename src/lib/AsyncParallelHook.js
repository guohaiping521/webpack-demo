/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

import Hook from "./Hook"
import HookCodeFactory from "./HookCodeFactory"

class AsyncParallelHookCodeFactory extends HookCodeFactory {
	content({ onError, onDone }) {
		return this.callTapsParallel({
			onError: (i, err, done, doneBreak) => onError(err) + doneBreak(true),
			onDone
		});
	}
}

const factory = new AsyncParallelHookCodeFactory();

//异步并行执行，如果是通过 tapAsync 注册的事件，那么我们需要通过callAsync触发，如果我们通过tapPromise注册的事件，那么我们需要promise触发。
class AsyncParallelHook extends Hook {
	compile(options) {
		factory.setup(this, options);
		return factory.create(options);
	}
}

Object.defineProperties(AsyncParallelHook.prototype, {
	_call: { value: undefined, configurable: true, writable: true }
});
export default AsyncParallelHook;
