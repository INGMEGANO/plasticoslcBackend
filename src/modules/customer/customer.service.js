import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const create = async (data) => {
  return await prisma.customer.create({ data });
};

export const findAll = async () => {
  return await prisma.customer.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
};

export const findById = async (id) => {
  return await prisma.customer.findUnique({
    where: { id },
  });
};

export const update = async (id, data) => {
  return await prisma.customer.update({
    where: { id },
    data,
  });
};

export const deleteCustomer = async (id) => {
  return await prisma.customer.update({
    where: { id },
    data: { active: false },
  });
};
