import { includeRelations } from '../lib/utils.js'
import prisma from '../database/client.js'

const controller = {}   // Objeto vazio

controller.create = async function(req, res) {
  /*
    Cria um novo Pedido/Carrinho. O campo 'status' (default 'pending')
    permite ao front-end usar esta entidade como um carrinho simples.
  */
  try {
    const { cliente_id } = req.body;
    
    // Validação mínima para garantir que o pedido/carrinho tenha um cliente associado
    if (!cliente_id) {
        return res.status(400).send({ error: 'O campo cliente_id é obrigatório para criar um pedido/carrinho.' });
    }

    const data = await prisma.pedido.create({ data: req.body })

    // Envia um código de sucesso ao front-end, retornando o ID do novo pedido (carrinho)
    // HTTP 201: Created
    res.status(201).send({ id: data.id })
  }
  catch(error) {
    // Algo deu errado: exibe o erro no terminal
    console.error(error)

    // P2003: Falha na chave estrangeira (cliente_id não existe)
    if(error?.code === 'P2003') {
        return res.status(400).send({ error: 'ClienteID fornecido não existe.' });
    }

    // Envia o erro ao front-end, com código de erro
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}

// NOVO: Função para o checkout, alterando o status do pedido para 'ordered'
controller.checkout = async function(req, res) {
    try {
        // Busca se existe um pedido com o ID e status 'pending' para ser atualizado
        const pedido = await prisma.pedido.findUnique({
            where: { id: req.params.id }
        })

        if (!pedido) {
             return res.status(404).end();
        }

        // Simula a transição de um carrinho (pending) para um pedido finalizado (ordered)
        await prisma.pedido.update({
            where: { id: req.params.id },
            data: { status: 'ordered' }
        })
        
        res.status(204).end() // HTTP 204: No Content
    }
    catch(error) {
        console.error(error)
        if(error?.code === 'P2025') {
            // Não encontrou o pedido
            res.status(404).end()
        }
        else {
            res.status(500).send(error)
        }
    }
}


controller.retrieveAll = async function(req, res) {
  try {

    const include = includeRelations(req.query)

    // Manda buscar todas os pedidos cadastradas no BD
    const result = await prisma.pedido.findMany({
      include,
      orderBy: [ { num_pedido: 'asc' }]  // Ordem ASCendente
    })

    // Retorna os dados obtidos ao cliente com o status
    // HTTP 200: OK (implícito)
    res.send(result)
  }
  catch(error) {
    // Algo deu errado: exibe o erro no terminal
    console.error(error)

    // Envia o erro ao front-end, com código de erro
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}

controller.retrieveOne = async function(req, res) {
  try {

    const include = includeRelations(req.query)

    // Manda recuperar o documento no servidor de BD
    // usando como critério um id informado no parâmetro
    // da requisição
    const result = await prisma.pedido.findUnique({
      include,
      where: { id: req.params.id }
    })

    // Encontrou o docuemento ~> retorna HTTP 200: OK (implícito)
    if(result) res.send(result)
    // Não encontrou o documento ~> retorna HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    // Algo deu errado: exibe o erro no terminal
    console.error(error)

    // Envia o erro ao front-end, com código de erro
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}


controller.update = async function(req, res) {
  try {
    // Busca o documento passado como parâmetro e, caso o documento seja
    // encontrado, atualiza-o com as informações contidas em req.body
    await prisma.pedido.update({
      where: { id: req.params.id },
      data: req.body
    })

    // Encontrou e atualizou ~> retorna HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    // Algo deu errado: exibe o erro no terminal
    console.error(error)

    // P2025: erro do Prisma referente a objeto não encontrado
    if(error?.code === 'P2025') {
      // Não encontrou e não atualizou ~> retorna HTTP 404: Not Found
      res.status(404).end()
    }
    else {    // Outros tipos de erro
      // Envia o erro ao front-end, com código de erro
      // HTTP 500: Internal Server Error
      res.status(500).send(error)
    }
  }
}

controller.delete = async function(req, res) {
  try {
    // Busca o documento pelo id passado como parâmetro
    // e efetua a exclusão, caso o documento seja encontrado
    await prisma.pedido.delete({
      where: { id: req.params.id }
    })

    // Encontrou e excluiu ~> retorna HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    // Algo deu errado: exibe o erro no terminal
    console.error(error)

    // P2025: erro do Prisma referente a objeto não encontrado
    if(error?.code === 'P2025') {
      // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
      res.status(404).end()
    }
    else {    // Outros tipos de erro
      // Envia o erro ao front-end, com código de erro
      // HTTP 500: Internal Server Error
      res.status(500).send(error)
    }
  }
}

controller.createItem = async function(req, res) {
 try {
   // Adiciona no corpo da requisição o item do pedido,
   // passada como parâmetro na rota
   req.body.pedido_id = req.params.id


   await prisma.itemPedido.create({ data: req.body })


   // Envia uma mensagem de sucesso ao front-end
   // HTTP 201: Created
   res.status(201).end()
 }
 catch(error) {
   // Deu errado: exibe o erro no terminal
   console.error(error)


   // Envia o erro ao front-end, com status de erro
   // HTTP 500: Internal Server Error
   res.status(500).send(error)
 }
}


controller.retrieveAllItems = async function(req, res) {
 try {
   const include = includeRelations(req.query)


   const result = await prisma.itemPedido.findMany({
     where: { pedido_id: req.params.id },
     orderBy: [ { num_item: 'asc' } ],
     include
   })


   // HTTP 200: OK
   res.send(result)
 }
 catch(error) {
   // Deu errado: exibe o erro no terminal
   console.error(error)


   // Envia o erro ao front-end, com status de erro
   // HTTP 500: Internal Server Error
   res.status(500).send(error)
 }
}


controller.retrieveOneItem = async function(req, res) {
 try {
   /*
     A rigor, o item do pedido poderia ser encontrado apenas pelo seu id.
     No entanto, para forçar a necessidade de um item ao pedido correspondente,
     a busca é feita usando-se tanto o id do item quanto o id do pedido.
   */
   const result = await prisma.itemPedido.findFirst({
     where: {
       id: req.params.itemId,
       pedido_id: req.params.id
     }
   })


   // Encontrou o documento ~> HTTP 200: OK (implícito)
   if(result) res.send(result)
   // Não encontrou ~> HTTP 404: Not Found
   else res.status(404).end()
 }
 catch(error) {
   // Deu errado: exibe o erro no terminal
   console.error(error)


   // Envia o erro ao front-end, com status de erro
   // HTTP 500: Internal Server Error
   res.status(500).send(error)
 }
}


controller.updateItem = async function(req, res) {
 try {
   await prisma.itemPedido.update({
     where: {
       id: req.params.itemId,
       pedido_id: req.params.id
     },
     data: req.body
   })


   // Encontrou e atualizou ~> HTTP 204: No Content
   res.status(204).end()


 }
 catch(error) {
   // P2025: erro do Prisma referente a objeto não encontrado
   if(error?.code === 'P2025') {
     // Não encontrou e não alterou ~> retorna HTTP 404: Not Found
     res.status(404).end()
   }
   else {    // Outros tipos de erro
     // Deu errado: exibe o erro no terminal
     console.error(error)


     // Envia o erro ao front-end, com status de erro
     // HTTP 500: Internal Server Error
     res.status(500).send(error)
   }
 }
}


controller.deleteItem = async function(req, res) {
 try {
   await prisma.itemPedido.delete({
     where: {
       id: req.params.itemId,
       pedido_id: req.params.id
     }
   })


   // Encontrou e excluiu ~> HTTP 204: No Content
   res.status(204).end()
 }
 catch(error) {
   // P2025: erro do Prisma referente a objeto não encontrado
   if(error?.code === 'P2025') {
     // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
     res.status(404).end()
   }
   else {    // Outros tipos de erro
     // Deu errado: exibe o erro no terminal
     console.error(error)


     // Envia o erro ao front-end, com status de erro
     // HTTP 500: Internal Server Error
     res.status(500).send(error)
   }
 }
}


export default controller