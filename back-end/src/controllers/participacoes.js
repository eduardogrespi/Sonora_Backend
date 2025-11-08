import prisma from '../database/client.js'
import { includeRelations } from '../lib/utils.js'

const controller = {}

// Cria um registro de ParticipacaoEvento (simulando a compra de ingresso)
controller.create = async function(req, res) {
  try {
    // Campos necessários: evento_id, cliente_id
    const { evento_id, cliente_id } = req.body;

    if (!evento_id || !cliente_id) {
      return res.status(400).send({ error: 'Os campos evento_id e cliente_id são obrigatórios.' });
    }

    await prisma.participacaoEvento.create({ data: req.body })
    res.status(201).end() // HTTP 201: Created
  }
  catch(error) {
    console.error(error)
    // P2002: Tentativa de participar duas vezes do mesmo evento (chave @@unique)
    if(error?.code === 'P2002') {
      return res.status(400).send({ error: 'Cliente já está cadastrado para este evento.' });
    }
    // P2003: Evento ou Cliente não existe
    if(error?.code === 'P2003') {
        return res.status(400).send({ error: 'Evento ou Cliente não encontrado.' });
    }
    res.status(500).send(error)
  }
}

// Lista todas as participações
controller.retrieveAll = async function(req, res) {
  try {
    const include = includeRelations(req.query)

    const result = await prisma.participacaoEvento.findMany({
      include,
      orderBy: [ { data_compra: 'desc' }]
    })

    res.send(result)
  }
  catch(error) {
    console.error(error)
    res.status(500).send(error)
  }
}

// Busca uma participação pelo ID
controller.retrieveOne = async function(req, res) {
  try {
    const include = includeRelations(req.query)

    const result = await prisma.participacaoEvento.findUnique({
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

// Exclui uma participação (simulando cancelamento de ingresso)
controller.delete = async function(req, res) {
  try {
    await prisma.participacaoEvento.delete({
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