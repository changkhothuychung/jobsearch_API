const express = require('express'); 
const router = express.Router(); 
const {getJobs} = require('../controller/jobsController');
const {newJob} = require('../controller/jobsController');
const {getJobInRadius} = require('../controller/jobsController');
const {updateJob} = require('../controller/jobsController');
const {deleteJob} = require('../controller/jobsController');
const {getJob} = require('../controller/jobsController');
const {applyJob} = require('../controller/jobsController');
const {isAuthenticatedUser, authorizeUserRoles} = require('../middlewares/auth');

router.route('/jobs').get(getJobs)
router.route('/jobs/:id/:slug').get(getJob);
// router.route('/job/new').post(newJob);
// router.route('/jobs/:zipcode/:distance').get(getJobInRadius);
router.route('/job/:id').put(updateJob)
router.route('/job/:id').delete(deleteJob)
router.route('/job/new').post(isAuthenticatedUser, authorizeUserRoles('employeer', 'admin'),newJob);
router.route('/job/:id/apply').put(isAuthenticatedUser, authorizeUserRoles('employeer', 'admin'), applyJob)


module.exports = router;