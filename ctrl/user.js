require('dotenv').config();
const userModel = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
// const jwt = require("../util/jwt")
const { sendEmail } = require("../MIDDLEWARE/Email");

// user sign up
exports.userSignUp = async (req, res) => {
  try {
    const {
      email, 
      password, 
      confirmPassword } = req.body;

    const emailExists = await userModel.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        message: `Email already exist.`
      })
    }

    // salt and hash the password using bcrypt
    const salt = bcrypt.genSaltSync(12)
    const hashedPassword = bcrypt.hashSync(password, confirmPassword, salt)
    const data = {
      firstName: surName.toUpperCase(),
      lastName: lastName.toUpperCase(),
      email: email.toLowerCase(),
      sex,
      password: hashedPassword,
      confirmpassword: hashedPassword
    }

    // create a user
    const user = await userModel.create(data);

    // create a token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "5 mins" })
    // console.log(token)

    const protocol = req.protocol;
    const host = req.get("host");
    const subject = "Email Verification";
    // const link = `https://PointPlus-app.onrender.com/#/verification/${token}`;
    const html = await mailTemplate(link, user.firstName +""+ LastName);
    const mail = {
      email: email,
      subject,
      html,
    };
    sendEmail(mail);

    // save the user
    const savedUser = await user.save();

    // return a response
    res.status(201).json({
      message: `Check your email: ${savedUser.email} to verify your account.`,
      data: savedUser
    });

  } catch (error) {
    res.status(500).json({
      Error: error.message
    })
  }
}


// verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(404).json({
        error: "Token not found"
      })
    }

    // verify the token and extract the user's email
    const { email } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    // Check if user has already been verified
    if (user.isVerified) {
      return res.status(400).json({
        error: "User already verified"
      });
    }

    // update the user verification and save changes to database
    user.isVerified = true;
    await user.save();

    res.status(200).json({
      message: "User verified successfully",
      data: user,
    })
    // res.status( 200 ).redirect( `${req.protocol}://${req.get("host")}/api/log-in` );

  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
};


// resend verification
exports.resendVerificationEmail = async (req, res) => {
  try {
    // get user email from request body
    const { email } = req.body;
    if (!email) {
      return res.status(404).json({
        error: "Please enter email address"
      });
    }

    // find user
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    // Check if user has already been verified
    if (user.isVerified) {
      return res.status(400).json({
        error: "User already verified"
      });
    }

    // create a token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "5 mins" });

    const subject = "Email Verification";
    // const link = `https://Asap-app.onrender.com/#/verification/${token}`;
    // const html = await mailTemplate(link, user.fullName);
    const mail = {
      email: email,
      subject,
      html,
    };
    sendEmail(mail);

    res.status(200).json({
      message: `Verification email sent successfully to your email: ${user.email}`
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}


// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(404).json({
        error: "Please enter a valid email address"
      });
    }

    // Check if the email or the user exists in the Database
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: `User with the email ${email} not found`
      });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "5m" });

    const subject = "Password Reset";
    // const link = `https://Asap-app.onrender.com/#/resetpassword/${resetToken}`;
    // const html = await forgotMailTemplate(link, user.fullName);
    const mail = {
      email: email,
      subject,
      html,
    };
    sendEmail(mail);
    
    res.status(200).json({
      message: `Password reset email sent successfully to ${email}`
    });

  } catch (error) {
    console.error("Something went wrong", error.message);
    res.status(500).json({
      message: error.message
    });
  }
};


// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(404).json({
        error: "Please enter a new password"
      });
    }

    // Verify the user's token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Get the user's ID from the token
    const userId = decodedToken.userId;

    // Find the user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Salt and hash the new password
    const saltedRound = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, saltedRound);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password reset successful"
    });
  } catch (error) {
    console.error("Something went wrong", error.message);
    res.status(500).json({
      message: error.message
    });
  }
};


// User login
exports.userLogin = async (req, res) => {
  try {
    // Extract the user's email and password
    const { password, email } = req.body;
    if (!email || !password) {
      return res.status(404).json({
        error: "incorrect credencials"
      });
    }

    // Find user by their registered email
    const user = await userModel.findOne({ email: email.toLowerCase() })

    // Check if the user exists
    if (!user) {
      return res.status(404).json({
        Failed: `User with the email ${email} not found`
      })
    }

    // Compare user's password with the saved password.
    const checkPassword = bcrypt.compareSync(password, user.password)
    // Check for password error
    if (!checkPassword) {
      return res.status(404).json({
        Message: 'Login Unsuccessful',
        Failed: 'Invalid password'
      })
    }

    // Check if the user if verified
    if (!user.isVerified) {
      return res.status(404).json({
        message: `Email Not Verified, Please verify your email to log in.`
      })
    }

    const token = jwt.sign({
      userId: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    },
      process.env.JWT_SECRET, { expiresIn: "5 min" })

    user.save()

    res.status(200).json({
      message: 'Login successful',
      firstName: user.firstName,
      email: user.email,
      token
    })

  } catch (error) {
    res.status(500).json({
      Error: error.message
    })
  }
}

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, existingPassword } = req.body;
    if (!newPassword || !existingPassword) {
      return res.status(404).json({
        error: "Please enter all fields"
      });
    }

    // Verify the user's token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Get the user's Id from the token
    const userId = decodedToken.userId;

    // Find the user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Confirm the previous password
    const isPasswordMatch = await bcrypt.compare(existingPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Existing password is incorrect."
      });
    }

    // Salt and hash the new password
    const saltedRound = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, saltedRound);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successful"
    });
  } catch (error) {
    console.error("Something went wrong", error.message);
    res.status(500).json({
      message: error.message
    });
  }
};


// User sign out
exports.signOut = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({
        message: 'Missing token'
      });
    }

    const token = authorizationHeader.split(' ')[1];

    // Create a new revoked token entry and save it to the database
    const revokedToken = new RevokedToken({
      token: token
    });

    await revokedToken.save();

    res.status(200).json({
      message: 'User logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      Error: error.message
    });
  }
};
