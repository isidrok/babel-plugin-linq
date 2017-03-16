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
        this.expressionStart = path.node.start;
        this.expressionEnd = path.node.end;
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
        let params = [t.StringLiteral(key), t.Identifier(key)];
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
    buildBlockStatement() {
        let newStatement = this.newBooleanExpression();
        let paramExpressions = this.buildAllParamsExpressions();
        let expression = this.file.code.substring(this.expressionStart,this.expressionEnd+1);
        let expressionStatement = this.setBooleanExpression(expression);
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
            if(param.isIdentifier)
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
        let counter = 0;
        let _this = this;
        function name() {
            let name = `p${counter}`;
            counter++;
            return name;
        }
        function flagChildernAsValid(node) {
            node.right[VALID] = true;
            node.left[VALID] = true;
        };
        function handleNode(node) {
            if (t.isMemberExpression(node)) return;
            let _name = name();
            if (t.isIdentifier(node)) {
                _this.params.push({ [_name]: node.name , isIdentifier:true });
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
                if (!node.body[VALID]) return;
                if (!t.isLogicalExpression(node.body) && !t.isBinaryExpression(node.body))
                    throw new SyntaxError('Invalid arrow function expression');
                
            },
            LogicalExpression(path, left, right) {
                const { node } = path;
                if (!node[VALID]) return;
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
        return this.buildFunctionCall();
    }
}