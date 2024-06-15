const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const User = require('./models/user');
const app = express();

const mongoose = require('mongoose');

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById("666d95ea679ca87b859baefc")
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect("mongodb+srv://parasyerunkar:AeaICWhXR5teNZd7@store.axahzoz.mongodb.net/?retryWrites=true&w=majority&appName=Store")
.then(result => {
  User.findOne().then(user => {
    if (!user){
      const user = new User({
        name:'tester001',
        email:'abc@gmail.com',
        cart : {
          items:[]
        }
      });
      user.save();
    }
  });
  app.listen(3000);
})
.catch(err => {
  console.log(err);
});