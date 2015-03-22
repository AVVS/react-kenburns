'use strict';

/**
 * Pass source of the image and get an error or img object
 * if it succeeds to load
 * @param {String}   source
 * @param {Function} callback
 */
function getImage(source, callback) {

    if (!window) {
        throw new Error('only works in browser');
    }

    var image = new Image();

    // callback
    function next(error) {

        // cleanup
        image.onerror = null;
        image.onabort = null;
        image.onload = null;

        if (error instanceof Error) {
            return callback(error);
        }

        callback(null, image);
    }

    // event listeners
    image.onload = next;
    image.onabort = next;
    image.onerror = next;

    // source
    image.src = source;

    // make sure the load event fires for cached images too
    if (image.complete || image.complete === undefined) {
        image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
        image.src = source;
    }

}



module.exports = getImage;
