var inputField = document.getElementById('in')
var formulaHolder = document.getElementById('out')
var suggestionsDiv = document.getElementById('suggestions')
var formula, suggestions;

function update() {
    let latex = inputField.value.replace('\\)', '')
    displayLatex(latex)
    console.log()
}

function displayLatex(latex) {
    formula = parse(latex)
    formulaHolder.innerHTML = '\\( ' + latex + ' \\)'
    suggestions = FindSuggestions(formula)
    suggestionsDiv.innerHTML = ''
    suggestions.forEach(sug => {
        let e = document.createElement('button')
        e.classList.add('btn', 'btn-primary')
        e.innerHTML = sug[1].name + ' \\(' + sug[0].makeLatex() + '\\)'
        e.addEventListener('click', () => ApplyAt(sug[0], sug[1]))
        suggestionsDiv.appendChild(e)
    })
    MathJax.typeset()
}

function parse(string)
{
    let mathml = new DOMParser().parseFromString(MathJax.tex2mml(string), "text/xml").childNodes[0]
    console.log(mathml)
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
    displayLatex(Convert(formula, rules[0]).makeLatex())
}

function ApplyAt(element, rule) {
    let young = Convert(element, rule)
    if(element == formula) {
        formula = young
    }
    else {
        FindAndReplace(formula, element, young)
    }
    displayLatex(formula.makeLatex())
}

function FindAndReplace(element, old, young) {
    if(element.constructor.name != 'Operation') return
    for (let i = 0; i < element.elements.length; i++) {
        const e = element.elements[i];
        if(e == old) {
            element.elements[i] = young
            return
        }
        FindAndReplace(e, old, young)
    }
}

function FindSuggestions(element) {
    let result = []
    rules.forEach(rule => {
        if(Unify(rule.src, element, {}))
            result.push([element, rule])
    });
    if(element.constructor.name == 'Operation') {
        element.elements.forEach(e => {
            result.push(...FindSuggestions(e))
        })
    }
    return result
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

function Convert(expr, rule) {
    let dict = {}
    if(!Unify(rule.src, expr, dict)) {
        console.warn('Failed to unify.')
        return
    }
    return Apply(rule.dest, dict)
}

rules = [
    {
        "src": new Operation([new MetaExpression(0), new Operation([new MetaExpression(1), new MetaExpression(2)], 'addition')], 'multiplication'),
        "dest": new Operation([new Operation([new MetaExpression(0), new MetaExpression(1)], 'multiplication'), new Operation([new MetaExpression(0), new MetaExpression(2)], 'multiplication')], 'addition'),
        "name": "Expand"
    },
    {
        "src": new Operation([new Operation([new MetaExpression(1), new MetaExpression(2)], 'addition'), new MetaExpression(0)], 'multiplication'),
        "dest": new Operation([new Operation([new MetaExpression(1), new MetaExpression(0)], 'multiplication'), new Operation([new MetaExpression(2), new MetaExpression(0)], 'multiplication')], 'addition'),
        "name": "Expand from right"
    }
]