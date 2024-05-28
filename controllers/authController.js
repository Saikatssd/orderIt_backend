const User = require("../models/user");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const ErrorHandler = require("../utils/errorHandler");
const Email = require("../utils/email");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
// const cloudinary = require("cloudinary").v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const multer = require("multer");
const cloudinary = require('../middlewares/cloudinary');
const upload = require('../middlewares/multer');



// Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "avatars",
//     transformation: [{ width: 150, crop: "scale" }],
//   },
// });

// const upload = multer({ storage: storage }).single("avatar");

// Helper function to sign JWT
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME + "d",
  });
};

// Helper function to create and send token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: { user },
  });
};




// Signup

// exports.signup = catchAsyncErrors(async (req, res, next) => {
//   const { name, email, password, passwordConfirm, phoneNumber } = req.body;

//   // Check if file is uploaded
//   if (!req.file) {
//     return next(new ErrorHandler("Missing required parameter - file", 400));
//   }

//   const result = await cloudinary.uploader.upload(req.file.path, {
//     folder: "avatars",
//     width: 150,
//     crop: "scale",
//   });

//   const newUser = await User.create({
//     name,
//     email,
//     password,
//     passwordConfirm,
//     phoneNumber,
//     avatar: {
//       public_id: result.public_id,
//       url: result.secure_url,
//     },
//   });

//   createSendToken(newUser, 201, res);
// });


exports.signup = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, passwordConfirm, phoneNumber } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "Missing required parameter - file" });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm,
      phoneNumber,
      avatar: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ success: false, message: error.message || "Signup failed. Please try again." });
  }
});




// Login
exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  createSendToken(user, 200, res);
});

// Protect routes

exports.protect = catchAsyncErrors(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    // console.log("Token if:", token);

  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
    console.log("Token else if:", token);
  }

  if (!token) {
    console.log("!Token :", token);

    return next(new ErrorHandler("You are not logged in! Please log in to get access.", 401));
  }

  try {
    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new ErrorHandler("The user belonging to this token does no longer exist.", 401));
    }

    // Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new ErrorHandler("User recently changed password! Please log in again.", 401));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    return next(new ErrorHandler("Invalid token. Please log in again.", 401));
  }
});

// Get user profile
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

// Update password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;

  // Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // Check if posted current password is correct
  if (!(await user.correctPassword(oldPassword, user.password))) {
    return next(new ErrorHandler("Old password is incorrect", 401));
  }

  // If so, update password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});

// Update user profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);
    const imageId = user.avatar.public_id;
    await cloudinary.uploader.destroy(imageId);

    const result = await cloudinary.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    newData.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("There is no user with that email address.", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${process.env.FRONTEND_URL}/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler("There was an error sending the email. Try again later!", 500));
  }
});

// Reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

// Logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("jwt", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});
