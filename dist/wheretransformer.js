"use strict";

var _babelTraverse = require("babel-traverse");

var _babelTypes = require("babel-types");

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WhereTransformer = function WhereTransformer(body, params, file) {
    _classCallCheck(this, WhereTransformer);

    if (params.size != 1) throw new SyntaxError('Invalid arrow function');
    this.id = params[0].name;
    this.body = body;
    this.file = file;
};