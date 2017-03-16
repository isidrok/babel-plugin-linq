'use strict';

var _wheretransformer = require('./wheretransformer');

var _wheretransformer2 = _interopRequireDefault(_wheretransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (_ref) {
    var t = _ref.types;

    var VISITED = Symbol();
    return {
        visitor: {
            ArrowFunctionExpression: function ArrowFunctionExpression(path, state) {
                var node = path.node;

                if (node[VISITED] || !parentIsWhere(path)) return;
                var Transformer = _wheretransformer2.default;
                node[VISITED] = true;
                path.replaceWith(new Transformer(path, node.params, state.file).run());
            }
        }
    };
};

function parentIsWhere(path) {
    return path.parent.callee.property.name === 'where';
}