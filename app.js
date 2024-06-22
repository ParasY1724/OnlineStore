require('dotenv').config();

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const errorController = require('./controllers/error');
const User = require('./models/user');
const app = express();
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const multer = require('multer');

const MONGODB_URI = process.env.MONGODB_URI;


const store = new MongoDBStore({
  uri : MONGODB_URI,
  collection : 'sessions'
});

const fileStorage = multer.diskStorage({
  destination: (req,file,cb) => {
    cb(null, 'images');
  } ,
  filename: (req,file,cb) => {
    cb(null,file.originalname);
  }
});



const fileFliter = (req,file,cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null,true);
  }
  else{
    cb(null,false);
  }
}

const crsfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join( 'images')));


app.use(multer({storage : fileStorage , fileFilter : fileFliter}).single('image'));

app.use(session({secret : 'my secret', resave : false,saveUninitialized : false ,store:store}));

app.use(crsfProtection);

app.use(flash());

app.use((req,res,next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (user){
        req.user = user;
      }
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});



app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


app.use(errorController.get404);

app.get('/500',errorController.get500);


mongoose.connect(MONGODB_URI)
.then(result => {
  app.listen(3000);
})
.catch(err => {
  console.log(err);
});