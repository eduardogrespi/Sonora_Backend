import { Router } from 'express'
import controller from '../controllers/participacoes.js'

const router = Router()

// Rotas CRUD padrão para ParticipacaoEvento
router.post('/', controller.create) // Criar participação / Comprar ingresso
router.get('/', controller.retrieveAll)
router.get('/:id', controller.retrieveOne)
router.delete('/:id', controller.delete) // Cancelar participação/ingresso

export default router