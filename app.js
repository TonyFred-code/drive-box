import "./config/passport.js";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { prisma } from "./db/prisma.js";
import { indexRouter } from "./routes/index.route.js";
import passport from "passport";
import { registerRouter } from "./routes/register.route.js";
import { dashboardRouter } from "./routes/dashboard.route.js";
import { logoutRouter } from "./routes/logout.route.js";
import { loginRouter } from "./routes/login.route.js";
import { directoryRouter } from "./routes/directory.route.js";
import { attachUserLocals } from "./middleware/responseModifiers.js";
import { fileRouter } from "./routes/file.route.js";
import {
  notFoundMiddleware,
  serverErrorMiddleware,
} from "./middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());

app.use(express.static(join(__dirname, "public")));

app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// SESSION SETUP

app.set("trust proxy", 1);

app.use(
  session({
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // Clear expired sessions every 2 minutes
      dbRecordIdFunction: undefined,
      dbRecordIdIsSessionId: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    saveUninitialized: false,
  })
);

// PASSPORT AUTHENTICATION
app.use(passport.initialize());
app.use(passport.session());

// attach user locals
app.use(attachUserLocals);

// ROUTES
app.use("/files", fileRouter);
app.use("/directories", directoryRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/dashboard", dashboardRouter);
app.use("/register", registerRouter);
app.use("/", indexRouter);

app.use(notFoundMiddleware);

app.use(serverErrorMiddleware);

export { app };
