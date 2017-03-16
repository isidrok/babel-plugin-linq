'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _babelTraverse = require('babel-traverse');

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _valid = require('./valid');

var _valid2 = _interopRequireDefault(_valid);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WhereTransformer = function () {
    function WhereTransformer(path, params, file) {
        _classCallCheck(this, WhereTransformer);

        if (params.length != 1) throw new SyntaxError('Invalid arrow function');
        this.id = params[0].name;
        this.path = path;
        this.body = path.node.body;
        this.file = file;
        this.params = [];
    }

    _createClass(WhereTransformer, [{
        key: 'newBooleanExpression',
        value: function newBooleanExpression() {
            var expression = t.NewExpression(t.Identifier('BooleanExpression'), []);
            var variableDeclarator = t.variableDeclarator(t.Identifier('_booleanExpression'), expression);
            var variableDeclaration = t.variableDeclaration('let', [variableDeclarator]);
            return variableDeclaration;
        }
    }, {
        key: 'paramsBooleanExpression',
        value: function paramsBooleanExpression(param) {
            var memberExpression = t.MemberExpression(t.Identifier('_booleanExpression'), t.Identifier('params'));
            var key = Object.keys(param)[0];
            var params = [t.StringLiteral(key), t.Identifier(param[key])];
            var callExpression = t.CallExpression(memberExpression, params);
            var expressionStatement = t.ExpressionStatement(callExpression);
            return expressionStatement;
        }
    }, {
        key: 'setBooleanExpression',
        value: function setBooleanExpression(_expression) {
            var memberExpression = t.MemberExpression(t.Identifier('_booleanExpression'), t.Identifier('expression'));
            var expression = t.StringLiteral(_expression);
            var assignmentExpression = t.assignmentExpression('=', memberExpression, expression);
            var expressionStatement = t.ExpressionStatement(assignmentExpression);
            return expressionStatement;
        }
    }, {
        key: 'buildAllParamsExpressions',
        value: function buildAllParamsExpressions() {
            var _this2 = this;

            var paramExpressions = [];
            this.params.forEach(function (param) {
                paramExpressions.push(_this2.paramsBooleanExpression(param));
            });
            return paramExpressions;
        }
    }, {
        key: 'traverseAST',
        value: function traverseAST() {
            var counter = 0;
            var _this = this;
            function name() {
                var name = 'p' + counter;
                counter++;
                return name;
            }
            function flagChildernAsValid(node) {
                node.right[_valid2.default] = true;
                node.left[_valid2.default] = true;
            };
            function handleNode(node) {
                if (t.isMemberExpression(node)) return;
                var _name = name();
                if (t.isIdentifier(node)) {
                    _this.params.push(_defineProperty({}, _name, node.name));
                    node.name = _name;
                } else {
                    _this.params.push(_defineProperty({}, _name, node.value));
                    node.value = _name;
                }
            }
            (0, _babelTraverse2.default)(this.path.parent, {
                noScope: true,

                ArrowFunctionExpression: function ArrowFunctionExpression(path, state) {
                    var node = path.node;

                    node.body[_valid2.default] = true;
                    if (!node.body[_valid2.default]) return;
                    if (!t.isLogicalExpression(node.body) && !t.isBinaryExpression(node.body)) throw new SyntaxError('Invalid arrow function expression');
                },
                LogicalExpression: function LogicalExpression(path, left, right) {
                    var node = path.node;

                    if (!node[_valid2.default]) return;
                    if (!t.isBinaryExpression(node.left) || !t.isBinaryExpression(node.right)) {
                        throw new SyntaxError('Invalid logical expression');
                    }
                    flagChildernAsValid(node);
                },
                BinaryExpression: function BinaryExpression(path, left, right) {
                    var node = path.node;

                    if (!node[_valid2.default]) return;
                    var lhs = node.left;
                    var rhs = node.right;
                    if (!t.isMemberExpression(lhs) && !t.isMemberExpression(rhs)) {
                        throw new SyntaxError('Invalid binary expression');
                    }
                    flagChildernAsValid(node);
                    handleNode(lhs);
                    handleNode(rhs);
                },
                MemberExpression: function MemberExpression(path) {
                    var node = path.node;

                    if (!node[_valid2.default]) return;
                    if (node.object.name != _this.id) throw new SyntaxError('Invalid member expression');
                }
            });
        }
    }, {
        key: 'run',
        value: function run() {
            this.traverseAST();
            var newStatement = this.newBooleanExpression();
            var paramExpressions = this.buildAllParamsExpressions();
            var expressionStatement = this.setBooleanExpression('expression');
            var code = [newStatement];
            paramExpressions.forEach(function (expression) {
                code.push(expression);
            });
            code.push(expressionStatement);
            return t.blockStatement(code, ["a"]);
        }
    }]);

    return WhereTransformer;
}();

exports.default = WhereTransformer;