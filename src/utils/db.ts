import {Kysely} from 'kysely'
import {PlanetScaleDialect} from 'kysely-planetscale'

const db = new Kysely<Database>({
  dialect: new PlanetScaleDialect({
    host: '<host>',
    username: '<user>',
    password: '<password>',
  }),
})
