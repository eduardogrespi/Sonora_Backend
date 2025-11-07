import { Router } from 'express'
import controller from '../controllers/eventos.js' // Caminho e nome do arquivo do controller Evento

const router = Router()

router.post('/', controller.create)

router.get('/', controller.retrieveAll)

// :id é um PARÂMETRO DE ROTA, que permite buscar/atualizar/excluir um evento específico
router.get('/:id', controller.retrieveOne)

router.put('/:id', controller.update)

router.delete('/:id', controller.delete)

export default router