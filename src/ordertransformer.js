import * as t from 'babel-types';
import { check } from './check';

/**
 * Transforms the body of an order()
 * expression an string literal so it can be
 * treated as a string, for example:
 * order( c=> c.id) outputs order( 'c=> c.id')
 * @export
 * @class OrderTransformer
 */
export default class OrderTransformer {
  constructor(path, code) {
    check.isValidOrderBody(path.node);
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
  createLiteral() {
    let body = this.path.node.body;
    check.isValidMemberExpression(body, this.id);
    let expression = this.code.substring(body.start, body.end);
    expression = `${this.id} => ${expression}`;
    return t.stringLiteral(expression);
  }
  run() {
    return this.createLiteral();
  }
}
