"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _babelTraverse = require("babel-traverse");

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

var _babelTypes = require("babel-types");

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WhereTransformer = function () {
    function WhereTransformer(path, params, file) {
        _classCallCheck(this, WhereTransformer);

        if (params.length != 1) throw new SyntaxError('Invalid arrow function');
        this.id = params[0].name;
        this.path = path;
        this.body = path.node.body;
        this.file = file;
        this.counter = 0;
        this.params = [];
    }

    _createClass(WhereTransformer, [{
        key: "newBooleanExpression",
        value: function newBooleanExpression() {
            var expression = t.NewExpression(t.Identifier('BooleanExpression'), []);
            var variableDeclarator = t.variableDeclarator(t.Identifier('_booleanExpression'), expression);
            var variableDeclaration = t.variableDeclaration('let', [variableDeclarator]);
            return variableDeclaration;
        }
    }, {
        key: "paramsBooleanExpression",
        value: function paramsBooleanExpression(param) {
            var memberExpression = t.MemberExpression(t.Identifier('_booleanExpression'), t.Identifier('params'));
            var params = [t.StringLiteral(param), t.Identifier(param)];
            var callExpression = t.CallExpression(memberExpression, params);
            var expressionStatement = t.ExpressionStatement(callExpression);
            return expressionStatement;
        }
    }, {
        key: "expressionBooleanExpression",
        value: function expressionBooleanExpression(_expression) {
            var memberExpression = t.MemberExpression(t.Identifier('_booleanExpression'), t.Identifier('expression'));
            var expression = t.StringLiteral(_expression);
            var assignmentExpression = ('=', memberExpression, expression);
            var expressionStatement = t.ExpressionStatement(assignmentExpression);
        }
    }, {
        key: "buildAllParamsExpressions",
        value: function buildAllParamsExpressions() {
            var paramExpressions = [];
            this.params.forEach(function (param) {
                paramExpressions.push(paramsBooleanExpression(param.key));
            });
            return paramExpressions;
        }
    }, {
        key: "traverseAST",
        value: function traverseAST() {
            (0, _babelTraverse2.default)(this.path.parent, {
                noScope: true,
                ArrowFunctionExpression: function ArrowFunctionExpression(path, params) {
                    console.log(path.node);
                },
                BinaryExpression: function BinaryExpression(path, left, right) {
                    console.log('hello');
                }
            });
        }
    }, {
        key: "run",
        value: function run() {
            // let newStatement = newBooleanExpression();
            // let paramExpressions = buildAllParamsExpressions();
            // let expressionStatement = expressionBooleanExpression('expression');
            // return t.blockStatement([newStatement,paramExpressions,expressionStatement]);
            this.traverseAST();
            return t.blockStatement([]);
        }
    }]);

    return WhereTransformer;
}();

exports.default = WhereTransformer;