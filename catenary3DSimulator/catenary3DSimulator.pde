///////////////////////////////////////////////////
// LAKE MAC - MAP mima's CATENARY LIGHTS 3D VISUALISER
// Authors: Luke Hespanhol
// Date: April 2022
///////////////////////////////////////////////////

import processing.video.*;
import mqtt.*;

MQTTClient client;

PoleSet poleSet;
LightModuleSet lightModuleSet;
Environment environment;
AnimationSequenceCustom animationSequence;
Settings settings;
SceneManager sceneManager;
Console console;
Scheduler scheduler;

void setup() {
  size(1600, 1000, P2D);
//  size(1280, 800, P2D);
  //colorMode(HSB, 100);
    

  /////////////////////////////////
  // SETUP MQTT
  /////////////////////////////////
  client = new MQTTClient(this);
  try {
    client.connect("mqtt://broker.hivemq.com:1883");
  } catch (Exception e) {
    println("MQTT CONNECTION FAILURE: " + e);
  }
  
  /////////////////////////////////
  // SETUP SETTINGS AND SCHEDULER
  /////////////////////////////////
  settings = new Settings(this);
  settings.loadProperties();

  animationSequence = new AnimationSequenceCustom();
  environment = new Environment(this, animationSequence);
  sceneManager = new SceneManager(this, environment);
  console = new Console(this, environment);
  scheduler = new Scheduler(console);
  background(10);
}

void draw() {
  scheduler.evaluate();
  sceneManager.setLightsAndCamera();  
  sceneManager.evaluateControlsAndNavigation();
  animationSequence.render();
  environment.display();
  console.display();
  
  if (SceneManager.exitButtonPressed) {
    exit();
  }
}

void mousePressed() {
  console.evaluateMousePress();
}

void mouseReleased() {
  console.evaluateMouseRelease();
}
  
/////////////////////////////////////////////
// MOVIE EVENT
/////////////////////////////////////////////
void movieEvent(Movie m) {
  m.read();
}

/////////////////////////////////////////////
// MQTT
/////////////////////////////////////////////
void clientConnected() {
  println("MQTT client connected");
  client.subscribe("catenaryUserUpdate", 0);
  client.subscribe("catenaryDeleteUser", 0);
  client.subscribe("catenaryVolumeUpdate", 0);
}

void connectionLost() {
  println("MQTT connection lost");
}
