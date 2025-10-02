import { Goal } from "../models/index.d.js";

export const listMyGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("program currentWorkout workouts");
    return res.status(200).json({ goals });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createGoal = async (req, res) => {
  try {
    // Normalize FE payload to BE fields when provided
    const { target, targetWorkoutsPerWeek, completed, achieved, ...rest } = req.body || {};
    const normalized = {
      ...rest,
      targetWorkoutsPerWeek: typeof target === 'number' ? target : (typeof targetWorkoutsPerWeek === 'number' ? targetWorkoutsPerWeek : 3),
      achieved: typeof achieved === 'boolean' ? achieved : false,
      // Keep FE tracking fields if sent
      target: typeof target === 'number' ? target : undefined,
      completed: typeof completed === 'number' ? completed : undefined,
    };
    const goal = await Goal.create({ user: req.user.id, ...normalized });
    return res.status(201).json({ goal });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id).populate("program currentWorkout");
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    if (goal.user.toString() !== req.user.id && !(req.user.roles || []).includes("Admin")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return res.status(200).json({ goal });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    if (goal.user.toString() !== req.user.id && !(req.user.roles || []).includes("Admin")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { target, targetWorkoutsPerWeek, completed, achieved, ...rest } = req.body || {};
    // Map FE fields to BE fields when present
    const mapped = {
      ...rest,
      ...(typeof target === 'number' ? { targetWorkoutsPerWeek: target, target } : {}),
      ...(typeof targetWorkoutsPerWeek === 'number' ? { targetWorkoutsPerWeek } : {}),
      ...(typeof completed === 'number' ? { completed } : {}),
      ...(typeof achieved === 'boolean' ? { achieved } : {}),
    };
    Object.assign(goal, mapped);
    await goal.save();
    return res.status(200).json({ goal });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    if (goal.user.toString() !== req.user.id && !(req.user.roles || []).includes("Admin")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await goal.deleteOne();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};