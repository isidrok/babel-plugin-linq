'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  /**
   * Gets the name of the parent of a
   * given node, in this case the function
   * that called the ArrowFunctionExpression.
   * @param {any} path
   * @return {string} name of the caller
   */
  function getParentName(path) {
    return path.parent.callee.property && path.parent.callee.property.name || path.parent.callee.name;
  }

  /**
   * Gets the callee of the ArrowFunctionExpression
   * and returns the transformer that must handle
   * that kind of expression.
   * @param {any} path
   * @return {object} transformer to parse the expression
   */
  function getTransformer(path) {
    var parent = getParentName(path);
    var transformers = {
      'where': _wheretransformer2.default,
      'select': _selecttransformer2.default,
      'orderBy': _ordertransformer2.default,
      'orderByDescending': _ordertransformer2.default,
      'thenBy': _ordertransformer2.default,
      'thenByDescending': _ordertransformer2.default
    };
    return transformers[parent];
  }
  return {
    visitor: {

      /**
       * Parses the ArrowFunctionExpressions by obtaining
       * the correct transformer for that kind of expression
       * and replacing its path.
       * @param {any} path
       * @param {any} state
       */
      ArrowFunctionExpression: function ArrowFunctionExpression(path, state) {
        var node = path.node;

        var Transformer = getTransformer(path);
        if (!Transformer) return;
        _check.check.hasOnlyOneParam(node);
        path.replaceWith(new Transformer(path, state.file.code).run());
      }
    }
  };
};

var _ordertransformer = require('./ordertransformer');

var _ordertransformer2 = _interopRequireDefault(_ordertransformer);

var _wheretransformer = require('./wheretransformer');

var _wheretransformer2 = _interopRequireDefault(_wheretransformer);

var _selecttransformer = require('./selecttransformer');

var _selecttransformer2 = _interopRequireDefault(_selecttransformer);

var _check = require('./check');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }