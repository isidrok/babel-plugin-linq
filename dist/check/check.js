'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.check = undefined;

var _expressionerror = require('./expressionerror');

var _expressionerror2 = _interopRequireDefault(_expressionerror);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hasOnlyOneParam(arrowFunctionExp) {
    if (arrowFunctionExp.params.length !== 1) throw new _expressionerror2.default('Arrow Function Expressions must have exactly one argument');
}
function isValidOrderBody(arrowFunctionExp) {
    if (arrowFunctionExp.body.type !== 'MemberExpression') throw new _expressionerror2.default('The body of an order expression must be a Member Expression');
}
function isValidSelectBody(arrowFunctionExp) {
    if (arrowFunctionExp.body.type !== 'ObjectExpression') throw new _expressionerror2.default('The body of a select expression must be an Object Expression');
}
function isValidWhereBody(arrowFunctionExp) {
    if (arrowFunctionExp.body.type !== 'LogicalExpression' && arrowFunctionExp.body.type !== 'BinaryExpression') throw new _expressionerror2.default('The body of a where expression must be a Logical or Binary Expression');
}
function isValidMemberExpression(memberExp, id) {
    if (memberExp.object.type === 'Identifier' && memberExp.object.name !== id) throw new _expressionerror2.default('The Member Expression identifier must be the one of the Arrow Funciton');
}
function isValidObjectProperty(objectProp) {
    var validTypes = ['ObjectExpression', 'ArrayExpression', 'Identifier'];
    if (validTypes.indexOf(objectProp.value.type) === -1) throw new _expressionerror2.default('The value of an Object Property must be of type ObjectExpression, ArrayExpression or Identifier');
}
function isValidBinaryExpression(binaryExp) {
    var lhs = binaryExp.left.type;
    var rhs = binaryExp.right.type;
    var validTypes = ['Identifier', 'StringLiteral', 'NumericLiteral'];
    if (lhs === 'MemberExpression' && validTypes.indexOf(rhs) !== -1 || validTypes.indexOf(lhs) !== -1 && rhs === 'MemberExpression') return;
    throw new _expressionerror2.default('A Binary Expression must have a Member Expression and an Identifier');
}
function isValidLogicalExpression(logicalExp) {
    var validTypes = ['LogicalExpression', 'BinaryExpression'];
    var lhs = logicalExp.left.type;
    var rhs = logicalExp.right.type;
    if (validTypes.indexOf(lhs) === -1 || validTypes.indexOf(rhs) === -1) throw new _expressionerror2.default('A Logical Expression can only contain Logical Expressions and Binary Expressions');
}
var check = exports.check = {
    hasOnlyOneParam: hasOnlyOneParam,
    isValidOrderBody: isValidOrderBody,
    isValidSelectBody: isValidSelectBody,
    isValidWhereBody: isValidWhereBody,
    isValidMemberExpression: isValidMemberExpression,
    isValidObjectProperty: isValidObjectProperty,
    isValidBinaryExpression: isValidBinaryExpression,
    isValidLogicalExpression: isValidLogicalExpression
};