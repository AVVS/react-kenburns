'use strict';

var React = require('react');
var KenBurns = require('../lib/kenburns.jsx');
var images = [
    'images/barley.jpg',
    'images/gladiator.jpg',
    'images/leaves.jpg',
    'images/paris.jpg',
    'images/run.jpg'
];

document.body.style.margin = 0;
document.body.style.padding = 0;

function render() {
    React.render(<KenBurns
                        images={images}
                        fallback='images/train.jpg'
                        width={window.innerWidth}
                        height={window.innerHeight}
                />, document.getElementById('SlideshowContainer'));
}
window.onresize = render;
render();
