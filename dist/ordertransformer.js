'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _check = require('./check');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Transforms the body of an order()
 * expression an string literal so it can be
 * treated as a string, for example:
 * order( c=> c.id) outputs order( 'c=> c.id')
 * @export
 * @class OrderTransformer
 */
var OrderTransformer = function () {
  function OrderTransformer(path, code) {
    _classCallCheck(this, OrderTransformer);

    _check.check.isValidOrderBody(path.node);
    this.code = code;
    this.path = path;
    this.id = path.node.params[0].name;
  }

  /**
   * Takes the original code from the ArrowFunctionExpression
   * body and uses it to create a string literal with the identifier
   * of the arrowFunction and its expression.
   * @return {stringLiteral} body of the order expression as a string
   *
   * @memberOf OrderTransformer
   */


  _createClass(OrderTransformer, [{
    key: 'createLiteral',
    value: function createLiteral() {
      var body = this.path.node.body;
      _check.check.isValidMemberExpression(body, this.id);
      var expression = this.code.substring(body.start, body.end);
      expression = this.id + ' => ' + expression;
      return t.stringLiteral(expression);
    }
  }, {
    key: 'run',
    value: function run() {
      return this.createLiteral();
    }
  }]);

  return OrderTransformer;
}();

exports.default = OrderTransformer;