(function (description) {
    const instance = new Context();
    var z = instance.Foo
        .where((c) => c.description === description && c.id === 12)
})("Hello");

(function(p0, p1) {
    let _booleanExpresion = new BooleanExpresion();
    _booleanExpresion.params('p0', p0);
    _booleanExpresion.params('p1', p1);
    _booleanExpresion.expression = '(c)=>c.description === p0 && c.id===p1'

})(description, 12);
