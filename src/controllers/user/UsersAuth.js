import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

export const resgisterUser = async (req, res) => {
  try {
    const { name, email, phone_number, birth_date, password, confPassword, pin } = req.body;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneNumberRegex = /^\d{10,14}$/;
    const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Z!@#$%^&*].{7,}$/;
    const pinRegex = /^\d{6}$/;

    if (!emailRegex.test(email))
      return res.status(400).send({
        type: "Not Email",
        errorMessage: "Email Tidak Sesuai",
      });

    if (!phoneNumberRegex.test(phone_number))
      return res.status(400).send({
        type: "Phone Number Invalid",
        errorMessage: "Nomor Hp yang anda masukan tidak valid",
      });

    const isEmailTaken = await prisma.users.findUnique({
      where: { email: email },
      select: {
        email: true,
      },
    });

    const isPhoneNumberTaken = await prisma.users.findUnique({
      where: { phone_number: phone_number },
      select: {
        phone_number: true,
      },
    });

    if (isEmailTaken)
      return res.status(400).send({
        type: "Email Taken",
        errorMessage: "Email Ini Sudah Terdaftar",
      });

    if (isPhoneNumberTaken)
      return res.status(400).send({
        type: "Phone Number Taken",
        errorMessage: "Nomor Hp Ini Sudah Terdaftar",
      });

    if (password !== confPassword)
      return res.status(400).send({
        type: "Password Not Match",
        errorMessage: "Password Dan Confirm Password Tidak Sesuai",
      });

    if (!passwordPattern.test(password))
      return res.status(400).send({
        type: "Password Pattern",
        errorMessage:
          "Panjang password minimal 8 karakter, yang berisikan huruf awal kapital, dan minimal harus memiliki satu simbol",
      });

    if (!pinRegex.test(pin))
      return res.status(400).send({
        type: "Pin Invalid",
        errorMessage: "Pin yang anda masukan tidak valid",
      });

    const hashPassword = await argon2.hash(password);
    const hashPin = await argon2.hash(pin);

    await prisma.users.create({
      data: {
        name: name,
        email: email,
        phone_number: phone_number,
        birth_date: birth_date,
        gender: "",
        profile_image: "default.jpg",
        password: hashPassword,
        pin: hashPin,
        balance: 0,
      },
    });
    res.status(200).json("Akun Berhasil Dibuat...");
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};