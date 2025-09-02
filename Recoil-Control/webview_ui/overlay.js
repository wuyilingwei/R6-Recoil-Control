document.addEventListener('contextmenu', e => e.preventDefault());

function update_agents(agents) {
    const container = document.getElementById('agent-container');
    if (!container) return;
    container.innerHTML = '';

    const totalSquares = 14;
    
    for (let i = 0; i < totalSquares; i++) {
        const square = document.createElement('div');
        square.classList.add('drop-square');

        if (agents && i < agents.length && agents[i]) {
            const img = document.createElement('img');
            img.src = agents[i].image;
            img.classList.add('agent-icon');
            square.appendChild(img);
        }
        
        container.appendChild(square);
    }
}

function highlight_square(index) {
    const container = document.getElementById('agent-container');
    if (!container) return;

    const squares = container.querySelectorAll('.drop-square');

    squares.forEach(square => {
        square.classList.remove('selected');
    });

    if (index >= 0 && index < squares.length) {
        squares[index].classList.add('selected');
    }
}

window.highlight_square = highlight_square;