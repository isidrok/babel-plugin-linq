import WhereTransformer from './wheretransformer'
module.exports = function ({ types: t }) {
    const VISITED = Symbol();
    return {
        visitor: {
            ArrowFunctionExpression(path, state) {
                const { node } = path;
                if (node[VISITED] || !parentIsWhere(path)) return;
                let Transformer = WhereTransformer;
                node[VISITED] = true;
                path.replaceWith(new Transformer(path, node.params, state.file).run());
             }
        }
    }
}

function parentIsWhere(path) {
    return path.parent.callee.property.name === 'where';
}
