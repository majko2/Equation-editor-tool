function update()
{
    formula = document.getElementById('in').value.replace('\\)', '')
    document.getElementById('out').innerHTML = '\\( ' + formula + ' \\)'
    MathJax.typeset()
    console.log(document.getElementById('out').getElementsByTagName('mjx-math')[0])
    return
}
