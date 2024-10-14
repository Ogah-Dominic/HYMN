const express = require("express")
// const{isAdmin,
//       authenticate} = require("../MIDDLEWARE/authentication");
      const{validationMiddleware}=require("../middleware/validation");
      const router = express.Router()
    // User Router
    const{
        userSignUp,
        userLogin,
        signOut,
        verifyEmail,
        resendVerificationEmail,
        forgotPassword,
        changePassword,
        resetPassword,
        } = require("../ctrl/user")

    // User route
    router.route("/signup").post(userSignUp)
    router.route("/verify/:token").put(verifyEmail);
    router.route("/resend-email-verification").get(resendVerificationEmail);
    router.route("/signin").post(userLogin);
    router.route("/forgot-password").post(forgotPassword);
    router.route("/reset-password").put(resetPassword,)
    router.route("/change-password").put(changePassword)
    router.route("/logout").get(signOut);

    module.exports = router;