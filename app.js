const { error } = require("console");
const express = require("express");
const { getPriority } = require("os");
const app = express();
const path = require("path");
const port = 3000;
const fs = require('fs');
const multer = require('multer');

const server = require("http").createServer(app);
const { Server } = require('node-osc');
const io = require("socket.io")(server);

const { SerialPort, ReadlineParser } = require('serialport')
const Aport = new SerialPort({ path: "COM5", baudRate: 115200 })
const parser = new ReadlineParser()
Aport.pipe(parser)


var oscServer = new Server('3333', 'localhost', () => {
    console.log(" osc server listening"); ``
});

oscServer.on('bundle', (data) => {
    // console.log(data);
    let elementLength = data.elements.length - 1;
    data.elements[elementLength][1];
    io.emit('getdata', data.elements[elementLength][1]);
    //console.log(data.elements[elementLength][1]);
    var message = (data.elements[elementLength][1]).toString();
    console.log(message);
    Aport.write(message);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer to handle file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'asset', 'images'));
    },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${file.fieldname}${fileExtension}`;
        cb(null, fileName);
    },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.fields([{ name: 'image1' }, { name: 'image2' }, { name: 'image3' }, { name: 'image4' }, { name: 'image5' }]), (req, res) => {
    const numberOfImages = 5;

    for (let i = 1; i <= numberOfImages; i++) {
        const file = req.files[`image${i}`];

        if (!file) {
            console.log(`No file uploaded for image${i}`);
            continue;
        }

        const fileName = path.basename(file[0].path);
        io.emit('newImage', `/asset/images/${fileName}`);
    }

    res.send('Images uploaded successfully!');
});

server.listen(port, () => console.log(`server running on port ${port}`));

app.use("/asset", express.static(path.join(__dirname, "asset")));

app.get("/", (req, res) => {
    res.render("page.ejs");
});
app.get("/btn", (req, res) => {
    res.render("btn.ejs");
});
app.get("/image", (req, res) => {
    res.render("image.ejs");
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
    socket.on("on", () => {
        //    console.log('socket on triggered');
        //Aport.write('open', function() {
        Aport.write('1 ', (err) => {
            if (err) {
                return console.log('Error on write: ', err.message)
            }
            //console.log('message written')
        });
        //});
    });

    socket.on("off", () => {
        // console.log('getting off');
        Aport.write('0 ', (err) => {
            if (err) {
                return console.log('Error on write: ', err.message)
            }
            // console.log('message written')
        });
    });

    socket.on("sendImg", (e) => {
        console.log(e);
        Aport.write(e, (err) => {
            if (err) {
                return console.log('Error on write: ', err.message)
            }
            // console.log('message written')
        });
        if (e == 1) {
            io.emit('getImg', 1)
        }
        if (e == 25) {
            io.emit('getImg', 2)
        }
        if (e == 50) {
            io.emit('getImg', 3)
        }
        if (e == 75) {
            io.emit('getImg', 4)
        }
        if (e == 100) {
            io.emit('getImg', 5)
        }

    })

    socket.on("sendstops", (e) => {
        console.log(e);
        io.emit("getstops", e);
    })
});
