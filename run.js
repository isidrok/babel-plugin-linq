var babel = require('babel-core');
var babylon = require('babylon');
var linq = require('./dist/index').default;
// var code =`(function (description) {
//     const instance = new Context();
//     var z = instance.Foo
//         .where((c) => c.description === description && c.id === 12 || c.name === long_description)
//         .select((c) => c.description === description)
// })("Hello")`;
var code = `select(c=>({id1,name2,foo:{id3,name4},bar:[{id5,name6}]}))`;
var ast = babylon.parse(code);
var out = babel.transformFromAst(ast,code, {
    plugins: [linq]
});
console.log(out.code);
