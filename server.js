const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const handlebars = require("handlebars");
const { v4: uuidv4 } = require("uuid");
const md5 = require("md5");
const cookieParser = require("cookie-parser");
const URL = "http://localhost:3003/";


//HELPERS
const makeHtml = (data, page, back = true) => {
    const dir = back ? "back" : "front";
    data.url = URL;
    const topHtml = fs.readFileSync(`./templates/${dir}/top.hbr`, "utf8");
    const bottomHtml = fs.readFileSync(`./templates/${dir}/bottom.hbr`, "utf8");
    const pageHtml = fs.readFileSync(`./templates/${dir}/${page}.hbr`, "utf8");
    const html = handlebars.compile(topHtml + pageHtml + bottomHtml)(data);
    return html;
};

const updateSession = (req, prop, data) => {
    const sessionId = req.user.sessionId
    let sessions = fs.readFileSync('./data/sessions.json', 'utf8');
    sessions = JSON.parse(sessions);
    let session = sessions.find(s => s.sessionId === sessionId)
    if (!session) {
        return
    }
    if (data === null) {
        delete session[prop]
    } else {
        session[prop] = data
    }
    sessions = JSON.stringify(sessions);
    fs.writeFileSync('./data/sessions.json', sessions);
}
//MIDDLEWARE
const sessionMiddleware = (req, res, next) => {
    let sessionId = req.cookies.sessionId || null;
    if (!sessionId) {
        sessionId = md5(uuidv4());
    }
    let sessions = fs.readFileSync("./data/sessions.json", "utf8");
    sessions = JSON.parse(sessions);
    let user = sessions.find((u) => u.sessionId === sessionId)
    if (!user) {
        user = {
            sessionId
        }
        sessions.push(user)
        sessions = JSON.stringify(sessions)
        fs.writeFileSync('./data/sessions.json', sessions)
    }

    res.cookie('sessionId', sessionId, { maxAge: 1000 * 60 * 60 * 24 * 365 })
    req.user = user
    next()
}
const auth = (req, res, next) => {
    const isLogin = req.url.includes('/login') && req.method === 'GET'
    if (isLogin && req.user?.user) {
        res.redirect(URL + 'admin/dashboard')
        return
    }

    const isAdmin = req.url.includes('/admin')
    if (isAdmin && req.user?.user) {
        next();
        return;
    }

    next()
}




//USE MIDDLEWARE and libraries?
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(auth);


//ROUTES
//MAIN PAGE FRONT
app.get("/", (req, res) => {
    const data = {
        pageTitle: "CRUD basic",
    }

    const html = makeHtml(data, "landing", false);
    res.send(html);
});

//ADMIN LOGIN
app.get("/admin/login", (req, res) => {

    const data = {
        pageTitle: "Login",
    }

    const html = makeHtml(data, "login", true);
    res.send(html);
});
//ADMIN LOGIN
app.post("/admin/login", (req, res) => {
    const isLogout = req.query.hasOwnProperty('logout');
    console.log(isLogout)
    if (isLogout) {
        updateSession(req, 'user', null);
        updateSession(req, 'message', { text: 'Sėkmingai atsijungta', type: 'success' });
        res.redirect(URL + 'admin/login');
        return;
    }

    const { userName, password } = req.body
    let usersDatabase = fs.readFileSync("./data/users.json", "utf8");
    usersDatabase = JSON.parse(usersDatabase);
    const user = usersDatabase.find(u => u.userName === userName && u.password === md5(password))
    if (!user) {
        res.redirect(URL + "admin/login");
        return;
    }
    updateSession(req, 'user', user)
    res.redirect(URL + 'admin/dashboard');

});

app.get("/admin/dashboard", (req, res) => {
    const data = {
        pageTitle: "CRUD admin dashboard",
    }
    const html = makeHtml(data, "dashboard", true);
    res.send(html);
});

const port = 3003;
app.listen(port, () => {
    console.log(`Serveris pasiruošęs ir laukia ant ${port} porto!`);
});