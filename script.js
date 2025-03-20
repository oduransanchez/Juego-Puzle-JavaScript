let imageFile, pieceSize, numPieces, gridSize, puzzlePieces = [], startTime, timer, currentImageSrc;
let showingVictoryModal = false;
let showingImagePreview = false;
let selectedPiece = null;

document.getElementById("imageUpload").addEventListener("change", handleImageUpload);
document.getElementById("startPuzzle").addEventListener("click", createPuzzle);
document.getElementById("showGuide").addEventListener("click", showGuide);
document.getElementById("solvePuzzle").addEventListener("click", solvePuzzle);
document.getElementById("showOriginalImage").addEventListener("click", showOriginalImage);
document.getElementById("puzzleContainer").addEventListener("click", handlePieceClick);

function handleImageUpload(event) {
    imageFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageSrc = e.target.result;
        document.getElementById("guideImage").src = currentImageSrc;
        document.getElementById("showGuide").disabled = false;
        document.getElementById("startPuzzle").disabled = false;
        document.getElementById("showOriginalImage").disabled = false;
    };
    reader.readAsDataURL(imageFile);
}

function createPuzzle() {
    const imagePreview = document.getElementById("imagePreview");
    if (!document.getElementById("guideImage").src) {
        alert("Por favor, sube una imagen antes de comenzar el puzle.");
        return;
    }

    // Reiniciar el estado del juego
    showingVictoryModal = false;
    clearInterval(timer);
    document.getElementById("time").textContent = "0";
    document.getElementById("puzzleContainer").innerHTML = '';
    selectedPiece = null;

    // Mostrar la imagen en `imagePreview` solo al comenzar el puzle
    imagePreview.src = currentImageSrc;
    imagePreview.style.display = showingImagePreview ? 'block' : 'none';

    numPieces = parseInt(document.getElementById("numPiezas").value);
    gridSize = Math.sqrt(numPieces);
    pieceSize = 400 / gridSize;

    const puzzleContainer = document.getElementById("puzzleContainer");
    puzzleContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    puzzleContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    puzzlePieces = [];

    // Crear las piezas del puzle
    for (let i = 0; i < numPieces; i++) {
        const piece = document.createElement("div");
        piece.classList.add("puzzle-piece");
        piece.style.width = `${pieceSize}px`;
        piece.style.height = `${pieceSize}px`;
        piece.dataset.index = i;

        const x = (i % gridSize) * pieceSize;
        const y = Math.floor(i / gridSize) * pieceSize;
        piece.style.backgroundImage = `url(${currentImageSrc})`;
        piece.style.backgroundPosition = `-${x}px -${y}px`;
        piece.style.backgroundSize = '400px 400px';

        puzzlePieces.push(piece);
    }

    // Desordenar las piezas
    const shuffledPositions = shuffleArray([...Array(numPieces).keys()]);
    
    puzzlePieces.forEach((piece, index) => {
        const position = shuffledPositions[index];
        const randomColumn = (position % gridSize) + 1;
        const randomRow = Math.floor(position / gridSize) + 1;

        piece.style.gridColumnStart = randomColumn;
        piece.style.gridRowStart = randomRow;
        piece.addEventListener("click", handlePieceClick);

        puzzleContainer.appendChild(piece);
    });

    // Iniciar el temporizador
    startTime = Date.now();
    timer = setInterval(updateTime, 1000);

    // Habilitar el botón de resolver
    document.getElementById("solvePuzzle").disabled = false;

    // Habilitar el botón de comenzar puzle
    document.getElementById("startPuzzle").disabled = false;
}

function handlePieceClick(event) {
    const piece = event.target.closest('.puzzle-piece');
    if (piece) {
        selectPiece(piece);
    }
}

function selectPiece(piece) {
    if (selectedPiece === null) {
        selectedPiece = piece;
        piece.classList.add('selected');
    } else {
        selectedPiece.classList.remove('selected');
        if (selectedPiece !== piece) {
            swapPieces(selectedPiece, piece);
            checkSolved();
        }
        selectedPiece = null;
    }
}

function swapPieces(piece1, piece2) {
    const tempColumn = piece1.style.gridColumnStart;
    const tempRow = piece1.style.gridRowStart;

    piece1.style.gridColumnStart = piece2.style.gridColumnStart;
    piece1.style.gridRowStart = piece2.style.gridRowStart;

    piece2.style.gridColumnStart = tempColumn;
    piece2.style.gridRowStart = tempRow;
}

function checkSolved() {
    const solved = puzzlePieces.every(piece => {
        const index = parseInt(piece.dataset.index);
        const expectedCol = (index % gridSize) + 1;
        const expectedRow = Math.floor(index / gridSize) + 1;
        const actualCol = parseInt(piece.style.gridColumnStart);
        const actualRow = parseInt(piece.style.gridRowStart);
        return expectedCol === actualCol && expectedRow === actualRow;
    });

    if (solved && !showingVictoryModal) {
        clearInterval(timer);
        showingVictoryModal = true;
        showVictoryModal();
    }
}

function showVictoryModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    const time = document.getElementById("time").textContent;
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="trophy-icon">🏆</div>
            <h2>¡Felicitaciones!</h2>
            <p>Has completado el puzzle en</p>
            <p style="font-size: 24px; font-weight: bold; margin: 20px 0;">${time} segundos</p>
            <button onclick="restartGame()">Jugar de nuevo</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showGuide() {
    const modal = document.getElementById('guideModal');
    modal.style.display = 'flex';
}

function closeGuide() {
    const modal = document.getElementById('guideModal');
    modal.style.display = 'none';
}

function restartGame() {
    showingVictoryModal = false;
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
    document.getElementById("imageUpload").value = '';
    document.getElementById("imagePreview").style.display = 'none'; // Ocultar vista previa
    document.getElementById("time").textContent = '0';
    document.getElementById("puzzleContainer").innerHTML = '';
    document.getElementById("startPuzzle").disabled = true;
    document.getElementById("showGuide").disabled = true;
    document.getElementById("solvePuzzle").disabled = true;
    document.getElementById("showOriginalImage").disabled = true;
    clearInterval(timer);
}

function updateTime() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("time").textContent = elapsed;
}

function solvePuzzle() {
    puzzlePieces.forEach((piece, index) => {
        const expectedCol = (index % gridSize) + 1;
        const expectedRow = Math.floor(index / gridSize) + 1;

        piece.style.gridColumnStart = expectedCol;
        piece.style.gridRowStart = expectedRow;
    });

    clearInterval(timer);
    document.getElementById("time").textContent = "0";
    alert("El puzle ha sido resuelto automáticamente.");
}

function showOriginalImage() {
    showingImagePreview = !showingImagePreview;
    document.getElementById("imagePreview").style.display = showingImagePreview ? 'block' : 'none';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Deshabilitar botones al cargar la página
document.getElementById("startPuzzle").disabled = true;
document.getElementById("showGuide").disabled = true;
document.getElementById("solvePuzzle").disabled = true;
document.getElementById("showOriginalImage").disabled = true;

// Cerrar el modal de guía al hacer clic fuera de la imagen
document.getElementById('guideModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeGuide();
    }
});