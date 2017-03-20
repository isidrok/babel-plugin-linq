import WhereTransformer from './wheretransformer'
import VALID from './valid';
module.exports = function ({ types: t }) {
    return {
        visitor: {
            ArrowFunctionExpression(path, state) {
                const { node } = path;
                if (!parentIsWhere(path)) return;
                if (!t.isLogicalExpression(node.body) && !t.isBinaryExpression(node.body))
                    throw new SyntaxError('Invalid arrow function expression');
                let Transformer = WhereTransformer;
                node.body[VALID] = true;
                path.replaceWith(new Transformer(path,state.file.code).run());
             }
        }
    }
}

function parentIsWhere(path) {
    return path.parent.callee.property.name === 'where';
}
