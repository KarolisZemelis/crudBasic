const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const handlebars = require("handlebars");
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
//MIDDLEWARE


//USE MIDDLEWARE and libraries?
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

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
app.post("/admin/login", (req, res) => {
    const data = {
        pageTitle: "Login",
    }

    const html = makeHtml(data, "login", true);
    res.send(html);
});



const port = 3003;
app.listen(port, () => {
    console.log(`Serveris pasiruošęs ir laukia ant ${port} porto!`);
});