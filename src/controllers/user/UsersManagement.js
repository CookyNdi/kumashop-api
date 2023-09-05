import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export const updateUser = async (req, res) => {
  try {
    const { name, email, phone_number, birth_date, gender, password, confPassword, pin } = req.body;
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

    await prisma.users.update({
      data: {
        name: name,
        email: email,
        phone_number: phone_number,
        birth_date: birth_date,
        gender: gender,
        profile_image: fileName,
        password: hashPassword,
        pin: hashPin,
        balance: 0,
      },
    });
    res.status(200).json("Akun Berhasil Di Perbarui...");
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateProfileImages = async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const allowedType = [".png", ".jpg", ".jpeg", ".webp"];
    const url = `${req.protocol}://${req.get("host")}/users/profile-images/${fileName}`;
    if (!allowedType.includes(ext.toLowerCase()))
      return res.status(422).json({ msg: "Gambar yang anda masukan harus berformat (png, jpg, jpeg, webp)" });
    if (fileSize > 1000000) return res.status(422).json({ msg: "Ukuran gambar harus dibawah 1mb" });
    if (user.profile_image !== "default.jpg") {
      const url = user.profile_image;
      const pattern = /\/([^\/]+)$/;
      const matches = url.match(pattern);
      const fileName = matches ? matches[1] : null;
      const filePath = `./src/public/users/profile-images/${fileName}`;
      fs.unlinkSync(filePath);
    }
    file.mv(`./src/public/users/profile-images/${fileName}`, async (err) => {
      if (err) return res.status(500).json({ msg: err.message });
    });

    await prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        profile_image: url,
      },
    });
    res.status(200).json({ msg: "Profile Image Berhasil Di Perbarui..." });
  } catch (error) {
    console.log(error);
  }
};

export const updatePassword = async (req, res) => {};

export const updatePin = async (req, res) => {};

export const updatePhoneNumber = async (req, res) => {};

export const forgotPassword = async (req, res) => {};
