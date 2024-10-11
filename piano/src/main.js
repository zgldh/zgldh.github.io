const keys = document.querySelectorAll(".key");
const volumeControl = document.getElementById("volume");
const soundControl = document.getElementById("sound");
const showKeysControl = document.getElementById("show-keys");

let volume = 0.5;
let soundType = "sine";
let isMouseDown = false;
const activeOscillators = {};

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(keyCode) {
  if (activeOscillators[keyCode]) return; // 如果已经有一个活动的振荡器，则返回

  const key = document.querySelector(`.key[data-key="${keyCode}"]`);
  if (!key) return;

  const note = key.dataset.note;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = soundType;
  oscillator.frequency.setValueAtTime(
    getFrequency(note),
    audioContext.currentTime
  );
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  activeOscillators[keyCode] = { oscillator, gainNode };

  key.classList.add("active");
}

function stopSound(keyCode) {
  const key = document.querySelector(`.key[data-key="${keyCode}"]`);
  if (!key) return;

  const activeOscillator = activeOscillators[keyCode];
  if (activeOscillator) {
    activeOscillator.gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + 0.03
    );
    activeOscillator.oscillator.stop(audioContext.currentTime + 0.03);
    delete activeOscillators[keyCode];
  }

  key.classList.remove("active");
}

function getFrequency(note) {
  const notes = {
    C4: 261.63,
    "C#4": 277.18,
    D4: 293.66,
    "D#4": 311.13,
    E4: 329.63,
    F4: 349.23,
    "F#4": 369.99,
    G4: 392.0,
    "G#4": 415.3,
    A4: 440.0,
    "A#4": 466.16,
    B4: 493.88,
    C5: 523.25,
    "C#5": 554.37,
    D5: 587.33,
    "D#5": 622.25,
    E5: 659.25,
  };
  return notes[note];
}

function removeTransition(e) {
  if (e.propertyName !== "transform") return;
  this.classList.remove("active");
}

function handleVolumeChange(e) {
  volume = e.target.value;
}

function handleSoundChange(e) {
  soundType = e.target.value;
}

function handleShowKeysChange(e) {
  const showKeys = e.target.checked;
  const keyLabels = document.querySelectorAll(".key-label");
  keyLabels.forEach((label) => {
    label.classList.toggle("hidden", !showKeys);
  });
}

function handleMouseDown(e) {
  isMouseDown = true;
  const key = e.target.closest(".key");
  if (!key) return;
  playSound(key.dataset.key);
}

function handleMouseUp(e) {
  isMouseDown = false;
  const key = e.target.closest(".key");
  if (key) {
    stopSound(key.dataset.key);
  }
}

function handleMouseOver(e) {
  if (isMouseDown) {
    const key = e.target.closest(".key");
    if (!key) return;
    playSound(key.dataset.key);
  }
}

function handleMouseOut(e) {
  const key = e.target.closest(".key");
  if (key) {
    stopSound(key.dataset.key);
  }
}

function handleKeyDown(e) {
  if (!activeOscillators[e.keyCode]) {
    playSound(e.keyCode);
  }
}

function handleKeyUp(e) {
  stopSound(e.keyCode);
}

keys.forEach((key) => key.addEventListener("transitionend", removeTransition));
keys.forEach((key) => key.addEventListener("mousedown", handleMouseDown));
keys.forEach((key) => key.addEventListener("mouseup", handleMouseUp));
keys.forEach((key) => key.addEventListener("mouseover", handleMouseOver));
keys.forEach((key) => key.addEventListener("mouseout", handleMouseOut));
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
volumeControl.addEventListener("input", handleVolumeChange);
soundControl.addEventListener("change", handleSoundChange);
showKeysControl.addEventListener("change", handleShowKeysChange);
