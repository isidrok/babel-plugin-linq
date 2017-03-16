import traverse from 'babel-traverse';
import * as t from 'babel-types';
import VALID from './valid'

export default class WhereTransformer {
    constructor(path, params, file) {
        if (params.length != 1)
            throw new SyntaxError('Invalid arrow function');
        this.id = params[0].name;
        this.path = path;
        this.body = path.node.body;
        this.file = file;
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
        let key = Object.keys(param)[0];
        let params = [t.StringLiteral(key), t.Identifier(param[key])];
        let callExpression = t.CallExpression(memberExpression, params);
        let expressionStatement = t.ExpressionStatement(callExpression);
        return expressionStatement;
    }
    setBooleanExpression(_expression) {
        let memberExpression = t.MemberExpression(
            t.Identifier('_booleanExpression'),
            t.Identifier('expression')
        );
        let expression = t.StringLiteral(_expression);
        let assignmentExpression = t.assignmentExpression('=', memberExpression, expression);
        let expressionStatement = t.ExpressionStatement(assignmentExpression);
        return expressionStatement;
    }
    buildAllParamsExpressions() {
        let paramExpressions = [];
        this.params.forEach(param => {
            paramExpressions.push(this.paramsBooleanExpression(param));
        });
        return paramExpressions;
    }

    traverseAST() {
        let counter = 0;
        let _this = this;      
        function name() {
            let name = `p${counter}`;
            counter++;
            return name;
        }
        function flagChildernAsValid(node){
            node.right[VALID] = true;
            node.left[VALID] = true;
        };
        function handleNode(node) {
            if(t.isMemberExpression(node)) return;
            let _name = name();
            if (t.isIdentifier(node)) {
                _this.params.push({ [_name]: node.name });
                node.name = _name;
            }
            else {
                _this.params.push({ [_name]: node.value });
                node.value = _name;
            }
        }
        traverse(this.path.parent, {
            noScope: true,

            ArrowFunctionExpression(path, state) {
                const { node } = path;
                node.body[VALID] = true;
                if(!node.body[VALID]) return;
                if (!t.isLogicalExpression(node.body) && !t.isBinaryExpression(node.body))
                    throw new SyntaxError('Invalid arrow function expression');
            },
            LogicalExpression(path, left, right) {
                const { node } = path;
                if(!node[VALID]) return;
                if (!t.isBinaryExpression(node.left) || !t.isBinaryExpression(node.right)) {
                    throw new SyntaxError('Invalid logical expression');
                }
                flagChildernAsValid(node);
            },
            BinaryExpression(path, left, right) {
                const { node } = path;
                if (!node[VALID]) return;
                let lhs = node.left;
                let rhs = node.right;
                if (!t.isMemberExpression(lhs) && !t.isMemberExpression(rhs)) {
                    throw new SyntaxError('Invalid binary expression');
                }
                flagChildernAsValid(node);
                handleNode(lhs);
                handleNode(rhs);

            },
            MemberExpression(path) {
                const { node } = path;
                if (!node[VALID]) return;
                if (node.object.name != _this.id)
                    throw new SyntaxError('Invalid member expression');
            }
        });
    }

    run() {
        this.traverseAST();
        let newStatement = this.newBooleanExpression();
        let paramExpressions = this.buildAllParamsExpressions();
        let expressionStatement = this.setBooleanExpression('expression');
        let code = [newStatement];
        paramExpressions.forEach(expression =>{
            code.push(expression);
        });
        code.push(expressionStatement)
        return t.blockStatement(code);
    }
}