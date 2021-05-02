// script.js

// DOM ELEMENTS
const imgInput = document.getElementById("image-input")
const canvas = document.getElementById("user-image")
const topTxtInput = document.getElementById("text-top")
const bottomTxtInput = document.getElementById("text-bottom")
const form = document.getElementById('generate-meme') 
const generateBtn = document.querySelector('button[type="submit"]')
const resetBtn = document.querySelector('button[type="reset"]')
const readBtn = document.querySelector('button[type="button"]')
const voiceSelect = document.getElementById("voice-selection") 
const volume = document.querySelector('input[type="range"]')
const volueImg = document.getElementById('volume-group').querySelector('img')
const synth = window.speechSynthesis;
var voices

generateBtn.disabled = true;
resetBtn.disabled = true;
readBtn.disabled = true;
voiceSelect.disabled = false

const context = canvas.getContext('2d');

const img = new Image(); // used to load image from <input> and draw to canvas

synth.addEventListener("voiceschanged", () => {
  if (voices.length > 0) {
    return
  }
  voices = synth.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
      if ( aname < bname ) return -1;
      else if ( aname == bname ) return 0;
      else return +1;
  });
  var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = '';
  for(let i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.value = voices[i].name
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
    
    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.selectedIndex = selectedIndex;
})

function populateVoiceList() {
  voices = synth.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
      if ( aname < bname ) return -1;
      else if ( aname == bname ) return 0;
      else return +1;
  });
  var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = '';
  for(let i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.value = voices[i].name
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
    
    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.selectedIndex = selectedIndex;
}

readBtn.addEventListener('click', () => {
  var utterThis = new SpeechSynthesisUtterance(topTxtInput.value + " " + bottomTxtInput.value);
  utterThis.volume = volume.value/100
  for(let i = 0; i < voices.length ; i++) {
    if(voices[i].name === voiceSelect.options[voiceSelect.selectedIndex].value) {
      utterThis.voice = voices[i];
      break;
    }
  }

  synth.speak(utterThis);
})

volume.addEventListener('input', e => {
  if (volume.value >= 67) {
    volueImg.src = "icons/volume-level-3.svg"
  } else if (volume.value >= 34) {
    volueImg.src = "icons/volume-level-2.svg"
  } else if (volume.value >= 1) {
    volueImg.src = "icons/volume-level-1.svg"
  } else {
    volueImg.src = "icons/volume-level-0.svg"
  }
})

populateVoiceList()

imgInput.addEventListener('change', e => {
  var reader  = new FileReader();

  reader.onloadend = function () {
    img.src = reader.result;
    canvas.setAttribute('alt', imgInput.files[0].name);
  }

  reader.readAsDataURL(imgInput.files[0]);
  
})

form.addEventListener('submit', e => {
  e.preventDefault()
  context.font = '48px serif';
  context.fillStyle = "white";
  context.textAlign = 'center'
  context.fillText(topTxtInput.value, canvas.width/2, 48);
  context.fillText(bottomTxtInput.value, canvas.width/2, canvas.height - 10);
})

resetBtn.addEventListener('click', e => {
  generateBtn.disabled = true;
  resetBtn.disabled = true;
  readBtn.disabled = true;
  context.clearRect(0, 0, canvas.width, canvas.height);
})

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO

  generateBtn.disabled = false;
  resetBtn.disabled = false;
  readBtn.disabled = false;
  context.fillStyle = "black";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillRect(0, 0, canvas.width, canvas.height);

  const { width, height, startX, startY } = getDimmensions(
    canvas.offsetWidth, 
    canvas.offsetHeight,
    img.width,
    img.height
  )
  
  context.drawImage(
    img, 
    startX, 
    startY,
    width,
    height
  );
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
