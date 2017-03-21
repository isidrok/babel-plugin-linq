
import WhereTransformer from './wheretransformer'

export default function ({ types: t }) {
    
    function isValidArrowFunction(node) {
        return (node.params.length === 1 && (t.isLogicalExpression(node.body) || t.isBinaryExpression(node.body)))
    }

    function getParentName(path) {
        return path.parent.callee.property.name;
    }

    function getTransformer(path) {
        let parent = getParentName(path);
        let transformers = {
            "where": WhereTransformer
            //"select" : SelectTransformer
        }
        return transformers[parent];
    }
    return {
        visitor: {
            ArrowFunctionExpression(path, state) {
                const { node } = path;
                let Transformer = getTransformer(path);
                if (!Transformer) return;
                if (!isValidArrowFunction(node))
                    throw new SyntaxError('Invalid arrow function expression');
                path.replaceWith(new Transformer(path, state.file.code).run());
            }
        }
    }
}


