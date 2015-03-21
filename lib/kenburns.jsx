'use strict';

var React = require('react/addons');
var DiaporamaComponent = require('diaporama-react');
var getImage = require('get-image');
var random = require('lodash.random');
var eachLimit = require('./eachLimit');
var loadedImages = {};

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

    resolveImages: function () {
        var images = this.props.images;
        var self = this;

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

            getImage(imageSource, function (err, img) {

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
            var image = {
                image: source,
                duration: this.props.duration || 4000,
                kenburns: {
                    from: [ random(0.6, 0.8), [ random(0.4, 0.6), random(0.4, 0.6) ] ],
                    to: [ random(0.7, 0.9), [ random(0.4, 0.6), random(0.4, 0.6) ] ]
                },
                transitionNext: {
                    duration: this.props.transitionDuration || 3000
                }
            };

            this.setState(React.addons.update(this.state, {
                images: {
                    $push: [image]
                }
            }));
        }
    },

    componentWillReceiveProps: function (nextProps) {
        this.setState({ images: [] });
        this.resolveImages();
    },

    diaporamaMounted: function (diaporama) {
        this.diaporama = diaporama;
    },

    handleClick: function (e) {
        if (this.diaporama && this.state.images.length > 1) {
            this.diaporama.next();
        }
    },

    render: function () {

        if (this.state.images.length === 0) {
            return (<img src={this.props.fallback} width={this.props.width} height={this.props.height} />);
        }

        return (<div onClick={this.handleClick}>
                    <DiaporamaComponent
                        data={{ timeline: this.state.images }}
                        width={this.props.width}
                        height={this.props.height}
                        resolution={this.props.resolution || resolution}
                        loop={true}
                        autoplay={true}
                        onDiaporamaCreated={this.diaporamaMounted}
                    />
                </div>);
    }

});

module.exports = KenBurnsComponent;
