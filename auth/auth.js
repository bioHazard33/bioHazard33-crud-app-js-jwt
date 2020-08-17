const jwt = require("jsonwebtoken");
const fs = require("fs");
const studentJSONPath = "json/students.json";

const auth = (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const payload = jwt.verify(token, "my-secret-key");
        const students = JSON.parse(fs.readFileSync(studentJSONPath));
        req.studentId = payload.studentId;
        let student = students.find(
            (ele) => ele["studentId"] === parseInt(payload.studentId)
        );
        if (!student) throw `Please Authenticate`;
        next();
    } catch (error) {
        res.status(401).send({ data: null, error });
    }
};

module.exports = auth;