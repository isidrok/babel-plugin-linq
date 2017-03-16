import traverse from "babel-traverse";
import * as t from "babel-types";

export default class WhereTransformer {
    constructor(path, params, file) {
        if (params.length != 1)
            throw new SyntaxError('Invalid arrow function');
        this.id = params[0].name;
        this.path = path;
        this.body = path.node.body;
        this.file = file;
        this.counter = 0;
        this.params = [];
    }
    newBooleanExpression() {
        let expression = t.NewExpression(t.Identifier('BooleanExpression'), []);
        let variableDeclarator = t.variableDeclarator(t.Identifier('_booleanExpression'), expression);
        let variableDeclaration = t.variableDeclaration('let', [variableDeclarator]);
        return variableDeclaration;
    }
    paramsBooleanExpression(param) {
        let memberExpression = t.MemberExpression(
            t.Identifier('_booleanExpression'),
            t.Identifier('params')
        );
        let params = [t.StringLiteral(param),t.Identifier(param)];
        let callExpression = t.CallExpression(memberExpression,params);
        let expressionStatement = t.ExpressionStatement(callExpression);
        return expressionStatement;
    }
    setBooleanExpression(_expression) {
        let memberExpression = t.MemberExpression(
            t.Identifier('_booleanExpression'),
            t.Identifier('expression')
        );
        let expression = t.StringLiteral(_expression);
        let assignmentExpression = ('=',memberExpression,expression);
        let expressionStatement = t.ExpressionStatement(assignmentExpression);
    }
    buildAllParamsExpressions(){
        let paramExpressions = [];
        this.params.forEach(param => {
            paramExpressions.push(paramsBooleanExpression(param.key));
        });
        return paramExpressions;
    }

    traverseAST(){
        traverse(this.path.parent, {
            noScope: true,
            BinaryExpression(path,left,right){
                console.log('hello');
            }
        });
    }

    run() {
        // let newStatement = this.newBooleanExpression();
        // let paramExpressions = this.buildAllParamsExpressions();
        // let expressionStatement = this.setBooleanExpression('expression');
        // return t.blockStatement([newStatement,paramExpressions,expressionStatement]);
        this.traverseAST();
        return t.blockStatement([]);
    }
}