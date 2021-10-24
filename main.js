const RED = 1;
const GREEN = 2;
const BLUE = 3;
const YELLOW = 4;

const TEST = false;

let gameState;
let redButton;
let greenButton;
let yellowButton;
let blueButton;
let gameButtons;
let nextRoundButton;
let nextRoundOnClick;
let resetButton;
let defaultResetOnClick;
let failDiv;


class Sound {
  constructor(assetName) {
    this.audioElement_ = document.createElement('audio');
    this.audioElement_.src = `./assets/audio/${assetName}`;
    this.audioElement_.addEventListener('ended', () => {
      this.isPLaying_ = false;
    });
    this.isPlaying_ = false;
  }

  play() {
    if (this.isPlaying_) {
      this.audioElement_.pause();
      this.audioElement_.load();
    }
    this.audioElement_.play();
    this.isPlaying_ = true;
  }
}

const SOUNDS_FAMILY = 'dream_dancer_';
const SOUNDS_EXT = '.wav';
let redSound = new Sound(`${SOUNDS_FAMILY}C${SOUNDS_EXT}`);
let greenSound = new Sound(`${SOUNDS_FAMILY}Dm${SOUNDS_EXT}`);
let blueSound = new Sound(`${SOUNDS_FAMILY}Em${SOUNDS_EXT}`);
let yellowSound = new Sound(`${SOUNDS_FAMILY}F${SOUNDS_EXT}`);


function onLoad() {
  if (document.readyState !== 'complete') {
    return;
  }
  gameState = new GameState();
  redButton = document.getElementById('red-button');
  greenButton = document.getElementById('green-button');
  yellowButton = document.getElementById('yellow-button');
  blueButton = document.getElementById('blue-button');
  gameButtons = [redButton, greenButton, blueButton, yellowButton];

  nextRoundButton = document.getElementById('next-round-button');
  nextRoundOnClick = () => { gameState.startNextRound(); };
  nextRoundButton.onclick = nextRoundOnClick;
  resetButton = document.getElementById('reset-button');
  defaultResetOnClick = () => {
    resetButton.innerHTML = "Reset: Tap again to confirm";
    resetButton.onclick = () => {
      gameState = new GameState();
      gameState.start();
    }
  };

  failDiv = document.getElementById('fail-gif');

  document.getElementById('start-button').onclick = () => {
    gameState.start();
    document.getElementById('start-button').classList.add('hidden');
  }
}

class GameState {

  constructor() {
    this.isStarted = false;
    this.sequence = [];
    this.inputSequence = [];
  }

  start() {
    this.isStarted = true;
    this.startNextRound();

    /* Test colors/sounds. */
    if (TEST) {
      this.sequence = [RED, GREEN, BLUE, YELLOW];
      const flash = () => {
        this.flashSequence().then(() => {
          flash();
        });
      }
      flash();
    }
  }

  startNextRound() {
    this.hideNextRoundButton();
    this.sequence.push(getNextButton());
    this.flashSequence();
  }

  fail() {
    this.inputSequence = [];
    failDiv.classList.remove('hidden');
    setTimeout(() => {
      failDiv.classList.add('hidden');
      setTimeout(() => { this.showFailButtons(); }, 100);
    }, 3000);
  }

  async flashSequence() {
    for (let i = 0; i < this.sequence.length; i++) {
      await this.pressButton(this.sequence[i]);
    }
    this.enableInput();
  }

  enableInput() {
    this.inputSequence = [];
    gameButtons.forEach((btn) => {
      const value = parseInt(btn.getAttribute('value'));
      btn.onclick = undefined;
      btn.onclick = () => {
        this.userPressedButton(value);
      };
    });
  }

  disableInput() {
    gameButtons.forEach((btn) => {
      btn.onclick = undefined;
    });
  }

  async userPressedButton(buttonNum) {
    await this.pressButton(buttonNum);
    this.inputSequence.push(buttonNum);
    for (let i = 0; i < this.inputSequence.length; i++) {
      if (this.inputSequence[i] != this.sequence[i]) {
        this.fail();
        this.disableInput();
        return;
      }
    }
    if (this.inputSequence.length === this.sequence.length) {
      this.showNextRoundButtons();
      this.disableInput();
      return;
    }
  }

  pressButton(buttonNum) {
    return new Promise((resolve, reject) => {
      this.playSound(buttonNum);
      const buttonEl = getButtonElement(buttonNum);
      buttonEl.classList.add('pressed');
      setTimeout(() => {
        buttonEl.classList.remove('pressed');
        setTimeout(() => {
          resolve();
        }, 250);
      }, 250);
    });
  }

  playSound(buttonNum) {
    if (buttonNum === RED) {
      redSound.play();
    }
    if (buttonNum === GREEN) {
      greenSound.play();
    }
    if (buttonNum === BLUE) {
      blueSound.play();
    }
    if (buttonNum === YELLOW) {
      yellowSound.play();
    }
  }

  showNextRoundButtons() {
    nextRoundButton.classList.remove('hidden');
    nextRoundButton.innerHTML = `Start round ${this.sequence.length + 1}`;
    nextRoundButton.onclick = nextRoundOnClick;
    resetButton.classList.remove('hidden');
    resetButton.innerHTML = 'Restart';
    resetButton.onclick = defaultResetOnClick;
  }

  showFailButtons() {
    nextRoundButton.classList.remove('hidden');
    nextRoundButton.innerHTML = `Try again`;
    nextRoundButton.onclick = () => {
      this.enableInput();
      this.hideNextRoundButton();
    };
    resetButton.classList.remove('hidden');
    resetButton.innerHTML = 'Restart';
    resetButton.onclick = defaultResetOnClick;
  }

  hideNextRoundButton() {
    nextRoundButton.classList.add('hidden');
    resetButton.classList.add('hidden');
  }
}

function getButtonElement(buttonNum) {
  if (buttonNum === RED) {
    return redButton;
  }
  if (buttonNum === GREEN) {
    return greenButton;
  }
  if (buttonNum === BLUE) {
    return blueButton;
  }
  if (buttonNum === YELLOW) {
    return yellowButton;
  }
}

function getNextButton() {
  const rand = Math.random();
  if (rand < 0.25) {
    return RED;
  } else if (rand < 0.5) {
    return GREEN;
  } else if (rand < 0.75) {
    return BLUE;
  } else {
    return YELLOW;
  }
}

document.onreadystatechange = onLoad;
