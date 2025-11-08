import { Router } from 'express'
import controller from '../controllers/comentarios.js'

const router = Router()

// Rotas CRUD padrão
router.post('/', controller.create)
router.get('/', controller.retrieveAll)
router.get('/:id', controller.retrieveOne)
router.put('/:id', controller.update)
router.delete('/:id', controller.delete)

export default router