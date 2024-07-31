var HTTP_PORT = process.env.PORT || 8080;
var express = require('express');
var exphbs = require('express-handlebars');
var dataCollection = require('./modules/collegeData');
var path = require('path');

var app = express();

app.use(express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: true }));

app.engine('.hbs', exphbs.engine({  
    extname: '.hbs' ,
    helpers: {
        navLink: function( url , options) {
            return '<li' +
            ((url == app.locals.activeRoute)? ' class="nav-item active" ': ' class="nav-item" ' )+
            '><a class="nav-link" href="' + url + '">'+ options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebar Helper equal needs 2 parameter");
            if (lvalue != rvalue) {
                return options.inverse(this);
            }
            else {
                return options.fn(this);
            }
        }
    }

}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'))

app.use(function(req,res,next){ 
    let route = req.path.substring(1); 
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));     
    next(); 
});


// GET Students
app.get("/students", (req,res)=> {

    
    var course_id = req.query.course;

    if (course_id == undefined) {
        dataCollection.getAllStudents()
        .then(
            (all_students) => res.render('students', { students: all_students, layout: "main" })   
        )
        .catch(
            () => res.render('students', { message: 'no results', layout: "main" })  
        );
    }
    else {
        dataCollection.getStudentsByCourse(course_id)
        .then(
            (all_students) => res.render('students', { students: all_students, layout: "main" })   
        )
        .catch(
            () => res.render('students', { message: 'no results', layout: "main" })  
        );
    }


});



// GET /courses
app.get("/courses", (req,res)=> {

    dataCollection.initialize()
    .then(
        () => dataCollection.getCourses() 
    )
    .then(
        (courses) => res.render('courses', { courses: courses, layout: "main" })   
    )
    .catch(
        () => res.render('courses', { message: 'no results', layout: "main" })  
    );
});

app.get("/course/:id", (req,res)=> {
    const courseID = req.params.id;
    dataCollection.getCourseById(courseID)
    .then(
        (courses) =>res.render('course', { course: courses, layout: "main" })   
    )
    .catch(
        () =>res.render('course', { message: 'query returned 0 results', layout: "main" }) 
    );
});


app.get("/student/:num", (req,res)=> {

    let viewData = {};
    const studentNo = req.params.num;

    dataCollection.getStudentByNum(studentNo) 
    .then((student_data) => {
        if (student_data) {
            console.log(student_data);
            viewData.student = student_data;
        } else {
            viewData.student = null;
        }
    })
    .catch(
        () =>{   
            viewData.student = null;
        }
    )
    .then(dataCollection.getCourses)
    .then((courseData) => {
        viewData.courses = courseData;

        for (let i=0; i < viewData.courses.length; i++) {
            if (viewData.courses[i].courseId == viewData.student.course) {
                viewData.courses[i]['selected'] = true;
            }
        }
    })
    .catch(() => { viewData.courses = [] })
    .then(() => {
        if(viewData.student == null ){
            res.status(404).send('Student Not Found!');
        } else {
            res.render('student', {viewData: viewData, layout : "main"});
        }
    });
});


app.get("/course/delete/:id", (req,res)=> {
    const courseNo = req.params.id;
    dataCollection.deleteCourse(courseNo)
    .then(
        function(){
            res.redirect('/courses')  
        }
    )
    .catch(
        () =>res.render('course', { message: 'Unable to Remove Course / Course not found', layout: "main" }) 
    );
});

app.get("/student/delete/:studentNum", (req,res)=> {
    const studentNo = req.params.id;
    dataCollection.deleteStudentByNum(studentNo)
    .then(
        function() {
            res.redirect('/students')  
        }
    )
    .catch(
        () =>res.render('course', { message: 'Unable to Remove Student / Student not found', layout: "main" }) 
    );
});

// GET /
app.get("/", (req,res)=> {
    res.render('home', { layout: "main" });   
});

app.get("/home", (req,res)=> {
    res.render('home', { layout: "main" });   
});

// GET /about
app.get("/about", (req,res)=> {
    res.render('about', { layout: "main" });  
});


// GET /htmlDemo
app.get("/htmlDemo", (req,res)=> {
    res.render('htmlDemo', { layout: "main" });  
});

app.get("/htmldemo", (req,res)=> {
    res.render('htmlDemo', { layout: "main" });  
});

app.get("/courses/add", (req,res)=> {
    res.render('addCourse', { layout: 'main' });
});

app.get("/students/add", (req,res)=> {
    dataCollection.getCourses()
    .then(
        function(course_data) {
            res.render('addStudent', {courses: course_data, layout: "main"})
        }
    )
    .catch(
        ()=>res.render('addStudent', { layout: "main" }) 
    )
});

// Form posting routes
app.post("/students/add", (req, res) => {
    dataCollection.addStudent(req.body) 
    .then(
        function() {
            res.redirect('/students')
        }
    )
    .catch(
        function(){
            res.render('students', { message: 'Unable to Remove Student / Student not found', layout: "main" })
        }
    );
});

app.post("/courses/add", (req, res) => {
    dataCollection.addCourse(req.body) 
    .then(
        function(){
            res.redirect('/courses')
        }
    )
    .catch(
        function(){
            res.render('course', { message: 'Unable to Remove Student / Student not found', layout: "main" })
        }
    );
});

app.post("/students/update", (req, res) => { 
    console.log(req.body); 
    dataCollection.updateStudent(req.body) 
    .then(
        function() {
            res.redirect('/students')
        }
    )
    .catch(
        function(){
            res.render('students', { message: 'Unable to Remove Student / Student not found', layout: "main" })
        }
    );
});

app.post("/course/update", (req, res) => {
    dataCollection.updateCourse(req.body) 
    .then(
        function(){
            res.redirect('/courses')
        }
    )
    .catch(
        function(){
            res.render('course', { message: 'Unable to Remove Student / Student not found', layout: "main" })
        }
    );
});

app.use(function(req, res){
    res.status(404).sendFile(path.join(__dirname,"/views/404.html"));
});

// setup http server to listen on HTTP_PORT
dataCollection.initialize()
.then(
    () => app.listen(HTTP_PORT, () => {console.log("server listening on port: " + HTTP_PORT)})
)
.catch(
    (err) => console.log(err) 
);