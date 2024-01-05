const { error } = require("console");
const express = require("express");
const { getPriority } = require("os");
const app = express();
const path = require("path");
const port = 3000;
const server = require("http").createServer(app);
const {Server} = require('node-osc');
const io = require("socket.io")(server);
const fs = require('fs')

const { SerialPort, ReadlineParser } = require('serialport')
const Aport = new SerialPort({ path: "COM5", baudRate: 115200 })
const parser = new ReadlineParser()
Aport.pipe(parser)




var oscServer = new Server('3333', 'localhost', ()=>{
    console.log(" osc server listening");``
});

oscServer.on('bundle',(data)=>{
    // console.log(data);
    let elementLength=data.elements.length-1;
    data.elements[elementLength][1];
    io.emit('getdata', data.elements[elementLength][1]);
    //console.log(data.elements[elementLength][1]);
    var message =(data.elements[elementLength][1]).toString();
    console.log(message);
    Aport.write(message);
});

server.listen(port, () => console.log(`server running on port ${port}`));

app.use("/asset", express.static(path.join(__dirname, "asset")));

app.get("/", (req, res) => {
    res.render("page.ejs");
});
app.get("/btn", (req, res) => {
    res.render("btn.ejs");
});



// parser.on('data', (data) => {
//     console.log(data);
//     io.emit('getdata', data);
//     // try {
//     //     io.emit('data', data);
//     // } catch (error) {
//     //     console.log('Error on emit:', error.message);
//     // }
  
// });



io.on("connection", function (socket) {
    console.log(`connected`);
    socket.on("on",()=>{
    //    console.log('socket on triggered');
        //Aport.write('open', function() {
        Aport.write('1 ',(err)=>{
            if (err) {
                return console.log('Error on write: ', err.message)
              }
              //console.log('message written')
        });
    //});
     });

    socket.on("off",()=>{
       // console.log('getting off');
        Aport.write('0 ',(err)=>{
            if (err) {
                return console.log('Error on write: ', err.message)
              }
             // console.log('message written')
        });
    });

    socket.on("sendImg",(e)=>{
        console.log(e);
        Aport.write(e,(err)=>{
            if (err) {
                return console.log('Error on write: ', err.message)
              }
             // console.log('message written')
        });
        if(e == 1){
            io.emit('getImg',1)
        }
        if(e == 25){
            io.emit('getImg',2)
        }
        if(e == 50){
            io.emit('getImg',3)
        }
        if(e == 75){
            io.emit('getImg',4)
        }
        if(e == 100){
            io.emit('getImg',5)
        }
      
    })

    socket.on("sendstops",(e)=>{ 
        console.log(e);
        io.emit("getstops", e);
    })
});
