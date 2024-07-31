require('pg');
const Sequalize = require('sequelize');

const database = 'SenecaDB';
const user = 'SenecaDB_owner';
const password = 'jvFB5nfo3sOz';
const host = 'ep-square-night-a5zs3yxv.us-east-2.aws.neon.tech';


const sequelize = new Sequalize(database, user, password, {
    host: host,
    dialect: 'postgres',
    port: '5432',
    dialectOptions: {
        ssl: {rejectUnauthorized: false }
    },
    query: { raw: true}
});


const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequalize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequalize.STRING,
    lastName: Sequalize.STRING,
    email: Sequalize.STRING,
    addressStreet: Sequalize.STRING,
    addressCity: Sequalize.STRING,
    addressProvince: Sequalize.STRING,
    TA: Sequalize.BOOLEAN,
    status: Sequalize.STRING
});


const Course = sequelize.define('Course', {
    courseId: {
        type: Sequalize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequalize.STRING,
    courseDescription: Sequalize.STRING,
});


Course.hasMany(Student, { foreignKey: 'course' });

module.exports.initialize = function () {
    return new Promise( (resolve, reject) => {
        sequelize.sync()
        .then( function() {
            resolve('connection successful!!'); return;
        })
        .catch(function() {
            reject('unable to sync the database !!'); return;
        });
    });
}

module.exports.getAllStudents = function(){
    return new Promise((resolve,reject)=>{
        Student.findAll()
        .then( function(data) {
            resolve(data); return;
        })
        .catch(function() {
            reject('no results returned !!');
        })
    });
}

module.exports.getTAs = function () {
    return new Promise(function (resolve, reject) {
        reject();
    });
};

module.exports.getCourses = function(){
    return new Promise((resolve,reject)=>{
        Course.findAll()
        .then( function(data) {
            resolve(data); return;
        })
        .catch(function() {
            reject('no results returned !!');
        });
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise((resolve,reject)=>{
        Student.findAll({
            where: {
                studentNum: num
            }
        })
        .then( function(data) {
            resolve(data[0]); return;
        })
        .catch(function() {
            reject('no results returned !!'); return;
        });
    });
};


module.exports.getCourseById = function (num) {
    return new Promise((resolve,reject)=>{
        Course.findAll({
            where: {
                courseId: num,
            }
        })
        .then( function(data) {
            resolve(data[0]); return;
        })
        .catch(function() {
            console.log('no found');
            reject('no results returned !!'); return;
        });
    });
};

module.exports.getStudentsByCourse = function (course) {
    return new Promise((resolve,reject)=>{
        Student.findAll({
            where: {
                course: course
            }
        })
        .then( function(data) {
            resolve(data); return;
        })
        .catch(function() {
            reject('no results returned !!');
        });
    });
};

module.exports.addStudent = function (studentData) {
    return new Promise( function (resolve, reject) {
        studentData.TA = (studentData.TA)? true: false;
        var studentListCount = 0;
        for(let i =0; i < studentData.length; i++){
            if (studentData[i] == "") {
                studentData = studentData+1;
            }
        }

        if (studentListCount > 0) {
            reject('All form fields are required '); return;
        }

        Student.create(studentData)
        .then(function(){
            resolve(); return;
        })
        .catch(function(){
            reject('unable to create student. '); return;
        });
    } );
}

module.exports.updateStudent = function (studentData) {
    return new Promise( function (resolve, reject) {
        studentData.TA = (studentData.TA)? true: false;
        var studentListCount = 0;
        for(let i =0; i < studentData.length; i++){
            if (studentData[i] == "") {
                studentData = studentData+1;
            }
        }

        if (studentListCount > 0) {
            reject('All form fields are required '); return;
        }

        Student.update(studentData, {
            where: {
                studentNum: studentData.studentNum
            }
        })
        .then(function(){
            resolve(); return;
        })
        .catch(function(){
            reject('unable to create student. '); return;
        });
    } );
}

module.exports.addCourse = function (courseData) {
    return new Promise( function (resolve, reject) {
        var courseListCount = 0;
        for(let i =0; i < courseData.length; i++){
            if (courseData[i] == "") {
                courseListCount = courseListCount+1;
            }
        }

        if (courseListCount > 0) {
            reject('All form fields are required '); return;
        }

        Course.create(courseData)
        .then(function(){
            resolve(); return;
        })
        .catch(function(){
            reject('unable to create course. '); return;
        });
    } );
}

module.exports.updateCourse = function (courseData) {
    return new Promise( function (resolve, reject) {
        var courseListCount = 0;
        for(let i =0; i < courseData.length; i++){
            if (courseData[i] == "") {
                courseListCount = courseListCount+1;
            }
        }

        if (courseListCount > 0) {
            reject('All form fields are required '); return;
        }

        Course.update(courseData, {
            where: {
                courseId: courseData.courseId
            }
        })
        .then(function(){
            resolve(); return;
        })
        .catch(function(){
            reject('unable to update course. '); return;
        });
    } );
}

module.exports.deleteCourse = function (courseID) {
    return new Promise( function (resolve, reject) {
        Course.destroy( {
            where: {
                courseId: courseID
            }
        })
        .then(function(){
            resolve(); return;
        })
        .catch(function(){
            reject('unable to delete course. '); return;
        });
    } );
}

module.exports.deleteStudentByNum = function (student_no) {
    return new Promise( function (resolve, reject) {
        Student.destroy( {
            where: {
                studentNum: student_no
            }
        })
        .then(function(){
            resolve(); return;
        })
        .catch(function(){
            reject('unable to delete student. '); return;
        });
    } );
}