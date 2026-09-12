function attachUserLocals(req, res, next) {
  res.locals.user = req.user;
  next();
}

export { attachUserLocals };
