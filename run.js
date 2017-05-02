/*eslint-disable */
var babel = require('babel-core');
var babylon = require('babylon');
var linq = require('./dist/index').default;

// var code = `select(c=>({id, foo:{description}}))`;
var code = `where(c => c.description === '10' || c.bar.id === 10)`;
// var code = `orderBy(c=>c.id)`;

var ast = babylon.parse(code);
var out = babel.transformFromAst(ast,code, {
    plugins: [linq]
});
console.log(out.code);
