/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

import Hook from "./Hook"
import HookCodeFactory from "./HookCodeFactory"
//为串行同步执行，事件处理函数返回true表示继续循环，如果返回undefined的话，表示结束循环。
class SyncLoopHookCodeFactory extends HookCodeFactory {
	content({ onError, onDone, rethrowIfPossible }) {
		return this.callTapsLooping({
			onError: (i, err) => onError(err),
			onDone,
			rethrowIfPossible
		});
	}
}

const factory = new SyncLoopHookCodeFactory();

class SyncLoopHook extends Hook {
	tapAsync() {
		throw new Error("tapAsync is not supported on a SyncLoopHook");
	}

	tapPromise() {
		throw new Error("tapPromise is not supported on a SyncLoopHook");
	}

	compile(options) {
		factory.setup(this, options);
		return factory.create(options);
	}
}

export default SyncLoopHook;
