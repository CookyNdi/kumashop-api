import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();



export const updateUser = async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.params.id },
    });
    if (!user) return res.status(404).json({ msg: "User Tidak Di Temukan" });

    let fileName = "";

    if (req.files === null) {
      fileName = user.profile_image;
    } else {
      const file = req.files.file;
      const fileSize = file.data.length;
      const ext = path.extname(file.name);
      fileName = file.md5 + ext;
      const allowedType = [".png", ".jpg", ".jpeg", ".webp"];
      if (!allowedType.includes(ext.toLowerCase()))
        return res.status(422).json({ msg: "Gambar yang anda masukan harus berformat (png, jpg, jpeg, webp)" });
      if (fileSize > 2000000) return res.status(422).json({ msg: "Image must be less than 2mb" });
      if (user.profile_image !== "default.jpg") {
        const filePath = `./public/Users/profile-images/${user.profile_image}`;
        fs.unlinkSync(filePath);
      }
      file.mv(`./public/Users/profile-images/${fileName}`, (err) => {
        if (err) return res.status(500).json({ msg: err.message });
      });
    }
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
