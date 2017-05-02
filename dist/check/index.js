'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _check = require('./check');

Object.keys(_check).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _check[key];
    }
  });
});