import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userGeneralRoutes from "./routes/users/UsersGeneral.js";
import userAuthRoutes from "./routes/users/UsersAuth.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
dotenv.config();

const options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Kumashiop API",
      version: "1.0.0",
    },
  },
  apis: ["./src/routes/*/*.js"],
};

const app = express();
const port = process.env.PORT;

const specs = swaggerJSDoc(options);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

app.use(userGeneralRoutes);
app.use(userAuthRoutes);

app.listen(port, () => {
  console.log(`server running perfectly at port ${port}`);
});
