// Filename : user.js

const express = require("express");
const {
    check,
    validationResult
} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/check-auth");


const User = require("../models/user");

/**
 * @method - POST
 * @param - /register
 * @description - User SignUp
 */

router.post(
    "/register",
    [
        check("username", "Please Enter a Valid Username")
        .not()
        .isEmpty(),
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                success: false,
                message: 'Input validation errors',
                data: errors.array()
            });
        }

        const {
            username,
            email,
            password
        } = req.body;
        try {
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    success: false,
                    message: "User Already Exists",
                    data: {}
                });
            }

            user = new User({
                username,
                email,
                password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                process.env.JWT_KEY, {
                    expiresIn: 3600
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        success: true,
                        message: "User Created",
                        data: {
                            user,
                            token
                        }
                    });
                }
            );
        } catch (err) {
            console.log(err.message);
            res.status(500).send({
                success: false,
                message: "Server Error",
                data: {}
            });
        }
    }
);

/**
 * @method - POST
 * @param - /login
 * @description - User Login
 */

router.post(
    "/login",
    [
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Input validation errors',
                data: errors.array()
            });
        }

        const {
            email,
            password
        } = req.body;
        try {
            let user = await User.findOne({
                email
            });
            if (!user)
                return res.status(400).json({
                    success: false,
                    message: "User Not Exist",
                    data: {}
                });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return res.status(400).json({
                    success: false,
                    message: "Incorrect Password !",
                    data: {}
                });

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                process.env.JWT_KEY, {
                    expiresIn: 3600
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        success: true,
                        message: "User Created",
                        data: {
                            user,
                            token
                        }
                    });
                }
            );
        } catch (e) {
            console.error(e);
            res.status(500).json({
                success: false,
                message: "Server Error",
                data: {}
            });
        }
    }
);

/**
 * @method - POST
 * @description - Get LoggedIn User
 * @param - /user/me
 */

router.get("/me", auth, async (req, res) => {
    try {
        // request.user is getting fetched from Middleware after token authentication
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            message: "User Created",
            data: {
                user
            }
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            message: "Error in Fetching user",
            data: {}
        });
    }
});

module.exports = router;