var inputField = document.getElementById('in')
var formulaHolder = document.getElementById('out')
var jsonOutput = document.getElementById('jsonOut')

function update() {
    let formula = inputField.value.replace('\\)', '')
    formulaHolder.innerHTML = '\\( ' + formula + ' \\)'
    MathJax.typeset()
    let mathml = new DOMParser().parseFromString(MathJax.tex2mml(formula), "text/xml").childNodes[0]
    console.log(mathml)
    let res = processMathML(mathml)
    console.log(res)
    console.log(res.toString())
    // jsonOutput.innerHTML = JSON.stringify(res, null, 2)
    jsonOutput.innerHTML = res.toString()
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

var opAlias = {
    "implicit": "multiplication"
}

var operations = {
    "addition": {
        "operator": "+"
    },
    "multiplication": {
        "operator": "*"
    },
    "subtraction": {
        "operator": "-"
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
}

