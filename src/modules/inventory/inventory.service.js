import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getKardex(productId){

  const movements = await prisma.inventoryMovement.findMany({

    where:{
      productId
    },

    orderBy:{
      createdAt:"asc"
    }

  })

  let stock = 0

  const kardex = movements.map(m=>{

    stock += m.quantity

    return{
      date:m.createdAt,
      type:m.type,
      quantity:m.quantity,
      stock
    }

  })

  return kardex

}

export async function getKardexAll(){

  const movements = await prisma.inventoryMovement.findMany({

    include:{
      product:true
    },

    orderBy:{
      createdAt:"desc"
    }

  })

  return movements.map(m=>({

    date:m.createdAt,
    product:m.product?.name,
    type:m.type,
    quantity:m.quantity

  }))

}

export async function getStock(){

  const products = await prisma.product.findMany({

    select:{
      id:true,
      name:true,
      sku:true,
      stock:true
    }

  })

  return products

}