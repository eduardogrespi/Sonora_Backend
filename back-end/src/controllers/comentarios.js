import prisma from '../database/client.js'
import { includeRelations } from '../lib/utils.js'

const controller = {}

// Cria um novo comentário para um produto
controller.create = async function(req, res) {
  try {
    // Campos necessários para um comentário
    const { texto, produto_id, cliente_id } = req.body;

    if (!texto || !produto_id || !cliente_id) {
      return res.status(400).send({ error: 'Os campos texto, produto_id e cliente_id são obrigatórios.' });
    }

    await prisma.comentarioProduto.create({ data: req.body })
    res.status(201).end() // HTTP 201: Created
  }
  catch(error) {
    console.error(error)
    if(error?.code === 'P2003') {
        return res.status(400).send({ error: 'Produto ou Cliente não encontrado.' });
    }
    res.status(500).send(error)
  }
}

// Lista todos os comentários (com opção de incluir Produto e Cliente)
controller.retrieveAll = async function(req, res) {
  try {
    const include = includeRelations(req.query)

    const result = await prisma.comentarioProduto.findMany({
      include,
      orderBy: [ { data_criacao: 'desc' }]
    })

    res.send(result) // HTTP 200: OK
  }
  catch(error) {
    console.error(error)
    res.status(500).send(error)
  }
}

// Busca um comentário pelo ID
controller.retrieveOne = async function(req, res) {
  try {
    const include = includeRelations(req.query)

    const result = await prisma.comentarioProduto.findUnique({
      include,
      where: { id: req.params.id }
    })

    if(result) res.send(result)
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    res.status(500).send(error)
  }
}

// Atualiza um comentário
controller.update = async function(req, res) {
  try {
    await prisma.comentarioProduto.update({
      where: { id: req.params.id },
      data: req.body
    })

    res.status(204).end() // HTTP 204: No Content
  }
  catch(error) {
    console.error(error)
    if(error?.code === 'P2025') {
      res.status(404).end()
    }
    else {
      res.status(500).send(error)
    }
  }
}

// Exclui um comentário
controller.delete = async function(req, res) {
  try {
    await prisma.comentarioProduto.delete({
      where: { id: req.params.id }
    })

    res.status(204).end() // HTTP 204: No Content
  }
  catch(error) {
    console.error(error)
    if(error?.code === 'P2025') {
      res.status(404).end()
    }
    else {
      res.status(500).send(error)
    }
  }
}

export default controller