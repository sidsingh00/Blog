
import  {Hono} from 'hono';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {sign} from 'hono/jwt'


export const userRouter = new Hono<{
    Bindings :{
        DATABASE_URL : string, 
        JWT_SECRET: string,
    }
}>();



userRouter.post ('/signup', async (c) => {

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

  })
  
  userRouter.post ('/signin', async (c) => {
  
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    try{
      const user = await prisma.user.findFirst({
        where:{
          username: body.username,
          password: body.password,
        }
      })
  
      if(!user){
        c.status(403);
        return c.json({
          message:"user don't found"
        })
      }
    }
    catch(e){
      c.status(411);
      console.error(e);
      
      return c.json({
        message: "invalid user"
      })
    }
  
  })
  