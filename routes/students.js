const express = require("express");
const fs = require("fs");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../auth/auth");
const emailValidator=require('email-validator')

const studentJSONPath = "json/students.json";

// Get all Students
router.get("/", (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(studentJSONPath));
        data.map(() => {
            delete data["password"];
            delete ["accessToken"];
            delete ["email"];
        });
        res.send({ data, error: null });
    } catch (e) {
        res.status(500).send({ data: null, error: e });
    }
});

// Get Specific Student Whole Details
router.get("/:id", auth, (req, res) => {
    try {
        let data = JSON.parse(fs.readFileSync(studentJSONPath));
        data = data.filter((ele) => ele["studentId"] === parseInt(req.params.id));
        if (!data) throw `No student with ID:${req.params.id}`;
        res.send({ data, error: null });
    } catch (error) {
        res.status(404).send({ data: null, error });
    }
});

// Login
router.post("/login", (req, res) => {
    try {
        let email = req.body.email.trim(),
            password = req.body.password.trim();

        if ((!email || !password ) || !emailValidator.validate(email) || password.length<=5) throw `Invalid Form Data`;

        const students = JSON.parse(fs.readFileSync(studentJSONPath));

        let student = students.findIndex(
            (student) => student.email === email && student.password === password
        );
        if (student === -1) throw `Invalid Email or Password`;

        const token = jwt.sign(
            { studentId: students[student]["studentId"] },
            "my-secret-key",
            { expiresIn: "1h" }
        );

        students[student].accessToken = token;
        fs.writeFileSync(studentJSONPath, JSON.stringify(students, null, 2));
        res.status(200).send({ data: { token }, error: null });
    } catch (error) {
        res.status(401).send({ data: null, error });
    }
});

// Signup
router.post("/signup", (req, res) => {
    try {
        let userName = req.body.userName.trim(),
            email = req.body.email.trim(),
            password = req.body.password.trim();

        if ((!userName || !email || !password ) || !emailValidator.validate(email) || password.length<=5) throw `Invalid Form Data`;

        let users = JSON.parse(fs.readFileSync(studentJSONPath));
        users.map((element) => {
            if (element.email === email)
                throw `User with email ${email} already exists.`;
        });
        let studentId = users.length;
        const accessToken = jwt.sign({ studentId }, "my-secret-key", {
            expiresIn: "1h",
        });
        let obj = {
            studentId,
            userName,
            email,
            password,
            accessToken,
        };

        users.push(obj);
        fs.writeFileSync(studentJSONPath, JSON.stringify(users, null, 2));
        res.status(201).send({ data: { accessToken }, error: null });
    } catch (error) {
        res.status(400).send({ data: null, error });
    }
});

module.exports = router;