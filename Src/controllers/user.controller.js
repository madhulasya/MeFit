import { User } from "../models/index.d.js";
import { createToken, verifyToken } from "../configs/jwt.config.js";
import { generateHash, compareHash } from "../libs/bcrypt.helper.js";

// 👉 Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await generateHash(password);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = createToken({ id: user._id, email: user.email, roles: user.roles }, "1h");

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, roles: user.roles },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 👉 Login User (Step 1)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+twoFactorSecret name email password roles twoFactorEnabled");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await compareHash(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.twoFactorEnabled) {
      return res.status(200).json({ message: "TOTP required", userId: user._id.toString() });
    }

    const token = createToken({ id: user._id, email: user.email, roles: user.roles }, "1h");

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, roles: user.roles },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 👉 Get current user profile (auth header)
const getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Token required" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id).select("-password -twoFactorSecret");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 👉 GET /user → redirect to /user/me data
const getSelf = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Token required" });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: "Invalid or expired token" });
    const user = await User.findById(decoded.id).select("-password -twoFactorSecret");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 👉 GET /user/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -twoFactorSecret");
    if (!user) return res.status(404).json({ message: "User not found" });
    // Admin or self
    if (req.user.id !== user._id.toString() && !(req.user.roles || []).includes("Admin")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 👉 PATCH /user/:id (no password here)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isAdmin = (req.user.roles || []).includes("Admin");
    const isSelf = req.user.id === user._id.toString();
    if (!isAdmin && !isSelf) return res.status(403).json({ message: "Forbidden" });

    // Allow updating profile fields used by FE
    const allowed = [
      "name",
      "email",
      "picture",
      "height",
      "weight",
      "level",
      "twoFactorEnabled",
    ]; // roles can be changed by Admin only
    if (isAdmin && Array.isArray(req.body.roles)) {
      user.roles = req.body.roles;
    }
    for (const k of allowed) {
      if (k in req.body) user[k] = req.body[k];
    }
    await user.save();
    const safe = await User.findById(user._id).select("-password -twoFactorSecret");
    return res.status(200).json({ user: safe });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 👉 PUT /user/self — return plain user object for FE merge
const updateSelf = async (req, res) => {
  try {
    req.params.id = req.user.id; // ensure same path as updateUser
    // Reuse updateUser logic but unwrap the response shape
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Only self is allowed here
    if (req.user.id !== user._id.toString()) return res.status(403).json({ message: "Forbidden" });

    const allowed = ["name", "email", "picture", "height", "weight", "level", "twoFactorEnabled"];
    for (const k of allowed) {
      if (k in req.body) user[k] = req.body[k];
    }
    await user.save();
    const safe = await User.findById(user._id).select("-password -twoFactorSecret");
    // Return the plain user object (not wrapped)
    return res.status(200).json(safe);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 👉 POST /user/:id/update_password
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id).select("password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const isAdmin = (req.user.roles || []).includes("Admin");
    const isSelf = req.user.id === user._id.toString();
    if (!isAdmin && !isSelf) return res.status(403).json({ message: "Forbidden" });

    if (!isAdmin) {
      const ok = await compareHash(oldPassword || "", user.password);
      if (!ok) return res.status(400).json({ message: "Old password incorrect" });
    }
    user.password = await generateHash(newPassword);
    await user.save();
    return res.status(200).json({ message: "Password updated" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 👉 DELETE /user/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isAdmin = (req.user.roles || []).includes("Admin");
    const isSelf = req.user.id === user._id.toString();
    if (!isAdmin && !isSelf) return res.status(403).json({ message: "Forbidden" });
    await user.deleteOne();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export { registerUser, loginUser, getProfile, getSelf, getUserById, updateUser, updatePassword, deleteUser, updateSelf };