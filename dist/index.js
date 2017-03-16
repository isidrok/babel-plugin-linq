'use strict';

var _wheretransformer = require('./wheretransformer');

var _wheretransformer2 = _interopRequireDefault(_wheretransformer);

var _valid = require('./valid');

var _valid2 = _interopRequireDefault(_valid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (_ref) {
    var t = _ref.types;

    return {
        visitor: {
            ArrowFunctionExpression: function ArrowFunctionExpression(path, state) {
                var node = path.node;

                if (!parentIsWhere(path)) return;
                var Transformer = _wheretransformer2.default;
                node.body[_valid2.default] = true;
                path.replaceWith(new Transformer(path, node.params, state.file).run());
            }
        }
    };
};

function parentIsWhere(path) {
    return path.parent.callee.property.name === 'where';
}