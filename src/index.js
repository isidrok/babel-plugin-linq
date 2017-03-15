// import * as WhereTransformer from './wheretransformer'
module.exports = function ({ types: t }) {
    const VISITED = Symbol();
    return {
        visitor: {
            ArrowFunctionExpression(path, state) {
                const { node } = path;
                if (node[VISITED] || !parentIsWhere(path)) return;
                //let Constructor = WhereTransformer;
                node[VISITED] = true;
                // path.replaceWith(new constructor(node.body, node.params, state.file).run());
                let be = t.BlockStatement([
                    t.variableDeclaration(
                        'let', [t.variableDeclarator(
                            t.Identifier('_booleanExpression'),
                            t.NewExpression(
                                t.Identifier('BooleanExpression'), []
                            )
                        )
                    ])
                ]);
                let fe = t.FunctionExpression(null, [t.Identifier('p1'), t.Identifier('p2')], be);
                let ce = t.CallExpression(fe, [t.Identifier('param1'), t.NumericLiteral(13)]);

                path.replaceWith(t.ExpressionStatement(ce));
            }
        }
    }
}

function parentIsWhere(path) {
    return path.parent.callee.property.name === 'where';
}
