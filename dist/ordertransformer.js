'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //TODO: if the identifier of the arrow function is different from the one of the body then
// the expression is not valid


var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SelectTransformer = function () {
    function SelectTransformer(path, code) {
        _classCallCheck(this, SelectTransformer);

        this.code = code;
        this.path = path;
        this.id = path.node.params[0].name;
    }

    _createClass(SelectTransformer, [{
        key: 'createLiteral',
        value: function createLiteral() {
            var body = this.path.node.body;
            var expression = this.code.substring(body.start, body.end);
            expression = this.id + ' => ' + expression;
            return t.StringLiteral(expression);
        }
    }, {
        key: 'run',
        value: function run() {
            return this.createLiteral();
        }
    }]);

    return SelectTransformer;
}();

exports.default = SelectTransformer;