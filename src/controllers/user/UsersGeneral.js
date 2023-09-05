import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllUsers = async (req, res) => {
  try {
    const response = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        birth_date: true,
        profile_image: true,
        balance: true,
        createdAt: true,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const response = await prisma.users.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        birth_date: true,
        profile_image: true,
        balance: true,
        createdAt: true,
      },
    });
    if (!response) return res.status(404).json({ msg: "User Tidak Di Temukan" });
    res.status(200).json(response);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};
