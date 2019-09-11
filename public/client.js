

//User info and objects that we're going to send between server and client side.
const user_dataJson = {}

// PHYSICS/STONES data
let timer;
let stoneBeingDragged;
let stoneCollided;
let deltaX, deltaY;
let tempVelX = 0;
let tempVelY = 0;
let velX = 0;
let velY = 0;
const startX = 800
const startY = 600
const radius_of_stone = 15 
// end of PHYSICS/STONES data

//Users and their colours
let player_colour1 = ""
let player_colour2 = ""
let usersInGame;
//END OF USERS and their colours

//Stones, will represent the stones on the canvas, stones with "player_type" will be player 1 and none will be player 2, and viewer will be either if the client either one of them leaves.
let stones = [
    {player_type: "player 1", name: `stone1`, x: startX +90, y: 500, velX: 0, velY: 0, direction: [0,0]},
    {player_type: "player 1", name: `stone2`, x: startX + 45 , y: 500, velX: 0, velY: 0, direction: [0,0]},
    {player_type: "player 1", name: `stone3`, x: startX +  15, y: 500, velX: 0, velY: 0, direction: [0,0]},
    {name: `stone4`, x: startX + 120, y: 500, velX: 0, velY: 0, direction: [0,0]},
    {name: `stone5`, x: startX + 150, y: 500, velX: 0, velY: 0, direction: [0,0]},
    {name: `stone6`, x: startX + 185, y: 500, velX: 0, velY: 0, direction: [0,0]}
  ]







//Libaries 
const window_width  = window.innerWidth
const window_height = window.innerHeight
const socket = io('http://' + window.document.location.host)
//END OF LIBARIES



/*=========================================MESSAGING HANDLER====================================================================*/
document.getElementById('message-box').addEventListener('keypress', (e) =>{
    var key = e.which || e.keyCode;
    let user_text= document.getElementById("message-box").value;
    if (key == 13 && user_text){ // 13 is enter
        printMessage();
             
    }
   
});


const printMessage = ()=>{
  let user_text= document.getElementById("message-box").value;
  if(!user_text)
    return;
  document.getElementById("message-box").value = "";
  socket.emit('createMessage',{text:user_text});
}
/*=========================================END OF MESSAGING HANDLER====================================================================*/
/*=========================================MUSIC HANDLER====================================================================*/
let toggleMusicButton = 0;
let audio = new Audio("musicList.mp3");
const music_button = document.getElementById("music-button")

const handleMusic = ()=>{
    
    
    if(toggleMusicButton % 2 == 0){
        music_button.style.backgroundColor = "#1dd1a1";
        music_button.style.color = "#fff";
        audio.play();
    }
    else{
        music_button.style.color = "#48dbfb";
        music_button.style.backgroundColor = "";
        audio.pause();
    }
    toggleMusicButton++;
}

music_button.addEventListener('click',handleMusic);
/*=========================================END OF MUSIC HANLDER====================================================================*/



/*=========================================READYING UP HANLDER====================================================================*/
let readyUpToggle = 0;
const ready_button = document.getElementById("ready-button");

let user_name = document.getElementById("user-name");
let user_color = document.getElementById("user-color");
const handleReadyUp = ()=>{
    
   
    //Change color when they're ready  and send that to sockets io so ik both players are ready.
    if(readyUpToggle % 2 == 0){
        ready_button.style.backgroundColor = "#1dd1a1";
        ready_button.style.color = "#fff";
        
        //Get user name
        if(user_name.value.length > 1 && (user_name.value !== "" || user_name.value !== " ") && user_name.value.trim().length >=1) 
            user_dataJson.name = user_name.value;
        else
            user_dataJson.name = "player 1"
        
        //Get user color
        if(user_color.value.length > 1 && (user_color.value !== "" || user_color.value !== " ") && user_color.value.trim().length >=1) 
            user_dataJson.color = user_color.value.toLowerCase();
        else
            user_dataJson.color = "red"

        //ready up the user anyway on all conditions because you will always get a username if input is avaliable  or not.
        user_dataJson.ready = true;  
        user_dataJson.player_type = "player"
        user_dataJson.score = 0;  
       
        
        
        //Send client user info to server side
        socket.emit("userPlay", user_dataJson);
       
    }
    else{
        ready_button.style.color = "#48dbfb";
        ready_button.style.backgroundColor = "";
      
        window.location.reload();
        
       
    }
    readyUpToggle++;
    
}

ready_button.addEventListener("click", handleReadyUp);
/*=========================================END OF READYING UP HANDLER====================================================================*/




/*=========================================STARTING GAME HANDLER====================================================================*/
const start_button = document.getElementById("start-button");
const player_menu = document.querySelector(".player-menu");
const player_game = document.querySelector(".player-game");
//Disable the game first, once both users ready then when we start, then we show it.
player_game.style.display = "none";
start_button.addEventListener("click", ()=>{
    socket.emit("isEnoughPlayers")
 })
/*=========================================END OF STARTING GAME HANDLER====================================================================*/



/*=========================================FUNCTIONS USED IN GENERAL====================================================================*/
function drawCanvas(){
    let canvas = document.getElementById('canvas');
  
  let small_stones_canvas = '';
  let large_stones_canvas = '';

  for (stone of stones) {

    if(stone.player_type){
        small_stones_canvas += `<ellipse   rx=${radius_of_stone-5}  cy=${stone.y} cx=${stone.x} stroke-width="5" stroke="grey" fill="${player_colour1}" />`;
        if (stone.y<200) {
            large_stones_canvas += `<ellipse   rx=${(radius_of_stone-5)*3}  cy=${stone.y*3} cx=${(stone.x-startX)*3} stroke-width="15" stroke="grey" fill="${player_colour1}" />`;
        }
    }
    else{
        small_stones_canvas += `<ellipse   rx=${radius_of_stone-5}  cy=${stone.y} cx=${stone.x} stroke-width="5" stroke="grey" fill="${player_colour2}" />`;
        if (stone.y<200) {
            large_stones_canvas += `<ellipse   rx=${(radius_of_stone-5)*3}  cy=${stone.y*3} cx=${(stone.x-startX)*3} stroke-width="15" stroke="grey" fill="${player_colour2}" />`;
        }
    }
    
  }

  canvas.innerHTML = `<svg id = "svg"xmlns = "http://www.w3.org/2000/svg" width = ${window_width} height = ${window_height + 20}>
  <ellipse  rx="225" id="svg_1" cy="300" cx="300" stroke-width="75" stroke="blue" fill="#fff"/>
  <ellipse  rx="75" id="svg_2" cy="300" cx="300" stroke-width="75" stroke="red" fill="#fff"/>
  <ellipse  rx="75" id="svg_3" cy="100" cx=${startX+100} stroke-width="25" stroke="blue" fill="#fff"/>
  <ellipse  rx="25" id="svg_4" cy="100" cx=${startX+100} stroke-width="25" stroke="red" fill="#fff"/>
  <line id="svg_5" y2=${startY} x2=${startX} y1="0" x1=${startX} stroke-width="1.5" stroke="#000" fill="none"/>
  <line id="svg_6" y2=${startY} x2= ${startX+200} y1=${startY} x1=${startX} stroke-width="1.5" stroke="#000" fill="none"/>
  <line id="svg_5" y2=${startY} x2=${startX+200} y1="0" x1=${startX+200} stroke-width="1.5" stroke="#000" fill="none"/>
  ${small_stones_canvas}
  ${large_stones_canvas}

  <div class="col-8 player-game">
  <h3 id="player-1" class="formatted">player1:</h3>
  <h4 id='player-1-name' class="formatted">${usersInGame ? "" + usersInGame[0].name : "tempName 1"}</h4> 
  <h3 id="player-2" class="formatted">player2:</h3>
  <h4 id='player-2-name' class="formatted">${usersInGame ? "" +usersInGame[1].name : "tempName 2"}</h4>

  

 
  </svg>`;
}


function getStoneLocation(mouseX,mouseY) {
    for (var i = 0; i < stones.length; i++) {
        let stone = stones[i];

        if((mouseX > stone.x - radius_of_stone && mouseX < stone.x + radius_of_stone)
         && (mouseY> stone.y - radius_of_stone && mouseY < stone.y + radius_of_stone)) {
          return stone;
        }
      }
      return null
    }




function handleMouseDown(e){

    console.log(" MOUSE X AND Y  ARE ", e.pageX , "     with Y "  , e.pageY)
    stoneBeingDragged = getStoneLocation(e.pageX, e.pageY);
    

	
	if(stoneBeingDragged != null ){
	   deltaX = stoneBeingDragged.x - e.pageX; 
	   deltaY = stoneBeingDragged.y - e.pageY;
	   $("#canvas").mousemove(handleMouseMove);
	   $("#canvas").mouseup(handleMouseUp);
	   
	}

    // Stop propagation of the event and stop any default 
    //  browser action
    e.stopPropagation();
    e.preventDefault();
    
    
    drawCanvas();
	
}
	
function handleMouseMove(e){
	
    
    var currX = stoneBeingDragged.x;
    var currY = stoneBeingDragged.y;
	

    stoneBeingDragged.x = e.pageX + deltaX;
    stoneBeingDragged.y = e.pageY + deltaY;
    
    tempVelX = stoneBeingDragged.x - currX;
    tempVelY = stoneBeingDragged.y - currY;
    

	e.stopPropagation();
    e.preventDefault();
    drawCanvas();
}

function handleMouseUp(e){
    		
    e.stopPropagation();

    if(tempVelY > 0){
      stoneBeingDragged.velX = - tempVelX * 4;
      stoneBeingDragged.velY = - tempVelY * 4;
    }
   

    //remove mouse move and mouse up handlers but leave mouse down handler
    $("#canvas").off("mousemove", handleMouseMove); //remove mouse move handler
    $("#canvas").off("mouseup", handleMouseUp); //remove mouse up handler
    
   

    
    let hitSound = new Audio("throw.wav");
        hitSound.play();
        setTimeout(()=>{
            hitSound = null;
        },2000) 
    
    
    drawCanvas();
}

//Update the movement of a stone, using both my logic/billard helper methods for shots, similar
function updateMovement(aStone) {
    hitBoundary(aStone)
  
    if (isCollision(aStone)) {
      let stoneCollided_distance = (aStone.x - stoneCollided.x)*(aStone.x - stoneCollided.x) + (aStone.y - stoneCollided.y)*(aStone.y - stoneCollided.y)
      if (Math.sqrt(stoneCollided_distance)<2*radius_of_stone-5) {
        let apartSpeed = 1
        aStone.velX += aStone.direction[0]*apartSpeed
        aStone.velY += aStone.direction[1]*apartSpeed
  
        stoneCollided.velX += stoneCollided.direction[0]*apartSpeed
        stoneCollided.velY += stoneCollided.direction[1]*apartSpeed

        //add music here for the ball collision
        
        let hitSound = new Audio("ball-hit-each-other.wav");
        hitSound.play();
        setTimeout(()=>{
            hitSound = null;
        },2000) 
      }
    }
    //write direction
    aStone.direction = generateDirection(aStone)
  
    if (Math.abs(aStone.velY)<0.98) {
        aStone.velY = 0
    }
    if (Math.abs(aStone.velX)<0.98) {
        aStone.velX = 0
    }

    aStone.y += aStone.velY
    aStone.velY *= 0.95
    aStone.x += aStone.velX
    aStone.velX *= 0.95
    //Update the new canvas
    drawCanvas()
}
  

//Getting the direction of the stone, would be an array, since i need two directions.
function generateDirection(aStone) {
    let direction = []
  
    if (aStone.velX>0) {
      if (aStone.velY>0) {
        direction = [1,1]
      }else {
        direction = [1,-1]
      }
    } else {
      if (aStone.velY>0) {
        direction = [-1,1]
      }else {
        direction = [-1,-1]
      }
    }
  
    return direction
}

//checking if the ball outside of the canvas
function hitBoundary(stoneMoving) {
    // left and right
    if (stoneMoving.x < startX + radius_of_stone) {
        
        stoneMoving.x = startX + radius_of_stone
        stoneMoving.velX = 0
        let hitSound = new Audio("wall-hit2.wav");
        hitSound.play();
        setTimeout(()=>{
            hitSound = null;
        },2000) 
    } else if (stoneMoving.x > startX + 200 - radius_of_stone) {
       
        stoneMoving.x = startX + 200 -  radius_of_stone
        stoneMoving.velX = 0
        let hitSound = new Audio("wall-hit2.wav");
        hitSound.play();
        setTimeout(()=>{
            hitSound = null;
        },2000) 
    }
    // upper and lower
    if (stoneMoving.y < radius_of_stone ) {
        
        stoneMoving.y = radius_of_stone
        stoneMoving.velY = 0
        
    } else if (stoneMoving.y > startY - radius_of_stone) {
        
        stoneMoving.y = startY - radius_of_stone
        stoneMoving.velY = 0
       
    }
}


//Billard code
function stoneCollision(stone1,stone2) {//change ball1, ball2 speed
    let dx = Math.abs(stone1.x - stone2.x)
    let dy = Math.abs(stone1.y - stone2.y)


    let stone1_tempVel = Math.sqrt(stone1.velX * stone1.velX + stone1.velY * stone1.velY)
  
    if (stone1_tempVel === 0) {//handle error divide 0
        stone1_tempVel += 1e-12
    }
  
    let deltaDistance = Math.sqrt(dx * dx + dy * dy)
  
    if (deltaDistance==0) {
      console.log("distance is zero!")
      return
    }
  
    let angle_b = Math.asin(dy/deltaDistance)
    let angle_d = Math.asin(Math.abs(stone1.velX)/stone1_tempVel)//error!!
    let angle_a = (Math.PI / 2) - angle_b - angle_d;
    let angle_c = angle_b - angle_a;
  
  
    let v1 = stone1_tempVel * Math.abs(Math.sin(angle_a))
    let v2 = stone1_tempVel * Math.abs(Math.cos(angle_a))
  
    let v1x = v1 * Math.abs(Math.cos(angle_c));
    let v1y = v1 * Math.abs(Math.sin(angle_c));
    let v2x = v2 * Math.abs(Math.cos(angle_b));
    let v2y = v2 * Math.abs(Math.sin(angle_b));
    
    //set horizontal directions
    if(stone1.velX > 0){//stone1 is going right
      if(stone1.x < stone2.x) {
        v1x = -v1x;
  
      } else {
        v2x = -v2x;
      }
    } else {
      if(stone1.x > stone2.x){
        v2x = -v2x;
      } else {
        v1x = -v1x;
      }
    }
    
    //set vertical directions
    if(stone1.velY > 0){//stone1 is going right
      if(stone1.y < stone2.y) {
        v1y = -v1y;
      }else{
        v2y = -v2y;
      }
    }else {
      if(stone1.y > stone2.y){
        v2y = -v2y;
      }else{
        v1y = -v1y;
      }
    }
  
    stone1.velX = v1x
    stone1.velY = v1y
    stone2.velX = v2x
    stone2.velY = v2y
  
    return
}
  

function handleTimer() {
    let stone_coordinates = {}
    for (stone of stones) {
      if (stone.velX !==0 || stone.velY !==0) {

        stone_coordinates.name  =stone.name,
        stone_coordinates.x     =stone.x,
        stone_coordinates.y     =stone.y,
        socket.emit("stonesUpdate",JSON.stringify(stone_coordinates))
      }
      updateMovement(stone)
      
    }
  }
  
  function isCollision(stoneMoving) {
    for (stone of stones) {
      if (stone.velX !== 0 || stone.velY !== 0) {
        continue
      }
  
      let deltaDistance = (stoneMoving.x - stone.x)*(stoneMoving.x-stone.x) + (stoneMoving.y-stone.y)*(stoneMoving.y-stone.y)
      if (deltaDistance>0 && Math.sqrt(deltaDistance)<2*radius_of_stone-5) {
        stoneCollided = stone
        stoneCollision(stoneMoving,stoneCollided)
        return true
      }
    }
  }



/*=========================================END OF FUNCTIONS USED IN GENERAL====================================================================*/



//=========================================================SENDING DATA TO SERVER/HANDLING SOCKETS=======================================================


//check if users have same name/color
socket.on("matchMakingError", ()=>{
    alert("You need to choose a different username and color from the other play!")
});

//Connect and join players, if players arent ready(basically if one player is ready and the other isnt then alert the user)
socket.on('connectPlayersAndJoin', (data)=>{
    socket.on("playerIsNotReady",()=>{
        alert("You need atleast two players(you and someone else) to be ready in order to start the game ")
    }) 
  });

let players =0;
let player_typeIs = ""
socket.on("connect",()=>{
    console.log("Connected to the server")
})

socket.on("disconnect", ()=>{
    console.log("Discconeted from the server")
})


//once the match making queue is full, we start the game
socket.on("launchGame", (data)=>{
    
     
    usersInGame = data
    //hide menu
    player_menu.style.display = "none";
    //show game play
    player_game.style.display = "none";

    document.querySelector(".jumbotron").style.display = "none";
    document.querySelector(".page-footer").style.display = "none"
    if(data[0].player_type === 'player 1'){
        player_colour1 = data[0].color
      
    }
    if(data[1].player_type === 'player 2'){
        player_colour2 = data[1].color
    }
    
    
   
    //user 1 data:
    document.getElementById("player-1-name").innerHTML = data[0].name; 
    document.getElementById("player-1-score").innerHTML = data[0].score;

    //user 2 data:
    document.getElementById("player-2-name").innerHTML = data[1].name; 
    document.getElementById("player-2-score").innerHTML = data[1].score;

 
    //Register event shooter for all clients.
    $("#canvas").mousedown(handleMouseDown)
    drawCanvas()
    timer = setInterval(handleTimer,30)
   
})




//Send messages to all clients and handle them.
socket.on('createMessage',(data)=>{
    let messages_catalog = document.getElementById("message-catalog");
    let new_message = document.createElement("div");
    new_message.className = "a-new-message";
   
    
        new_message.innerHTML = `Viewer: ${data.text}`;
    
        new_message.innerHTML = `Viewer: ${data.text}`;
    
    

    messages_catalog.appendChild(new_message);

  });


//Update the moemvent of stones
socket.on("stonesUpdate",function (data) {
    console.log(`received data : ${data}`);
    let parsedInfo = JSON.parse(data)
  
    for (stone of stones) {
      if (parsedInfo.name === stone.name) {
        stone.x = parsedInfo.x
        stone.y = parsedInfo.y
        updateMovement(stone)
      }
    }
})