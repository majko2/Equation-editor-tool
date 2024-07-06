var operations = {
    "addition": {
        "operator": "+",
        "requireFence": true
    },
    "multiplication": {
        "operator": "*",
        "latexOp": "\\cdot "
    },
    "subtraction": {
        "operator": "-",
        "requireFence": true
    },
    "division": {
        "operator": "/"
    },
    "equality": {
        "operator": "="
    },
    "negative": {
        "prefix": "-"
    }
}

var opAlias = {
    "implicit": "multiplication"
}

class Expression {
    disabled_for_clicking = false

    toString() {}
    equals(other) {}
    repr() {}
    makeLatex() {}
    onClick(){}
}

class NumberExp extends Expression {
    value

    constructor(value) {
        super()
        this.value = value
    }

    toString() {
        return this.value
    }

    equals(other) {
        return typeof(other) == NumberExp && this.value == other.value
    }

    repr() {
        return `new NumberExp(${this.value})`
    }

    makeLatex() {
        return this.value
    }
}

class Variable extends Expression {
    identifier

    constructor(identifier) {
        super()
        this.identifier = identifier
    }

    toString() {
        return this.identifier
    }

    equals(other) {
        return typeof(other) == Variable && this.identifier == other.identifier
    }

    repr() {
        return `new Variable('${this.identifier}')`
    }

    makeLatex() {
        return this.identifier
    }
}

class Sum extends Expression {

}

class Product extends Expression {

}

class UnaryOperation extends Expression {

}

class Power extends Expression {

}

class Root extends Expression {

}