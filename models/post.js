const db = require("../data/database");

class Post {
  constructor(title, content, id) {
    this.title = title;
    this.content = content;
    // may be undefined when we creating a new post, because creating a new post obviously don't have the ID.
    this.id = id;
  }

  // save method for storing new post
  // grab nodeJs logic from route (blog.js)
  async save() {
    const result = await db.getDb().collection("posts").insertOne({
      title: this.title,
      content: this.content,
    });

    // returning result container if we want to use it later and if we interest what inside of it
    return result;
  }
}

module.exports = Post;
