import OrderTransformer from './ordertransformer';
import WhereTransformer from './wheretransformer';
import SelectTransformer from './selecttransformer';
import { check } from './check';

/**
 * Entry point of the plugin, transforms
 * the arrow functions inside the calls to
 * 'where', 'select', 'orderBy', 'orderByDescending'
 * 'thenBy' and 'thenByDescending' methods.
 * @export
 * @param {any} { types: t }
 * @return {object} visitor that parses the ArrowFunctionExpression
 */
export default function({ types: t }) {
  /**
   * Gets the name of the parent of a
   * given node, in this case the function
   * that called the ArrowFunctionExpression.
   * @param {any} path
   * @return {string} name of the caller
   */
  function getParentName(path) {
    return ((path.parent.callee.property &&
      path.parent.callee.property.name) ||
      path.parent.callee.name);
  }

  /**
   * Gets the callee of the ArrowFunctionExpression
   * and returns the transformer that must handle
   * that kind of expression.
   * @param {any} path
   * @return {object} transformer to parse the expression
   */
  function getTransformer(path) {
    let parent = getParentName(path);
    let transformers = {
      'where': WhereTransformer,
      'select': SelectTransformer,
      'orderBy': OrderTransformer,
      'orderByDescending': OrderTransformer,
      'thenBy': OrderTransformer,
      'thenByDescending': OrderTransformer
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
      ArrowFunctionExpression(path, state) {
        const { node } = path;
        let Transformer = getTransformer(path);
        if (!Transformer) return;
        check.hasOnlyOneParam(node);
        path.replaceWith(new Transformer(path, state.file.code).run());
      }
    }
  };
}


