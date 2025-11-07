import { includeRelations } from '../lib/utils.js'
import prisma from '../database/client.js'

const controller = {}   

controller.create = async function(req, res) {
  /*
    Cria um novo registro de Artista, garantindo que os dados obrigatórios
    (nome, genero_musical, email) estejam presentes no corpo da requisição.
  */
  try {
    const { nome, genero_musical, email } = req.body;

    // Validação de campos obrigatórios antes de tentar criar
    if (!nome || !genero_musical || !email) {
      return res.status(400).send({ error: 'Os campos nome, genero_musical e email são obrigatórios.' });
    }

    await prisma.artista.create({ data: req.body })

    // HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    console.error(error)

    // P2002: Tentativa de inserção com email ou nome duplicado (@unique)
    if(error?.code === 'P2002') {
      return res.status(400).send({ error: 'Email ou nome já cadastrado.' });
    }

    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}


controller.retrieveAll = async function(req, res) {
  try {
    const include = includeRelations(req.query)

    // Manda buscar todos os artistas
    const result = await prisma.artista.findMany({
      include,
      orderBy: [ { nome: 'asc' }]  
    })

    // Retorna os dados obtidos
    res.send(result)
  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}


controller.retrieveOne = async function(req, res) {
  try {
    const include = includeRelations(req.query)

    // Manda recuperar o artista pelo ID
    const result = await prisma.artista.findUnique({
      include,
      where: { id: req.params.id }
    })

    // Encontrou ~> retorna HTTP 200: OK (implícito)
    if(result) res.send(result)
    // Não encontrou ~> retorna HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}


controller.update = async function(req, res) {
  try {
    // Busca e atualiza o artista
    await prisma.artista.update({
      where: { id: req.params.id },
      data: req.body
    })

    // Encontrou e atualizou ~> retorna HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    console.error(error)

    if(error?.code === 'P2025') {
      // Não encontrou ~> retorna HTTP 404: Not Found
      res.status(404).end()
    } else if (error?.code === 'P2002') {
      // Tentativa de atualizar com email ou nome duplicado
      res.status(400).send({ error: 'Email ou nome já cadastrado.' });
    }
    else {    
      // HTTP 500: Internal Server Error
      res.status(500).send(error)
    }
  }
}

controller.delete = async function(req, res) {
  try {
    // Busca e efetua a exclusão
    await prisma.artista.delete({
      where: { id: req.params.id }
    })

    // Encontrou e excluiu ~> retorna HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    console.error(error)

    if(error?.code === 'P2025') {
      // Não encontrou ~> retorna HTTP 404: Not Found
      res.status(404).end()
    } else if (error?.code === 'P2003') {
      // Tentativa de excluir artista com eventos relacionados (chave estrangeira)
      res.status(400).send({ error: 'Não é possível excluir o artista. Existem eventos relacionados.' });
    }
    else {    
      // HTTP 500: Internal Server Error
      res.status(500).send(error)
    }
  }
}

export default controller