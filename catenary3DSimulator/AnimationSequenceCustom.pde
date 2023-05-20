import processing.video.*;
import java.util.*;
import oscP5.*;
import netP5.*;

int CURRENT_CATENARY_END = 768;

/********************************************************
  EDIT HERE TO ADD OWN VARIABLES 
*********************************************************/

int[] xCoor;
int[] yCoor;

static class User {
  int pole;
  boolean playing;
  float size;
  float volume;
  int usrColor;
  boolean growing;
  
  public User(int pos, boolean pl, float sz, float vol, int col, boolean grw) {
    pole = pos;
    playing = pl;
    size = sz;
    volume = vol;
    usrColor = col;
    growing = grw;
  }
}

User [] users = new User [5];

static class Connection {
  long timestamp;
  User node1;
  User node2;
  
  public Connection(long ts, User n1, User n2) {
    timestamp = ts;
    node1 = n1;
    node2 = n2;
  }
}

//Connection [] connections = new Connection [6];

Queue<Connection> connections = new LinkedList<>();

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
    
    //initial color convert from 360 scale to 255;
    int initialCol = (int)map(270, 0, 360, 0 ,255);
    
    //initializing poles
    for(int i = 0; i < 5; i++) {
       users[i] = new User(i, false, 100, 0, initialCol, false);
    }
    
    //declaring poles x-coordinates
    xCoor = new int[5];
    xCoor[0] = 0;
    xCoor[1] = CURRENT_CATENARY_END/4;
    xCoor[2] = CURRENT_CATENARY_END/2;
    xCoor[3] = 3*CURRENT_CATENARY_END/4;
    xCoor[4] = CURRENT_CATENARY_END;
    
    //declaring poles y-coordinates
    yCoor = new int[5];
    yCoor[0] = canvas.height;
    yCoor[1] = 0;
    yCoor[2] = canvas.height;
    yCoor[3] = 0;
    yCoor[4] = canvas.height;

  }
  
  public void render() {
    canvas.beginDraw();
    canvas.background(0,0,0);
    
    /////////////////////////////////////////
    // CUSTOMISE YOUR CODE - BEGIN
    /////////////////////////////////////////
    canvas.ellipseMode(CENTER);
    canvas.colorMode(HSB);
    
    for(int i = 0; i < users.length; i++){
      User user = users[i];
      
      //if volume input is higher than threshold, grow color at pole
      if(user.volume > 0.006){ //regularly 0.003 and vol*100
        user.size += user.volume*50;
        user.growing = true;
      } else if (user.size > 100) {
        //else decay color at pole
        user.size -= 0.5;
        user.growing = false;
      }
      
      //design circles to have 70% opacity fill and fully opaque outline
      canvas.strokeWeight(2);
      canvas.stroke(user.usrColor, 255, 255);
      canvas.fill(user.usrColor, 255, 255, 70);
      
      //outer extending circle
      canvas.ellipse(xCoor[i], yCoor[i], user.size, user.size);
      
      //inner rippling circles
      for(int j = 1; j < 4; j++){
        canvas.ellipse(xCoor[i], yCoor[i], (frameCount%CURRENT_CATENARY_END/j)%user.size, (frameCount%CURRENT_CATENARY_END/j)%user.size);
      }
      
      //checking for connections between poles
      for(int k = i+1; k < users.length; k++){
        float dist = dist(xCoor[i], yCoor[i], xCoor[k], yCoor[k]);
        float sizeSum = (user.size + users[k].size)/2;
        
        if(dist != 0 && Math.floor(sizeSum) == Math.floor(dist) && (user.growing || users[k].growing)){
          Connection newCon = new Connection(System.currentTimeMillis(), user, users[k]);
          connections.add(newCon);
          println("new connection", i, k);
        }
      }
      
      
    }
    
    //https://www.techiedelight.com/iterate-through-queue-java/
    // using Iterator to iterate through a queue
    Iterator<Connection> iterator = connections.iterator();
 
    // hasNext() returns true if the queue has more elements
    while (iterator.hasNext())
    {
      Connection curCon = iterator.next();
      
      //if connection was made less than 5 seconds ago, play celebration
      if(System.currentTimeMillis() - curCon.timestamp < 5000){
        int xPos = (xCoor[curCon.node1.pole] + xCoor[curCon.node2.pole])/2;
        int yPos = (yCoor[curCon.node1.pole] + yCoor[curCon.node2.pole])/2;
        
        for(int i = 1; i < 20; i++) {
         if(i%2 ==0){
            canvas.stroke(curCon.node1.usrColor,255,255);
            canvas.fill(curCon.node2.usrColor,255,255,100);
         } else {
             canvas.stroke(curCon.node2.usrColor,255,255);
            canvas.fill(curCon.node1.usrColor,255,255,100);
         }
         canvas.ellipse(xPos, yPos, (i*frameCount%CURRENT_CATENARY_END/4), (i*frameCount%CURRENT_CATENARY_END/4));
        }
      } else {
        //if it's been over 5 seconds, remove connection from queue
        iterator.remove();
      }
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
  if (topic.equals("catenaryUserUpdate")){
    //println("new User MQTT message: " + topic + " - " + new String(payload));

    String[] payloadArray = (new String(payload)).split(";");
     if(!payloadArray[0].equals("undefined")){
        int position = new Integer (payloadArray[0].trim());
        boolean playing = new Boolean (payloadArray[1].trim());
        int usrColor = new Integer (payloadArray[2].trim());
        
        //user color convert from 360 scale to 255;
        usrColor = (int)map(usrColor, 0, 360, 0 ,255);
        
        users[position].playing = playing;
        users[position].usrColor = usrColor;
        
        //println("### Pole: ", position);
        //println("### Colour: ", usrColor);
     }

  } else if (topic.equals("catenaryVolumeUpdate")) {
    //println("new update volume MQTT message: " + topic + " - " + new String(payload));
    String[] payloadArray = (new String(payload)).split(";");
    if(!payloadArray[0].equals("undefined")){
      int position = new Integer (payloadArray[0].trim());
      float volume = new Float (payloadArray[1].trim());
  
      users[position].volume = volume;
      
      //println("### Pole: ", position);
      //println("### Volume: ", volume);
    }
  }
}
