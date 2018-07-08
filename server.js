const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const cors=require('cors');
var mysql=require('mysql')
const app=express();

app.use(bodyParser.json()); 

var connection=mysql.createConnection({
  host:'sql12.freemysqlhosting.net',
  user:'sql12246629',
  password:'984M3ywwan',
  database:'sql12246629'
})

app.use(cors())




connection.connect(function(err) {
  if (err) throw err
  console.log('You are now connected...')
  //create table in database and add admin user in it
  connection.query('create table IF NOT EXISTS user(user_name varchar(255) PRIMARY KEY,Password varchar(255),College_Name varchar(255),Email varchar(255),Mobile Varchar(12))',function(err,data){
      if(err){
        console.log(err)
      }
  })
  connection.query('create table IF NOT EXISTS books(user_name varchar(255),Book_Name varchar(255),Author_Name varchar(255),Book_Condition varchar(255),Price int,FOREIGN KEY(user_name) REFERENCES user(user_name) ON DELETE CASCADE)',function(err,data) {
    if(err){
      console.log(err);
    }
  })
  connection.query('create table IF NOT EXISTS Book_Req(user_name varchar(255),Book_Name varchar(255),Requester varchar(255),price Integer(12),Author_Name varchar(255),Req_Phone varchar(12))',(err,result)=>{
    if(err){
      console.log(err);
    }
  })
})

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

app.post('/register',(req,res)=>{
  x=req.body;
  // console.log(x)
  arr=[];
  arr.push(req.body['Name'],req.body['Password'],req.body['CollegeName'],req.body['Email'],req.body['PhoneNumber'])
  // console.log(arr)
  connection.query("insert into user(user_name,Password,College_Name,Email,Mobile) values (?)",[arr],function(err,data){
    if(err){
      console.log(err)
      res.send({a:'User Already Exists'})
    }
    else{
      res.send({a:'User Registered Successfully'})
    }
})
})

app.post('/getUsers',(req,res)=>{
  connection.query('select user_name,Password from user where user_name=(?)',req.body['user'],(err,result)=>{
    if(err){
      console.log(err);
    }
    else{
      res.send(result);
    }
  })
})


app.get('/getBooks',(req,res)=>{
  connection.query('select * from books',(err,result)=>{
    if(err){
      console.log(err);
    }
    else{
      res.send(result);
    }
  })
})


app.post('/addRequest',(req,res)=>{
  // console.log(req.body)
  arr=[];
  arr.push(req.body['user_name'],req.body['Book_Name'],req.body['requester'],req.body['Price'],req.body['Author_Name'])
  connection.query("select * from Book_Req where user_name='"+arr[0]+"'and Book_Name='"+arr[1]+"'and requester='"+arr[2]+"'",function(err,result){
    // console.log(result.length)
    if(result.length===0){
      connection.query("select Mobile from user where user_name='"+req.body['requester']+"'",(err,result)=>{
        // console.log(result[0].Mobile)
        arr.push(+result[0].Mobile)
        // console.log(arr)
        connection.query('insert into Book_Req(user_name,Book_Name,requester,price,Author_Name,Req_Phone) values (?)',[arr],(err,data)=>{
          if(err){
            console.log(err)
          }
          else{
            res.send({a:'Request Added'})
          }
        })
    })
    }
    else{
      res.send({a:'Request is Already There!!'})
    }
  })

})


app.post('/deleteRequest',(req,res)=>{
  // console.log(req.body)
  connection.query("DELETE FROM Book_Req Where user_name='"+req.body['user_name']+"'and Book_Name='"+req.body['Book_Name']+"'and requester='"+req.body['Requester']+"'",(err,result)=>{
    if(err){
      console.log(err);
    }
    else{
      res.send(result)
    }
  })
})


app.post('/getRequest',(req,res)=>{
  connection.query("select * from Book_Req where requester='"+req.body['requester']+"'",(err,result)=>{
    if(err){
      console.log(err);
    }
    else{
      res.send(result);
    }
  })
})


app.post('/getRequestbyUser',(req,res)=>{
  console.log(req.body)
  connection.query("select * from Book_Req where user_name='"+req.body['user_Name']+"'",(err,result)=>{
    if(err){
      console.log(err);
    }
    else{
      // console.log(result)
      res.send(result);
    }
  })
})


app.post('/addBook',(req,res)=>{
  arr=[];
  arr.push(req.body['user_name'],req.body['Book_Name'],req.body['Author_Name'],req.body['Book_Condition'],req.body['Price']);
  // console.log(arr)
  connection.query('insert into books(user_name,Book_Name,Author_Name,Book_Condition,Price) values (?)',[arr],(err,result)=>{
    if(err){
      console.log(err);
    }
    else{
      res.send(result);
    }
  })
})


// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

// EJS
app.set('view engine', 'ejs');

// Public Folder
app.use(express.static('./public'));

app.get('/', (req, res) => res.render('index'));

app.post('/upload', (req, res) => {
  console.log(req.file);
  
  upload(req, res, (err) => {
    if(err){
      res.render('index', {
        msg: err
      });
    } else {
      if(req.file == undefined){
        res.render('index', {
          msg: 'Error: No File Selected!'
        });
      } else {
          console.log(req)
        res.render('index', {
          msg: 'File Uploaded!',
          file: `uploads/${req.file.filename}`
        });
      }
    }
  });
});

const port = 4201;
app.use('/',express.static(__dirname+'/public'))
app.listen(process.env.PORT||port, () => console.log(`Server started on port ${port}`));