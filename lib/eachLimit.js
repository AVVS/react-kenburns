'use strict';

var noop = function () {};

function once(func) {

    var called = false;

    return function (err, res) {

        if (called) {

            if (err) {
                return func(err, res);
            }
            throw new Error('Callback was already called.');
        }

        called = true;
        func(err, res);
    };
}

function _times(n, iterator) {

    var index = -1;
    while (++index < n) {
        iterator(index);
    }
}


function eachLimit(collection, limit, iterator, callback, thisArg) {

    callback = callback || noop;
    if (isNaN(limit) || limit < 1) {
        return callback();
    }

    var size, iterate;
    var started = 0;
    var completed = 0;
    var _iterator = thisArg ? iterator.bind(thisArg) : iterator;

    if (Array.isArray(collection)) {
        size = collection.length;
        if (!size) {
            return callback();
        }
        iterate = function () {
            var index = started++;
            if (index >= size) {
                return;
            }
            _iterator(collection[index], once(done));
        };
    } else if (collection && typeof collection === 'object') {
        var keys = Object.keys(collection);
        size = keys.length;
        if (!size) {
            return callback();
        }
        iterate = function () {
            var index = started++;
            if (index >= size) {
                return;
            }
            _iterator(collection[keys[index]], once(done));
        };
    } else {
        return callback();
    }

    _times(limit > size ? size : limit, iterate);

    function done(err, bool) {

        if (err) {
            callback(err);
            callback = noop;
            return;
        }
        if (++completed === size) {
            callback();
            callback = noop;
            return;
        }
        if (bool === false) {
            callback();
            callback = noop;
            return;
        }
        iterate();
    }

}

module.exports = eachLimit;
