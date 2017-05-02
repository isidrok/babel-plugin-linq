'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _babelTraverse = require('babel-traverse');

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _check = require('./check');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Transforms the body of a select() expression
 * into an object with two properties:
 *  expression: body of the select expression as a string
 *  initializer: function that maps the attributes to select
 *  with a given array of paramters.
 * For example the expression select(c=>{id, foo:{description}})
 * is transfomed into:
 *  select({
 *    expression: "c=>({id, foo:{description}})",
 *    initializer: function (...params) {
 *      return { id: params[0], foo: { description: params[1] } };
 *    }
 *  });
 * @export
 * @class SelectTransformer
 */
var SelectTransformer = function () {
  function SelectTransformer(path, code) {
    _classCallCheck(this, SelectTransformer);

    _check.check.isValidSelectBody(path.node);
    this.expression = code.substring(path.node.start, path.node.end);
    this.path = path;
  }

  /**
   * Creates an object expression with the
   * expression and the initializer properties.
   * @return {object}
   *
   * @memberOf SelectTransformer
   */


  _createClass(SelectTransformer, [{
    key: 'buildObject',
    value: function buildObject() {
      var objectExpression = t.objectExpression([this.buildExpression(), this.buildInitializer()]);
      return objectExpression;
    }

    /**
     * Creates the expression property which will contain
     * the expression of the ArrowFunction as a string.
     * @return {object}
     *
     * @memberOf SelectTransformer
     */

  }, {
    key: 'buildExpression',
    value: function buildExpression() {
      var objectProperty = t.objectProperty(t.identifier('expression'), t.stringLiteral(this.expression));
      return objectProperty;
    }

    /**
     * Creates the intitializer function as an
     * object property. Sets '...params' as the function
     * parameters and the arrowFunction expression with the
     * properties transformed by the visitor as its return
     * statement.
     * @return {object}
     *
     * @memberOf SelectTransformer
     */

  }, {
    key: 'buildInitializer',
    value: function buildInitializer() {
      var functionBody = t.blockStatement([t.returnStatement(this.path.node.body)]);
      var params = t.restElement(t.identifier('params'));
      var functionExpression = t.functionExpression(null, [params], functionBody);
      var objectProperty = t.objectProperty(t.identifier('initializer'), functionExpression);
      return objectProperty;
    }

    /**
     * Traverses the ArrowFunctionExpression
     * transforming the objectProperties in
     * order to create the initializer function
     * @memberOf SelectTransformer
     */

  }, {
    key: 'traverseAST',
    value: function traverseAST() {
      var paramCounter = 0;

      /**
       * Transforms an objectPropery into
       * an object that contains the parameter
       * the property is mapped to inside
       * the intitializer function.
       * @param {any} property
       * @return {object}  memberExpression with the form params[x]
       */
      function createProperyValue(property) {
        return t.memberExpression(t.identifier('params'), t.numericLiteral(paramCounter++), true);
      }
      (0, _babelTraverse2.default)(this.path.node, {
        /**
         * Takes all the properties of the object
         * expressions and when finds one whose value type
         * is identifer, transforms it into memberExpressions
         * for the initializer fucntion.
         * @param {any} path
         */
        ObjectExpression: function ObjectExpression(path) {
          var properties = path.node.properties;
          properties.forEach(function (prop) {
            _check.check.isValidObjectProperty(prop);
            if (prop.value.type === 'Identifier') prop.value = createProperyValue(prop.value.name);
          });
        }
      }, this.path.scope, this.path);
    }
  }, {
    key: 'run',
    value: function run() {
      this.traverseAST();
      return this.buildObject();
    }
  }]);

  return SelectTransformer;
}();

exports.default = SelectTransformer;