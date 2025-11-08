import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'

const app = express()

app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', indexRouter)
app.use('/users', usersRouter)

/******************** ROTAS ********************/

import categoriasRouter from './routes/categorias.js'
app.use('/categorias', categoriasRouter)

import clientesRouter from './routes/clientes.js'
app.use('/clientes', clientesRouter)

import fornecedoresRouter from './routes/fornecedores.js'
app.use('/fornecedores', fornecedoresRouter)

import pedidosRouter from './routes/pedidos.js'
app.use('/pedidos', pedidosRouter)

import produtosRouter from './routes/produtos.js'
app.use('/produtos', produtosRouter)

import artistasRouter from './routes/artistas.js'
app.use('/artistas', artistasRouter)

import eventosRouter from './routes/eventos.js'
app.use('/eventos', eventosRouter)

// NOVAS ROTAS IMPLEMENTADAS
import comentariosRouter from './routes/comentarios.js'
app.use('/comentarios', comentariosRouter)

import participacoesRouter from './routes/participacoes.js'
app.use('/participacoes', participacoesRouter)

export default app