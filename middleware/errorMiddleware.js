function serverErrorMiddleware(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const errMessage = err.message || "Internal server error";

  if (req.accepts("json")) {
    return res.status(statusCode).res.json({ error: errMessage });
  }

  res.status(statusCode).type("text").send(`Error: ${errMessage}`);
}

function notFoundMiddleware(req, res, next) {
  res.status(404);

  if (req.accepts("json")) {
    return res.json({ error: "Page not found" });
  }

  // Minimal version for now.
  res.type("text").send("404 not found");
}

export { serverErrorMiddleware, notFoundMiddleware };
