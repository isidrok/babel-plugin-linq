'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _babelTraverse = require('babel-traverse');

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WhereTransformer = function () {
    function WhereTransformer(path, code) {
        _classCallCheck(this, WhereTransformer);

        this.expression = code.substring(path.node.start, path.node.end + 1);
        this.id = path.node.params[0].name;
        this.path = path;
        this.params = [];
    }

    _createClass(WhereTransformer, [{
        key: 'buildBoolean',
        value: function buildBoolean() {
            var expression = t.NewExpression(t.Identifier('BooleanExpression'), []);
            var variableDeclarator = t.variableDeclarator(t.Identifier('_booleanExpression'), expression);
            var variableDeclaration = t.variableDeclaration('let', [variableDeclarator]);
            return variableDeclaration;
        }
    }, {
        key: 'buildAllParams',
        value: function buildAllParams() {
            var _this2 = this;

            var paramExpressions = [];
            this.params.forEach(function (param) {
                paramExpressions.push(_this2.buildParam(param));
            });
            return paramExpressions;
        }
    }, {
        key: 'buildParam',
        value: function buildParam(param) {
            var memberExpression = t.MemberExpression(t.Identifier('_booleanExpression'), t.Identifier('params'));
            var key = Object.keys(param)[0];
            var params = [t.StringLiteral(key), t.Identifier(key)];
            var callExpression = t.CallExpression(memberExpression, params);
            var expressionStatement = t.ExpressionStatement(callExpression);
            return expressionStatement;
        }
    }, {
        key: 'buildExpressionAssignment',
        value: function buildExpressionAssignment() {
            var memberExpression = t.MemberExpression(t.Identifier('_booleanExpression'), t.Identifier('expression'));
            var expression = t.StringLiteral(this.expression);
            var assignmentExpression = t.assignmentExpression('=', memberExpression, expression);
            var expressionStatement = t.ExpressionStatement(assignmentExpression);
            return expressionStatement;
        }
    }, {
        key: 'buildFunctionBody',
        value: function buildFunctionBody() {
            var newStatement = this.buildBoolean();
            var paramExpressions = this.buildAllParams();
            var expressionStatement = this.buildExpressionAssignment(this.expression);
            var code = [newStatement];
            paramExpressions.forEach(function (expression) {
                code.push(expression);
            });
            code.push(expressionStatement);
            var blockStatement = t.blockStatement(code);
            return blockStatement;
        }
    }, {
        key: 'buildFunction',
        value: function buildFunction() {
            var functionId = null;
            var functionBody = this.buildFunctionBody();
            var functionParams = [];
            this.params.forEach(function (param) {
                var key = Object.keys(param)[0];
                functionParams.push(t.Identifier(key));
            });
            var functionExpression = t.functionExpression(functionId, functionParams, functionBody);
            return functionExpression;
        }
    }, {
        key: 'buildFunctionCall',
        value: function buildFunctionCall() {
            var functionExpression = this.buildFunction();
            var callParams = [];
            this.params.forEach(function (param) {
                var key = Object.keys(param)[0];
                var _param = void 0;
                if (param.isIdentifier) _param = t.Identifier(param[key]);else _param = getParam(param[key]);
                callParams.push(_param);
            });
            var callExpression = t.callExpression(functionExpression, callParams);
            return t.expressionStatement(callExpression);

            function getParam(param) {
                if (typeof param === "number") return t.NumericLiteral(param);
                if (typeof param === "string") return t.StringLiteral(param);
            }
        }
    }, {
        key: 'buildExpression',
        value: function buildExpression() {
            var _this3 = this;

            var regex = void 0;
            this.params.forEach(function (param) {
                var key = Object.keys(param)[0];
                regex = new RegExp('([^.|w|d|_])' + param[key] + '(?!S)', 'g');
                _this3.expression = _this3.expression.replace(regex, '$1' + key);
            });
            this.expression = this.expression.replace(/["']/g, "");
        }
    }, {
        key: 'getKey',
        value: function getKey(param) {
            return Object.keys(param)[0];
        }
    }, {
        key: 'traverseAST',
        value: function traverseAST() {
            var paramCounter = 0;
            var _this = this;

            function generateName() {
                var name = 'p' + paramCounter;
                paramCounter++;
                return name;
            }

            function handleTerminalNode(node) {
                if (t.isMemberExpression(node)) {
                    handleMemberExpression();
                    return;
                }
                var name = generateName();
                if (t.isIdentifier(node)) handleIdentifier();else handleLiteral();

                function handleMemberExpression() {
                    if (node.object.name != _this.id) throw new SyntaxError('Invalid member expression');
                }
                function handleIdentifier(attr) {
                    var _this$params$push;

                    if (!isRepeated('name')) _this.params.push((_this$params$push = {}, _defineProperty(_this$params$push, name, node.name), _defineProperty(_this$params$push, 'isIdentifier', true), _this$params$push));
                }
                function handleLiteral() {
                    if (!isRepeated('value')) _this.params.push(_defineProperty({}, name, node.value));
                }
                function isRepeated(prop) {
                    var repeated = false;
                    var key = void 0;
                    _this.params.forEach(function (param) {
                        key = _this.getKey(param);
                        if (param[key] === node[prop]) repeated = true;
                    });
                    return repeated;
                }
            }

            function isValidLogicalExpression(node) {
                var lhs = node.left;
                var rhs = node.right;
                return t.isLogicalExpression(lhs) && t.isLogicalExpression(rhs) || t.isBinaryExpression(lhs) && t.isBinaryExpression(rhs) || t.isBinaryExpression(lhs) && t.isLogicalExpression(rhs) || t.isLogicalExpression(lhs) && t.isBinaryExpression(rhs);
            }

            function isValidBinaryExpression(node) {
                var lhs = node.left;
                var rhs = node.right;
                return t.isMemberExpression(lhs) && (t.isIdentifier(rhs) || t.isNumericLiteral(rhs) || t.isStringLiteral(rhs)) || (t.isIdentifier(lhs) || t.isNumericLiteral(lhs) || t.isStringLiteral(lhs)) && t.isMemberExpression(rhs);
            }

            (0, _babelTraverse2.default)(this.path.node, {
                LogicalExpression: function LogicalExpression(path, left, right) {
                    var node = path.node;

                    if (!isValidLogicalExpression(node)) {
                        throw new SyntaxError('Invalid logical expression');
                    }
                },
                BinaryExpression: function BinaryExpression(path, left, right) {
                    var node = path.node;

                    if (!isValidBinaryExpression(node)) {
                        throw new SyntaxError('Invalid binary expression');
                    }
                    var lhs = node.left;
                    var rhs = node.right;
                    handleTerminalNode(lhs);
                    handleTerminalNode(rhs);
                }
            }, this.path.scope, this.path);
        }
    }, {
        key: 'run',
        value: function run() {
            this.traverseAST();
            this.buildExpression();
            return this.buildFunctionCall();
        }
    }]);

    return WhereTransformer;
}();

exports.default = WhereTransformer;