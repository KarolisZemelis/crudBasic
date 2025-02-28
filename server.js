const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const handlebars = require("handlebars");
const { v4: uuidv4 } = require("uuid");
const md5 = require("md5");
const cookieParser = require("cookie-parser");
const multer = require('multer');
const URL = "http://localhost:3003/";

//picture upload settings NOT helper
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        let folder = 'default';
        if (file.fieldname === 'bannerImg') {
            folder = 'banner';
        } else if (file.fieldname === 'listImg') {
            folder = 'list';
        }
        cb(null, `./public/images/${folder}/`);

    },
    filename: function (req, file, cb) {
        const randomName = uuidv4();
        const extension = file.originalname.split('.').pop();
        const filename = `${randomName}.${extension}`;
        cb(null, filename);
    }
});

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

};

//MIDDLEWARE
// Deal with setting sessionId and updating cookie time
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
//Bouncer checking if user has been logged in on previous visit and if he is going to restricted area
const auth = (req, res, next) => {

    const isLogin = req.url.includes('/login') && req.method === 'GET'
    if (isLogin && req.user?.user) {
        res.redirect(URL + 'admin/dashboard')
        return
    }

    const isAdmin = req.url.includes('/admin')
    if (isAdmin && !req.user?.user) {
        res.redirect(URL + 'login')
        return;
    }

    next()
}
//Resets the success/failure message
const messagesMiddleware = (req, res, next) => {

    if (req.method === 'GET') {
        updateSession(req, 'message', null);
    }

    next();
};

const oldDataMiddleWare = (req, res, next) => {
    if (req.method === 'POST') {
        const oldData = req.body;
        updateSession(req, 'oldData', oldData)

    }
    if (req.method === 'GET') {
        updateSession(req, 'oldData', null);
    }
    next()
};

//Image upload
const upload = multer(

    {
        storage: storage,
        fileFilter: function (req, file, cb) {
            if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png' && file.mimetype !== 'image/webp') {
                cb(null, false);
                req.fileValidationError = true;
            } else {
                cb(null, true)
            }
        }
    },

)

//USE MIDDLEWARE and libraries?
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(messagesMiddleware);
app.use(oldDataMiddleWare);
app.use(auth);

//ROUTES
//MAIN PAGE FRONT
app.get("/", (req, res) => {
    let mainPageData = fs.readFileSync('./data/mainPage.json', 'utf8');
    mainPageData = JSON.parse(mainPageData);
    const data = {
        pageTitle: "CRUD basic",
        message: req.user.message || null,
        mainPageData

    }

    const html = makeHtml(data, "landing", false);
    res.send(html);
});
app.get('/itemsList', (req, res) => {
    let listPageData = fs.readFileSync('./data/listPage.json', 'utf8');
    listPageData = JSON.parse(listPageData);

    const data = {
        pageTitle: "Items list",
        message: req.user.message || null,
        listPageData,

    }
    const html = makeHtml(data, "list", false);
    res.send(html);
})
//ADMIN LOGIN
app.get("/login", (req, res) => {
    const data = {
        pageTitle: "Login",
        message: req.user.message || null,
        user: req.user.user || null,
        noMenu: true
    }
    const html = makeHtml(data, "login", true);
    res.send(html);
});
//ADMIN LOGIN/LOGOUT
app.post("/login", (req, res) => {
    const isLogout = req.query.hasOwnProperty('logout');
    if (isLogout) {
        updateSession(req, 'user', null);
        updateSession(req, 'message', { text: 'Sėkmingai atsijungta', type: 'success' });
        res.redirect(URL + 'login');
        return;
    }

    const { userName, password } = req.body
    let usersDatabase = fs.readFileSync("./data/users.json", "utf8");
    usersDatabase = JSON.parse(usersDatabase);
    const user = usersDatabase.find(u => u.userName === userName && u.password === md5(password))
    if (!user) {
        res.redirect(URL + "login");
        return;
    }
    updateSession(req, 'message', { text: 'Sėkmingai prisijungta', type: 'success' });
    updateSession(req, 'user', user)
    res.redirect(URL + 'admin/dashboard');

});
//ADMIN PAGES
app.get("/admin/dashboard", (req, res) => {
    const data = {
        pageTitle: "CRUD admin dashboard",
        message: req.user.message || null,
        user: req.user.user || null,
        dashboard: true
    }
    const html = makeHtml(data, "dashboard", true);
    res.send(html);
});

app.get("/admin/createMain", (req, res) => {
    let mainPageData = fs.readFileSync('./data/mainPage.json', 'utf8');
    mainPageData = JSON.parse(mainPageData);
    const data = {
        pageTitle: "CRUD create",
        message: req.user.message || null,
        oldData: req.user.oldData || null,
        user: req.user.user || null,
        mainPageData,
        createMain: true
    }

    const html = makeHtml(data, "createMain", true);
    res.send(html);
});
//Multer is added to route because we need to dinamically direct files to different categories
app.post("/admin/createMain", upload.single('bannerImg'), (req, res) => {
    const { title, text } = req.body
    if (!title || !text) {
        updateSession(req, 'message', { text: 'Fill all the fields', type: 'danger' });
        res.redirect(URL + 'admin/createMain');
        return;
    }
    if (req.fileValidationError) {
        updateSession(req, 'message', { text: 'Uncompatable image', type: 'danger' });
        res.redirect(URL + 'admin/createMain');
        return;
    }
    let fileName = req.file?.filename;
    let mainPageData = fs.readFileSync('./data/mainPage.json', 'utf8');
    mainPageData = JSON.parse(mainPageData);
    if (!fileName) {
        fileName = mainPageData.bannerImg;
    } else {
        if (mainPageData.bannerImg) {
            fs.unlinkSync('./public/images/banner/' + mainPageData.bannerImg);
        }
    }

    mainPageData =
    {
        title,
        text,
        bannerImg: fileName,
        imgPath: '/images/banner/'
    }
        ;
    mainPageData = JSON.stringify(mainPageData);
    fs.writeFileSync('./data/mainPage.json', mainPageData);

    updateSession(req, 'message', { text: 'Įrašas sukurtas', type: 'success' });

    res.redirect(URL + 'admin/dashboard');
});

app.get("/admin/createListItem", (req, res) => {
    const data = {
        pageTitle: "CRUD create list item",
        message: req.user.message || null,
        user: req.user.user || null,
        createList: true
    }
    const html = makeHtml(data, "createList", true);
    res.send(html);
});

app.post("/admin/createListItem", upload.single('listImg'), (req, res) => {
    const { title, text } = req.body
    if (!title || !text) {
        updateSession(req, 'message', { text: 'Fill all the fields', type: 'danger' });
        res.redirect(URL + 'admin/createMain');
        return;
    }
    if (req.fileValidationError) {
        updateSession(req, 'message', { text: 'Uncompatable image', type: 'danger' });
        res.redirect(URL + 'admin/createMain');
        return;
    }
    let fileName = req.file?.filename;
    let listPageData = fs.readFileSync('./data/listPage.json', 'utf8');
    listPageData = JSON.parse(listPageData);
    if (!fileName) {
        fileName = listPageData.listImg;
    } else {
        if (listPageData.listImg) {
            fs.unlinkSync('./public/images/list/' + listPageData.listImg);
        }
    }
    const itemId = uuidv4();
    itemData = {

        id: itemId,
        title,
        text,
        listImg: fileName,
        imgPath: '/images/list/'

    };
    // listPageData.push(itemData)
    listPageData[itemId] = itemData
    listPageData = JSON.stringify(listPageData);
    fs.writeFileSync('./data/listPage.json', listPageData);

    updateSession(req, 'message', { text: 'Save successful', type: 'success' });

    res.redirect(URL + 'admin/itemList');
});

app.get("/admin/itemList", (req, res) => {
    let listPageData = fs.readFileSync('./data/listPage.json', 'utf8');
    listPageData = JSON.parse(listPageData);
    console.log(listPageData)
    const data = {
        pageTitle: "CRUD item list",
        message: req.user.message || null,
        user: req.user.user || null,
        itemList: true,
        listPageData
    }
    const html = makeHtml(data, "itemList", true);
    res.send(html);
});

app.get("/admin/editItem/:id", (req, res) => {
    let listPageData = fs.readFileSync('./data/listPage.json', 'utf8');
    listPageData = JSON.parse(listPageData);
    const itemId = req.params.id
    let itemToDisplay = listPageData[itemId]
    const data = {
        pageTitle: "CRUD item list",
        message: req.user.message || null,
        user: req.user.user || null,
        itemList: true,
        itemToDisplay
    }


    const html = makeHtml(data, "editItem", true);
    res.send(html);
});

app.post("/admin/saveItemEdit/:id", upload.single('listImg'), (req, res) => {
    const { title, text } = req.body
    const itemId = req.params.id
    if (!title || !text) {
        updateSession(req, 'message', { text: 'Fill all the fields', type: 'danger' });
        res.redirect(URL + 'admin/createMain');
        return;
    }
    if (req.fileValidationError) {
        updateSession(req, 'message', { text: 'Uncompatable image', type: 'danger' });
        res.redirect(URL + 'admin/createMain');
        return;
    }
    let fileName = req.file?.filename;
    let listPageData = fs.readFileSync('./data/listPage.json', 'utf8');
    listPageData = JSON.parse(listPageData);
    if (!fileName) {
        fileName = listPageData.listImg;
    } else {
        if (listPageData.listImg) {
            fs.unlinkSync('./public/images/list/' + listPageData.listImg);
        }
    }

    itemData = {
        id: itemId,
        title,
        text,
        listImg: fileName,
        imgPath: '/images/list/'

    };
    listPageData[itemId] = itemData
    listPageData = JSON.stringify(listPageData);
    fs.writeFileSync('./data/listPage.json', listPageData);

    updateSession(req, 'message', { text: 'Save successful', type: 'success' });

    res.redirect(URL + 'admin/dashboard');
});

app.get("/admin/deleteItem/:id", (req, res) => {
    const itemId = req.params.id

    const data = {
        pageTitle: "CRUD delete item",
        message: req.user.message || null,
        user: req.user.user || null,
        noMenu: true,
        itemId
    }


    const html = makeHtml(data, "delete", true);
    res.send(html);
});

app.post("/admin/destroyItem/:id", (req, res) => {
    const itemId = req.params.id
    if (!itemId) {
        updateSession(req, 'message', { text: 'Such ID does not exist please try again', type: 'danger' });
        res.redirect(URL + '/admin/itemList');
        return;
    }

    let listPageData = fs.readFileSync('./data/listPage.json', 'utf8');
    listPageData = JSON.parse(listPageData);
    fs.unlinkSync('./public/images/list/' + listPageData[itemId].listImg)
    delete listPageData[itemId];
    listPageData = JSON.stringify(listPageData);
    fs.writeFileSync('./data/listPage.json', listPageData);

    updateSession(req, 'message', { text: 'Deleted successfuly', type: 'success' });

    res.redirect(URL + 'admin/itemList');
});

const port = 3003;
app.listen(port, () => {
    console.log(`Serveris pasiruošęs ir laukia ant ${port} porto!`);
});