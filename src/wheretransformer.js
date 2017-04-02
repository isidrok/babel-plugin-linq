import traverse from 'babel-traverse';
import * as t from 'babel-types';

export default class WhereTransformer {
    constructor(path, code) {
        this.expression = code.substring(path.node.start, path.node.end + 1);
        this.id = path.node.params[0].name;
        this.path = path;
        this.params = [];
    }
    buildBoolean() {
        //TODO: change so it builds booleanExpression = {}
        let expression = t.NewExpression(t.Identifier('BooleanExpression'), []);
        let variableDeclarator = t.variableDeclarator(t.Identifier('_booleanExpression'), expression);
        let variableDeclaration = t.variableDeclaration('let', [variableDeclarator]);
        return variableDeclaration;
    }
    buildAllParams() {
        let paramExpressions = [];
        this.params.forEach(param => {
            paramExpressions.push(this.buildParam(param));
        });
        return paramExpressions;
    }
    buildParam(param) {
        //TODO: change in order to build something like booleanExpression.params[key] = value
        let memberExpression = t.MemberExpression(
            t.Identifier('_booleanExpression'),
            t.Identifier('params')
        );
        let key = this.getKey(param);
        let params = [t.StringLiteral(key), t.Identifier(key)];
        let callExpression = t.CallExpression(memberExpression, params);
        let expressionStatement = t.ExpressionStatement(callExpression);
        return expressionStatement;
    }
    buildExpressionAssignment() {
        //TODO: review that this function works correctly with the changes introduced to booleanExpression
        let memberExpression = t.MemberExpression(
            t.Identifier('_booleanExpression'),
            t.Identifier('expression')
        );
        let expression = t.StringLiteral(this.expression);
        let assignmentExpression = t.assignmentExpression('=', memberExpression, expression);
        let expressionStatement = t.ExpressionStatement(assignmentExpression);
        return expressionStatement;
    }
    buildFunctionBody() {
        let newStatement = this.buildBoolean();
        let paramExpressions = this.buildAllParams();
        let expressionStatement = this.buildExpressionAssignment(this.expression);
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
        let functionBody = this.buildFunctionBody();
        let functionParams = [];
        let key;
        this.params.forEach(param => {
            key = this.getKey(param);
            functionParams.push(t.Identifier(key));
        });
        let functionExpression = t.functionExpression(functionId, functionParams, functionBody);
        return functionExpression;
    }
    buildFunctionCall() {
        let functionExpression = this.buildFunction();
        let callParams = [];
        this.params.forEach(param => {
            let key = this.getKey(param);
            let arg = parseParam(param,key);
            callParams.push(arg);
        });
        let callExpression = t.callExpression(functionExpression, callParams);
        return t.expressionStatement(callExpression);

        function parseParam(param,key) {
            if (param.isIdentifier)
                return t.Identifier(param[key]);
            if (typeof param[key] === "number")
                return t.NumericLiteral(param[key]);
            if (typeof param[key] === "string")
                return t.StringLiteral(param[key]);
        }
    }
    buildExpression() {
        let regex;
        this.params.forEach(param => {
            let key = this.getKey(param);
            regex = new RegExp(`([^.|w|d|_])${param[key]}(?!S)`, 'g');
            this.expression = this.expression.replace(regex, `$1${key}`);
        });
        this.expression = this.expression.replace(/["']/g, "");
    }
    getKey(param) {
        return Object.keys(param)[0];
    }
    traverseAST() {
        let paramCounter = 0;
        let _this = this;

        function generateName() {
            let name = `p${paramCounter}`;
            paramCounter++;
            return name;
        }

        function handleTerminalNode(node) {
            if (t.isMemberExpression(node)) {
                handleMemberExpression();
                return;
            }
            let name = generateName();
            if (t.isIdentifier(node)) handleIdentifier();
            else handleLiteral();

            function handleMemberExpression() {
                if (node.object.name != _this.id)
                    throw new SyntaxError('Invalid member expression');
            }
            function handleIdentifier() {
                if (!isRepeated('name'))
                    _this.params.push({ [name]: node.name, isIdentifier: true });
            }
            function handleLiteral() {
                if (!isRepeated('value'))
                    _this.params.push({ [name]: node.value });
            }
            function isRepeated(prop) {
                let repeated = false;
                let key;
                _this.params.forEach(param => {
                    key = _this.getKey(param);
                    if (param[key] === node[prop]) repeated = true;
                });
                return repeated;
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
                    if (!isValidLogicalExpression(node)) {
                        throw new SyntaxError('Invalid logical expression');
                    }
                },
                BinaryExpression(path, left, right) {
                    const { node } = path;
                    if (!isValidBinaryExpression(node)) {
                        throw new SyntaxError('Invalid binary expression');
                    }
                    let lhs = node.left;
                    let rhs = node.right;
                    handleTerminalNode(lhs);
                    handleTerminalNode(rhs);
                }
            }, this.path.scope, this.path);


    }
    run() {
        this.traverseAST();
        this.buildExpression();
        return this.buildFunctionCall();
    }
}
