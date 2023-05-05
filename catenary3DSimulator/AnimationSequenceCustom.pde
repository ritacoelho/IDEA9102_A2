import processing.video.*;
import oscP5.*;
import netP5.*;

int CURRENT_CATENARY_END = 768;

/********************************************************
  EDIT HERE TO ADD OWN VARIABLES 
*********************************************************/
int redValue = 255;
int greenValue = 200;
int blueValue = 20;

float length = 1;
float volume = 0;

String colour = "(0,0,0)";

boolean flag1Connection = false;
int connection1Frames = 0;

boolean flag2Connection = false;
int connection2Frames = 0;

int rainbowColor = 0;

static class User {
  float size;
  float volume;
  int redValue;
  int greenValue;
  int blueValue;
  
  public User(float sz, float vol, int red, int green, int blue) {
    size = sz;
    volume = vol;
    redValue = red;
    greenValue = green;
    blueValue = blue;
  }
  
  //public static void user() {
  //  User myUsr = new User(50, 0, 255, 255, 255);
  //  println(myUsr.size);
  //}
}

User [] users = new User [5];

/******************************************************************************
  CUSTOM VARIABLES SECTION END
*******************************************************************************/


class AnimationSequenceCustom extends AnimationSequence {
  int catenaryMovieWidth;
  int catenaryMovieHeight;

  public AnimationSequenceCustom() {
    catenaryMovieWidth = Integer.parseInt(Settings.getInstance().getProperty("catenaryMovieWidth"));
    catenaryMovieHeight = Integer.parseInt(Settings.getInstance().getProperty("catenaryMovieHeight"));
    canvas = createGraphics(catenaryMovieWidth, catenaryMovieHeight); 
    
    for(int i = 0; i < 5; i++) {
       users[i] = new User(50, 0, 255, 255, 255);
    }
  }
  
  public void render() {
    canvas.beginDraw();
    canvas.background(0,0,0);
    /////////////////////////////////////////
    // CUSTOMISE YOUR CODE - BEGIN
    /////////////////////////////////////////
    
    if(frameCount%5 == 0 || rainbowColor == 0) rainbowColor = canvas.color(random(0,255), random(0,255), random(0,255));
    
    if(volume > 0.01 && length <= CURRENT_CATENARY_END*2){
      length += volume*7.5;
    } else if (length > 1) {
      length -= 1;
    } else {
      length = 1;
    }
    
    float opacity = map(volume, 0, 0.1, 150, 255);
    
    //println(length, opacity, volume);
    
    //canvas.ellipseMode(CENTER);
    //canvas.fill(redValue, greenValue, blueValue, opacity); // Uncomment this line to receive colours via MQTT
    //canvas.ellipse(CURRENT_CATENARY_END/4, -50+canvas.height/2, length, length);
    
    //canvas.fill(0,255,0);
    //canvas.ellipse(CURRENT_CATENARY_END*2/4, canvas.height/2, 100, 100);
    //canvas.fill(0,0,255);
    //canvas.ellipse(CURRENT_CATENARY_END*3/4, canvas.height/2, 100, 100);
    canvas.ellipseMode(CENTER);
    
    if(CURRENT_CATENARY_END/4 + length/2 >= CURRENT_CATENARY_END*3/4 - 25){
      
      if(!flag2Connection){
        flag2Connection = true;
      }
      
      //interpolates first and second poles
      int color1 = lerpColor(color(redValue, greenValue, blueValue), color(0,255,0), 0.5);
      int color2 = lerpColor(color1, color(0,0,255), 0.5);
      canvas.fill(color2);
      canvas.ellipse(CURRENT_CATENARY_END/4, -50+canvas.height/2, length, length);
      
      canvas.ellipse(CURRENT_CATENARY_END*2/4, canvas.height/2, 100, 100);
      
      canvas.ellipse(CURRENT_CATENARY_END*3/4, canvas.height/2, 100, 100);
      
      
    } else if(CURRENT_CATENARY_END/4 + length/2 >= CURRENT_CATENARY_END*2/4 - 25){
      flag2Connection = false;
      connection2Frames = 0;
      
      if(!flag1Connection){
        flag1Connection = true;
      }
      
      //interpolates first and second poles
      canvas.fill(lerpColor(color(redValue, greenValue, blueValue), color(0,255,0), 0.5));
      canvas.ellipse(CURRENT_CATENARY_END/4, -50+canvas.height/2, length, length);
      
      canvas.ellipse(CURRENT_CATENARY_END*2/4, canvas.height/2, 100, 100);
      
      canvas.fill(0,0,255);
      canvas.ellipse(CURRENT_CATENARY_END*3/4, canvas.height/2, 100, 100);
      
    } else {
      
      flag1Connection = false;
      connection1Frames = 0;
      
      canvas.fill(redValue, greenValue, blueValue, opacity); // Uncomment this line to receive colours via MQTT
      canvas.ellipse(CURRENT_CATENARY_END/4, -50+canvas.height/2, length, length);
      
      canvas.fill(0,255,0);
      canvas.ellipse(CURRENT_CATENARY_END*2/4, canvas.height/2, 100, 100);
      canvas.fill(0,0,255);
      canvas.ellipse(CURRENT_CATENARY_END*3/4, canvas.height/2, 100, 100);
    }
    
    if(flag1Connection && connection1Frames < 200) {
      //canvas.rectMode(CORNER);
      canvas.fill(rainbowColor);
      //canvas.rect(CURRENT_CATENARY_END/4, canvas.height/2, length, canvas.height);
      canvas.ellipse(3*CURRENT_CATENARY_END/8, -50+canvas.height/2, CURRENT_CATENARY_END/4+50, CURRENT_CATENARY_END/4+50);
      connection1Frames++;
    } 
    
    if(flag2Connection && connection2Frames < 200) {
      //canvas.rectMode(CORNER);
      canvas.fill(rainbowColor);
      //canvas.rect(CURRENT_CATENARY_END/4, canvas.height/2, length, canvas.height);
      canvas.ellipse(5*CURRENT_CATENARY_END/8-25, -50+canvas.height/2, CURRENT_CATENARY_END/4+50, CURRENT_CATENARY_END/4+50);
      connection2Frames++;
    } 
    

    /////////////////////////////////////////
    // CUSTOMISE YOUR CODE - END
    /////////////////////////////////////////
    
    canvas.endDraw();
  }
  
}


/////////////////////////////////////////////
// MQTT EVENT
/////////////////////////////////////////////
void messageReceived(String topic, byte[] payload) {
  if (topic.equals("catenaryColourSelectionDemo")) {
    println("new MQTT message: " + topic + " - " + new String(payload));

    // ADD YOUR OWN CODE HERE TO PARSE THE MQTT MESSAGE
    String[] payloadArray = (new String(payload)).split(";");
    volume = new Float (payloadArray[0].trim());
    redValue = new Integer (payloadArray[1].trim());
    greenValue = new Integer (payloadArray[2].trim());
    blueValue = new Integer (payloadArray[3].trim());
    
    println("### Volume: ", volume);
    println("### Colour: ", redValue, greenValue, blueValue);
  }
}
