import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const create = async (data) => {
  return await prisma.supplier.create({
    data,
  });
};

export const findAll = async () => {
  return await prisma.supplier.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
};

export const findById = async (id) => {
  return await prisma.supplier.findUnique({
    where: { id },
  });
};

export const update = async (id, data) => {
  return await prisma.supplier.update({
    where: { id },
    data,
  });
};

export const deleteSupplier = async (id) => {
  return await prisma.supplier.update({
    where: { id },
    data: { active: false },
  });
};
