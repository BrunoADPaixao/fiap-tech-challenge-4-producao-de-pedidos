const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const STATUS_VALIDOS = ["Recebido", "Em preparação", "Pronto", "Finalizado"];

exports.criarPedido = async (req, res) => {
  try {
    const db = getDB();
    const { cliente_id, itens } = req.body;

    if (!cliente_id || !itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        message:
          "Dados do pedido inválidos. 'cliente_id' e 'itens' são obrigatórios.",
      });
    }

    const novoPedido = {
      cliente_id,
      itens,
      status: "Recebido", // Status inicial padrão
      createdAt: new Date(),
    };

    const result = await db.collection("pedidos").insertOne(novoPedido);
    res.status(201).json({
      message: "Pedido recebido na produção com sucesso!",
      insertedId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao criar o pedido na produção.",
      error: error.message,
    });
  }
};

// Lista os pedidos que não estão com status "Finalizado"
exports.listarFila = async (req, res) => {
  try {
    const db = getDB();
    const fila = await db
      .collection("pedidos")
      .find({ status: { $ne: "Finalizado" } })
      .toArray();
    res.status(200).json(fila);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar a fila de pedidos.",
      error: error.message,
    });
  }
};

// Lista todos os pedidos
exports.listarTodos = async (req, res) => {
  try {
    const db = getDB();
    const pedidos = await db.collection("pedidos").find({}).toArray();
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar todos os pedidos.",
      error: error.message,
    });
  }
};

// Atualiza o status de um pedido específico
exports.atualizarStatus = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID do pedido inválido." });
    }

    if (!status || !STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({
        message: `Status inválido. Use um dos seguintes: ${STATUS_VALIDOS.join(
          ", "
        )}`,
      });
    }

    const result = await db
      .collection("pedidos")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status: status, updatedAt: new Date() } },
        { returnDocument: "after" }
      );

    if (!result) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao atualizar o status do pedido.",
      error: error.message,
    });
  }
};
