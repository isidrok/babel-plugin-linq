import traverse from 'babel-traverse';
import * as t from 'babel-types';
import VALID from './valid'

export default class WhereTransformer {
    constructor(path, state) {
        let _params = path.node.params;
        if (_params.length != 1)
            throw new SyntaxError('Invalid arrow function');
        this.id = _params[0].name;
        this.path = path;
        this.state = state;
        this.params = [];
    }
    buildBoolean() {
        let expression = t.NewExpression(t.Identifier('BooleanExpression'), []);
        let variableDeclarator = t.variableDeclarator(t.Identifier('_booleanExpression'), expression);
        let variableDeclaration = t.variableDeclaration('let', [variableDeclarator]);
        return variableDeclaration;
    }
    buildParam(param) {
        let memberExpression = t.MemberExpression(
            t.Identifier('_booleanExpression'),
            t.Identifier('params')
        );
        let key = Object.keys(param)[0];
        let params = [t.StringLiteral(key), t.Identifier(key)];
        let callExpression = t.CallExpression(memberExpression, params);
        let expressionStatement = t.ExpressionStatement(callExpression);
        return expressionStatement;
    }
    buildExpression(_expression) {
        let memberExpression = t.MemberExpression(
            t.Identifier('_booleanExpression'),
            t.Identifier('expression')
        );
        let expression = t.StringLiteral(_expression);
        let assignmentExpression = t.assignmentExpression('=', memberExpression, expression);
        let expressionStatement = t.ExpressionStatement(assignmentExpression);
        return expressionStatement;
    }
    buildAllParams() {
        let paramExpressions = [];
        this.params.forEach(param => {
            paramExpressions.push(this.buildParam(param));
        });
        return paramExpressions;
    }
    buildBlockStatement() {
        let newStatement = this.buildBoolean();
        let paramExpressions = this.buildAllParams();
        let expression = 'TODO: build the expression correctly';
        let expressionStatement = this.buildExpression(expression);
        let code = [newStatement];
        paramExpressions.forEach(expression => {
            code.push(expression);
        });
        code.push(expressionStatement)
        let blockStatement = t.blockStatement(code);
        return blockStatement;
    }
    buildFunction() {
        let functionId = null;
        let functionBody = this.buildBlockStatement();
        let functionParams = [];
        this.params.forEach(param => {
            let key = Object.keys(param)[0];
            functionParams.push(t.Identifier(key));
        });
        let functionExpression = t.functionExpression(functionId, functionParams, functionBody);
        return functionExpression;
    }
    buildFunctionCall() {
        let functionExpression = this.buildFunction();
        let callParams = [];
        this.params.forEach(param => {
            let key = Object.keys(param)[0];
            let _param
            if (param.isIdentifier)
                _param = t.Identifier(param[key]);
            else
                _param = getParam(param[key]);
            callParams.push(_param);
        });
        let callExpression = t.callExpression(functionExpression, callParams);
        return t.expressionStatement(callExpression);

        function getParam(param) {
            if (typeof param === "number")
                return t.NumericLiteral(param);
            if (typeof param === "string")
                return t.StringLiteral(param);
        }
    }

    traverseAST() {
        let paramCounter = 0;
        let count = 0;
        let _this = this;

        function name() {
            let name = `p${paramCounter}`;
            paramCounter++;
            return name;
        }

        function flagChildernAsValid(node) {
            node.right[VALID] = true;
            node.left[VALID] = true;
        }

        function handleTerminalNode(node) {
            if (t.isMemberExpression(node)) {
                if (node.object.name != _this.id)
                    throw new SyntaxError('Invalid member expression');
                return;
            }

            let _name = name();
            if (t.isIdentifier(node)) {
                _this.params.push({ [_name]: node.name, isIdentifier: true });
                node.name = _name;
            }
            else
                _this.params.push({ [_name]: node.value }); {
                node.value = _name;
            }
        }
        function isValidLogicalExpression(node) {
            let lhs = node.left;
            let rhs = node.right;
            return (
            t.isLogicalExpression(lhs) && t.isLogicalExpression(rhs) ||
                t.isBinaryExpression(lhs) && t.isBinaryExpression(rhs) ||
                t.isBinaryExpression(lhs) && t.isLogicalExpression(rhs) ||
                t.isLogicalExpression(lhs) && t.isBinaryExpression(rhs));
        }
        function isValidBinaryExpression(node) {
            let lhs = node.left;
            let rhs = node.right;
            return (
            t.isMemberExpression(lhs) && (t.isIdentifier(rhs) || t.isNumericLiteral(rhs) || t.isStringLiteral(rhs)) ||
                (t.isIdentifier(lhs) || t.isNumericLiteral(lhs) || t.isStringLiteral(lhs)) && t.isMemberExpression(rhs));
        }

        traverse(this.path.node,
            {
             
                LogicalExpression(path, left, right) {
                    const { node } = path;
                    if (!node[VALID]) return;
                    if (!isValidLogicalExpression(node)) {
                        throw new SyntaxError('Invalid logical expression');
                    }
                    flagChildernAsValid(node);
                },
                BinaryExpression(path, left, right) {
                    const { node } = path;
                    if (!node[VALID]) return;
                    if (!isValidBinaryExpression(node)) {
                        throw new SyntaxError('Invalid binary expression');
                    }
                    let lhs = node.left;
                    let rhs = node.right;
                    flagChildernAsValid(node);
                    handleTerminalNode(lhs);
                    handleTerminalNode(rhs);
                }
            }, this.path.scope, this.path);

        
    }
    run() {
        this.traverseAST();
        return this.buildFunctionCall();
    }
}