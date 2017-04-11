import OrderTransformer from './ordertransformer';
import WhereTransformer from './wheretransformer';
import SelectTransformer from './selecttransformer';

export default function ({ types: t }) {
    
    function isValidArrowFunction(node) {
        return (node.params.length === 1 && (t.isLogicalExpression(node.body) || t.isBinaryExpression(node.body)))
    }

    function getParentName(path) {
        return ((path.parent.callee.property && path.parent.callee.property.name) || path.parent.callee.name);
    }

    function getTransformer(path) {
        let parent = getParentName(path);
        let transformers = {
            "where": WhereTransformer,
            "select" : SelectTransformer,
            "orderBy": OrderTransformer,
            "orderByDescending": OrderTransformer,
            "thenBy": OrderTransformer,
            "thenByDescending": OrderTransformer
        }
        return transformers[parent];
    }
    return {
        visitor: {
            ArrowFunctionExpression(path, state) {
                const { node } = path;
                let Transformer = getTransformer(path);
                if (!Transformer) return;
                // if (!isValidArrowFunction(node))
                //     throw new SyntaxError('Invalid arrow function expression');
                path.replaceWith(new Transformer(path, state.file.code).run());
                //new Transformer(path, state.file.code).run();
            }
        }
    }
}


