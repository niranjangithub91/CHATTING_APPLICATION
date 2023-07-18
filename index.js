///SERVER SIDE FUNCTIONALITY TEST COMPLETED WORKING SMOOTH




//This helps to create the authentication line of google using passport 
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();



//Initializing socket and which helps to crrate server client connection
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
//The above process helps us to create an http server
const users={};//This command helps us to see the user who are there as it is stored in the array
const links={};
let array=[];
//The below process helps us to open an home age using the html file named index.html



// Configure Passport
passport.use(
    new GoogleStrategy(
      {
        clientID: '833219992504-mdsq1pb079i5f4kggil1gcqdcq8nifi6.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: '/auth/google/callback',
      },
      (accessToken, refreshToken, profile, done) => {
        // This function is called when the authentication is successful
        // You can customize the logic here to handle user data as per your requirements
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);
        console.log('Profile:', profile);
        done(null, profile);
      }
    )
  );
  
  passport.serializeUser((user, done) => {
    // Serialize user data to store in the session or database
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    // Deserialize user data from the session or database
    done(null, user);
  });
  // Set up Express middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Configure and use Express session
  app.use(
    session({
      secret: 'qwert12345',
      resave: false,
      saveUninitialized: false,
    })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());

// Define routes
app.get('/',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication, redirect to the desired page
      const q=req.user.displayName
      const m=req.user.photos;
      const z=m[0];
      const w=z.value;
      array.push(q,m,z,w);
      res.sendFile(__dirname + '/index.html');
});



io.on('connection', (socket) => {
  let q=array[0];
  let m=array[1];
  let z=array[2];
  let w=array[3];
  array.length = 0;
  console.log('a user connected');
  console.log(q);
  console.log(m);
  console.log(z);
  console.log(w)
  //These are custom events which are being created
  users[socket.id]=q;//appending user in the array
  links[socket.id]=w;
  socket.broadcast.emit('user-joined',q,w)//this allows the users to get to know that new users have joined
  socket.on('send',message=>{
      socket.broadcast.emit('receive',{message:message,name:users[socket.id]})
  });
  socket.on('disconnect',message=>{
    socket.broadcast.emit('left',users[socket.id],links[socket.id]);
    delete users[socket.id];
    delete links[socket.id];
  });
});


  //This process tells us the port in which the server is listeneing in
  server.listen(3000, () => {
    console.log('listening on *:3000');
  });

