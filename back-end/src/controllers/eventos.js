import { includeRelations } from '../lib/utils.js'
import prisma from '../database/client.js'

const controller = {}  

controller.create = async function(req, res) {
  /*
    Cria um novo registro de Evento
  */
  try {
    // ATUALIZADO: Incluir 'nome' e 'horario' na validação
    const { artista_id, data, local, nome, horario, preco_ingresso } = req.body;

    // Validação de campos obrigatórios
    if (!artista_id || !data || !local || !nome || !horario || preco_ingresso === undefined) {
      return res.status(400).send({ error: 'Os campos artista_id, data, local, nome, horario e preco_ingresso são obrigatórios.' });
    }

    // Ajuste de tipos (converte data para objeto Date)
    const dadosEvento = { 
      ...req.body,
      data: new Date(data)
    };

    await prisma.evento.create({ data: dadosEvento })

    // HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    console.error(error)

    // P2003: Falha na chave estrangeira (artista_id não existe)
    if(error?.code === 'P2003') {
      return res.status(400).send({ error: 'ArtistaID fornecido não existe.' });
    }

    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}


controller.retrieveAll = async function(req, res) {
  try {
    const include = includeRelations(req.query)

    // Manda buscar todos os eventos
    const result = await prisma.evento.findMany({
      include,
      orderBy: [ { data: 'asc' }]  
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

    // Manda recuperar o evento pelo ID
    const result = await prisma.evento.findUnique({
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
    const dadosAtualizados = req.body;

    // Ajuste de tipos (converte data para objeto Date se estiver presente)
    if (dadosAtualizados.data) {
      dadosAtualizados.data = new Date(dadosAtualizados.data);
    }

    // Busca e atualiza o evento
    await prisma.evento.update({
      where: { id: req.params.id },
      data: dadosAtualizados
    })

    // Encontrou e atualizou ~> retorna HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    console.error(error)

    if(error?.code === 'P2025') {
      // Não encontrou ~> retorna HTTP 404: Not Found
      res.status(404).end()
    } else if (error?.code === 'P2003') {
      // Tentativa de atualizar com ArtistaID que não existe
      res.status(400).send({ error: 'ArtistaID fornecido não existe.' });
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
    await prisma.evento.delete({
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
    }
    else {    
      // HTTP 500: Internal Server Error
      res.status(500).send(error)
    }
  }
}

export default controller