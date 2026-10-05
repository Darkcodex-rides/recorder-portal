
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    const result = await pool.query(
      `INSERT INTO users (
        name,
        email,
        password_hash
      )
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at`,
      [
        normalizedName,
        normalizedEmail,
        passwordHash,
      ]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
}

// LOGIN
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const normalizedEmail =
      email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!JWT_SECRET) {
      console.error(
        "JWT_SECRET is not configured"
      );

      return res.status(500).json({
        success: false,
        message: "Authentication configuration error",
      });
    }

    const result = await pool.query(
      `SELECT
        id,
        name,
        email,
        password_hash
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
}

module.exports = {
  register,
  login,
};


