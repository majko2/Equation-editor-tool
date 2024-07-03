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
    jsonOutput.innerHTML = JSON.stringify(res, null, 2)
}

function processMathML(element) {
    if(element.nodeType == 3) return
    let tag = element.tagName
    switch(tag) {
        case 'math':
        case 'mrow':
        case 'msup':
            let result = []
            for (let i = 0; i < element.childNodes.length; i++) {
                const child = element.childNodes[i];
                let part = processMathML(child)
                if(part != undefined)
                    result.push(part)
            }
            return result
        case 'mi':
        case 'mn':
            return element.innerHTML
    }
    console.log(tag, element)
}
