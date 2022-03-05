const Post = require("../models/post");
const validationSession = require("../util/validation-session");
const validation = require("../util/validation");

function getHome(req, res) {
  res.render("welcome");
}

async function getAdmin(req, res) {
  if (!res.locals.isAuth) {
    return res.status(401).render("401");
  }

  // calling the fetchAll() static method
  // when using static method, we don't need the new keyword anymore
  const posts = await Post.fetchAll();

  sessionErrorData = validationSession.getSessionErrorData(req, {
    title: "",
    content: "",
  });

  res.render("admin", {
    posts: posts,
    inputData: sessionErrorData,
  });
}

async function createPost(req, res) {
  const enteredTitle = req.body.title;
  const enteredContent = req.body.content;

  if (!validation.postIsValid(enteredTitle, enteredContent)) {
    validationSession.flashErrorToSession(
      req,
      {
        message: "Invalid input - please check your data.",
        title: enteredTitle,
        content: enteredContent,
      },
      function () {
        res.redirect("/admin");
      }
    );

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
}

async function getSinglePost(req, res, next) {
  let post;
  // do try-catch to throw an error if user type the ID that doesn't exist.
  // and we throw our own error not using default error by nodejs
  try {
    post = new Post(null, null, req.params.id);
  } catch (error) {
    // throw an error like this (this will render 500 page)
    // next(error);
    // return;
    // or 404 page, up to us which one we want to use
    return res.status(404).render("404");
  }
  await post.fetch();

  if (!post.title || !post.content) {
    return res.render("404"); // 404.ejs is missing at this point - it will be added later!
  }

  sessionErrorData = validationSession.getSessionErrorData(req, {
    title: post.title,
    content: post.content,
  });

  res.render("single-post", {
    post: post,
    inputData: sessionErrorData,
  });
}

async function updatePost(req, res) {
  const enteredTitle = req.body.title;
  const enteredContent = req.body.content;

  if (!validation.postIsValid(enteredTitle, enteredContent)) {
    validationSession.flashErrorToSession(
      req,
      {
        message: "Invalid input - please check your data.",
        title: enteredTitle,
        content: enteredContent,
      },
      function () {
        res.redirect(`/posts/${req.params.id}/edit`);
      }
    );

    return;
  }

  const post = new Post(enteredTitle, enteredContent, req.params.id);
  await post.save();

  res.redirect("/admin");
}

async function deletePost(req, res) {
  // why we give the empty string argument or null?.
  // because based on the constructor where expected three parameteres init, we have to define three arguments too when we calling the constructor method here.
  // and we not interested for the title and the content, but we only interest with the ID for deleting the post.
  // so we defining the empty string then
  // const post = new Post("", "", req.params.id);
  const post = new Post(null, null, req.params.id);
  await post.delete();

  res.redirect("/admin");
}

module.exports = {
  getHome: getHome,
  getAdmin: getAdmin,
  createPost: createPost,
  getSinglePost: getSinglePost,
  updatePost: updatePost,
  deletePost: deletePost,
};
