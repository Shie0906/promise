/*
 * @Description: 一个简易版的 promise，未实现 then 方法返回新的 Promise，回调函数返回值不同做不同的处理，以及各种边界情况和异常处理
 * @Author: Shie
 * @Date: 2019-02-15 17:56:52
 * @Last Modified by: Shie
 * @Last Modified time: 2019-02-19 18:03:39
 */

const isFunction = fn => typeof fn === 'function';

// 定义状态常量，对于经常使用的一些不变值都应该通过常量来管理，便于开发及后期维护
// Promise 本质上是一个状态机，一个 Promise 的当前状态必须为以下三种状态中的一种：等待态（Pending）、执行态（Fulfilled）和拒绝态（Rejected）。
// 一个 Promise 状态一旦由 pending 转变为 fulfilled 或 rejected，则不再可变。
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

/**
 * Promise 对象
 * 创建常量 that 存储 this，因为代码可能会异步执行，用于获取正确的 this 对象
 * 初始化状态为 pending，用 value 存储 resolve 和 reject 方法传入的值
 * resolvedCallbacks 存储 then 方法的 onFulfilled 回调函数，rejectedCallbacks 存储 onRejected 回调函数
 * 同一个 Promise 可被多次调用，多个 then 方法有多个回调，用数组存储。每个 then 方法都返回一个新的 Promise
 * @param {function} fn - 构造函数（执行函数）
 */
function MyPromise(fn) {
  const that = this;
  that.state = PENDING;
  that.value = null;
  that.resolvedCallbacks = [];
  that.rejectedCallbacks = [];

  /**
   * Promise 内部的 resolve 方法，可改变 Promise 的状态为 fulfilled
   * 只有当 Promise 为 pending 状态时，调用此方法能改变其状态，并且用 value 存储当前传值，调用相应状态的回调
   * @param {*} value
   */
  function resolve(value) {
    if (that.state === PENDING) {
      that.state = FULFILLED;
      that.value = value;
      that.resolvedCallbacks.forEach(cb => cb(that.value));
    }
  }

  /**
   * Promise 内部的 reject 方法，可改变 Promise 的状态为 rejected
   * 只有当 Promise 为 pending 状态时，调用此方法能改变其状态，并且用 value 存储当前传值，调用相应状态的回调
   * @param {*} value
   */
  function reject(value) {
    if(that.state === PENDING) {
      that.state = REJECTED;
      that.value = value;
      that.rejectedCallbacks.forEach(cb => cb(that.value))
    }
  }

  // 执行构造函数内部的代码（Promise 中传入的函数），传入 Promise 内部的 resolve 和 reject 方法供其调用改变状态
  // 执行过程中出错要用 reject 抛出，符合 Promise 错误需要回调函数捕获，否则内部消化掉不报错的特点
  try {
    fn(resolve, reject)
  } catch (error) {
    reject(error)
  }
}

/**
 * Promise 原型链上的 then 方法，then 方法注册回调，当 Promise 状态改变后，会调用相应的回调方法
 * 参数如果不是函数，则实现值穿透
 * @param {*} onFulfilled - 可选参数，fulfilled 状态的回调函数
 * @param {*} onRejected - 可选参数，rejected 状态的回调函数
 */
MyPromise.prototype.then = function(onFulfilled, onRejected) {
  const that = this;
  onFulfilled = isFunction(onFulfilled) ? onFulfilled : value => value;
  onRejected = isFunction(onRejected) ? onRejected : error => { throw error };

  if (that.state === PENDING) {
    that.resolvedCallbacks.push(onFulfilled);
    that.rejectedCallbacks.push(onRejected);
  }

  if (that.state === FULFILLED) {
    onFulfilled(that.value);
  }

  if (that.state === REJECTED) {
    onRejected(that.value);
  }
}
