import { visitors } from "babel-traverse";
import * as t from "babel-types";

class WhereTransformer {
    constructor(body, params, file) {
        if (params.size != 1)
            throw new SyntaxError('Invalid arrow function');
        this.id = params[0].name;
        this.body = body;
        this.file = file;
    }
}