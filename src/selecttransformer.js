import traverse from 'babel-traverse';
import * as t from 'babel-types';
import { check } from './check';

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
export default class SelectTransformer {
  constructor(path, code) {
    check.isValidSelectBody(path.node);
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
  buildObject() {
    let objectExpression = t.objectExpression([
      this.buildExpression(),
      this.buildInitializer()
    ]);
    return objectExpression;
  }

  /**
   * Creates the expression property which will contain
   * the expression of the ArrowFunction as a string.
   * @return {object}
   *
   * @memberOf SelectTransformer
   */
  buildExpression() {
    let objectProperty = t.objectProperty(
      t.identifier('expression'),
      t.stringLiteral(this.expression)
    );
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
  buildInitializer() {
    let functionBody = t.blockStatement([
      t.returnStatement(this.path.node.body)
    ]);
    let params = t.restElement(t.identifier('params'));
    let functionExpression = t.functionExpression(
      null,
      [params],
      functionBody
    );
    let objectProperty = t.objectProperty(
      t.identifier('initializer'),
      functionExpression
    );
    return objectProperty;
  }

  /**
   * Traverses the ArrowFunctionExpression
   * transforming the objectProperties in
   * order to create the initializer function
   * @memberOf SelectTransformer
   */
  traverseAST() {
    let paramCounter = 0;

    /**
     * Transforms an objectPropery into
     * an object that contains the parameter
     * the property is mapped to inside
     * the intitializer function.
     * @param {any} property
     * @return {object}  memberExpression with the form params[x]
     */
    function createProperyValue(property) {
      return t.memberExpression(
        t.identifier('params'),
        t.numericLiteral(paramCounter++),
        true
      );
    }
    traverse(this.path.node,
      {
        /**
         * Takes all the properties of the object
         * expressions and when finds one whose value type
         * is identifer, transforms it into memberExpressions
         * for the initializer fucntion.
         * @param {any} path
         */
        ObjectExpression(path) {
          let properties = path.node.properties;
          properties.forEach(prop => {
            check.isValidObjectProperty(prop);
            if (prop.value.type === 'Identifier')
              prop.value = createProperyValue(prop.value.name);
          });
        }
      }, this.path.scope, this.path);
  }
  run() {
    this.traverseAST();
    return this.buildObject();
  }
}
