const mongodb = require("mongodb");

const db = require("../data/database");

const ObjectId = mongodb.ObjectId;

class Post {
  constructor(title, content, id) {
    this.title = title;
    this.content = content;
    // may be undefined when we creating a new post, because creating a new post obviously don't have the ID.
    // this.id = id;
    // instead of defining the id like that (which can be wrong because we don't have to actual ID from database), we must use the ObjectId class that provided by MongoDb like what we do in the blog.js (see at the very top of this code)
    // and then we do the if check whether the id is exist or not from database, and pass the id parameter to the ObjectId constructor
    if (id) {
      this.id = new ObjectId(id);
    }
  }

  // fetching all blog post with static method
  // using static method
  static async fetchAll() {
    const posts = await db.getDb().collection("posts").find().toArray();
    return posts;
  }

  async fetch() {
    // checking for spesific id
    if (!this.id) {
      return;
    }

    const postDocument = await db
      .getDb()
      .collection("posts")
      .findOne({ _id: this.id });
    this.title = postDocument.title;
    this.content = postDocument.content;
  }

  // save method for storing new post and can be use for updating the post.
  // grab nodeJs logic from route (blog.js).
  async save() {
    // for get the result, we have to define the result as a standalone variable, because the result variable is inside of the function, if we not defining it we won't be able to access that result variable inside of a function.
    // and in the end this standalone variable, allows us to return the result if we need that
    let result;

    // checking the id of post.
    // we do the if-else check first, to check whether the post have an id or not.
    // if not, we creating a new post, but if we have to just updating it, as simple as that.
    if (this.id) {
      result = await db
        .getDb()
        .collection("posts")
        .updateOne(
          { _id: this.id },
          { $set: { title: this.title, content: this.content } }
        );
    } else {
      result = await db.getDb().collection("posts").insertOne({
        title: this.title,
        content: this.content,
      });
    }

    // returning result container if we want to use it later and if we interest what inside of it
    return result;
  }

  // we can create another method for update the post, but we can use the existing save method.
  // I have write the explanation too there.
  //   async update() {
  //     await db
  //     .getDb()
  //     .collection("posts")
  //     .updateOne(
  //       { _id: postId },
  //       { $set: { title: enteredTitle, content: enteredContent } }
  //     );
  //   }

  async delete() {
    if (!this.id) {
      // we can throw an error and just return it
      // simply for preventing deleting the post when we not have the id.
      return;
    }

    const result = await db
      .getDb()
      .collection("posts")
      .deleteOne({ _id: this.id });
    return result;
  }
}

module.exports = Post;
