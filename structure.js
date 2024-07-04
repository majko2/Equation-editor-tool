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
    toString() {}
    equals(other) {}
    repr() {}
    makeLatex() {}
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

class Operation extends Expression {
    elements
    opType

    constructor(elements, type) {
        super()
        this.elements = elements
        this.opType = type
    }
    
    toString() {
        return '(' + this.elements.map((x) => x.toString()).join(operations[this.opType].operator) + ')'
    }

    equals(other) {
        if(typeof(other) != Operation) return false
        if(this.opType != other.opType) return false
        if(this.elements.length != other.elements.length) return false
        for (let i = 0; i < this.elements.length; i++) {
            if(!this.elements[i].equals(other.elements[i])) return false
        }
        return true
    }

    repr() {
        return 'new Operation([' + this.elements.map((x) => x.repr()).join(', ') + `], '${this.opType}')`
    }

    makeLatex(requireFence = false) {
        if(this.opType == 'division') return `\\frac{${this.elements[0].makeLatex()}}{${this.elements[1].makeLatex()}}`
        let op = operations[this.opType].latexOp
        if(op == undefined) op = operations[this.opType].operator
        let result = this.elements.map((x) => x.makeLatex(this.opType == 'subtraction' || this.opType == 'multiplication')).join(op)
        if(operations[this.opType].requireFence && requireFence) {
            result = '(' + result + ')'
        }
        return result
    }
}

class MetaExpression extends Expression {
    identifier

    constructor(identifier) {
        super()
        this.identifier = identifier
    }

    toString() {
        return '$' + this.identifier
    }

    repr() {
        return `new MetaExpression(${this.identifier})`
    }
}