const attemptsAllowed = 4; // Set the number of attempts allowed. 4 is default, but 5 for science bobblehead if I wanna add that
let attemptsLeft = attemptsAllowed;
let correctPassword = '';
let wordList = [];
let selectedChar = 'A';

document.addEventListener('DOMContentLoaded', () => {
    // Start the game when the page loads
    startGame();
});

// Start game functionality
function startGame() {
    // Get a word list based on difficulty
    const difficulty = 'novice';
    wordList = getRandomWords(difficulty);

    // Randomly select the correct password from the selected word list
    correctPassword = wordList[Math.floor(Math.random() * wordList.length)];

    attemptsLeft = attemptsAllowed;

    // Generates the random character for the boot numbers, A-Z
    selectedChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));

    displayWords(); // Display the words and symbols in the terminal
    updateAttempts(); // Update the attempt blocks display
}

// Get the word list based on given difficulty
function getRandomWords(difficulty) {
    const wordPool = words[difficulty].list;
    const minCount = words[difficulty].minCount;
    const maxCount = words[difficulty].maxCount;
    const wordCount = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));
    const randomWords = [];
    const usedIndices = new Set(); // Keeps track of the words that were used

    // Select words until the array matches the wordCount
    while (randomWords.length < wordCount) {
        // Select a random index from the word pool
        const randomIndex = Math.floor(Math.random() * wordPool.length);
        
        // Then check if the index has already been used
        if (!usedIndices.has(randomIndex)) {
            randomWords.push(wordPool[randomIndex]);
            usedIndices.add(randomIndex);
        }
    }

    return randomWords;
}

// Display the words and symbols in the terminal
function displayWords() {
    const column1 = document.getElementById('column1');
    const column2 = document.getElementById('column2');
    const selectionHistory = document.getElementById('selection-history');
    
    column1.innerHTML = '';
    column2.innerHTML = '';
    selectionHistory.innerHTML = '';

    let combinedList = generateCombinedList();
    combinedList.forEach((line, index) => {
        const rowElement = document.createElement('div');
        rowElement.className = 'row';
        line.forEach(item => {
            rowElement.innerHTML += formatLine(item);
        });
        if (index < 16) {
            column1.appendChild(rowElement);
        } else {
            column2.appendChild(rowElement);
        }
    });
}

// Format a line item into HTML
function formatLine(item) {
    if (typeof item === 'string') {
        return `<p class="selectable" onclick="selectChar('${item}')">${item}</p>`;
    } else if (item.type === 'word') {
        return `<p class="selectable" data-word="${item.word}" onclick="selectWord('${item.word}')">${item.word}</p>`;
    } else if (item.type === 'boot') {
        return `<p class="boot-number">${item.value}</p>`;
    }
    return '';
}

// Generate a combined list of words and symbols
function generateCombinedList() {
    const totalLines = 32; // Terminal has 16 lines in each column, makes 32
    const linesWithWords = wordList.length;
    let combinedList = [];

    for (let i = 0; i < totalLines; i++) {
        if (i < linesWithWords) {
            combinedList.push(generateLine(wordList[i]));
        } else {
            combinedList.push(generateLine(''));
        }
    }

    return combinedList.sort(() => Math.random() - 0.5);
}

// Generate a line with a boot number, symbols, and possibly a word
function generateLine(word) {
    const symbols = '!@#$%^&*()_+{}|:"<>?-=[];,./'.split('');

    const bootNumber = `0x${selectedChar}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;

    let line = [{type: 'boot', value: bootNumber}];
    const wordLength = word.length;
    const position = Math.floor(Math.random() * (12 - wordLength));

    for (let i = 0; i < 12; i++) {
        if (word && i >= position && i < position + wordLength) {
            if (i === position) {
                line.push({type: 'word', word: word});
            }
        } else {
            line.push(symbols[Math.floor(Math.random() * symbols.length)]);
        }
    }
    return line;
}

// Update the display of remaining attempts
function updateAttempts() {
    const attemptsElement = document.getElementById('attempt-blocks');
    attemptsElement.innerHTML = '';

    for (let i = 0; i < attemptsLeft; i++) {
        attemptsElement.innerHTML += '█ '; // Just using a character instead of drawing squares, might change that later but this is easier!
    }
}

// Select a word and update the history
function selectWord(word) {
    // Make sure the game isn't already over
    if (attemptsLeft > 0) {
        const correctLetters = getCorrectLetters(word);
        const historyElement = document.createElement('div');
        const selectionHistory = document.getElementById('selection-history');

        historyElement.className = 'history-entry';
        historyElement.innerHTML = `<div>>${word}</div><div>>ENTRY DENIED</div><div>>Likeness=${correctLetters}</div>`;

        selectionHistory.insertBefore(historyElement, selectionHistory.firstChild);

        if (correctLetters === word.length) {
            alert('Password Correct!');
            startGame();
        } else {
            attemptsLeft--;
            updateAttempts();
            if (attemptsLeft === 0) {
                alert('Terminal Locked Out');
                startGame();
            }
        }
    }
}

// Called if you click on a character/symbol instead of a word
function selectChar(char) {
    const historyElement = document.createElement('div');
    const selectionHistory = document.getElementById('selection-history');

    historyElement.className = 'history-entry';
    historyElement.innerHTML = `<div>>${char}</div><div>>ERROR</div>`;

    selectionHistory.insertBefore(historyElement, selectionHistory.firstChild);
}

// Get the number of correct letters in a word, calculates the "Likeness" value
function getCorrectLetters(word) {
    let correctLetters = 0;
    for (let i = 0; i < word.length; i++) {
        if (word[i] === correctPassword[i]) {
            correctLetters++;
        }
    }
    return correctLetters;
}

// Restart the game when the page is refreshed or closed
window.addEventListener('beforeunload', (event) => {
    startGame();
});