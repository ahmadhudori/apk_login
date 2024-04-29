import User from "../models/UserModel.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

// dotenv.config();

export const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "name", "email"],
        });
        res.json(users);
    } catch (error) {
        console.log(error);
    }
};

// function untuk Register
export const Register = async (req, res) => {
    const { name, email, password, confpassword } = req.body;
    if (password != confpassword) {
        return res.status(400).json({ msg: "password dan confirm password tidak cocok" });
    }
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    try {
        await User.create({
            name,
            email,
            password: hashPassword,
        });
        res.json({ msg: "Register berhasil" });
    } catch (error) {
        console.log(error);
    }
};

// Function Login
export const Login = async (req, res) => {
    try {
        const user = await User.findAll({
            where: {
                email: req.body.email,
            },
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if (!match) return res.status(400).json({ msg: "wrong password" });
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        const accessToken = jwt.sign(
            {
                userId,
                name,
                email,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "20s",
            }
        );
        const refreshToken = jwt.sign(
            {
                userId,
                name,
                email,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: "1d",
            }
        );
        await User.update(
            { refresh_token: refreshToken },
            {
                where: {
                    id: userId,
                },
            }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            //   secure: true, jika menggunakan https
        });
        res.json({ accessToken });
    } catch (error) {
        res.status(404).json({ msg: "email tidak ditemukan" });
    }
};

export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    const user = await User.findAll({
        where: {
            refresh_token: refreshToken,
        },
    });
    //    console.log(user[0]);
    if (!user[0]) return res.sendStatus(204);
    const userId = user[0].id;
    await User.update(
        { refresh_token: null },
        {
            where: {
                id: userId,
            },
        }
    );
    res.clearCookie("refreshToken");
    return res.sendStatus(200);
};
