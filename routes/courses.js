const express = require("express");
const fs = require("fs");
const router = express.Router();
const auth = require("../auth/auth");
const courseJSONPath = "json/courses.json";
const studentJSONPath = "json/students.json";

// Get all courses
router.get("/", (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(courseJSONPath));
        data.map((ele) => delete ele["enrolledStudents"]);
        res.send({ data, error: null });
    } catch (error) {
        res.status(500).send({ data: null, error });
    }
});

// Get Specific Course
router.get("/:id", (req, res) => {
    try {
        let data = JSON.parse(fs.readFileSync(courseJSONPath));
        data = data.filter((ele) => ele["courseId"] == req.params.id);
        if (!data) throw `No course with ID:${req.params.id}`;
        res.send({ data, error: null });
    } catch (error) {
        res.status(404).send({ data: null, error });
    }
});

// Add course
router.post("/", (req, res) => {
    try {
        let name = req.body.name,
            description = req.body.description,
            availableSlots = req.body.availableSlots;
        if (!name || !description || !availableSlots) throw "Invalid Input";

        let data = JSON.parse(fs.readFileSync(courseJSONPath));
        let obj = {
            courseId: data.length,
            name,
            description,
            availableSlots,
            enrolledStudents: [],
        };
        data.push(obj);
        // stringify() 's second parameter:replacer,third parameter:space for readability
        fs.writeFileSync(courseJSONPath, JSON.stringify(data, null, 2));
        res.status(200).send({ data: "Success", error: null });
    } catch (error) {
        res.status(400).send({ data: null, error });
    }
});

//Enroll in course
router.post("/:id/enroll", auth, (req, res) => {
    try {
        let courseId = req.params.id,
            studentId = req.studentId;

        let course_data = JSON.parse(fs.readFileSync(courseJSONPath));
        let student_data = JSON.parse(fs.readFileSync(studentJSONPath));

        let curr_student = student_data.findIndex(
            (ele) => ele["studentId"] == studentId
        );
        if (curr_student == -1)
            throw `No student exists with ID : ${studentId}`;

        let course_index = course_data.findIndex(
            (ele) => ele["courseId"] == courseId
        );
        if (course_index == -1) throw `No course exists with ID : ${courseId}`;

        if (course_data[course_index]["availableSlots"] == 0)
            throw `No availabe slots for course ID : ${courseId}`;

        course_data[course_index]["availableSlots"] -= 1;
        course_data[course_index]["enrolledStudents"].push(studentId);

        fs.writeFileSync(courseJSONPath, JSON.stringify(course_data, null, 2));
        res.send({ data: "Success", error: null });
    } catch (error) {
        res.status(500).send({ data: null, error });
    }
});

//Deregister from a Course
router.put("/:id/deregister", auth, (req, res) => {
    try {
        let courseId = req.params.id
            studentId = req.studentId;

        let course_data = JSON.parse(fs.readFileSync(courseJSONPath));
        let student_data = JSON.parse(fs.readFileSync(studentJSONPath));

        let curr_student = student_data.filter(
            (ele) => ele["studentId"] == studentId
        );
        if (!curr_student) throw `No student exists with ID : ${studentId}`;

        let course_index = course_data.findIndex(
            (ele) => ele["courseId"] == courseId
        );
        if (course_index == -1) throw `No course exists with ID : ${courseId}`;

        course_data[course_index]["availableSlots"] += 1;
        let enrolledStudents = course_data[course_index]["enrolledStudents"];

        let student_index = enrolledStudents.indexOf(studentId);

        if (student_index == -1)
            throw `Student with ID : ${studentId} not registered in this course with ID : ${courseId}`;

        course_data[course_index]["enrolledStudents"].splice(student_index, 1);
        fs.writeFileSync(courseJSONPath, JSON.stringify(course_data, null, 2));
        res.send({ data: "Success", error: null });
    } catch (error) {
        console.log(error);
        res.status(500).send({ data: null, error });
    }
});

module.exports = router;