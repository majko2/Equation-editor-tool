var inputField = document.getElementById('in')
var formulaHolder = document.getElementById('out')
var jsonOutput = document.getElementById('jsonOut')
var formula;

function update() {
    let latex = inputField.value.replace('\\)', '')
    displayLatex(latex)
}

function displayLatex(latex) {
    formula = parse(latex)
    formulaHolder.innerHTML = '\\( ' + latex + ' \\)'
    MathJax.typeset()
    jsonOutput.innerHTML = parse(latex).toString()
}

function parse(string)
{
    let mathml = new DOMParser().parseFromString(MathJax.tex2mml(string), "text/xml").childNodes[0]
    return processMathML(mathml)
}

function processMathML(element) {
    if(element.nodeType == 3) return
    let tag = element.tagName
    switch(tag) {
        case 'math':
        case 'mrow':
        case 'msup':
        case 'mfrac':
            let result = []
            for (let i = 0; i < element.childNodes.length; i++) {
                const child = element.childNodes[i]
                let part = processMathML(child)
                if(part != undefined)
                    result.push(part)
            }
            if(element.dataset.semanticType == 'fenced')
                return result[0]
            let type = element.dataset.semanticRole
            if(opAlias[type] != undefined) type = opAlias[type]
            return new Operation(result, type)
        case 'mi':
            return new Variable(element.innerHTML)
        case 'mn':
            return new NumberExp(Number(element.innerHTML))
    }
}

function Expand() {
    let dict = {}
    if(!Unify(rules[0][0], formula, dict)) {
        console.warn('Failed to unify.')
        return
    }
    displayLatex(Apply(rules[0][1], dict).makeLatex())
}

var opAlias = {
    "implicit": "multiplication"
}

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
        let result = '('
        for (let i = 0; i < this.elements.length; i++) {
            if(i) result += operations[this.opType].operator
            result += this.elements[i].toString()
        }
        return result + ')'
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
        let result = 'new Operation(['
        for (let i = 0; i < this.elements.length; i++) {
            if(i) result += ', '
            result += this.elements[i].repr()
        }
        return result + `], '${this.opType}')`
    }

    makeLatex() {
        if(this.opType == 'division') return `\\frac{${this.elements[0].makeLatex()}}{${this.elements[1].makeLatex()}}`
        let result = ''
        let op = operations[this.opType].latexOp
        if(op == undefined) op = operations[this.opType].operator
        for (let i = 0; i < this.elements.length; i++) {
            if(i) result += op
            result += this.elements[i].makeLatex()
        }
        if(operations[this.opType].requireFence) {
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

function Unify(pattern, expr, dict) {
    let type = pattern.constructor.name
    if(type == 'MetaExpression') {
        let saved = dict[pattern.identifier]
        if(saved == expr) return true
        if(saved != undefined) return false
        dict[pattern.identifier] = expr
        return true
    }

    if(type == 'Operation') {
        if(pattern.opType != expr.opType) return false
        if(pattern.elements.length != expr.elements.length) return false
        for (let i = 0; i < pattern.elements.length; i++) {
            if(!Unify(pattern.elements[i], expr.elements[i], dict)) return false
        }
        return true
    }

    return pattern.equals(expr)
}

function Apply(pattern, dict) {
    let type = pattern.constructor.name
    if(type == 'MetaExpression') {
        return dict[pattern.identifier]
    }

    if(type == 'Operation') {
        return new Operation(pattern.elements.map((x) => Apply(x, dict)), pattern.opType)
    }

    return pattern
}

ma = new MetaExpression(1)
mb = new MetaExpression(2)
pt = new Operation([ma, mb], 'addition')
expr = new Operation([new NumberExp(3), new Operation([new NumberExp(2), new Variable('x')], 'multiplication')], 'addition')
dc = {}

rules = [
    [
        new Operation([new MetaExpression(0), new Operation([new MetaExpression(1), new MetaExpression(2)], 'addition')], 'multiplication'),
        new Operation([new Operation([new MetaExpression(0), new MetaExpression(1)], 'multiplication'), new Operation([new MetaExpression(0), new MetaExpression(2)], 'multiplication')], 'addition')
    ]
]