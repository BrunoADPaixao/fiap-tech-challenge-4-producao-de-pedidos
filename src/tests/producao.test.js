// tests/producao.test.js
const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { MongoClient } = require("mongodb");

// Importar as rotas que queremos testar
const producaoRoutes = require("../routes/producaoRoutes");

// Precisamos mockar nosso módulo de DB para usar o banco em memória
jest.mock("../config/db", () => ({
  getDB: () => global.db,
  connectDB: jest.fn(),
}));

const app = express();
app.use(bodyParser.json());
app.use("/pedidos", producaoRoutes);

let mongod;
let connection;

beforeAll(async () => {
  // Inicia um servidor MongoDB em memória
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Conecta ao banco em memória
  connection = await MongoClient.connect(uri, {});
  global.db = connection.db("testdb");
});

afterAll(async () => {
  // Limpa e fecha as conexões
  await connection.close();
  await mongod.stop();
});

// Limpa a coleção de pedidos antes de cada teste
beforeEach(async () => {
  await global.db.collection("pedidos").deleteMany({});
});

describe("API de Produção (/pedidos)", () => {
  // Teste para criar um novo pedido
  describe("POST /pedidos", () => {
    it("deve criar um novo pedido e retornar status 201", async () => {
      const novoPedido = {
        cliente_id: "cliente123",
        itens: [{ produto_id: 1, nome_produto: "Hambúrguer", quantidade: 1 }],
      };

      const response = await request(app).post("/pedidos").send(novoPedido);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Pedido recebido na produção com sucesso!"
      );
      expect(response.body).toHaveProperty("insertedId");
    });

    it("deve retornar erro 400 se os dados forem inválidos", async () => {
      const response = await request(app)
        .post("/pedidos")
        .send({ cliente_id: "cliente123" }); // Faltando 'itens'

      expect(response.statusCode).toBe(400);
    });
  });

  // Teste no estilo BDD para listar a fila
  describe("GET /pedidos/fila", () => {
    it("Dado que existem pedidos na fila, Quando a rota for chamada, Então deve retornar a lista de pedidos não finalizados e status 200", async () => {
      // DADO que existem pedidos na fila
      const pedidos = [
        {
          cliente_id: "c1",
          itens: [],
          status: "Recebido",
          createdAt: new Date(),
        },
        {
          cliente_id: "c2",
          itens: [],
          status: "Em preparação",
          createdAt: new Date(),
        },
        {
          cliente_id: "c3",
          itens: [],
          status: "Finalizado",
          createdAt: new Date(),
        },
      ];
      await global.db.collection("pedidos").insertMany(pedidos);

      // QUANDO a rota for chamada
      const response = await request(app).get("/pedidos/fila");

      // ENTÃO deve retornar a lista e o status correto
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2); // Apenas os não finalizados
      expect(response.body.some((p) => p.status === "Finalizado")).toBe(false);
    });
  });

  // Teste para atualizar o status
  describe("PUT /pedidos/:id/status", () => {
    it("deve atualizar o status de um pedido existente e retornar status 200", async () => {
      const pedidoInicial = await global.db.collection("pedidos").insertOne({
        cliente_id: "c4",
        itens: [],
        status: "Recebido",
        createdAt: new Date(),
      });
      const pedidoId = pedidoInicial.insertedId.toString();

      const response = await request(app)
        .put(`/pedidos/${pedidoId}/status`)
        .send({ status: "Pronto" });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("Pronto");
    });

    it("deve retornar erro 404 se o pedido não existir", async () => {
      const idInexistente = "656a6f9b1e4f6e8d1c2b3a4e"; // ID válido mas que não existe no DB
      const response = await request(app)
        .put(`/pedidos/${idInexistente}/status`)
        .send({ status: "Pronto" });

      expect(response.statusCode).toBe(404);
    });
  });
});
