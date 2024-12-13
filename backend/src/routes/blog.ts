
import { PrismaClient } from '@prisma/client/extension';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Hono } from 'hono'
import { verify } from 'hono/jwt';

export const blogRouter = new Hono<{
    Bindings:{
        DATABASE_URL :string,
        JWT_SECRET: string
    },
    Variables?:{
        userId: string
    }
}>();

blogRouter.use("/*",async (c,next)=>{
    
    const authHeader = c.req.header('authorization')|| "";
    const user = await verify(authHeader,c.env.JWT_SECRET);

    if(user){
        //@ts-ignore
        c.set("userId",user.id);
        next();
    }
    else{
        c.status(403);
        return c.json({
            message: "you are not logged in"
        })  
    } 
});

blogRouter.post ('/', async (c) => {
    //@ts-ignore
    const userId = c.get("userId");

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const blog= await prisma.blog.create({
        data:{
            title: body.title,
            content: body.content,
            authorId: Number(userId)
        }
    })

    return c.json({
        id: blog.id
    })

})
  
blogRouter.put ('/', async (c) => {

    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const blog = await prisma.blog.update({
        where:{
            id : body.id
        },
        data:{
            title : body.title,
            content: body.content,
        }
    })
    return c.json({
        id: blog.id
    }) 
})
  
blogRouter.get('/:id', async (c) => {
    
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try{

        const blog = await prisma.blog.findFirst({
            where:{
                id:body.id
            },
        })
        return c.json({
            blog
        })
    }
    catch(e){
        console.error(e);
        return c.json({
            message: "error occur"
        })
    }
  })
  
blogRouter.get ('/bulk', async (c) => {

   const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const blog = await prisma.blog.findMany();

    return c.json({
        blog,
    })

  })