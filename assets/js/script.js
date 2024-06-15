const attemptsAllowed = 4; // Set the number of attempts allowed. 4 is default, but 5 for science bobblehead if I wanna add that
const difficulty = 'expert';
let attemptsLeft = attemptsAllowed;
let correctPassword = '';
let wordList = [];
let selectedChar = 'A';
let totalHistoryLines = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Start the game when the page loads
    startGame(difficulty);
});

// Start game functionality
function startGame(difficulty) {
    // Reset history lines count
    totalHistoryLines = 0;

    // Get a word list based on difficulty
    wordList = selectRandomWords(difficulty);

    // Randomly select the correct password from the selected word list
    correctPassword = wordList[Math.floor(Math.random() * wordList.length)];
    console.log(correctPassword);

    attemptsLeft = attemptsAllowed;

    // Generates the random character for the boot numbers, A-Z
    selectedChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));

    displayWords(); // Display the words and symbols in the terminal
    updateAttempts(); // Update the attempt blocks display
}

// Get the word list based on given difficulty
function selectRandomWords(difficulty) {
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
    const selectionHistoryTop = document.getElementById('selection-history-top');
    const selectionHistoryBottom = document.getElementById('selection-history-bottom');
    
    column1.innerHTML = '';
    column2.innerHTML = '';
    selectionHistoryTop.innerHTML = '';
    selectionHistoryBottom.innerHTML = '> <span class="blinking-cursor">|</span>';

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
        return `<p class="selectable" onclick="selectChar('${item}')" onmouseover="showHovered('${item}')">${item}</p>`;
    } else if (item.type === 'word') {
        return `<p class="selectable" data-word="${item.word}" onclick="selectWord('${item.word}')" onmouseover="showHovered('${item.word}')">${item.word}</p>`;
    } else if (item.type === 'boot') {
        return `<p class="boot-number">${item.value}</p>`;
    }
    return '';
}

// Generate a combined list of words and symbols
function generateCombinedList() {
    const totalLines = 32; // Terminal has 16 lines in each column, makes 32
    const linesWithWords = new Set();
    while (linesWithWords.size < wordList.length) {
        linesWithWords.add(Math.floor(Math.random() * (totalLines - 1))); // Ensure words are not placed on the last line
    }

    let combinedList = [];
    for (let i = 0; i < totalLines; i++) {
        if (linesWithWords.has(i)) {
            combinedList.push(generateLine(wordList.pop(), i, totalLines));
        } else {
            combinedList.push(generateLine('', i, totalLines));
        }
    }

    return combinedList;
}

// Generate a line with a boot number, symbols, and possibly a word
function generateLine(word, lineIndex, totalLines) {
    const symbols = '!@#$%^&*()_+{}|:"<>?-=[];,./'.split('');

    // Generate boot number
    // TODO: Make this more complex to fit the way it shows up in Fallout 4, right now it's just numbers and a letter
    const bootNumber = `0x${selectedChar}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;

    let line = [{type: 'boot', value: bootNumber}];
    const wordLength = word.length;
    const maxSymbols = 12; // Maximum symbols per line
    let position = Math.floor(Math.random() * (maxSymbols - wordLength)); // Randomly choose the starting position of the word

    // Make sure the word fits in the current line
    if (word && lineIndex < totalLines - 1) {
        if (position + wordLength > maxSymbols) {
            position = maxSymbols - wordLength;
        }
    }

    // Fill the line with either symbols or the word
    for (let i = 0; i < maxSymbols; i++) {
        if (word && i >= position && i < position + wordLength) {
            if (i === position) {
                line.push({type: 'word', word: word}); // Add the word at chosen position
            }
        } else {
            line.push(symbols[Math.floor(Math.random() * symbols.length)]); // Random symbol
        }
    }

    let lines = [line]; // Create a "lines" array with the current line

    // Handle words that span across lines
    if (lineIndex < totalLines - 1 && position + wordLength > maxSymbols) {
        const remainingLength = position + wordLength - maxSymbols; // Calc remaining length of the word
        let nextLine = [{type: 'boot', value: bootNumber}]; // Create the next line with a boot number

        // Fill the next line with the remaining part of the word
        for (let i = 0; i < maxSymbols; i++) {
            if (i < remainingLength) {
                nextLine.push({type: 'word', word: word});
            } else {
                nextLine.push(symbols[Math.floor(Math.random() * symbols.length)]); // Random symbol
            }
        }
        lines.push(nextLine); // Add the next line to the lines array
    }
    
    return lines.flat(); // Flatten the lines array to a single array of line elements
}

// Update the display of remaining attempts
function updateAttempts() {
    const attemptsElement = document.getElementById('attempt-blocks');
    attemptsElement.innerHTML = '';

    for (let i = 0; i < attemptsLeft; i++) {
        attemptsElement.innerHTML += '▮'; // Just using a character instead of drawing squares, might change that later but this is easier
    }
}

// Select a word and update the history
function selectWord(word) {
    // Make sure the game isn't already over
    if (attemptsLeft > 0) {
        const correctLetters = calculateLikeness(word);
        const historyElement = document.createElement('div');
        const selectionHistoryTop = document.getElementById('selection-history-top');

        historyElement.className = 'history-entry';
        historyElement.innerHTML = `<div>>${word}</div><div>>Entry denied.</div><div>>Likeness=${correctLetters}</div>`;

        // Remove the oldest entry if the total lines exceed the limit
        // 16 is the how many lines we fit in the hacking columns, so we don't want to extend past that
        const entryLines = 3;
        while (totalHistoryLines + entryLines > 16) {
            const oldestEntry = selectionHistoryTop.lastChild;
            const oldestEntryLines = oldestEntry.children.length;
            totalHistoryLines -= oldestEntryLines;
            selectionHistoryTop.removeChild(oldestEntry);
        }

        // Insert the new entry at the beginning
        selectionHistoryTop.insertBefore(historyElement, selectionHistoryTop.firstChild);
        totalHistoryLines += entryLines;

        if (correctLetters === word.length) {
            alert('Password Correct!');
            startGame(difficulty);
        } else {
            attemptsLeft--;
            updateAttempts();
            if (attemptsLeft === 0) {
                alert('Terminal Locked Out');
                startGame(difficulty);
            }
        }
    }
}

// Called if you click on a character/symbol instead of a word
function selectChar(char) {
    const historyElement = document.createElement('div');
    const selectionHistoryTop = document.getElementById('selection-history-top');

    historyElement.className = 'history-entry';
    historyElement.innerHTML = `<div>>${char}</div><div>>ERROR</div>`;

    // Remove the oldest entry if the total lines exceed the limit
    const entryLines = 2;
    while (totalHistoryLines + entryLines > 16) {
        const oldestEntry = selectionHistoryTop.lastChild;
        const oldestEntryLines = oldestEntry.children.length;
        totalHistoryLines -= oldestEntryLines;
        selectionHistoryTop.removeChild(oldestEntry);
    }

    // Insert the new entry at the top
    selectionHistoryTop.insertBefore(historyElement, selectionHistoryTop.firstChild);
    totalHistoryLines += entryLines;
}

// Show the currently hovered word or character
function showHovered(item) {
    const selectionHistoryBottom = document.getElementById('selection-history-bottom');
    selectionHistoryBottom.innerHTML = `>${item} <span class="blinking-cursor">█</span>`;
}

// Get the number of correct letters in a word, calculates the "Likeness" value
function calculateLikeness(word) {
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
    startGame(difficulty);
}); 