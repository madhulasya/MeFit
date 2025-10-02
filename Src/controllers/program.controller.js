import { Program } from "../models/index.d.js";

export const listPrograms = async (_req, res) => {
  try {
    const programs = await Program.find();
    return res.status(200).json({ programs });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createProgram = async (req, res) => {
  try {
    const program = await Program.create(req.body);
    return res.status(201).json({ program });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ message: "Program not found" });
    return res.status(200).json({ program });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!program) return res.status(404).json({ message: "Program not found" });
    return res.status(200).json({ program });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ message: "Program not found" });
    await program.deleteOne();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};