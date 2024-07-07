const symbols = new Set(['alpha', 'nu',
    'beta',  'xi',
    'gamma',
    'delta',  'pi',
    'epsilon',  'rho',
    'zeta',  'sigma',
    'eta',  'tau',
    'theta',  'upsilon',
    'iota',  'phi',
    'kappa',  'chi',
    'lambda',  'psi',
    'mu',  'omega',
    'varepsilon', 'varsigma',
    'vartheta',  'varphi',
    'varrho',
    'Gamma',
    'Delta',  'Upsilon',
    'Theta',  'Phi',
    'Lambda',  'Psi',
    'Xi',  'Omega']);

 const unaries = new Set(['hat',  'dot',
    'check',  'ddot',
    'tilde',  'breve',
    'acute',  'bar',
    'grave',  'vec', 'arccos', 'csc', 'ker', 'min',
    'arcsin', 'deg', 'lg', 'Pr',
    'arctan', 'det', 'lim', 'sec',
    'arg', 'dim', 'liminf', 'sin',
    'cos', 'exp', 'limsup', 'sinh',
    'cosh', 'gcd', 'ln', 'sup',
    'cot', 'hom', 'log', 'tan',
    'coth', 'inf', 'max', 'tanh', 'sqrt']);

const operations = new Set(['cdot', 'times', 'pm', 'mp']);

const ignore = new Set(['left', 'right']);

const parentheses = new Map([['(' , ')'],
                             ['[', ']']
                             ['{', '}']]);

const right_parentheses = new Set([')', ']', '}']);

function parse(string)
{
    var parentheses_stack = [];

    for (let i = 0; i < array.length; i++) {
        const char = array[i];
        
        if (right_parentheses.has(char))
        {
            if (parentheses_stack.length >= 1 && parentheses_stack[parentheses_stack.length-1] == char)
            {
                parentheses_stack.pop();
            } else
            {
                throw new Error('Error while parsing LaTeX: extra '+ char)
            }
        }

        if (parentheses.has(char))
        {
            parentheses_stack.push(parentheses[char]);
        }
    }

    if (parentheses_stack != [])
    {
        throw new Error('Error while parsing LaTeX: missing ' + parentheses_stack[parentheses_stack.length-1])
    }
}

function parse_parent_free(string)
{
    var tokens = [];
    var current_token = '';
    var number = false;
    var command = false;
    
    for (let i = 0; i < string.length; i++) {
        const char = array[index];
        

        if (command);
        {
            if(char.match(/[a-zA-Z]/i))
            {
                current_token = current_token + char;
                continue;
            }
            else {
                
            }
        }

        if (char == '\\')
        {
            command = True;
        }
    }
}
