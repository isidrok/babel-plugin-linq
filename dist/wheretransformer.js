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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Trasforms the body of a where expression into an
 * autoexecutable function that returns an object with
 * two properties:
 *  params: mapping between an attribute and its given alias
 *  expression: body of the Arrow function replacing the nodes that
 *  are not a memberExpression by a generated parameter.
 *
 * For example, where(c => c.description === 'hello' || c.bar.id === 10)
 * Outputs:
 * where(function (p0, p1) {
 *  let booleanExpression = {
 *    params: {}
 *  };
 *  booleanExpression.params.p0 = p0;
 *  booleanExpression.params.p1 = p1;
 *  booleanExpression.expression = 'c => c.description === p0 || c.bar.id === p1';
 *  return booleanExpression;
 * }('hello', 10));
 * @export
 * @class WhereTransformer
 */
var WhereTransformer = function () {
  function WhereTransformer(path, code) {
    _classCallCheck(this, WhereTransformer);

    _check.check.isValidWhereBody(path.node);
    this.expression = code.substring(path.node.start, path.node.end);
    this.id = path.node.params[0].name;
    this.path = path;
    this.params = [];
  }

  /**
   * Declares an object called booleanExpression
   * with a property called params that is an
   * empty object.
   * @return {object} booleanExpression
   *
   * @memberOf WhereTransformer
   */


  _createClass(WhereTransformer, [{
    key: 'buildBoolean',
    value: function buildBoolean() {
      var booleanExpressionObject = t.objectExpression([t.objectProperty(t.identifier('params'), t.objectExpression([]))]);
      var variableDeclarator = t.variableDeclarator(t.identifier('booleanExpression'), booleanExpressionObject);
      var variableDeclaration = t.variableDeclaration('let', [variableDeclarator]);
      return variableDeclaration;
    }

    /**
     * Creates an array whose values are
     * expressionStatements that assign the
     * different params found in the visitor to
     * the params property of the booleanExpression.
     * @return {array} parameters array
     *
     * @memberOf WhereTransformer
     */

  }, {
    key: 'buildAllParams',
    value: function buildAllParams() {
      var _this2 = this;

      var paramExpressions = [];
      this.params.forEach(function (param) {
        paramExpressions.push(_this2.buildParam(param));
      });
      return paramExpressions;
    }

    /**
     * Creates a parameter assignment with the form
     * booleanExpression.params.p0 = p0;
     * @param {any} param
     * @return {object} expressionStatement
     *
     * @memberOf WhereTransformer
     */

  }, {
    key: 'buildParam',
    value: function buildParam(param) {
      var key = this.getKey(param);
      var innerMemberExpression = t.memberExpression(t.identifier('booleanExpression'), t.identifier('params'));
      var outherMemberExpression = t.memberExpression(innerMemberExpression, t.identifier(key));
      var identifier = t.identifier(key);
      var assignmentExpression = t.assignmentExpression('=', outherMemberExpression, identifier);
      var expressionStatement = t.expressionStatement(assignmentExpression);
      return expressionStatement;
    }
    /**
     * Assigns the where expression, as a string, to
     * the boolean expression object, whith the form:
     * booleanExpression.expression = 'c => c.id === p0'
     * @return {object} expression asignment
     *
     * @memberOf WhereTransformer
     */

  }, {
    key: 'buildExpressionAssignment',
    value: function buildExpressionAssignment() {
      var memberExpression = t.memberExpression(t.identifier('booleanExpression'), t.identifier('expression'));
      var expression = t.stringLiteral(this.expression);
      var assignmentExpression = t.assignmentExpression('=', memberExpression, expression);
      var expressionStatement = t.expressionStatement(assignmentExpression);
      return expressionStatement;
    }

    /**
     * Creates the body of the function that will be inserted
     * into the where expression, will insert the booleanExpression
     * declaration, the expression assignment, the params assignments
     * and the return statement.
     * @return {object} function body
     *
     * @memberOf WhereTransformer
     */

  }, {
    key: 'buildFunctionBody',
    value: function buildFunctionBody() {
      var newStatement = this.buildBoolean();
      var paramExpressions = this.buildAllParams();
      var expressionStatement = this.buildExpressionAssignment();
      var returnStatement = t.returnStatement(t.identifier('booleanExpression'));
      var code = [newStatement];
      paramExpressions.forEach(function (expression) {
        code.push(expression);
      });
      code.push(expressionStatement);
      code.push(returnStatement);
      var blockStatement = t.blockStatement(code);
      return blockStatement;
    }
    /**
     * Creates an annonymous function whose body is
     * the one made in the buildFunctionBody() method
     * and sets the alias of the attributes as its
     * call parameters.
     * @return {object} annonymous function
     *
     * @memberOf WhereTransformer
     */

  }, {
    key: 'buildFunction',
    value: function buildFunction() {
      var _this3 = this;

      var functionId = null;
      var functionBody = this.buildFunctionBody();
      var functionParams = [];
      var key = void 0;
      this.params.forEach(function (param) {
        key = _this3.getKey(param);
        functionParams.push(t.identifier(key));
      });
      var functionExpression = t.functionExpression(functionId, functionParams, functionBody);
      return functionExpression;
    }

    /**
     * Builds the function call to the previous
     * annonymous function with a real value
     * for its parameters.
     * @return {object} function call
     *
     * @memberOf WhereTransformer
     */

  }, {
    key: 'buildFunctionCall',
    value: function buildFunctionCall() {
      var _this4 = this;

      var functionExpression = this.buildFunction();
      var callParams = [];
      this.params.forEach(function (param) {
        var key = _this4.getKey(param);
        var arg = parseParam(param, key);
        callParams.push(arg);
      });
      var callExpression = t.callExpression(functionExpression, callParams);
      return t.expressionStatement(callExpression);

      /**
       * Depending on the type of the parameter
       * the arguments of the function call have
       * a different type.
       * @param {any} param
       * @param {any} key
       * @return {object} appropiate parameter object
       */
      function parseParam(param, key) {
        if (param.isIdentifier) return t.identifier(param[key]);
        if (typeof param[key] === 'number') return t.numericLiteral(param[key]);
        if (typeof param[key] === 'string') return t.stringLiteral(param[key]);
      }
    }

    /**
     * Builds the expression of the where body
     * using as a base the original expression and
     * replacing the attributes by its mapping.
     * @memberOf WhereTransformer
     */

  }, {
    key: 'buildExpression',
    value: function buildExpression() {
      var _this5 = this;

      this.params.forEach(function (param) {
        var key = _this5.getKey(param);
        var regex = param.isIdentifier ? new RegExp('([^.|w|d|_|\'|"|`])' + param[key] + '(?!S)', 'g') : new RegExp('([^.|w|d|_])' + param[key] + '(?!S)', 'g');
        _this5.expression = _this5.expression.replace(regex, '$1' + key);
      });
      this.expression = this.expression.replace(/['']/g, '');
    }
  }, {
    key: 'getKey',
    value: function getKey(param) {
      return Object.keys(param)[0];
    }

    /**
     * Traverses the arrow function storing the
     * different attributes found into an array to later
     * add them to the booleanExpression params and create
     * the booleanExpression expression.
     * @memberOf WhereTransformer
     */

  }, {
    key: 'traverseAST',
    value: function traverseAST() {
      var paramCounter = 0;
      var _this = this;
      /**
       * Generates a name for a parameter
       * appending a counter to a prefix,
       * that name will be used for the mapping.
       * @return {string} param name
       */
      function generateName() {
        var prefix = 'p';
        return prefix + paramCounter++;
      }
      /**
       * Handles the sides of a binaryExpression.
       * If it is a memberExpression checks that it
       * is a valid one and then returns.
       * Otherwise generates a name for the property
       * and if there is not a parameter in the params array
       * with the same name already pushes an object with a property
       * being the generated name that stores the real name and
       * a boolean that sais if the property is an identifier.
       * @param {any} node
       */
      function handleTerminalNode(node) {
        var _this$params$push;

        if (t.isMemberExpression(node)) {
          _check.check.isValidMemberExpression(node, _this.id);
          return;
        }
        var name = generateName();
        var isIdentifier = t.isIdentifier(node);
        var prop = isIdentifier ? node.name : node.value;
        if (!isRepeated(prop)) _this.params.push((_this$params$push = {}, _defineProperty(_this$params$push, name, prop), _defineProperty(_this$params$push, 'isIdentifier', isIdentifier), _this$params$push));

        function isRepeated() {
          return _this.params.some(function (param) {
            return param[_this.getKey(param)] === prop && param.isIdentifier === isIdentifier;
          });
        }
      }

      (0, _babelTraverse2.default)(this.path.node, {
        LogicalExpression: function LogicalExpression(path, left, right) {
          var node = path.node;

          _check.check.isValidLogicalExpression(node);
        },
        BinaryExpression: function BinaryExpression(path, left, right) {
          var node = path.node;

          _check.check.isValidBinaryExpression(node);
          var lhs = node.left;
          var rhs = node.right;
          handleTerminalNode(lhs);
          handleTerminalNode(rhs);
        }
      }, this.path.scope, this.path);
    }
  }, {
    key: 'run',
    value: function run() {
      this.traverseAST();
      this.buildExpression();
      return this.buildFunctionCall();
    }
  }]);

  return WhereTransformer;
}();

exports.default = WhereTransformer;