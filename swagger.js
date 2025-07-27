const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "API do Microsserviço de Produção",
    description:
      "API para gerenciar o fluxo de preparação de pedidos na cozinha.",
  },
  host: "localhost:3002",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/index.js"]; // Apontar para o arquivo que define as rotas

swaggerAutogen(outputFile, endpointsFiles, doc);
