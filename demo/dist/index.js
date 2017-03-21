"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Demo = function () {
    function Demo() {
        _classCallCheck(this, Demo);
    }

    _createClass(Demo, [{
        key: "demo",
        value: function demo() {
            (function (description) {
                var instance = new Context();
                var z = instance.Foo.where(function (p0, p1, p2) {
                    var _booleanExpression = new BooleanExpression();

                    _booleanExpression.params("p0", p0);

                    _booleanExpression.params("p1", p1);

                    _booleanExpression.params("p2", p2);

                    _booleanExpression.expression = "(c) => c.description === p0 && c.id === p1 || c.name === p2)";
                }(description, 12, long_description)).select(function (c) {
                    return c.description === description;
                });
            })("Hello");
        }
    }]);

    return Demo;
}();