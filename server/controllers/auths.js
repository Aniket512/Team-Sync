const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const login = async (req, res) => {
  const { credential } = req.body;

  try {
    const response = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email_verified, email } = response.payload;

    if (email_verified) {
      const user = await User.findOne({ email });

      if (user) {
        const access_token = jwt.sign(
          { _id: user._id },
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.JWT_EXPIRY,
          }
        );
        const { _id, email, name, image } = user;
        return res.json({
          _id,
          access_token,
          email,
          name,
          image,
        });
      } else {
        const generatedPassword =
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8);
        const password = await bcrypt.hash(generatedPassword, 10);
        const newUser = new User({
          name: response.payload.name,
          email: response.payload.email,
          image: response.payload.picture,
          password,
        });

        const data = await newUser.save();

        const access_token = jwt.sign(
          { _id: data._id },
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.JWT_EXPIRY,
          }
        );
        const { _id, email, name, image } = data;
        return res.json({
          _id,
          access_token,
          email,
          name,
          image,
        });
      }
    } else {
      return res.status(400).json({
        error: "Google login failed. Try again",
      });
    }
  } catch (error) {
    console.log("ERROR GOOGLE LOGIN:", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  login,
};
