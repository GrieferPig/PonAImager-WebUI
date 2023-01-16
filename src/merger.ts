// deep merge & copy
// found this on https://juejin.cn/post/6882549580559777800

function merger(...opts) {
    let res = {};

    let combine = (opt) => {
        for (let prop in opt) {
            if (opt.hasOwnProperty(prop)) {

                if (Object.prototype.toString.call(opt[prop]) === '[object Object]') {

                    res[prop] = merger(res[prop], opt[prop]);

                } else {

                    res[prop] = opt[prop];

                }

            }
        }
    }

    for (let i = 0; i < opts.length; i++) {
        combine(opts[i]);
    }
    return res;
}

export {
    merger
}