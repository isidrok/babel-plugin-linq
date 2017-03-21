class Demo {

    demo() {
        (function (description) {
            const instance = new Context();
            var z = instance.Foo
                .where((c) => c.description === description && c.id === 12 || c.name === long_description)
                .select((c) => c.description === description)
        })("Hello")
    }

}