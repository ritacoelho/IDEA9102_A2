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

let colorPicker;

let mic;
let amp;
let fft;


function setup() {
  createCanvas(windowWidth, windowHeight);

  //create & start an audio input
  mic = new p5.AudioIn();
  mic.start();

  //create an amplitude object that will use mic as input
  amp = new p5.Amplitude();
  amp.setInput(mic);

  fft = new p5.FFT();

  colorPicker = createColorPicker('#AFDEF5');
  colorPicker.position(width/2, height/2);

 //background(0);

}


function draw() {
  //get the level of amplitude of the mic
  let level = amp.getLevel();
  //console.log(level);

  sendMessage(level);

  background(255);
}

////////////////////////////////////////////////////
// CUSTOMIZABLE SECTION - END: ENTER OUR CODE HERE
////////////////////////////////////////////////////

/***********************************************************************
  === PLEASE DO NOT CHANGE OR DELETE THIS SECTION ===
  This function sends a MQTT message to server
***********************************************************************/
function sendMessage(level) {
  let msgStr = level.toString() + ";" + colorPicker.color()._getRed().toString() + ";" + colorPicker.color()._getGreen().toString() + ";" + colorPicker.color()._getBlue().toString();

	let postData = JSON.stringify({ id: 1, 'message': msgStr });
  console.log(msgStr);

	xmlHttpRequest.open("POST", HOST + '/sendMessage', false);
  xmlHttpRequest.setRequestHeader("Content-Type", "application/json");
	xmlHttpRequest.send(postData);
}