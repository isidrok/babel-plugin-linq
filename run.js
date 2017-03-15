var babel = require('babel-core');
var babylon = require('babylon');
var miplugin = require('./dist/miplugin');
var code ="c=>c.description === description";
var ast = babylon.parse(code);
var out = babel.transformFromAst(ast,code, {
    plugins: [miplugin]
});
console.log(out.code);
