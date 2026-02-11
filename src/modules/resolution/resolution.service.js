import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const create = async (data) => {
  return await prisma.resolution.create({
    data,
  });
};

export const findAll = async () => {
  return await prisma.resolution.findMany({
    orderBy: { id: "desc" },
  });
};

export const findById = async (id) => {
  return await prisma.resolution.findUnique({
    where: { id: Number(id) },
  });
};

export const update = async (id, data) => {
  return await prisma.resolution.update({
    where: { id: Number(id) },
    data,
  });
};

export const remove = async (id) => {
  return await prisma.resolution.update({
    where: { id: Number(id) },
    data: { active: false },
  });
};
