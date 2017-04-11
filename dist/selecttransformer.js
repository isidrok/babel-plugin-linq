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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SelectTransformer = function () {
    function SelectTransformer(path, code) {
        _classCallCheck(this, SelectTransformer);

        this.expression = code.substring(path.node.start, path.node.end);
        this.path = path;
    }

    _createClass(SelectTransformer, [{
        key: 'buildObject',
        value: function buildObject() {
            var objectExpression = t.objectExpression([this.buildExpression(), this.buildInitializer()]);
            return objectExpression;
        }
    }, {
        key: 'buildExpression',
        value: function buildExpression() {
            var objectProperty = t.objectProperty(t.Identifier('expression'), t.StringLiteral(this.expression));
            return objectProperty;
        }
    }, {
        key: 'buildInitializer',
        value: function buildInitializer() {
            var functionBody = t.blockStatement([t.returnStatement(this.path.node.body)]);
            var params = t.restElement(t.Identifier('params'));
            var functionExpression = t.functionExpression(null, [params], functionBody);
            var objectProperty = t.objectProperty(t.Identifier('initializer'), functionExpression);
            return objectProperty;
        }
    }, {
        key: 'traverseAST',
        value: function traverseAST() {
            var paramCounter = 0;
            var _this = this;

            function createProperyValue(property) {
                return t.memberExpression(t.Identifier('params'), t.numericLiteral(paramCounter++), true);
            }
            (0, _babelTraverse2.default)(this.path.node, {
                ObjectExpression: function ObjectExpression(path) {
                    var properties = path.node.properties;
                    properties.forEach(function (prop) {
                        if (prop.value.type === 'Identifier') prop.value = createProperyValue(prop.value.name);
                    });
                },
                Identifier: function Identifier(path) {}
            }, this.path.scope, this.path);
        }
    }, {
        key: 'run',
        value: function run() {
            this.traverseAST();
            return this.buildObject();
        }
    }]);

    return SelectTransformer;
}();

exports.default = SelectTransformer;