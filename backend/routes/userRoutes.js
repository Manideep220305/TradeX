const express=require('express');
const router=express.Router();
//import the functions u wrote in the controller
const{ registerUser, loginUser }=require('../controllers/userController');

//connect url to the function
router.post('/register',registerUser);
router.post('/login',loginUser);

module.exports=router;