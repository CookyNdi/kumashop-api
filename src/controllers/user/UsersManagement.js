import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export const updateBasicData = async (req, res) => {
  try {
    const { name, birth_date, gender } = req.body;
    const user = await prisma.users.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    await prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        name: name,
        birth_date: birth_date,
        gender: gender,
      },
    });
    res.status(200).json({ msg: "Akun Berhasil Di Perbarui..." });
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

export const updateEmail = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await prisma.users.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email))
      return res.status(400).send({
        type: "Not Email",
        errorMessage: "Email Tidak Sesuai",
      });

    const isEmailTaken = await prisma.users.findUnique({
      where: { email: email },
      select: {
        email: true,
      },
    });

    if (isEmailTaken)
      return res.status(400).send({
        type: "Email Taken",
        errorMessage: "Email Ini Sudah Terdaftar",
      });

    const match = await argon2.verify(user.password, password);
    if (!match) {
      res.status(400).json({ msg: "Password Yang Anda Masukan Salah" });
    } else {
      await prisma.users.update({
        where: {
          id: user.id,
        },
        data: {
          email: email,
        },
      });
      res.status(200).json({ msg: "Email Berhasil Di Perbarui..." });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updatePhoneNumber = async (req, res) => {
  try {
    const phone_number = req.body.phone_number;
    const password = req.body.password;

    const user = await prisma.users.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const phoneNumberRegex = /^\d{10,14}$/;

    if (!phoneNumberRegex.test(phone_number))
      return res.status(400).send({
        type: "Phone Number Invalid",
        errorMessage: "Nomor Hp yang anda masukan tidak valid",
      });

    const isPhoneNumberTaken = await prisma.users.findUnique({
      where: { phone_number: phone_number },
      select: {
        phone_number: true,
      },
    });

    if (isPhoneNumberTaken)
      return res.status(400).send({
        type: "Phone Number Taken",
        errorMessage: "Nomor Hp Ini Sudah Terdaftar",
      });

    const match = await argon2.verify(user.password, password);
    if (!match) {
      res.status(400).json({ msg: "Password Yang Anda Masukan Salah" });
    } else {
      await prisma.users.update({
        where: {
          id: user.id,
        },
        data: {
          phone_number: phone_number,
        },
      });
      res.status(200).json({ msg: "Nomor Hp Berhasil Di Perbarui..." });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { password, confPassword, oldPassword } = req.body;

    const user = await prisma.users.findUnique({
      where: {
        id: req.params.id,
      },
    });

    const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Z!@#$%^&*].{7,}$/;
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
    
    const match = await argon2.verify(user.password, oldPassword);
    if (!match) {
      res.status(400).send({
        type: "Password Not Match",
        errorMessage: "Password lama yang anda masukan salah",
      });
    } else {
      const hashPassword = await argon2.hash(password);
      await prisma.users.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashPassword,
        },
      });
      res.status(200).json({ msg: "Password Berhasil Di Perbarui..." });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updatePin = async (req, res) => {
  try {
    const { pin, confPin, oldPin } = req.body.pin;

    const user = await prisma.users.findUnique({
      where: {
        id: req.params.id,
      },
    });

    const pinRegex = /^\d{6}$/;

    if (pin !== confPin)
      return res.status(400).send({
        type: "Pin Not Match",
        errorMessage: "Password Dan Confirm Password Tidak Sesuai",
      });

    if (!pinRegex.test(pin))
      return res.status(400).send({
        type: "Pin Invalid",
        errorMessage: "Pin yang anda masukan tidak valid",
      });

    const match = await argon2.verify(user.pin, oldPin);
    if (!match) {
      res.status(400).send({
        type: "Pin Not Match",
        errorMessage: "Pin lama yang anda masukan salah",
      });
    } else {
      const hashPin = await argon2.hash(pin);
      await prisma.users.update({
        where: {
          id: user.id,
        },
        data: {
          pin: hashPin,
        },
      });
      res.status(200).json({ msg: "Password Berhasil Di Perbarui..." });

    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const forgotPassword = async (req, res) => {};
