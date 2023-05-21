/***********************************************************************
  WEEK 04 - Example 04 - MQTT Sender

  Author: Luke Hespanhol
  Date: March 2022
***********************************************************************/
/*
	Disabling canvas scroll for better experience on mobile interfce.
	Source: 
		User 'soanvig', answer posted on Jul 20 '17 at 18:23.
		https://stackoverflow.com/questions/16348031/disable-scrolling-when-touch-moving-certain-element 
*/
document.addEventListener('touchstart', function(e) {
  document.documentElement.style.overflow = 'hidden';
});

document.addEventListener('touchend', function(e) {
  document.documentElement.style.overflow = 'auto';
});


//////////////////////////////////////////////////
//FIXED SECTION: DO NOT CHANGE THESE VARIABLES
//////////////////////////////////////////////////
var HOST = window.location.origin;
let xmlHttpRequest = new XMLHttpRequest();

////////////////////////////////////////////////////
// CUSTOMIZABLE SECTION - BEGIN: ENTER OUR CODE HERE
////////////////////////////////////////////////////

//page toggle
let currentScreen = 0;

//hue picker
let slider;

//variables for audio capture and display
let mic;
let amp;
let fft;
let captureAudio = false;

//variables for pole selection
let selectedPole;
let poles = [];

//buttons
let startButton;
let aboutButton;
let nextButton;
let closeButton;

//images
let closeIcon;
let micIcon;
let bg;


function preload(){
  //"https://icons8.com/icon/7FSknHLAHdnP/close"
  closeIcon = loadImage('assets/icons8-close-96.png');
  //"https://icons8.com/icon/85796/microphone"
  micIcon = loadImage('assets/icons8-microphone-96.png');
  //https://arts.lakemac.com.au/Venues/Multi-Arts-Pavilion-mima/Permanent-Artworks/The-Catenary
  //pixelated using https://pinetools.com/pixelate-effect-image 
  bg = loadImage('assets/background.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  //background(25,16,50);
  background(bg);

  //create & start an audio input
  mic = new p5.AudioIn();
  mic.start();

  //create an amplitude object that will use mic as input
  amp = new p5.Amplitude();
  amp.setInput(mic);

  fft = new p5.FFT();

  //creating pole selection buttons
  for (let i = 0; i < 5; i++) {
    let xCoor;
    if(i%2 != 0) {
      xCoor = -50 + width/4;
    } else {
      xCoor = -50 + 3*width/4;
    }
    poles[i] = createButton("");
    poles[i].position(xCoor, -50 + i*150 + height/4);
    poles[i].mousePressed(function() { selectPole(i);});
    poles[i].style("width: 100px; height: 100px; border-radius: 50px; background-color: white;");
  }

  //creating slider
  colorMode(HSB);
  slider = createSlider(0, 360, 270);
  slider.class("colorSelection");
  //centering slider by subtracting half of it's screen size responsive width (70%)
  slider.position((width/2) - width*.35, height*.85 - 150);
  slider.input(updateUser);

  //creating start button
  startButton = createButton("Start");
  startButton.position((width/2) - width*.35, height*.55);
  startButton.class("next-button");
  startButton.mousePressed(nextPressed);

  //creating about button
  aboutButton = createButton("About the project");
  aboutButton.position((width/2) - width*.35, height*.65);
  aboutButton.class("next-button");
  aboutButton.mousePressed(aboutPage);

  //creating next button
  nextButton = createButton("Next");
  nextButton.position((width/2) - width*.35, height*.85);
  nextButton.class("next-button");
  nextButton.mousePressed(nextPressed);

  //creating close button
  closeButton = createImg('assets/icons8-close-96.png');
  closeButton.position(width-140,60);
  closeButton.class("close-button");
  closeButton.mousePressed(closePage);
}


function draw() {
  background(bg);

  // push();
  //   colorMode(RGB);
  //   background(25,16,50);
  // pop();
  
  switch (currentScreen) {
    case -1:
      fill(0,0,0,0.7);
      rect(0,0,width, height);
      fill(0,0,0,0.5);
      rect(30,30,width-60, height-60);
      aboutTheProject();
      break;

    case 0:
      fill(0,0,0,0.7);
      rect(30,30,width-60, height-60);
      homepage();
      break;

    case 1: 
      // fill(0,0,0,0.7);
      // rect(0,0,width, height);
      // fill(0,0,0,0.5);
      // rect(30,30,width-60, height-60);
      push();
        colorMode(RGB);
        background(25,16,50);
      pop();
      screen1();
      break;
    
    case 2:
      // fill(0,0,0,0.7);
      // rect(0,0,width, height);
      // fill(0,0,0,0.5);
      // rect(30,30,width-60, height-60);
      push();
        colorMode(RGB);
        background(25,16,50);
      pop();
      screen2();
      break
  
    default:
      fill(0,0,0,0.7);
      rect(30,30,width-60, height-60);
      homepage();
      currentScreen = 0;
      break;
  }
  
}

function nextPressed(){
  currentScreen++;
  if(currentScreen == 2) captureAudio = true;
  console.log("next pressed");
}

function closePage(){
  //selectedPole = undefined;
  currentScreen = 0;
  console.log("back");
}

function selectPole(poleId) {
  if(selectedPole != undefined) {
    poles[selectedPole].style("background-color: white;");
  }
  selectedPole = poleId;
  console.log(selectedPole);
}

function aboutPage(){
  currentScreen = -1;
  console.log("about");
}

function homepage() {
  startButton.show();
  aboutButton.show();
  closeButton.hide();
  nextButton.hide();
  slider.hide();
  poles.forEach(pole => {
    pole.hide();
  });

  push();
    noStroke();
    fill(0,0,255);
    textStyle(NORMAL);
    textSize(160);
    textAlign(CENTER, CENTER);
    textFont('VT323');


    text("SONIC\nLINK", width/2, height/4);

    textSize(30);
    text("Please allow microphone access on your device", width/2, height - 100);
  pop();

}

function aboutTheProject() {
  startButton.hide();
  aboutButton.hide();
  closeButton.show();
  nextButton.hide();
  slider.hide();
  poles.forEach(pole => {
    pole.hide();
  });

  push();
    noStroke();
    fill(0,0,255);
    textStyle(NORMAL);
    textSize(80);
    textAlign(LEFT, CENTER);
    textFont('VT323');


    text("About the project", 60, 100);

    // image(bg, 0, 0);
    // noFill();
    fill(0,0,255);
    rect(60, 200, width-120, 400);

    textSize(60);
    text("Blablablabla", 60, 700);

  pop();

}

function screen1() {
  startButton.hide();
  aboutButton.hide();
  closeButton.show();
  poles.forEach(pole => {
    pole.show();
    pole.style("background-color: white;");
  });
  selectedPole != undefined ? nextButton.show() : nextButton.hide();
  selectedPole != undefined ? slider.show() : slider.hide();

  console.log("on screen 1");
  push();
    colorMode(RGB);

    rectMode(CENTER);
    noStroke();
    fill(255,255,255);
    textStyle(NORMAL);
    textSize(50);
    textAlign(CENTER, CENTER);
    textFont('VT323');

    text("1. Pick your pole", width/4, -250 + height/4);

    text("MAP Mima", width/2, -75 + height/4);

    if(selectedPole != undefined) {
      text("2. Pick your color", width/4, height*.85 - 250);
    }

    noFill();
    stroke(255,255,255);
    strokeWeight(2);
    rect(width/2, -75 + height/4, width*.7, 150, 8);

    strokeWeight(5);
    line(width/4, 150 + height/4, 3*width/4, height/4);
    line(width/4, 150 + height/4, 3*width/4, 300 + height/4);
    line(width/4, 450 + height/4, 3*width/4, 300 + height/4);
    line(width/4, 450 + height/4, 3*width/4, 600 + height/4);
  pop();
  
  //console.log(slider.value());
  if(selectedPole != undefined) {
    poles[selectedPole].style(`background-color: hsl(${slider.value()}, 100%, 50%);`);
  }
}

function screen2() {
  startButton.hide();
  aboutButton.hide();
  nextButton.hide();
  slider.hide();
  poles.forEach(pole => {
    pole.hide();
  });
  closeButton.show();

  //get the level of amplitude of the mic
  let level = amp.getLevel();

  push();
    colorMode(RGB);
    noStroke();
    fill(255,255,255);
    textStyle(BOLD);
    textSize(70);
    textAlign(CENTER, CENTER);
    textFont('VT323');

    text("Let your voice\nbe seen!", width/2, height/4);

    textSize(50);
    text("Maintain your volume above the line\nto see your color expand", width/2, 100 + 3*height/4);
    
  pop();
    
  push();
    rectMode(CORNERS);
    stroke(0,0,360);
    strokeWeight(5);
    noFill();

    let maxHeight = height/4 + 300;
    let minHeight = 3*height/4 - 200;

    let levelHeight = map(level, 0.002, 0.04, minHeight, maxHeight, true);

    rect(-100 + width/2, height/4 + 300, 100 + width/2, 3*height/4 - 200, 8);

    if(captureAudio){
      sendVolume(level);
      fill(slider.value(),360,200);
      rect(-100 + width/2, levelHeight, 100 + width/2, 3*height/4 - 200, 8);
    }
    
    line(-125 + width/2, 3*height/4 - 300, 125 + width/2, 3*height/4 - 300);

    imageMode(CENTER)
    image(micIcon, width/2, -100 + 3*height/4, 100, 100);
  pop();

  

}

////////////////////////////////////////////////////
// CUSTOMIZABLE SECTION - END: ENTER OUR CODE HERE
////////////////////////////////////////////////////

/***********************************************************************
  === PLEASE DO NOT CHANGE OR DELETE THIS SECTION ===
  This function sends a MQTT message to server
***********************************************************************/
function updateUser(){
  let msgStr = selectedPole + ";" + slider.value().toString();

	let postData = JSON.stringify({ id: 1, 'message': msgStr });
  console.log(msgStr);

	xmlHttpRequest.open("POST", HOST + '/updateUser', false);
  xmlHttpRequest.setRequestHeader("Content-Type", "application/json");
	xmlHttpRequest.send(postData);
}

function sendVolume(level) {
  let msgStr = selectedPole + ";" + level.toString();

	let postData = JSON.stringify({ id: 1, 'message': msgStr });
  console.log(msgStr);

	xmlHttpRequest.open("POST", HOST + '/sendVolume', false);
  xmlHttpRequest.setRequestHeader("Content-Type", "application/json");
	xmlHttpRequest.send(postData);
}