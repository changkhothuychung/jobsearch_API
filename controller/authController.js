const User = require('../models/user'); 
const catchAsyncError = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail'); 
const crypto = require('crypto'); 


// Register a new user

exports.registerUser = async (req,res,next) => {
    const {name,email,role,password} = req.body;

    const user = await User.create({
        name: name, 
        email: email, 
        role: role, 
        password: password, 
        

    });

    
    sendToken(user, 200, res); 
}

// Login User 
exports.loginUser = async (req,res,next) => {
    const {email, password} = req.body;

    // check if email or email is entered by user

    if(!email || !password){
        return next(new ErrorHandler("Please enter email and password", 400)); 
    }


    //fidning user in the database 

    const user =  await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid Email or Password", 401)); 
    }

    //check if password is correct

    const isPasswordMatched = await user.comparePassword(password); 

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Password", 401));
    }

    //Create a Json Web Token 


    sendToken(user, 200, res); 
}

exports.forgotPassword = async (req,res,next) => {
    const user = await User.findOne({email: req.body.email}); 
    // check user email in the database 

    if(!user){
        return next( new ErrorHandler('no user found', 404)); 
    }

    // get reset token 

    const resetToken = user.getResetPasswordToken(); 
    await user.save({validateBeforeSave: false}); 


    const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`

    const message = `Your password linkis at follow:\n\n${resetUrl}
    \n\n If you have not requested this, then please ig nore that.`;


    try {

        await sendEmail({
            email: user.email, 
            subject : 'Password Recovery',
            message: message,
        });
    
    
        res.status(200).json({
            sucess: true, 
            message: `Email sent successfuly to ${user.email}`
        });
        
    } catch (error) {

        user.resetPasswordToken = undefined; 
        user.resetPasswordExpire = undefined; 


        await user.save({validateBeforeSave: false}); 
        console.log(error);
        
    }


}


exports.resetPassword = async (req,res,next) => {
    // Hash url token 
    const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex'); 

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt: Date.now()}

    })

    if(!user){
        try{
            
        }
        catch(error){
            console.log(error);
        }
    }

    //setu[ new passowrd]

    user.password = req.body.password; 

    user.resetPasswordToken = undefined; 
    user.resetPasswordExpire = undefined; 

    await user.save();

    sendToken(user,200,res);


}


exports.logout = (req,res,next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now()), 
        httpOnly: true, 
    });

    res.status(200).json({
        success: true,
        message: "Logout successfully", 
    })
}