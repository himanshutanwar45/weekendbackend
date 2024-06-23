const express = require('express')
const router = express.Router();
const User = require('../../models/Users/CreateUser')
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET
const fetchuser = require('../../middleware/fetchuser')

//Route 1: Create a user ::::POST '/api/auth/create_users'
router.post('/create_user', [
    body('empCode', 'Enter Employee Code').isLength({ max: 6 }),
    body('empName', 'Enter Name').isLength({ min: 3 }),
    body('email', 'Enter Email').isLength({ min: 3 }),
    body('mobile', 'Enter Mobile').isLength({ min: 3 }),
    body('password', 'Enter Password').isLength({ min: 3 }) ,
    body('conpass', 'Enter Confirm Password').isLength({ min: 3 }) 

], fetchuser,async (req, res) => {
    let success = false
    const result = validationResult(req)
    
    if (!result.isEmpty()) {
        return res.status(200).json({ success, error: result.errors[0] }) 
    }
    try {
        let user = await User.findOne({ email: req.body.email,empCode:req.body.empCode })
        if(user){
            return res.status(200).json({success,error:"Email and empCode already exists"})
        }

        const salt = await bcrypt.genSalt(10)
        let secPass = await bcrypt.hash(req.body.password,salt)

        let secConPass = await bcrypt.hash(req.body.conpass,salt)

        const currentUser = req.user.id

        if (secPass !== secConPass){
            return res.status(200).json({success,error:"Password don't match"})
        }

        user = await User.create({
            empCode:req.body.empCode,
            empName:req.body.empName,
            email:req.body.email,
            mobile:req.body.mobile,
            password:secPass,
            isAdmin:req.body.isAdmin,
            status:req.body.status,
            createdBy:currentUser,
            updatedBy:currentUser
        })

        res.json({success:true,error:"Operation Successfully"})

        //res.json(req.body)

    } catch (error) {
        res.status(500).send(`Internal Error Occurred: ${error.message}`)
    }
})

//Route 2: Login the user ::::::::::POST /api/auth/login
router.post('/login',[
    body('email','Enter the valid Email').isEmail(),
    body('password','Enter Password').exists()
],async(req,res)=>{
    let success = false;
    const result = validationResult(req)
    if(!result.isEmpty()) {
        return res.status(400).json({ success, error: result.array() })
    }

    const {email,password} = req.body

    try{
        let user = await User.findOne({email})
       
        if(!user){
            return res.status(400).json({success,error:"Invalid credentials !!!"})
        }

        let empName = user.empName
        let userId = user._id
        let isAdmin = user.isAdmin
        const passCompare = await bcrypt.compare(password,user.password)

        if (!passCompare) {
            return res.status(401).json({success,error:'Invalid Credentials !!!'});
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)
        res.json({ success:true,authToken,empName,userId,isAdmin })
        //res.send(user)

    }catch(error){
        res.status(500).send("Internal Error Occured")
    }
})


//Route 3: List of all employees ::::::::::GET /api/auth/allemployee
router.get('/allemployee', async(req,res)=>{
    try{
        let user = await User.find()
        res.json(user)

    }catch(error){
        res.status(500).send(`Internal error contact admin ${error.message}`)
    }
})


//Route 4 : Get Employee Name from EmpId ::::::: get /api/auth/employeename
router.get('/employeename/:empCode',fetchuser,async(req,res)=>{
    try{
        let empCode = req.params.empCode
        let user = await User.findOne({'empCode':empCode})
        if(!user){
           return  res.status(200).json('Employee Name Not Found!')  
        }else{
          return  res.json(user.empName);
        }
    } catch (error) {
         return  res.status(500).json(`Internal error contact admin ${error.message}`);
    }
})


//Route 4 : Get Employee Name from EmpId ::::::: GET /api/auth/employeecode
router.get('/employeecode/:empName',fetchuser,async(req,res)=>{
    try{
        let empName= req.params.empName;
        let user = await User.findOne({'empName':empName})
        if(!user){
           return  res.status(200).json('Employee Node Not Found!')  
        }else{
          return  res.json(user.empCode);
        }
    } catch (error) {
         return  res.status(500).json(`Internal error contact admin ${error.message}`);
    }
})


//Route 5 : Add Admin User :::::::::::::::POST /api/auth/createadmin
router.post('/createadmin',async(req,res)=>{
    let success = false
    try{
        let user = await User.findOne({ email: "admin@invia.co.in",empCode:"admin" })
        if(user){
            return res.status(200).json({success,error:"Email and empCode already exists"})
        }

        const salt = await bcrypt.genSalt(10)
        let secPass = await bcrypt.hash("1234",salt)

        user = await User.create({
            empCode:"admin",
            empName:"Admin",
            email:"admin@invia.co.in",
            mobile:"123456789",
            password:secPass,
            isAdmin:true,
            status:true,
            createdBy:"System Generated",
            updatedBy:"System Generated"
        })

        res.json({success:true,error:"Operation Successfully"})
    }catch(error){
        res.status(500).send(`Internal Error Occurred: ${error.message}`)
    }
})


//Route 6: Update Users Details ::::::::::::::PUT /api/auth/updateuser
router.put('/updateuser/:id',[
    body('eempName', 'Enter Name').isLength({ min: 3 }),
    body('eemail', 'Enter Email').isLength({ min: 3 }),
    body('emobile', 'Enter Mobile').isLength({ min: 3 })
],fetchuser,async(req,res)=>{
    let success = false

    const {eempName,eemail,emobile,epassword,estatus,eisAdmin,econpass} = req.body

    const currentDate = new Date();
    const currentUser = req.user.id

    const result = validationResult(req)
    if(!result.isEmpty()) {
        return res.status(200).json({ success, error: result.errors[0] })
    }

    try{    

        const updateEntry = {}

        const salt = await bcrypt.genSalt(10)
        let secPass = await bcrypt.hash(epassword,salt)

        let secConPass = await bcrypt.hash(econpass,salt)

        if(eempName){updateEntry.empName = eempName}
        if(eemail){updateEntry.email = eemail}
        if(emobile){updateEntry.mobile = emobile}
        if(epassword){updateEntry.password = secPass}
        if(econpass){updateEntry.conpass = secConPass}
        if(estatus){updateEntry.status = estatus}
        if(eisAdmin){updateEntry.isAdmin = eisAdmin}
        updateEntry.updatedBy = currentUser
        updateEntry.updatedDate = currentDate

        let entry = await User.findById(req.params.id)

        if (!entry) {
            return res.status(404).json({ success, error: "No Entry found" });
        }

        if (secConPass !== secPass){
            return res.status(200).json({success,error:"Password don't match"})
        }

        entry = await User.findByIdAndUpdate(req.params.id, { $set: updateEntry }, { new: true })

        res.json({success:true,error:"Operation Successfully"})
        
        //res.send(updateEntry)
        

    }catch(error){
        res.status(500).send(`Internal Error Occurred: ${error.message}`)
    }
})

//Route 7: Get All Employee from Id ::::::::::::::Get /api/auth/allemployeId
router.get('/allemployeId/:id',fetchuser,async(req,res)=>{
    try{
        let id = req.params.id
        let user = await User.findOne({'_id':id},{ password: 0, createdDate: 0, createdBy:0, updatedBy:0,updatedDate:0})
        if(!user){
           return  res.status(200).json('Employee Name Not Found!')  
        }else{
          return  res.json(user);
        }
    } catch (error) {
         return  res.status(500).json(`Internal error contact admin ${error.message}`);
    }
})

module.exports = router