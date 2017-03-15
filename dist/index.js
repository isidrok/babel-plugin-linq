'use strict';

// import * as WhereTransformer from './wheretransformer'
module.exports = function (_ref) {
    var t = _ref.types;

    var VISITED = Symbol();
    return {
        visitor: {
            ArrowFunctionExpression: function ArrowFunctionExpression(path, state) {
                var node = path.node;

                if (node[VISITED] || !parentIsWhere(path)) return;
                //let Constructor = WhereTransformer;
                node[VISITED] = true;
                // path.replaceWith(new constructor(node.body, node.params, state.file).run());
                var be = t.BlockStatement([t.variableDeclaration('let', [t.variableDeclarator(t.Identifier('_booleanExpression'), t.NewExpression(t.Identifier('BooleanExpression'), []))])]);
                var fe = t.FunctionExpression(null, [t.Identifier('p1'), t.Identifier('p2')], be);
                var ce = t.CallExpression(fe, [t.Identifier('param1'), t.NumericLiteral(13)]);

                path.replaceWith(t.ExpressionStatement(ce));
            }
        }
    };
};

function parentIsWhere(path) {
    return path.parent.callee.property.name === 'where';
}