let currentWord = null;
let currentDict = null;
let score = 0;
let total = 0;
let answered = false;
let shuffledOptions = [];

const wordContainer = document.getElementById('word-container');
const optionsContainer = document.getElementById('options-container');
const nextButton = document.getElementById('next-btn');
const resultDiv = document.getElementById('result');
const scoreDiv = document.getElementById('score');
const dictSelect = document.getElementById('dictionary-select');
const modeIndicator = document.getElementById('mode-indicator');

function initDictionaries() {
  dictSelect.innerHTML = '';
  for (let dictName in dictionaries) {
    const option = document.createElement('option');
    option.value = dictName;
    option.textContent = dictName;
    dictSelect.appendChild(option);
  }
  updateModeIndicator();
}

function updateModeIndicator() {
  return false;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomWord() {
  const dictName = dictSelect.value;
  currentDict = dictionaries[dictName];
  const words = currentDict.words;
  return words[Math.floor(Math.random() * words.length)];
}

function renderLettersMode() {
  const letters = currentWord.word.split('');
  const blankSet = new Set(currentWord.blanks);
  
  letters.forEach((letter, index) => {
    if (blankSet.has(index)) {
      const span = document.createElement('span');
      span.className = 'blank-placeholder';
      span.textContent = '_';
      span.dataset.index = index;
      span.dataset.correct = letter;
      wordContainer.appendChild(span);
    } else {
      const span = document.createElement('span');
      span.className = 'letter-shown';
      span.innerHTML = letter.replace(" ", "&nbsp;&nbsp;");
      wordContainer.appendChild(span);
    }
  });
  
  renderLetterOptions();
}

function renderLetterOptions() {
  optionsContainer.innerHTML = '';
  
  shuffledOptions = shuffleArray(currentWord.options);
  
  shuffledOptions.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.dataset.optionIndex = index;
    btn.addEventListener('click', () => checkLetterAnswer(option, btn));
    optionsContainer.appendChild(btn);
  });
}

function checkLetterAnswer(selectedOption, clickedBtn) {
  if (answered) return;
  answered = true;
  
  const correctAnswer = currentWord.options[0];
  
  const blanks = wordContainer.querySelectorAll('.blank-placeholder');
  let allCorrect = (selectedOption === correctAnswer);
  
  blanks.forEach(blank => {
    if (allCorrect) {
      blank.textContent = correctAnswer;
      blank.classList.add('blank-correct');
    } else {
      blank.textContent = correctAnswer;
      blank.classList.add('blank-wrong');
    }
  });

  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true;
    const btnOption = btn.textContent;

    if (btnOption === correctAnswer) {
      btn.classList.add('option-correct');
    }
    
    if (btn === clickedBtn && !allCorrect) {
      btn.classList.add('option-wrong');
    }
  });
  
  showResult(allCorrect);
}

function renderStressMode() {
  const letters = currentWord.word.split('');
  
  letters.forEach((letter, index) => {
    const span = document.createElement('span');
    
    if (isVowel(letter)) {
      span.className = 'stress-vowel';
      span.textContent = letter;
      span.dataset.index = index;
      span.addEventListener('click', () => checkStressAnswer(index, span));
    } else {
      span.className = 'stress-consonant';
      span.textContent = letter;
    }
    
    wordContainer.appendChild(span);
  });
}

function isVowel(letter) {
  return 'аеёиоуыэюя'.includes(letter.toLowerCase());
}

function checkStressAnswer(clickedIndex, clickedSpan) {
  if (answered) return;
  answered = true;
  
  const correctIndex = currentWord.stressIndex;
  const allVowels = wordContainer.querySelectorAll('.stress-vowel');
  
  allVowels.forEach(vowel => {
    vowel.style.pointerEvents = 'none';
    
    if (parseInt(vowel.dataset.index) === correctIndex) {
      vowel.classList.add('stress-correct');
    }
  });
  
  if (clickedIndex === correctIndex) {
    clickedSpan.classList.add('stress-user-correct');
    showResult(true);
  } else {
    clickedSpan.classList.add('stress-user-wrong');
    showResult(false);
  }
}

function renderWord() {
  currentWord = getRandomWord();
  wordContainer.innerHTML = '';
  optionsContainer.innerHTML = '';
  resultDiv.textContent = '';
  resultDiv.className = '';
  answered = false;
  nextButton.style.display = 'none';
  
  if (currentDict.type === 'stress') {
    renderStressMode();
    optionsContainer.style.display = 'none';
  } else {
    renderLettersMode();
    optionsContainer.style.display = 'flex';
  }
}

function showResult(isCorrect) {
  total++;
  if (isCorrect) {
    score++;
    resultDiv.textContent = '✅ Правильно!';
    resultDiv.className = 'result-correct';
    wordContainer.classList.add('correct-animation');
  } else {
    const correctWord = currentDict.type === 'stress' 
      ? highlightStress(currentWord.word, currentWord.stressIndex)
      : currentWord.options[0];
    resultDiv.innerHTML = `❌ Неправильно. Правильно: <strong>${correctWord}</strong>`;
    resultDiv.className = 'result-wrong';
    wordContainer.classList.add('wrong-animation');
  }
  
  updateScore();
  nextButton.style.display = 'block';
  nextButton.focus();
}

function highlightStress(word, stressIndex) {
  const letters = word.split('');
  letters[stressIndex] = `<u>${letters[stressIndex].toUpperCase()}</u>`;
  return letters.join('');
}

function updateScore() {
  scoreDiv.textContent = `Счёт: ${score}/${total}`;
  if (total > 0) {
    const percentage = (score / total) * 100;
    if (percentage >= 80) scoreDiv.style.color = '#38a169';
    else if (percentage >= 50) scoreDiv.style.color = '#d69e2e';
    else scoreDiv.style.color = '#e53e3e';
  }
}

initDictionaries();
renderWord();

dictSelect.addEventListener('change', () => {
  score = 0;
  total = 0;
  updateScore();
  updateModeIndicator();
  renderWord();
});

nextButton.addEventListener('click', () => {
  wordContainer.classList.remove('correct-animation', 'wrong-animation');
  renderWord();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && answered) {
    nextButton.click();
  }
});