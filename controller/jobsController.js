const Job = require('../models/jobs');
const geoCoder = require('../utils/geocoder');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFilter = require('../utils/apiFilter');
const path = require('path'); 

exports.getJobs =  async (req,res) => {
    const apiFilter = new APIFilter(Job.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .searchByQuery()
    .pagination();
    const jobs = await apiFilter.query;
    res.status(200).json({
        success: true, 
        results: jobs.length, 
        data: jobs
    })
}


// Create a new job 

exports.newJob = catchAsyncErrors(async (req, res , next) => {

    //adding user to body 
    req.body.user = req.user.id; 
    
    const job = await Job.create(req.body);
    res.status(200).json({
        success: true, 
        message: "Job Created", 
        data: job,
    })
})


// exports.getJobInRadius = async (req,res,next) => {
//     const {zipcode, distance} = req.params;
//     const loc = await geoCoder.getcode(zipcode);
//     const latitude = loc[0].latitude;
//     const longtitude = loc[0].longtitude;
//     const radius = distance / 3963; 

//     const jobs = await Job.find({
//         location: {$geoWithin: {$centerSphere: [[longtitude, latitude], radius]}}
//     })


//     res.status(200).json({
//         success: true, 
//         results: jobs.length, 
//         data: jobs,
//     });
// }


//update jobs


exports.updateJob = async (req,res,next) => {
    let job = await Job.findById(req.params.id, async (err, user) => {
        if(err){
            return next(new ErrorHandler("Job not Found", 404)); 
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false, 
        })
    
    
        return res.status(200).json({
            success: true,
            message: "Done", 
    
        })
    })
   
}


//delete a job 

exports.deleteJob = async (req,res,next) => {
    let job = await Job.findById(req.params.id); 

    if(!job){
        return res.status(404).json({
            success: false
        })
    }
    job = await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true, 
        message: "Job is delete",
    })
}


//get a single job with id and slug 

exports.getJob = async (req,res,next) => {
    const job = await Job.findById({$and: [{_id: req.params.id}, {slug: req.params.slug}]}); 
    if(!job || job.length == 0){
        return res.status(404).json({
            success: false,
        })
    }

    return res.status(200).json({
        success: true,
        data: job
    })
}

// get statistics 

exports.jobStats = async (req,res,next) => {
    const stats = await Job.aggregate([
        {
            $match: {$text: {$search: "\"" + req.params.topic + "\""}}
        },
        {
            $group: {
                _id: null,
                avgSalary: {
                    $avg: '$salary'
                }
            }
        }
    ]);

    if(stats.length === 0){
        return res.status(404).json({
            success: false, 
            message: "wrong"
        })
    }

    res.status(200).json({
        success: true,
        data: stats, 
    })


}

exports.applyJob = async (req,res,next) =>{
    let job = await Job.findById(req.params.id); 
    if(!job){
        return next(new ErrorHandler("job not found", 404)); 
    }

    //check if job last date has been passed

    if(job.lastDate < new Date(Date.now())){
        return next (Errohandler('You cant applyto this job', 400)); 
    }

    //check the files

    if(!req.files){
        console.log(req.files);
        console.log(req.file);
        return next(new ErrorHandler('Please upload file',400));
    }

    const file = req.files.file;

    // check file type 
    const supportedFiles = /.docs|.pdf/; 

    if(!supportedFiles.test(path.extname(file.name))){
        return next(new ErrorHandler('please upload correct file', 400)); 
    }

    //check document size 

    if(file.size > process.env.MAX_FILE_SIZE){
        return next(new ErrorHandler('Please Upload File Less than 2MB', 400)); 
    }

    //Renaming resume 
    file.name = `${req.user.name.replace(' ', '_')}_${job._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async (err) => {
        if(err){
            console.log(err); 
            return next(new ErrorHandler('Resume', 500));
        }

        await Job.findByIdAndUpdate(req.params.id, {$push: {
            applicantsApplied: {
                id: req.user.id, 
                resume: file.name, 
            }
        }},{
            new: true, 
            runValidators: true, 
            useFindAndModify:false, 
        })

        res.status(200).json({
            success: true, 
            message: "Applied Successfully", 

        })
    })



}
