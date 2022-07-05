
function Promise2(fn) {
    let self = this;
    // 通过指针私有变量,  挂载属性, 状态, 方便回调函数通过this获取
    self.status = 'pending';
    self.value = undefined;
    self.reason = undefined;

    // 成功回调
    self.onFulfilled = [];
    // 失败回调
    self.onRejected = [];

    function resolve(value) {
        if (self.status !== 'pending') return;
        self.value = value;
        self.status = 'resolved';

        self.onFulfilled.forEach(item => {
            item(value)
        })
    }
    function reject(value) {
        if (self.status !== 'pending') return;
        self.reason = value;
        self.status = 'rejected';
        self.onRejected.forEach(item => item(value))
    }
    try {
        fn(resolve, reject)
    } catch (e) {
        console.error(e);
        reject(e)
    }
}
// 简单点. 返回一个 Promise 嘛
Promise2.resolve = function (res) {
    return new Promise2((resolve, reject) => {
        resolve(res);
    });
}

Promise2.all = function (promises) {
    let result = [];
    return new Promise2((resolve, reject) => {
        let index = 0;
        function loadPromises() {
            console.log("promises::", promises.length);
            promises[index].then(res => {
                result[index] = res;
                console.log("index", index);
                index++;
                if (index == promises.length) {
                    console.log("end");
                    resolve(result);
                } else {
                    loadPromises();
                }
            });
        }
        loadPromises();
    });
}

// 简单点. 就是执行一个回调函数
// 需要链式调用? 就是返回一个Promise嘛
Promise2.prototype.then = function (fullfiled, onRejected) {
    let self = this;
    let newPromise = new Promise2((resolve, reject) => {
        if (self.status === 'pending') {
            self.onFulfilled.push(() => {
                fullfiled(self.value);
                resolve(self.value);
            });
            self.onRejected.push(() => {
                onRejected(self.value);
                reject(self.value);
            });
        }
        if (self.status === 'resolved') {
            fullfiled(self.value)
            resolve(self.value);
        }

        if (self.status === 'rejected') {
            onRejected(self.reason)
            reject(self.reason);
        }
    })
    return newPromise;
}

function main() {
    var a = new Promise2((resolve, reject) => {
        setTimeout(() => {
            console.log('a cb run');
            resolve('success');
        });
    }).then((a) => {
        console.log("a", a);
    }, (err) => {
        console.log("err", err);
    }).then((a) => {
        // 这里是链式调用
        console.log("a2", a);
    })

    var b = Promise2.resolve('success');

    b.then((b) => {
        console.log('b', b);
    })

    console.log('all c run ');
    var c = Promise2.all([a, b]).then(res => {
        console.log('all c', res);
    }, err => {
        console.log('all c error', err);
    })
}

main();