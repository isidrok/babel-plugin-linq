/*eslint-disable */
var babel = require('babel-core');
var babylon = require('babylon');
var linq = require('./dist/index').default;
// var code =`(function (description) {
//     const instance = new Context();
//     var z = instance.Foo
//         .where((c) => c.description === description && c.id === 12 || c.name === long_description)
//         .select((c) => c.description === description)
// })("Hello")`;
// var code = `select(c=>({id, foo:{description}}))`;
// var code = `orderBy(c=>c.id)`;
var code = `where(c => c.description === 'hello' || c.bar.id === 10)`;

var ast = babylon.parse(code);
var out = babel.transformFromAst(ast,code, {
    plugins: [linq]
});
console.log(out.code);
