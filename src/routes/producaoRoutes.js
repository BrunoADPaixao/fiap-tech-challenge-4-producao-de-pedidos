const express = require("express");
const router = express.Router();
const producaoController = require("../controllers/producaoController");

// Rota para criar um novo pedido
router.post(
  "/",
  /* #swagger.tags = ['Produção']
    #swagger.summary = 'Cria um novo pedido na fila (contrato atualizado).'
    #swagger.description = 'Endpoint para registrar um novo pedido vindo do microsserviço de Pedidos.'
    #swagger.parameters['pedido'] = {
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
    } 
    */
  producaoController.criarPedido
);

// Rota para listar os pedidos na fila da cozinha (não finalizados)
router.get(
  "/fila",
  /* #swagger.tags = ['Produção']
    #swagger.summary = 'Lista os pedidos na fila da cozinha.'
    #swagger.description = 'Retorna todos os pedidos que ainda não foram finalizados.'
    */
  producaoController.listarFila
);

// Rota para listar todos os pedidos (histórico)
router.get(
  "/todos",
  /* #swagger.tags = ['Produção']
    #swagger.summary = 'Lista todos os pedidos já registrados.'
    #swagger.description = 'Retorna um histórico completo de todos os pedidos.'
    */
  producaoController.listarTodos
);

// Rota para atualizar o status de um pedido
router.put(
  "/:id/status",
  /* #swagger.tags = ['Produção']
    #swagger.summary = 'Atualiza o status de um pedido.'
    #swagger.description = 'Altera o status de um pedido específico (ex: Recebido -> Em preparação).'
    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID do Pedido.',
        required: true,
        type: 'string'
    }
    #swagger.parameters['status'] = {
        in: 'body',
        description: 'O novo status do pedido.',
        required: true,
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'Em preparação' }
            }
        }
    } 
    */
  producaoController.atualizarStatus
);

module.exports = router;
