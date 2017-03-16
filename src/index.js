import WhereTransformer from './wheretransformer'
import VALID from './valid';
module.exports = function ({ types: t }) {
    return {
        visitor: {
            ArrowFunctionExpression(path, state) {
                const { node } = path;
                if (!parentIsWhere(path)) return;
                let Transformer = WhereTransformer;
                node.body[VALID] = true;
                path.replaceWith(new Transformer(path, node.params, state.file).run());
             }
        }
    }
}

function parentIsWhere(path) {
    return path.parent.callee.property.name === 'where';
}
