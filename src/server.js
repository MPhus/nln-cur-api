import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { corsOptions } from '~/config/cors'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1/'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddlewares'

const START = () => {
  const app = express()
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
  // Use Cookie
  app.use(cookieParser())

  app.use(cors(corsOptions))


  app.use(express.json())

  app.use('/v1', APIs_V1)

  app.use(errorHandlingMiddleware)
  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => console.log(`Production: ${env.AUTHOR}'s app listening on PORT :${process.env.PORT}`))
  } else {
    app.listen(env.LOCAL_DEV_PORT, env.LOCAL_DEV_HOST, () => console.log(`Local Dev: ${env.AUTHOR}'s app listening on http://${env.LOCAL_DEV_HOST}:${env.LOCAL_DEV_PORT}`))
  }


  exitHook(async () => {
    CLOSE_DB()
    console.log('Exit...')

  })

}
(async () => {
  try {
    console.log('Connecting...')
    await CONNECT_DB()
    console.log('Connect successfully')
    START()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()