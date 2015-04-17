'use strict';

var React = require('react/addons');
var DiaporamaComponent = require('diaporama-react');
var getImage = require('./getImage');
var random = require('lodash.random');
var eachLimit = require('./eachLimit');
var loadedImages = {};
var GlslTransitions = require('glsl-transition');
var update = React.addons.update;

/**
 * Helper to determine the resolution
 */
var resolution = (function () {
    if (!window) {
        return 1;
    }

    var mediaQuery = '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-resolution: 1.5dppx)';

    if (window.devicePixelRatio) {
        return window.devicePixelRatio;
    }

    if (window.matchMedia && window.matchMedia(mediaQuery).matches) {
        return 2;
    }

    return 1;
})();

var KenBurnsComponent = React.createClass({

    displayName: 'KenBurnsComponent',

    getInitialState: function () {
        return {
            images: []
        };
    },

    componentDidMount: function () {
        this.resolveImages();
    },

    componentWillUnmount: function () {
        this.diaporama = null;
    },

    resolveImages: function (props) {
        props = props || this.props;
        var images = props.images;
        var self = this;

        if (!Array.isArray(images)) {
            images = [images];
        }

        // component has load control, however, it display a black screen
        // before the first image is loaded, so we'll display placeholder
        // before that and load images in background, and only then mutate state
        eachLimit(images, 3, function downloadImage(imageSource, next) {
            var cachedImage = loadedImages[imageSource];
            if (typeof cachedImage === 'boolean') {
                if (cachedImage) {
                    self.pushImage(imageSource);
                }
                return next();
            }

            getImage(imageSource, function imageHasLoaded(err, img) {

                if (err) {
                    loadedImages[imageSource] = false;
                    return next();
                }

                if (self.isMounted()) {
                    loadedImages[imageSource] = true;
                    self.pushImage(imageSource);
                }

                next();
            });

        });
    },

    pushImage: function (source) {
        if (this.isMounted()) {
            var images = this.state.images;
            var image = this.createSlide(source);

            this.setState(update(this.state, {
                images: {
                    $push: [image]
                }
            }));
        }
    },

    createSlide: function (url) {
        var image = {
            image: url,
            duration: this.props.duration || 4000,
            kenburns: {
                from: [ random(0.6, 0.8), [ random(0.4, 0.6), random(0.4, 0.6) ] ],
                to: [ random(0.7, 0.9), [ random(0.4, 0.6), random(0.4, 0.6) ] ]
            },
            transitionNext: {
                duration: this.props.transitionDuration || 3000
            }
        };

        return image;
    },

    componentWillReceiveProps: function (nextProps) {
        this.setState({ images: [] });
        this.resolveImages(nextProps);
    },

    diaporamaMounted: function (diaporama) {
        this.diaporama = diaporama;
    },

    nextSlide: function () {
        if (this.diaporama && this.state.images.length > 1) {
            this.diaporama.next(this.props.transitionDuration || 1000);
        }
    },

    pause: function () {
        if (this.diaporama && this.state.images.length > 1) {
            this.diaporama.pause();
        }
    },

    play: function () {
        if (this.diaporama && this.state.images.length > 1) {
            this.diaporama.play();
        }
    },

    render: function () {
        if (this.state.images.length < 2) {
            var src = this.state.images[0] && this.state.images[0].image || this.props.fallback;
            return (<img src={src} width={this.props.width} height={this.props.height} />);
        }

        return (<DiaporamaComponent
                    key='diaporama'
                    data={{ timeline: this.state.images }}
                    width={this.props.width}
                    height={this.props.height}
                    resolution={this.props.resolution || resolution}
                    loop={true}
                    autoplay={true}
                    GlslTransitions={GlslTransitions}
                    onDiaporamaCreated={this.diaporamaMounted}
                />);
    }

});

module.exports = KenBurnsComponent;
