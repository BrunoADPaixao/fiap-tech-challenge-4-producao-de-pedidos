const express = require("express");
const router = express.Router();
const producaoController = require("../controllers/producaoController");

// Rota para criar um novo pedido (para testes)
router.post("/", producaoController.criarPedido);

// Rota para listar os pedidos na fila da cozinha (não finalizados)
router.get("/fila", producaoController.listarFila);

// Rota para listar todos os pedidos (histórico)
router.get("/todos", producaoController.listarTodos); // Alterado para /todos para evitar conflito com /:id

// Rota para atualizar o status de um pedido
router.put("/:id/status", producaoController.atualizarStatus);

module.exports = router;
