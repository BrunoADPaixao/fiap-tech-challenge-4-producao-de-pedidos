const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const swaggerFile = require("../swagger-output.json");
const producaoRoutes = require("./routes/producaoRoutes");
const { connectDB } = require("./config/db");

const app = express();
const PORT = 3002;

connectDB()
  .then(() => {
    app.use(cors());

    app.use(bodyParser.json());
    // Rotas da API
    app.use("/pedidos", producaoRoutes);

    // Rota da documentação Swagger
    app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

    app.get("/", (req, res) => {
      res.send(
        "Microsserviço de Produção está no ar e conectado ao MongoDB! Acesse /doc para ver a documentação."
      );
    });

    app.listen(PORT, () => {
      console.log(`Servidor de Produção rodando na porta ${PORT}`);
      console.log(`Acesse a documentação em http://localhost:${PORT}/doc`);
    });
  })
  .catch((err) => {
    console.error("Falha ao iniciar o servidor", err);
  });

module.exports = app;
