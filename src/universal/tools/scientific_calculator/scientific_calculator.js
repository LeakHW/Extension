(function() {
    /**
     * SCIENTIFIC CALCULATOR TOOL
     * A draggable, fully functional scientific calculator.
     */
    
    if (window.Leak) {
        let container = null;
        let currentExpr = "0";
        let historyExpr = "";
        let lastAns = "0";
        let isDeg = true; // Degrees vs Radians

        const updateDisplay = () => {
            if (!container) return;
            const currentEl = container.querySelector('#leak-calc-current');
            const historyEl = container.querySelector('#leak-calc-history');
            
            currentEl.textContent = currentExpr;
            historyEl.textContent = historyExpr;
            
            // Auto-resize font for long expressions
            if (currentExpr.length > 10) {
                currentEl.style.fontSize = '20px';
            } else {
                currentEl.style.fontSize = '32px';
            }
        };

        const calculate = () => {
            try {
                // Safe Evaluation Logic (Recursive Descent Parser to avoid eval() CSP issues)
                let offset = 0;
                const tokens = currentExpr.match(/([0-9.]+)|([+\-*/^()])|(sin|cos|tan|log|ln|sqrt|abs|exp|!|π|e|Ans|÷|×)/g);
                
                if (!tokens) {
                    currentExpr = "0";
                    updateDisplay();
                    return;
                }

                const parseExpr = () => {
                    let node = parseTerm();
                    while (offset < tokens.length && (tokens[offset] === '+' || tokens[offset] === '-')) {
                        const op = tokens[offset++];
                        const right = parseTerm();
                        node = op === '+' ? node + right : node - right;
                    }
                    return node;
                };

                const parseTerm = () => {
                    let node = parseFactor();
                    while (offset < tokens.length && (tokens[offset] === '*' || tokens[offset] === '/' || tokens[offset] === '×' || tokens[offset] === '÷')) {
                        const op = tokens[offset++];
                        const right = parseFactor();
                        node = (op === '*' || op === '×') ? node * right : node / right;
                    }
                    return node;
                };

                const parseFactor = () => {
                    let node = parsePrimary();
                    while (offset < tokens.length && tokens[offset] === '^') {
                        offset++;
                        const right = parseFactor();
                        node = Math.pow(node, right);
                    }
                    if (offset < tokens.length && tokens[offset] === '!') {
                        offset++;
                        let res = 1;
                        for (let i = 2; i <= Math.floor(node); i++) res *= i;
                        node = res;
                    }
                    return node;
                };

                const parsePrimary = () => {
                    const token = tokens[offset++];
                    if (!token) return 0;

                    if (token === '(') {
                        const res = parseExpr();
                        if (tokens[offset] === ')') offset++; 
                        return res;
                    }

                    if (token === 'π') return Math.PI;
                    if (token === 'e') return Math.E;
                    if (token === 'Ans') return parseFloat(lastAns);

                    if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'abs', 'exp'].includes(token)) {
                        const next = tokens[offset];
                        let val;
                        if (next === '(') {
                            offset++;
                            val = parseExpr();
                            if (tokens[offset] === ')') offset++;
                        } else {
                            val = parsePrimary();
                        }

                        switch(token) {
                            case 'sin': return Math.sin(isDeg ? val * Math.PI / 180 : val);
                            case 'cos': return Math.cos(isDeg ? val * Math.PI / 180 : val);
                            case 'tan': return Math.tan(isDeg ? val * Math.PI / 180 : val);
                            case 'log': return Math.log10(val);
                            case 'ln': return Math.log(val);
                            case 'sqrt': return Math.sqrt(val);
                            case 'abs': return Math.abs(val);
                            case 'exp': return Math.exp(val);
                        }
                    }

                    if (!isNaN(parseFloat(token))) return parseFloat(token);
                    return 0;
                };

                const result = parseExpr();
                lastAns = result.toString();
                historyExpr = currentExpr + " =";
                currentExpr = parseFloat(result.toFixed(8)).toString();
            } catch (e) {
                window.Leak.error('Calculator Error:', e);
                currentExpr = "Error";
            }
            updateDisplay();
        };

        const createCalculator = async () => {
            if (document.getElementById('leak-scientific-calculator')) return;

            container = document.createElement('div');
            try {
                const response = await fetch(chrome.runtime.getURL('universal/tools/scientific_calculator/scientific_calculator.html'));
                const html = await response.text();
                container.innerHTML = html;
                container = container.firstElementChild;
                document.body.appendChild(container);

                // Draggable logic
                const header = container.querySelector('.leak-calc-header');
                let isDragging = false;
                let offsetX, offsetY;

                header.onmousedown = (e) => {
                    isDragging = true;
                    offsetX = e.clientX - container.offsetLeft;
                    offsetY = e.clientY - container.offsetTop;
                };

                document.onmousemove = (e) => {
                    if (!isDragging) return;
                    container.style.left = (e.clientX - offsetX) + 'px';
                    container.style.top = (e.clientY - offsetY) + 'px';
                    container.style.right = 'auto';
                };

                document.onmouseup = () => {
                    isDragging = false;
                };

                // Close logic
                container.querySelector('.leak-calc-close').onclick = () => {
                    const hostname = window.location.hostname;
                    window.Leak.toggleTool('scientific_calculator', false);
                };

                // Button logic
                container.querySelectorAll('.leak-calc-btn').forEach(btn => {
                    btn.onclick = () => {
                        const num = btn.getAttribute('data-num');
                        const op = btn.getAttribute('data-op');
                        const func = btn.getAttribute('data-func');

                        if (currentExpr === "0" || currentExpr === "Error") currentExpr = "";

                        if (num) {
                            currentExpr += num;
                        } else if (op) {
                            currentExpr += op;
                        } else if (func) {
                            switch(func) {
                                case 'clear': currentExpr = "0"; historyExpr = ""; break;
                                case 'delete': currentExpr = currentExpr.slice(0, -1) || "0"; break;
                                case 'equals': calculate(); return;
                                case 'sin': case 'cos': case 'tan': case 'log': case 'ln': case 'abs': case 'exp':
                                    currentExpr += func + "("; break;
                                case 'sqrt': currentExpr += "sqrt("; break;
                                case 'pow': currentExpr += "^"; break;
                                case 'pi': currentExpr += "π"; break;
                                case 'e': currentExpr += "e"; break;
                                case 'fact': currentExpr += "!"; break;
                                case 'ans': currentExpr += "Ans"; break;
                                case 'deg': 
                                    isDeg = !isDeg;
                                    btn.textContent = isDeg ? 'Deg' : 'Rad';
                                    break;
                            }
                        }
                        updateDisplay();
                    };
                });

            } catch (error) {
                window.Leak.error('Failed to load Calculator HTML', error);
            }
        };

        window.Leak.registerTool('scientific_calculator', async (isEnabled) => {
            if (isEnabled) {
                await createCalculator();
                if (container) container.classList.add('active');
                window.Leak.log('Scientific Calculator enabled.');
            } else {
                const el = document.getElementById('leak-scientific-calculator');
                if (el) el.classList.remove('active');
                window.Leak.debug('Scientific Calculator disabled.');
            }
        });
    }
})();
