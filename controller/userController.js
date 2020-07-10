const User = require('../models/user'); 
const catchAsyncError = require('../middlewares/catchAsyncErrors'); 
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const fs = require('fs');
const Job = require('../models/user');
exports.getUserProfile = async (req,res,next) => {
    const user = await User.findById(req.user.id).populate({
            path: 'jobsPublished',
            select: 'title postingDate', 

        }); 


    res.status(200).json({
        success: true,
        data: user, 

    })
}


exports.updatePassword = async (req, res, next) => {
    const user = await User.findById(req.user.id).select('password');

    // Check previous user password
    const isMatched = await user.comparePassword(req.body.currentPassword);
    if(!isMatched) {
        return next(new ErrorHandler('Old Password is incorrect.', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
};


exports.updateUser = async (req, res, next) => {
    const newUserData = {
        name : req.body.name,
        email : req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new : true,
        runValidators : true,
        useFindAndModify : false
    });

    res.status(200).json({
        success : true,
        data : user
    });
};


exports.deleteUser = async (req,res,next) => {

    deleteUserData(req.user.id, req.user.role); 

    const user = await User.findByIdAndDelete(req.user.id); 

    res.cookie('token', 'none', {
        expires: new Date(Date.now()), 
        httpOnly: true,
    });

    res.status(200).json({
        success: true, 
        message: 'Your account has been deleted', 
    })
}



async function deleteUserData(user, role){
    if(role === 'employeer'){
        await Job.deleteMany({user: user}); 
    }

    if(role === 'admin'){
        const appliedJobs = await Job.find({'applicantsApplied.id': user}).select('applicantsApplied'); 

        for(let i = 0 ; i < appliedJobs.length ; i++){
            let obj = appliedJobs[i].applicantsApplied.find(o => o.id === user); 



            let filepath = `${__dirname}/public/uploads/${obj.resume}`.replace('\\controllers', ''); 

            fs.unlink(filepath, err => {
                if(err) return console.log(err);
            });


            appliedJobs[i].applicantsApplied.splice(appliedJobs[i].applicantsApplied.indexOf(obj.id)); 

            appliedJobs[i].save(); 

        }


    }
}