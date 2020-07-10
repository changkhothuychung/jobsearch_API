const mongoose = require('mongoose'); 
const validator = require('validator'); 
const slugify = require('slugify'); 
const geoCoder = require('../utils/geocoder');
const jobSchema = new mongoose.Schema({
    title: {
        type:String, 
        required: [true, "Please enter job title"], 
        trim: true,
        maxLength: [100, 'Job title can not exceed 100 characters'], 
    },
    slug: String,
    description: {
        type: String, 
        required:[true, "Please enter Job description"], 
        maxLength: [1000, 'Job description can not exceed 1000 characters'],

    },
    emai: {
        type: String, 
        validate: [validator.isEmail, "Please add a valid email address"],

    },
    address:{
        type: String, 
        required: [true , "Please add an address"], 

    },

    

    company: {
        type: String, 
        required: [true, "Please add a company name"], 

    },

    industry: {
        type: [String], 
        required: true, 
        enum: {
            values: [
                "Businness",
                "Information Technology", 
                "Banking", 
                "Education/Training",
                "Telecommunication", 
                "Others"
            ], 
            message: "please select correct options for industry",
        },

    },
    jobType:{
        type: String, 
        required: true, 
        enum: {
            values: [
                "Permanent",
                "Temporary", 
                "Internship",
            ],
            message: 'Please select correct options for job type', 

        }
    },
    minEducation: {
        type: String, 
        required: true, 
        enum: {
            values: [
                "Bachelors", 
                "Masters", 
                "PhD",

            ],
            message: "Please select correct options"
        }
    },
    positions: {
        type: Number, 
        default: 1, 

    },
    experience: {
        type: String, 
        required: true, 
        enum: {
            values: [
                "No Experience", 
                "1 year - 2 Year",
                "2 Years - 5 Years", 
            ],
            message: "Please select correct option"
        }
    },
    salary: {
        type: Number, 
        required: [true, 'Please enter expected salary for this job'], 

    },
    postingDate: {
        type: Date, 
        default: Date.now, 
    },
    lastDate: {
        type: Date, 
        default: new Date().setDate(new Date().getDate() + 7)
    },
    applicantsApplied: {
        type: [Object], 
        select: false, 
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
        required: true
    }

})
jobSchema.pre('save', function(next){
    // create slug before saving to db
    this.slug = slugify(this.title,{
        lower: true, 

    });

    next(); 


});

// jobSchema.pre('save', async function(next){
//     const loc = await geoCoder.geocode(this.address);
//     this.location = {
//         type: 'Point', 
//         coordinates: [loc[0].longitude, loc[0].latitude],
//         formattedAddress: loc[0].formattedAddress,
//         city: loc[0].city, 
//         state: loc[0].stateCode,
//         zipcode: loc[0].zipcode,
//         country: loc[0].countryCode,


//     }
// })
module.exports = mongoose.model('Job', jobSchema);
