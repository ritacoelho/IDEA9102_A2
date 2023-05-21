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
let HOST = window.location.origin;
let xmlHttpRequest = new XMLHttpRequest();

////////////////////////////////////////////////////
// CUSTOMIZABLE SECTION - BEGIN: ENTER OUR CODE HERE
////////////////////////////////////////////////////

let MAX_USERS = 5;

//current users
let userSessionIds = new Map();

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
let nextButton;
let closeButton;

//
let users = [false, false, false, false, false];

//images
let closeIcon;
let micIcon;


function preload(){
  //"https://icons8.com/icon/7FSknHLAHdnP/close"
  closeIcon = loadImage('assets/icons8-close-96.png');
  //"https://icons8.com/icon/85796/microphone"
  micIcon = loadImage('assets/icons8-microphone-96.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(25,16,50);

  //create & start an audio input
  mic = new p5.AudioIn();
  mic.start();

  //create an amplitude object that will use mic as input
  amp = new p5.Amplitude();
  amp.setInput(mic);

  fft = new p5.FFT();

  colorMode(HSB);
  slider = createSlider(0, 360, 270);
  slider.class("colorSelection");
  //centering slider by subtracting half of it's screen size responsive width (70%)
  slider.position((width/2) - width*.35, height*.85 - 150);

  nextButton = createButton("Next");
  nextButton.position((width/2) - width*.35, height*.85);
  nextButton.class("next-button");
  nextButton.mousePressed(nextPressed);

  for (let i = 0; i < MAX_USERS; i++) {
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

  closeButton = createImg('assets/icons8-close-96.png');
  closeButton.position(30,30);
  closeButton.mousePressed(closePage);

}

function draw() {
  getPoles();

  push();
    colorMode(RGB);
    background(25,16,50);
  pop();

  //image(closeIcon, 30, 30, 75, 75);
  
  if (currentScreen == 0) {
    screen1();
  } else if (currentScreen == 1) {
    screen2();
  } else if (currentScreen == 2) {
    screen3();
  }
  
}

function nextPressed(){
  captureAudio = true;
  users[selectedPole] = true;
  updateUser();
  currentScreen = 1;
  console.log("next pressed");
}

function closePage(){
  users[selectedPole] = false;
  //selectedPole = undefined;
  currentScreen = 0;
  console.log("back");
}

function selectPole(poleId) {
  if(selectedPole != undefined) {
    poles[selectedPole].style("background-color: white;");
  }
  updatePole(selectedPole, poleId);
  selectedPole = poleId;
  console.log(selectedPole);
}

function screen1() {
  closeButton.hide();
  nextButton.show();
  slider.show();
  console.log(userSessionIds);
  for(i = 0; i < MAX_USERS; i++){
    let curPole = poles[i];
    if(curPole != selectedPole && userSessionIds.has(i)){
      curPole.attribute('disabled', '');
    } else {
      curPole.show();
      curPole.style("background-color: white;");
      curPole.removeAttribute('disabled');
    }
  }

  console.log("on screen 1");
  push();
    colorMode(RGB);

    rectMode(CENTER);
    noStroke();
    fill(255,255,255);
    textStyle(NORMAL);
    textSize(40);
    textAlign(CENTER, CENTER);
    textFont('Verdana');

    text("1. Pick your pole", width/4, -250 + height/4);

    text("MAP Mima", width/2, -75 + height/4);

    text("2. Pick your color", width/4, height*.85 - 250);

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

  closeButton.show();
  //captureAudio? micButtonOn.show() && micButtonOff.hide(): micButtonOff.show() && micButtonOn.hide();
  nextButton.hide();
  slider.hide();
  poles.forEach(pole => {
    pole.hide();
  });

  //get the level of amplitude of the mic
  let level = amp.getLevel();

  push();
    colorMode(RGB);
    noStroke();
    fill(255,255,255);
    textStyle(BOLD);
    textSize(50);
    textAlign(CENTER, CENTER);
    textFont('Verdana');

    text("Let your voice \n be seen!", width/2, height/4);

    textSize(30);
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
  This function sends the pole information to the server
***********************************************************************/
function updatePole(prevPole, newPole){
  let postData = JSON.stringify({prevPole: prevPole, newPole: newPole});

  xmlHttpRequest.open("POST", HOST + '/updatePole', false);
  xmlHttpRequest.setRequestHeader("Content-Type", "application/json");
	xmlHttpRequest.send(postData);
}

/***********************************************************************
  This function sends the pole information to the server
***********************************************************************/
function getPoles(){
  xmlHttpRequest.open("GET", HOST + '/getCurrentUsers', false);
  xmlHttpRequest.setRequestHeader("Content-Type", "application/json");
	xmlHttpRequest.send();
  xmlHttpRequest.onreadystatechange = function() {
    console.log(this.responseText, this.responseText.typeof);
    if(this.readyState == 4 && this.status == 200 && this.response != undefined){
      console.log("this response: ", this.response);

      let arr = this.responseText.split(",");
      userSessionIds = new Map(arr);
    }
  }
}

/***********************************************************************
  === PLEASE DO NOT CHANGE OR DELETE THIS SECTION ===
  This function sends a MQTT message to server
***********************************************************************/
function updateUser(){
  let msgStr = selectedPole + ";" + users[selectedPole] + ";" + slider.value().toString();

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