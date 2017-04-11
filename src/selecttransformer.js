import traverse from 'babel-traverse';
import * as t from 'babel-types';

export default class SelectTransformer {
    constructor(path, code) {
        this.expression = code.substring(path.node.start, path.node.end);
        this.path = path;
    }


    buildObject() {
        let objectExpression = t.objectExpression([this.buildExpression(), this.buildInitializer()]);
        return objectExpression;
    }

    buildExpression() {
        let objectProperty = t.objectProperty(t.Identifier('expression'),t.StringLiteral(this.expression));
        return objectProperty;
    }

    buildInitializer(){
        let functionBody = t.blockStatement([t.returnStatement(this.path.node.body)]);
        let params = t.restElement(t.Identifier('params'));
        let functionExpression = t.functionExpression(null, [params], functionBody);
        let objectProperty = t.objectProperty(t.Identifier('initializer'),functionExpression);
        return objectProperty;
    }

    traverseAST() {
        let paramCounter = 0;
        let _this = this;

        function createProperyValue(property) {
            return t.memberExpression(t.Identifier('params'), t.numericLiteral(paramCounter++), true);
        }
        traverse(this.path.node,
            {
                ObjectExpression(path) {
                    let properties = path.node.properties;
                    properties.forEach(prop => {
                        if (prop.value.type === 'Identifier') prop.value = createProperyValue(prop.value.name);
                    });
                },
                Identifier(path) {

                }

            }, this.path.scope, this.path);


    }
    run() {
        this.traverseAST();
        return this.buildObject();

    }
}
