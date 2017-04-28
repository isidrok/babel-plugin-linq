//TODO: if the identifier of the arrow function is different from the one of the body then
// the expression is not valid
import * as t from 'babel-types';
export default class SelectTransformer {
    constructor(path, code) {
        this.code = code;
        this.path = path;
        this.id = path.node.params[0].name;
    }
    createLiteral(){
        let body = this.path.node.body
        let expression = this.code.substring(body.start, body.end);
        expression = `${this.id} => ${expression}`;
        return t.StringLiteral(expression);
    }
    run() {
        return this.createLiteral();
    }
}
