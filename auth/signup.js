const express = require("express");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");

const userData = "json/users.json";

router.post("/", (req, res) => {
    try {
        let userName = req.body.userName,
            email = req.body.email,
            password = req.body.password;

        if (!userName || !email || !password) throw `Invalid Form Data`;

        let users = JSON.parse(fs.readFileSync(userData));
        users.map((element) => {
            if (element.userName === userName)
                throw `User with Username ${userName} already exists.`;
            if (element.email === email)
                throw `User with email ${email} already exists.`;
        });

        const accessToken = jwt.sign({ email }, "my-secret-token");
        let obj = {
            userName,
            email,
            password,
        };

        users.push(obj);
        fs.writeFileSync(userData, JSON.stringify(users, null, 2));
        res.status(200).send({ data: { accessToken }, error: null });
    } catch (error) {
        console.log(error);
        res.status(400).send({ data: null, error });
    }
});

module.exports = router;
