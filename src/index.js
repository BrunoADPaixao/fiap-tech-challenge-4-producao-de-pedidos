// index.js
const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("../swagger-output.json");
const producaoRoutes = require("./routes/producaoRoutes");
const { connectDB } = require("./config/db");

const app = express();
const PORT = 3002;

// Conecta ao banco de dados e então inicia o servidor
connectDB()
  .then(() => {
    // Middlewares
    app.use(bodyParser.json());

    // Rotas da API
    app.use("/pedidos", producaoRoutes);

    // Rota da documentação Swagger
    app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

    // Endpoint raiz
    app.get("/", (req, res) => {
      // #swagger.ignore = true
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
