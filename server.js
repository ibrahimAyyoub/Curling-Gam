const app = require('http').createServer(handler)
const io = require('socket.io')(app) //this is how we communicate between server and client we use io........
const fs = require("fs");
const url = require("url");
const PORT = 3000;
const ROOT_DIR = "public"; //dir to serve static files from
//END OF LIBRAES/APIS


//Global user state
let current_user =[]
let match_making_queue  = []



//an object of mimeTypes so that the server is able to handle and serve the the types
const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  txt: "text/plain"
};

/* Helper function to get file type */
function get_mime(filename)
{
  let ext, type
  for (let ext in MIME_TYPES) {
    type = MIME_TYPES[ext]
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return type
    }
  }
  return MIME_TYPES["txt"]
}

//HANDLE SERVER STATE/SERVE FILES
function handler(request, response)
{
    let urlObj = url.parse(request.url, true, false)
 

    let receivedData = ""

    //attached event handlers to collect the message data
    request.on("data", function(chunk) {
      receivedData += chunk
    })

    //event handler for the end of the message
    request.on("end", function() {
     

      if (request.method == "GET") {
        //handle GET requests as static file requests
        fs.readFile(ROOT_DIR + urlObj.pathname, (err, data)=> {
          if (err) {
            //report error to console
            console.log("ERROR: " + JSON.stringify(err))
            //respond with not found 404 to client
            response.writeHead(404)
            response.end(JSON.stringify(err))
            return
          }
          response.writeHead(200, {
            "Content-Type": get_mime(urlObj.pathname)
          })
          response.end(data)
        })
      }
    })
  }

//CHECKING IF THE MATCHING QUEUE IS FULL, if so, game is ready to start
const checkPlayers = (socket)=>{
    socket.on("isEnoughPlayers", ()=>{
      if(match_making_queue.length === 2)
        //If there are two players then start game, else dont!
        io.emit("launchGame",match_making_queue);
      else
      //IF the other player isnt ready then going to alert the current user thats requsting to start the game
        socket.emit("playerIsNotReady")

    })
}



//If a client connects, then register them as a player.
const player_connected = (socket)=> {

	socket.on("userPlay", (data)=>{
    
    for(let index = 0; index < current_user.length;index++){
      if(current_user[index].name === data.name && current_user[index].color === data.color){
        socket.emit("matchMakingError");
        return;
      }
    }
    
    if(match_making_queue.length === 0)
      data.player_type = "player 1"
    else if(match_making_queue.length === 1)
      data.player_type = "player 2"
    else
    {
      data.player_type= "spectator"
      socket.emit('cameraSpectator');
    }


    //Once done creating the user, going to push it temparly. incase another user wants another name that was already here.
    current_user.push(data);
    
    socket.usersToCheck = data;
    
    //Pushing it to the Queue, so its easy to start a game.
    match_making_queue.push(data);
    const user_roles = {
      player_type: data.player_type, 
      name: data.name,
      color: data.color
    };

    const user_roles_stringified = JSON.stringify(user_roles);


    //join a player to a lobby
		socket.emit("connectPlayersAndJoin", user_roles_stringified);
    
    //Check the QUEUE and if players are ready to play
    checkPlayers(socket);
    
        
	});
};


//If a client leaves, then make the specator play.
var player_left = function(socket){
	//if a player leaves
	socket.on("disconnect", (data)=>{
    //Check the user that left and itterate through the match_making Queee
    if(socket.usersToCheck){
        match_making_queue = []
        socket.usersToCheck = {}
    }
    else{return;}
	});
};

// Passing new connections here.
io.sockets.on("connection", function(socket){
  player_connected(socket);
  player_left(socket);
  
  //When a user sends the message and now its being listened to right now, I'm going to broadcast it to everyone
  socket.on("createMessage", (data)=>{
  io.emit("createMessage",data)
  })

  socket.on("stonesUpdate",function (data) {
    console.log(data);
    io.emit("stonesUpdate",data)
  })
  
});

/* Start server */
app.listen(PORT,()=>{
  console.log("SERVER IS UP RUNNING ON PORT 3000")
  console.log("TO TEST :")
  console.log("http://localhost:3000/index.html")
});
 

