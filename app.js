import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Drive box initialized");
});

export { app };
