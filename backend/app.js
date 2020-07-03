//SY0MI2JYJbDTnfgE
//Mpp63fCAKNiLWPYs

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require('fs');
const json2csv = require('json2csv').parse;
//const moment = require("moment");

const Post = require('./models/post');
const Limit = require('./models/limit');
const Mqtt = require('./models/mqtt');
const DataStream = require('./models/stream');
const User = require("./models/user");
const History = require("./models/historybin");

var env = process.env.NODE_ENV || 'development';
var config = require('./helper')[env];

const checkAuth = require("./middleware/check-auth");

const app = express();

//moment().format();

var connectionString = "mongodb+srv://" + config.database.username + ":" + config.database.password + "@cluster0-izhg8.mongodb.net/binData?retryWrites=true&w=majority"

mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
  console.log('Connected to Database');
})
.catch((error) => {
  console.log(error);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});


// console.log(limit);
//   Limit.updateOne({_id:"5e9ef66d8fedcf8447f55350"}, limit)
//     .then(result => {
//       console.log(result);
//       res.status(200).json({
//         message: "Max/Mins Updated"
//       });
//     });

app.post('/api/writefile',
checkAuth,
(req, res, next) => {
  const fields = ['timestream', 'tempstream', 'moisturestream', 'foodstream', 'foodamountstream'];
  const opts = { fields };
  //console.log(req.body);
  const csv = json2csv(req.body, opts);
  fs.writeFileSync('data.csv', csv)
  console.log("Downloaded File");

  res.status(201).json({
    message: 'Data Saved'
  });
});
    //console.log(csv);
// .then(result => {
//   res.status(201).json({
//     message: 'Downloaded File'
//   });
// })
// .catch(err => {
//   console.log(err);
//   res.status(500).json({
//     error: err
//   });
// });

app.put("/api/reset/:title",
checkAuth,
(req, res, next) => {
  console.log("Here?");
  console.log(req.params.title);
 // console.log(post);
  Post.updateOne({title: req.params.title},
    { $set: {
      id: req.body.id,
      title: req.body.title,
      status: req.body.status,
      temp: req.body.temp,
      moisture: req.body.moisture,
      timestamp: req.body.timestamp,
      daysleft: req.body.daysleft,
      dayStart: null,
      dayEnd: null,
      errorstream: req.body.errorstream,
      tempstream: req.body.tempstream,
      moisturestream: req.body.moisturestream,
      foodstream: req.body.foodstream,
      foodamountstream: req.body.foodamountstream,
      timestream: req.body.timestream
    }
  })
  .then(result => {
    res.status(201).json({
      message: 'Bin Reset successfully'
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

app.get("/api/gethistory",
checkAuth,
(req, res, next) => {
  History.find()
    .sort({id:1})
    .then(documents => {
     // console.log(documents);
      res.status(200).json({
        message: "Posts fetched successfully!",
        history: documents
      });
    });
});

app.post("/api/history",
checkAuth,
(req, res, next) => {
  console.log(req.body.dayEntered);
  const historybin = new History({
    title: req.body.title,
    dayStart: req.body.dayStart,
    dayEnd: req.body.dayEnd,
    dayEntered: req.body.dayEntered,
    harvestAmount: req.body.harvestamount,
    errorstream: req.body.errorstream,
    tempstream: req.body.tempstream,
    moisturestream: req.body.moisturestream,
    foodstream: req.body.foodstream,
    foodamountstream: req.body.foodamountstream,
    timestream: req.body.timestream,
  });
  //console.log(historybin);
  historybin.save()
  .then(result => {
    res.status(201).json({
      message: 'History Saved',
      result: result
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

app.get("/api/mqtt",
checkAuth,
(req, res, next) => {
  //console.log(res);
  Mqtt.find()
    .sort({id:1})
    .then(documents => {
      console.log(documents);
      res.status(200).json({
        message: "Mqtt Test!",
        mqtt: documents
      });
    });
});

app.post("/api/posts",
checkAuth,
(req, res, next) => {
  console.log("Here?");
  const post = new Post({
    id: req.body.id,
    title: req.body.title,
    status: req.body.status,
    temp: req.body.temp,
    moisture: req.body.moisture,
    timestamp: req.body.timestamp,
    daysleft: req.body.daysleft,
    dayStart: null,
    dayEnd: null,
    errorstream: req.body.errorstream,
    tempstream: req.body.tempstream,
    moisturestream: req.body.moisturestream,
    foodstream: req.body.foodstream,
    foodamountstream: req.body.foodamountstream,
    timestream: req.body.timestream,
  });
 // console.log(post);
  post.save();
  res.status(201).json({
    message: 'Post added successfully'
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

app.post("/api/posts/:title",
checkAuth,
(req, res, next) => {
  //console.log(req.params.title);
  //console.log(req.params);
  Post.updateOne({title: req.params.title}, {
    $push: {
      tempstream: req.body.temperature,
      moisturestream: req.body.moisture,
      foodstream: req.body.food,
      foodamountstream: req.body.foodamount,
      timestream: req.body.timestamp,
    }
  })
  .then(result => {
    console.log(result);
    res.status(200).json({
      message: "Stream Data Updated!"
    });
  });
});

app.post("/api/error/:title",
checkAuth,
(req, res, next) => {
  console.log(req.params.title);
  console.log(req.body);
  Post.updateOne({title: req.params.title}, {
    $push: {
      errorstream: req.body.errorstring,
    }
  })
  .then(result => {
    console.log(result);
    res.status(200).json({
      message: "Error Data Updated!"
    });
  });
});

app.post("/api/food/:title",
checkAuth,
(req, res, next) => {
  //console.log(req.params.title);
  //console.log(req.body);
  const intNum = parseInt(req.body.foodIndex);
  const foodString = "foodstream." + intNum;
  const foodAString = "foodamountstream." + intNum;

  Post.updateOne({title: req.params.title}, {
    $set: {
      [foodString]: req.body.foodType,
      [foodAString]: req.body.foodAmount
    },
  })
  .then(result => {
    console.log(result);
    res.status(200).json({
      message: "Stream Data Updated!"
    });
  });
});

app.get("/api/posts",
checkAuth,
(req, res, next) => {
  Post.find()
    .sort({id:1})
    .then(documents => {
     // console.log(documents);
      res.status(200).json({
        message: "Posts fetched successfully!",
        bins: documents
      });
    });
});

app.delete("/api/posts/:title",
checkAuth,
(req, res, next) => {
  //console.log("TESTED HERE");
  //console.log(req.params.title);
  Post.deleteOne({
    title: req.params.title})
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "Post Deleted!"
      });
  });
});

app.put("/api/posts/:title",
checkAuth,
(req, res, next) => {
  console.log(req.body.startDate, req.body.endDate);
  Post.findOneAndUpdate({title: req.params.title}, {
    dayStart: req.body.startDate,
    dayEnd: req.body.endDate,
  })
  .then(result => {
    //console.log(result);
    res.status(200).json({
      message: "Bin Date Data Updated!"
    });
  });
});

app.put("/api/limits",
checkAuth,
(req, res, next) => {
  //console.log("TESTED HERE");
  //console.log(req.params.title);
  const limit = new Limit({
    _id: "5e9ef66d8fedcf8447f55350",
    tempmin: req.body.tempmin,
    tempmax: req.body.tempmax,
    moisturemin: req.body.moisturemin,
    moisturemax: req.body.moisturemax
  })
  console.log(limit);
  Limit.updateOne({_id:"5e9ef66d8fedcf8447f55350"}, limit)
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "Max/Mins Updated"
      });
    });
});

app.post("/api/stream",
checkAuth,
(req, res, next) => {
  const stream = new DataStream({
    binname: req.body.binname,
    tempstream: req.body.tempstream,
    moisturestream: req.body.moisturestream,
    foodstream: req.body.foodstream,
    foodstreamamount: req.body.foodstreamamount,
    timestream: req.body.timestream,
  });
  //console.log(stream);
  stream.save();
  res.status(201).json({
    message: 'Post added successfully'
  });
});

app.delete("/api/stream/:title",
checkAuth,
(req, res, next) => {
  DataStream.deleteOne({
    title: req.params.title})
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "Post Deleted!"
      });
  });
});


app.get("/api/limits",
checkAuth,
(req, res, next) => {
  console.log("Got Here");
  Limit.find()
    .sort({id:1})
    .then(documents => {
      //console.log(documents);
      res.status(200).json({
        message: "Posts fetched successfully!",
        limits: documents
      });
    });
});

app.post("/api/signup", (req, res, next) => {
  console.log(req.body);
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash
    });
    user.save()
    .then(result => {
      res.status(201).json({
        message: 'User Created',
        result: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
  });
});

app.post("/api/login", (req, res, next) => {
  let fetchedUser;
  console.log(req.body.email);
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: "Auth Failed"
        });
      }
      //FOund User
      console.log("found user: " + user);
      fetchedUser = user;
      return  bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        console.log("User Error");
        return res.status(401).json({
          message: "Auth Failed"
        });
      }
      //Valid PW

      //const token = "";
      console.log("Did I get here? " + fetchedUser + config.mqtt.admin);
      if (fetchedUser.email != config.mqtt.admin) {
        const token = jwt.sign(
          {email: fetchedUser.email, userId: fetchedUser._id},
          "secret_this_should_be_longer",
          { expiresIn: "1h" }
        );
        res.status(200).json({
          token: token,
          expiresIn: 3600
        });
      } else {
        //Add a different token type (does not expire) if admin logs in
        //Logs
        console.log("Admin User");
        const token = jwt.sign(
          {email: fetchedUser.email, userId: fetchedUser._id},
          "secret_this_should_be_longer"
        );
        res.status(200).json({
          token: token,
          expiresIn: 5555
        });
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(401).json({
      message: "Auth Failed"
    });
  });
});

module.exports = app;
