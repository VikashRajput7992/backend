const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const router = express.Router();



const JWT_SECRET = process.env.JWT_SECRET;

//create a user using post: "/api/auth/createuser". no login required

router.post('/createuser',
    [
        body('name', 'Enter a valid name').isLength({ min: 3 }),
        body('email', 'Enter a valid email').isEmail(),
        body('password', 'Password must be atleast 5 characters').isLength({ min: 5 })
    ]
    , async (req, res) => {
        // if there are errors,return bad request and the errors
        const result = validationResult(req);
        let success = false;
        if (!result.isEmpty()) {
            return res.status(400).json({ success,errors: result.array() });
        }

        //check whether the user with this email exists already
        try {
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                success=false;
                return res.status(400).json({success, error: "Sorry a user with this email already exist" });
            }
            const salt = await bcrypt.genSalt(10);
            const secPassword = await bcrypt.hash(req.body.password, salt);
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPassword
            })
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET);
            success=true;
            res.json({ success,authToken });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    })

//authenticate a user using post: "/api/auth/login". no login required
router.post('/login', [body('email', 'Enter a valid email').isEmail(),body('password', 'Password cannot be blank').exists()], async (req, res)=> {
    const result = validationResult(req);
    let success = false;
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    const {email,password} = req.body;
    try {
        let user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({error:"Please try to login with correct credential"});
        }
        const passwordCompare = await bcrypt.compare(password,user.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({success,error:"Please try to login with correct credential"});
        } 
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error"); 
    }
})

//ROUTE: get loggedin user details post: "/api/auth/getuser".login required
router.post('/getuser',fetchuser,async (req,res)=>{
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error"); 
    }
})

module.exports = router;