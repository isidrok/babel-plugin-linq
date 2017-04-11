'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (_ref) {
    var t = _ref.types;


    function isValidArrowFunction(node) {
        return node.params.length === 1 && (t.isLogicalExpression(node.body) || t.isBinaryExpression(node.body));
    }

    function getParentName(path) {
        return path.parent.callee.property && path.parent.callee.property.name || path.parent.callee.name;
    }

    function getTransformer(path) {
        var parent = getParentName(path);
        var transformers = {
            "where": _wheretransformer2.default,
            "select": _selecttransformer2.default
        };
        return transformers[parent];
    }
    return {
        visitor: {
            ArrowFunctionExpression: function ArrowFunctionExpression(path, state) {
                var node = path.node;

                var Transformer = getTransformer(path);
                if (!Transformer) return;
                // if (!isValidArrowFunction(node))
                //     throw new SyntaxError('Invalid arrow function expression');
                path.replaceWith(new Transformer(path, state.file.code).run());
                //new Transformer(path, state.file.code).run();
            }
        }
    };
};

var _wheretransformer = require('./wheretransformer');

var _wheretransformer2 = _interopRequireDefault(_wheretransformer);

var _selecttransformer = require('./selecttransformer');

var _selecttransformer2 = _interopRequireDefault(_selecttransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }