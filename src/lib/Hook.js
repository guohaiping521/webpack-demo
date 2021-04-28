/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

class Hook {
	constructor(args) {
		// args 参数必须是一个数组，比如我们上面的demo 传递值为 ["name", "age"]
		if (!Array.isArray(args)) args = [];
		// 把数组args赋值给 _args的内部属性
		this._args = args;
		// 保存所有的tap事件
		this.taps = [];
		// 拦截器数组
		this.interceptors = [];
		// 调用 内部方法 createCompileDelegate 然后把返回值赋值给内部属性 _call， 并且暴露给外部属性 call
		this.call = this._call;
		/* 调用 内部方法 createCompileDelegate ，然后把返回值赋值给内部属性 _promise，并且暴露外部属性 promise
	*/
		this.promise = this._promise;
		/*
	调用 内部方法 createCompileDelegate _callAsync， 并且暴露外部属性
	callAsync
   */
		this.callAsync = this._callAsync;
		// 用于调用函数的时候，保存钩子数组的变量
		this._x = undefined;
	}

	compile(options) {
		throw new Error("Abstract: should be overriden");
	}

	_createCall(type) {
		return this.compile({
			taps: this.taps,
			interceptors: this.interceptors,
			args: this._args,
			type: type
		});
	}

	tap(options, fn) {
		if (typeof options === "string") options = { name: options };
		if (typeof options !== "object" || options === null)
			throw new Error(
				"Invalid arguments to tap(options: Object, fn: function)"
			);
		options = Object.assign({ type: "sync", fn: fn }, options);
		//options = { type: "sync", fn: fn, name: "A" };
		if (typeof options.name !== "string" || options.name === "")
			throw new Error("Missing name for tap");
		//注册一个拦截器
		options = this._runRegisterInterceptors(options);
		this._insert(options);
	}

	tapAsync(options, fn) {
		if (typeof options === "string") options = { name: options };
		if (typeof options !== "object" || options === null)
			throw new Error(
				"Invalid arguments to tapAsync(options: Object, fn: function)"
			);
		options = Object.assign({ type: "async", fn: fn }, options);
		if (typeof options.name !== "string" || options.name === "")
			throw new Error("Missing name for tapAsync");
		options = this._runRegisterInterceptors(options);
		this._insert(options);
	}

	tapPromise(options, fn) {
		if (typeof options === "string") options = { name: options };
		if (typeof options !== "object" || options === null)
			throw new Error(
				"Invalid arguments to tapPromise(options: Object, fn: function)"
			);
		options = Object.assign({ type: "promise", fn: fn }, options);
		if (typeof options.name !== "string" || options.name === "")
			throw new Error("Missing name for tapPromise");
		options = this._runRegisterInterceptors(options);

		this._insert(options);
	}

	_runRegisterInterceptors(options) {
		for (const interceptor of this.interceptors) {
			if (interceptor.register) {
				const newOptions = interceptor.register(options);
				if (newOptions !== undefined) options = newOptions;
			}
		}
		return options;
	}

	withOptions(options) {
		const mergeOptions = opt =>
			Object.assign({}, options, typeof opt === "string" ? { name: opt } : opt);

		// Prevent creating endless prototype chains
		options = Object.assign({}, options, this._withOptions);
		const base = this._withOptionsBase || this;
		const newHook = Object.create(base);

		(newHook.tapAsync = (opt, fn) => base.tapAsync(mergeOptions(opt), fn)),
			(newHook.tap = (opt, fn) => base.tap(mergeOptions(opt), fn));
		newHook.tapPromise = (opt, fn) => base.tapPromise(mergeOptions(opt), fn);
		newHook._withOptions = options;
		newHook._withOptionsBase = base;
		return newHook;
	}

	isUsed() {
		return this.taps.length > 0 || this.interceptors.length > 0;
	}

	intercept(interceptor) {
		// 重置所有的调用方法
		this._resetCompilation();
		// 保存拦截器到全局属性 interceptors内部，我们使用 Object.assign方法复制了一份
		this.interceptors.push(Object.assign({}, interceptor));
		/*
  如果该拦截器有register属性的话，我们就遍历所有的taps, 把他们作为参数调用拦截器的register，并且把返回的tap对象
  (该tap对象指tap函数里面把fn和name这些信息组合起来的新对象)。然后赋值给 当前的某一项tap
 */
		if (interceptor.register) {
			for (let i = 0; i < this.taps.length; i++)
				this.taps[i] = interceptor.register(this.taps[i]);
		}
	}

	_resetCompilation() {
		this.call = this._call;
		this.callAsync = this._callAsync;
		this.promise = this._promise;
	}

	_insert(item) {
		// 重置资源，因为每一个插件都会有一个新的 Compilation
		this._resetCompilation();
		let before; // 该item.before 是插件的名称
		/*
  before 可以是单个字符串插件的名称，也可以是一个字符串数组的插件
  new Set 是ES6新增的，它的作用是去掉数组里面重复的值
 */
		if (typeof item.before === "string") before = new Set([item.before]);
		else if (Array.isArray(item.before)) {
			before = new Set(item.before);
		}

		let stage = 0;
		if (typeof item.stage === "number") stage = item.stage;

		let i = this.taps.length;

		while (i > 0) {
			console.log('----', i);
			i--;
			const x = this.taps[i];
			this.taps[i + 1] = x;
			const xStage = x.stage || 0;
			console.log("before==", before);
			if (before) {
				if (before.has(x.name)) {
					before.delete(x.name);
					continue;
				}
				if (before.size > 0) {
					continue;
				}
			}
			if (xStage > stage) {
				continue;
			}
			i++;
			break;
		}
		this.taps[i] = item;
	}
}

function createCompileDelegate(name, type) {
	return function lazyCompileHook(...args) {
		this[name] = this._createCall(type);
		return this[name](...args);
	};
}

Object.defineProperties(Hook.prototype, {
	_call: {
		value: createCompileDelegate("call", "sync"),
		configurable: true,
		writable: true
	},
	_promise: {
		value: createCompileDelegate("promise", "promise"),
		configurable: true,
		writable: true
	},
	_callAsync: {
		value: createCompileDelegate("callAsync", "async"),
		configurable: true,
		writable: true
	}
});

export default Hook;
