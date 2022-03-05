function guardRoutes(req, res, next) {
  if (!res.locals.isAuth) {
    // new route
    return res.redirect("/401");
  }

  next();
}

module.exports = guardRoutes;
