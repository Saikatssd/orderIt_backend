
// require('dotenv').config({ path: './config/config.env' });
// const express = require("express");
// const app = express();
// const path = require("path");
// const cookieParser = require("cookie-parser");
// const bodyParser = require("body-parser");
// const cloudinary = require("cloudinary");
// const fileUpload = require("express-fileupload");
// const errorMiddleware = require("./middlewares/errors");
// const cors = require('cors');

// // app.use(cors({
// //   origin: 'http://localhost:5173',
// // }));

// app.use(
//   cors({
//     origin: ["http://localhost:5173"],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );


// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // console.log(process.env.CLOUDINARY_CLOUD_NAME)
// // app.use(express.json());
// // app.use(bodyParser.urlencoded({ extended: true }));
// // app.use(cookieParser());
// // app.use(fileUpload());

// const foodRouter = require("./routes/foodItem");
// const restaurantRouter = require("./routes/restaurant");
// const menuRouter = require("./routes/menu");
// const couponRouter = require("./routes/couponRoutes");
// const reviewRouter = require("./routes/reviewsRoutes");
// const orderRouter = require("./routes/order");
// const authRouter = require("./routes/auth");

// const paymentRouter = require("./routes/payment");

// app.use(express.json({ limit: '30kb' }));
// app.use(express.urlencoded({ extended: true, limit: '30kb' }));

// app.use("/api/v1/eats", foodRouter);
// app.use("/api/v1/eats/menus", menuRouter);
// app.use("/api/v1/eats/stores", restaurantRouter);
// app.use("/api/v1/eats/orders", orderRouter);
// app.use("/api/v1/reviews", reviewRouter);
// app.use("/api/v1/users", authRouter);
// app.use("/api/v1/payment", paymentRouter);
// app.use("/api/v1/coupon", couponRouter);


// app.get("/", (req, res) => {
//   res.send("Hello");
// });

// app.set("view engine", "pug");
// app.set("views", path.join(__dirname, "views"));

// app.all("*", (req, res, next) => {
//   res.status(404).json({
//     status: "fail",
//     message: `Can't find ${req.originalUrl} on this server !`,
//   });
// });

// app.use(errorMiddleware);

// module.exports = app;


class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    // Fields to exclude
    const removeFields = ["keyword", "limit", "page"];
    removeFields.forEach((el) => delete queryCopy[el]);

    // Advanced filter for price, ratings etc.
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));

    // Sorting
    if (this.queryStr.sortBy) {
      const sortQuery = this.queryStr.sortBy.toLowerCase();
      let sortOptions = {};
      if (sortQuery === "ratings") sortOptions = { ratings: -1 };
      else if (sortQuery === "reviews") sortOptions = { numOfReviews: -1 };
      this.query = this.query.sort(sortOptions);
    }

    return this;
  }

  pagination(resultsPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultsPerPage * (currentPage - 1);
    this.query = this.query.limit(resultsPerPage).skip(skip);
    return this;
  }

  sort() {
    if (this.queryStr.sortBy) {
      const sortQuery = this.queryStr.sortBy.toLowerCase();
      let sortOptions = {};
      if (sortQuery === "ratings") sortOptions = { ratings: -1 };
      else if (sortQuery === "reviews") sortOptions = { numOfReviews: -1 };
      this.query = this.query.sort(sortOptions);
    }
    return this;
  }
}

module.exports = APIFeatures;
