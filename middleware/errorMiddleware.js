function serverErrorMiddleware(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const errMessage = err.message || "Internal server error";

  if (req.accepts("html")) {
    return res.status(statusCode).type("text").send(`Error: ${errMessage}`);
  }

  return res.status(statusCode).json({ error: errMessage });
}

function notFoundMiddleware(req, res, next) {
  res.status(404);

  if (req.accepts("html")) {
    return res.type("text").send("404 not found");
  }

  // Minimal version for now.
  return res.json({ error: "Page not found" });
}

export { serverErrorMiddleware, notFoundMiddleware };
