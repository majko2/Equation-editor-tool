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

rules = [
    [
        new Operation([new MetaExpression(0), new Operation([new MetaExpression(1), new MetaExpression(2)], 'addition')], 'multiplication'),
        new Operation([new Operation([new MetaExpression(0), new MetaExpression(1)], 'multiplication'), new Operation([new MetaExpression(0), new MetaExpression(2)], 'multiplication')], 'addition')
    ]
]