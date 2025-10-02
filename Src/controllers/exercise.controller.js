import { Exercise } from "../models/index.d.js";

export const listExercises = async (req, res) => {
  try {
    const { muscle } = req.query;
    const filter = muscle ? { targetMuscleGroup: muscle } : {};
    const ex = await Exercise.find(filter);
    return res.status(200).json({ exercises: ex });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getExercise = async (req, res) => {
  try {
    const ex = await Exercise.findById(req.params.id);
    if (!ex) return res.status(404).json({ message: "Exercise not found" });
    return res.status(200).json({ exercise: ex });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createExercise = async (req, res) => {
  try {
    const ex = await Exercise.create({ ...req.body, createdBy: req.user.id });
    return res.status(201).json({ exercise: ex });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateExercise = async (req, res) => {
  try {
    const ex = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ex) return res.status(404).json({ message: "Exercise not found" });
    return res.status(200).json({ exercise: ex });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteExercise = async (req, res) => {
  try {
    const ex = await Exercise.findById(req.params.id);
    if (!ex) return res.status(404).json({ message: "Exercise not found" });
    await ex.deleteOne();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};