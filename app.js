const path = require("path");

const express = require("express");
const session = require("express-session");
const csrf = require("csurf");

const sessionConfig = require("./config/session");
const db = require("./data/database");
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blog");
const authMiddleware = require("./middlewares/auth-middleware");
const addCSRFTokenMiddleware = require("./middlewares/csrf-token-middleware");

// calling the createSessionStore function from config folder/session.js and passing session package as argument.
const mongoDbSessionStore = sessionConfig.createSessionStore(session);

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.use(session(sessionConfig.createSessionConfig(mongoDbSessionStore)));
app.use(csrf());

// add custom middleware that hold the CSRF token
app.use(addCSRFTokenMiddleware);

// not executing our custom middleware, we let the package (express) execute it for us when the request coming in the future
// that means the res.locals
app.use(authMiddleware);

app.use(authRoutes);
app.use(blogRoutes);

app.use(function (error, req, res, next) {
  res.render("500");
});

db.connectToDatabase().then(function () {
  app.listen(3000);
});
