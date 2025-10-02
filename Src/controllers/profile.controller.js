import { validationResult } from "express-validator";
import { Profile } from "../models/index.d.js";

export const createProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = req.user.id;
    const existing = await Profile.findOne({ user: userId });
    if (existing) return res.status(400).json({ message: "Profile already exists" });

    const profile = await Profile.create({ user: userId, ...req.body });
    return res.status(201).json({ profile });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate("user", "name email roles");
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Access control: owner or Admin
    if (req.user.id !== profile.user._id.toString() && !(req.user.roles || []).includes("Admin")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json({ profile });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate("user", "_id");
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    if (req.user.id !== profile.user._id.toString() && !(req.user.roles || []).includes("Admin")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    Object.assign(profile, req.body);
    await profile.save();
    return res.status(200).json({ profile });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate("user", "_id");
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    if (req.user.id !== profile.user._id.toString() && !(req.user.roles || []).includes("Admin")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await profile.deleteOne();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};