import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono'
import {sign} from 'hono/jwt'

const app = new Hono<{
  Bindings:{
    DATABASE_URL:string;
    JWT_SECRET: string;
  }
}>()

app.post ('/api/v1/user/signup', async (c) => {

  const prisma = new PrismaClient({
    datasourceUrl : c.env.DATABASE_URL,
  }).$extends(withAccelerate()); 


  const body = await c.req.json();

  try{
    const user = await prisma.user.create({
      data:{
        username : body.username,
        password : body.password,
        name : body.name,
      }
    })
    const jwt = await sign({id : user.id},c.env.JWT_SECRET);

    return c.json({
      message : "user is created"
    })
  }
  catch(e){
    c.status(403)
    console.log(e);
    return c.json({
      message : "user can't be created"
    })
  }



  return c.text('Hello Hono!')
})

app.post ('/api/v1/user/signin', (c) => {
  return c.text('Hello Hono!')
})

app.post ('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})

app.put ('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})

app.get ('/api/v1/blog/:id', (c) => {
  
   
  return c.text('Hello Hono!')
})

app.get ('/api/v1/blog/bulk', (c) => {
  return c.text('Hello Hono!')
})

export default app
