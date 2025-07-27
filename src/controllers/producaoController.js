// controllers/producaoController.js
const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const STATUS_VALIDOS = ["Recebido", "Em preparação", "Pronto", "Finalizado"];

// Cria um novo pedido (adaptado para o novo contrato)
exports.criarPedido = async (req, res) => {
  // #swagger.tags = ['Produção']
  // #swagger.summary = 'Cria um novo pedido na fila (contrato atualizado).'
  // #swagger.description = 'Endpoint para registrar um novo pedido vindo do microsserviço de Pedidos.'
  /* #swagger.parameters['pedido'] = {
           in: 'body',
           description: 'Dados do novo pedido conforme contrato.',
           required: true,
           schema: {
             type: 'object',
             properties: {
               cliente_id: { type: 'string', example: '12345678901' },
               itens: {
                 type: 'array',
                 items: {
                   type: 'object',
                   properties: {
                     produto_id: { type: 'integer', example: 1 },
                     nome_produto: { type: 'string', example: 'Hambúrguer Clássico' },
                     categoria: { type: 'string', example: 'Lanche' },
                     quantidade: { type: 'integer', example: 2 },
                     preco_unitario: { type: 'number', example: 15.50 },
                     observacoes: { type: 'string', example: 'Sem cebola' }
                   }
                 }
               }
             }
           }
    } */
  try {
    const db = getDB();
    const { cliente_id, itens } = req.body;

    // Validação básica para o novo contrato
    if (!cliente_id || !itens || !Array.isArray(itens) || itens.length === 0) {
      return res
        .status(400)
        .json({
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
    res
      .status(201)
      .json({
        message: "Pedido recebido na produção com sucesso!",
        insertedId: result.insertedId,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erro ao criar o pedido na produção.",
        error: error.message,
      });
  }
};

// Lista os pedidos que não estão com status "Finalizado"
exports.listarFila = async (req, res) => {
  // #swagger.tags = ['Produção']
  // #swagger.summary = 'Lista os pedidos na fila da cozinha.'
  // #swagger.description = 'Retorna todos os pedidos que ainda não foram finalizados.'
  try {
    const db = getDB();
    const fila = await db
      .collection("pedidos")
      .find({ status: { $ne: "Finalizado" } })
      .toArray();
    res.status(200).json(fila);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erro ao buscar a fila de pedidos.",
        error: error.message,
      });
  }
};

// Lista todos os pedidos (para um histórico, por exemplo)
exports.listarTodos = async (req, res) => {
  // #swagger.tags = ['Produção']
  // #swagger.summary = 'Lista todos os pedidos já registrados.'
  // #swagger.description = 'Retorna um histórico completo de todos os pedidos.'
  try {
    const db = getDB();
    const pedidos = await db.collection("pedidos").find({}).toArray();
    res.status(200).json(pedidos);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erro ao buscar todos os pedidos.",
        error: error.message,
      });
  }
};

// Atualiza o status de um pedido específico
exports.atualizarStatus = async (req, res) => {
  // #swagger.tags = ['Produção']
  // #swagger.summary = 'Atualiza o status de um pedido.'
  // #swagger.description = 'Altera o status de um pedido específico (ex: Recebido -> Em preparação).'
  /* #swagger.parameters['id'] = {
           in: 'path',
           description: 'ID do Pedido.',
           required: true,
           type: 'string'
    } */
  /* #swagger.parameters['status'] = {
           in: 'body',
           description: 'O novo status do pedido.',
           required: true,
           schema: {
             type: 'object',
             properties: {
               status: { type: 'string', example: 'Em preparação' }
             }
           }
    } */
  try {
    const db = getDB();
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID do pedido inválido." });
    }

    if (!status || !STATUS_VALIDOS.includes(status)) {
      return res
        .status(400)
        .json({
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
    res
      .status(500)
      .json({
        message: "Erro ao atualizar o status do pedido.",
        error: error.message,
      });
  }
};
