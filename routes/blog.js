const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");
const Post = require("../models/post");

const ObjectId = mongodb.ObjectId;
const router = express.Router();

router.get("/", function (req, res) {
  res.render("welcome", { csrfToken: req.csrfToken() });
});

router.get("/admin", async function (req, res) {
  if (!res.locals.isAuth) {
    return res.status(401).render("401");
  }

  const posts = await db.getDb().collection("posts").find().toArray();

  let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      title: "",
      content: "",
    };
  }

  req.session.inputData = null;

  res.render("admin", {
    posts: posts,
    inputData: sessionInputData,
    csrfToken: req.csrfToken(),
  });
});

router.post("/posts", async function (req, res) {
  const enteredTitle = req.body.title;
  const enteredContent = req.body.content;

  if (
    !enteredTitle ||
    !enteredContent ||
    enteredTitle.trim() === "" ||
    enteredContent.trim() === ""
  ) {
    req.session.inputData = {
      hasError: true,
      message: "Invalid input - please check your data.",
      title: enteredTitle,
      content: enteredContent,
    };

    res.redirect("/admin");
    return; // or return res.redirect('/admin'); => Has the same effect
  }

  // Post class needs actual values (enteredTitle, enteredContent), id can be omit because when first time creating a post, that will have no id then.
  // expected parameter (which turn to be argument, because we call this constructor).
  const post = new Post(enteredTitle, enteredContent);
  // calling the save method.
  // await the save method, to ensure we'll redirect to admin page after the post was saved.
  // doesn't even make sense if we redirect to admin page before the actual post was saved and we couldn't see the newer post then.
  // and why we await the save() method here because we define async function at posts.js
  // by default, all async function will return a promise automatically.
  await post.save();

  res.redirect("/admin");
});

router.get("/posts/:id/edit", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const post = await db.getDb().collection("posts").findOne({ _id: postId });

  if (!post) {
    return res.render("404"); // 404.ejs is missing at this point - it will be added later!
  }

  let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      title: post.title,
      content: post.content,
    };
  }

  req.session.inputData = null;

  res.render("single-post", {
    post: post,
    inputData: sessionInputData,
    csrfToken: req.csrfToken(),
  });
});

router.post("/posts/:id/edit", async function (req, res) {
  const enteredTitle = req.body.title;
  const enteredContent = req.body.content;

  if (
    !enteredTitle ||
    !enteredContent ||
    enteredTitle.trim() === "" ||
    enteredContent.trim() === ""
  ) {
    req.session.inputData = {
      hasError: true,
      message: "Invalid input - please check your data.",
      title: enteredTitle,
      content: enteredContent,
    };

    res.redirect(`/posts/${req.params.id}/edit`);
    return;
  }

  const post = new Post(enteredTitle, enteredContent, req.params.id);
  await post.save();

  res.redirect("/admin");
});

router.post("/posts/:id/delete", async function (req, res) {
  // why we give the empty string argument or null?.
  // because based on the constructor where expected three parameteres init, we have to define three arguments too when we calling the constructor method here.
  // and we not interested for the title and the content, but we only interest with the ID for deleting the post.
  // so we defining the empty string then
  // const post = new Post("", "", req.params.id);
  const post = new Post(null, null, req.params.id);
  await post.delete();

  res.redirect("/admin");
});

module.exports = router;
