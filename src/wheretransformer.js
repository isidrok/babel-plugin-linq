import traverse from 'babel-traverse';
import * as t from 'babel-types';
import { check } from './check';


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
export default class WhereTransformer {
  constructor(path, code) {
    check.isValidWhereBody(path.node);
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
  buildBoolean() {
    let booleanExpressionObject = t.objectExpression([
      t.objectProperty(
        t.identifier('params'),
        t.objectExpression([])
      )
    ]);
    let variableDeclarator = t.variableDeclarator(
      t.identifier('booleanExpression'),
      booleanExpressionObject
    );
    let variableDeclaration = t.variableDeclaration(
      'let',
      [variableDeclarator]
    );
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
  buildAllParams() {
    let paramExpressions = [];
    this.params.forEach(param => {
      paramExpressions.push(this.buildParam(param));
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
  buildParam(param) {
    let key = this.getKey(param);
    let innerMemberExpression = t.memberExpression(
      t.identifier('booleanExpression'),
      t.identifier('params')
    );
    let outherMemberExpression = t.memberExpression(
      innerMemberExpression,
      t.identifier(key)
    );
    let identifier = t.identifier(key);
    let assignmentExpression = t.assignmentExpression(
      '=',
      outherMemberExpression,
      identifier
    );
    let expressionStatement = t.expressionStatement(assignmentExpression);
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
  buildExpressionAssignment() {
    let memberExpression = t.memberExpression(
      t.identifier('booleanExpression'),
      t.identifier('expression')
    );
    let expression = t.stringLiteral(this.expression);
    let assignmentExpression = t.assignmentExpression(
      '=',
      memberExpression,
      expression
    );
    let expressionStatement = t.expressionStatement(assignmentExpression);
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
  buildFunctionBody() {
    let newStatement = this.buildBoolean();
    let paramExpressions = this.buildAllParams();
    let expressionStatement = this.buildExpressionAssignment();
    let returnStatement = t.returnStatement(t.identifier('booleanExpression'));
    let code = [newStatement];
    paramExpressions.forEach(expression => {
      code.push(expression);
    });
    code.push(expressionStatement);
    code.push(returnStatement);
    let blockStatement = t.blockStatement(code);
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
  buildFunction() {
    let functionId = null;
    let functionBody = this.buildFunctionBody();
    let functionParams = [];
    let key;
    this.params.forEach(param => {
      key = this.getKey(param);
      functionParams.push(t.identifier(key));
    });
    let functionExpression = t.functionExpression(
      functionId,
      functionParams,
      functionBody
    );
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
  buildFunctionCall() {
    let functionExpression = this.buildFunction();
    let callParams = [];
    this.params.forEach(param => {
      let key = this.getKey(param);
      let arg = parseParam(param, key);
      callParams.push(arg);
    });
    let callExpression = t.callExpression(functionExpression, callParams);
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
      if (param.isIdentifier)
        return t.identifier(param[key]);
      if (typeof param[key] === 'number')
        return t.numericLiteral(param[key]);
      if (typeof param[key] === 'string')
        return t.stringLiteral(param[key]);
    }
  }

  /**
   * Builds the expression of the where body
   * using as a base the original expression and
   * replacing the attributes by its mapping.
   * @memberOf WhereTransformer
   */
  buildExpression() {
    this.params.forEach(param => {
      let key = this.getKey(param);
      let regex = param.isIdentifier
        ? new RegExp(`([^.|w|d|_|'|"|\`])${param[key]}(?!S)`, 'g')
        : new RegExp(`([^.|w|d|_]')${param[key]}(?!S)`, 'g');
      this.expression = this.expression.replace(regex, `$1${key}`);
    });
    this.expression = this.expression.replace(/['']/g, '');
  }
  getKey(param) {
    return Object.keys(param)[0];
  }

  /**
   * Traverses the arrow function storing the
   * different attributes found into an array to later
   * add them to the booleanExpression params and create
   * the booleanExpression expression.
   * @memberOf WhereTransformer
   */
  traverseAST() {
    let paramCounter = 0;
    let _this = this;
    /**
     * Generates a name for a parameter
     * appending a counter to a prefix,
     * that name will be used for the mapping.
     * @return {string} param name
     */
    function generateName() {
      let prefix = 'p';
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
      if (t.isMemberExpression(node)) {
        check.isValidMemberExpression(node, _this.id);
        return;
      }
      let name = generateName();
      let isIdentifier = t.isIdentifier(node);
      let prop = isIdentifier ? node.name : node.value;
      if (!isRepeated(prop))
        _this.params.push({ [name]: prop, isIdentifier: isIdentifier });

      function isRepeated() {
        return _this.params.some(param => {
          return param[_this.getKey(param)] === prop &&
            param.isIdentifier === isIdentifier;
        });
      }
    }

    traverse(this.path.node,
      {

        LogicalExpression(path, left, right) {
          const { node } = path;
          check.isValidLogicalExpression(node);
        },
        BinaryExpression(path, left, right) {
          const { node } = path;
          check.isValidBinaryExpression(node);
          let lhs = node.left;
          let rhs = node.right;
          handleTerminalNode(lhs);
          handleTerminalNode(rhs);
        }
      }, this.path.scope, this.path);
  }
  run() {
    this.traverseAST();
    this.buildExpression();
    return this.buildFunctionCall();
  }
}
