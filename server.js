import "./config/env.js";

import { app } from "./app.js";

const PORT = process.env.PORT || 3000;

app
  .listen(PORT, () => {
    console.log(`Server is listening on PORT: ${PORT}`);
  })
  .on("error", (error) => {
    console.error("Server failed to start with error: ", error);
  });
