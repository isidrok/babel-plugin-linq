'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Transformer = function Transformer(path, file) {
    _classCallCheck(this, Transformer);

    this.node = path.node;
    if (node.params.size != 1) throw new SyntaxError('Invalid arrow function');
    this.id = node.params[0].name;
    this.body = node.body;
    this.file = file;
};