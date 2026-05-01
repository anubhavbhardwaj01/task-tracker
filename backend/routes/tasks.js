// routes/tasks.js — Task CRUD with role-based access
const express = require("express");
const router  = express.Router();
const Task    = require("../models/Task");
const Project = require("../models/Project");
const { protect, adminOnly } = require("../middleware/auth");

// ── GET /api/tasks — list tasks ───────────────────────────────
// Query params: status, project, assignedTo
router.get("/", protect, async (req, res) => {
  try {
    const filter = {};

    // Members only see their own tasks
    if (req.user.role !== "ADMIN") {
      filter.assignedTo = req.user._id;
    } else {
      // Admin can filter by assignedTo
      if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    }

    if (req.query.status)  filter.status  = req.query.status;
    if (req.query.project) filter.project = req.query.project;

    const tasks = await Task.find(filter)
      .populate("project",    "name")
      .populate("assignedTo", "name email")
      .populate("createdBy",  "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/tasks/dashboard — summary stats ─────────────────
router.get("/dashboard", protect, async (req, res) => {
  try {
    const baseFilter =
      req.user.role === "ADMIN" ? {} : { assignedTo: req.user._id };

    const [total, completed, inProgress, todo] = await Promise.all([
      Task.countDocuments(baseFilter),
      Task.countDocuments({ ...baseFilter, status: "Done" }),
      Task.countDocuments({ ...baseFilter, status: "In-Progress" }),
      Task.countDocuments({ ...baseFilter, status: "Todo" }),
    ]);

    // Overdue = dueDate < now AND status != Done
    const overdue = await Task.countDocuments({
      ...baseFilter,
      status:  { $ne: "Done" },
      dueDate: { $lt: new Date() },
    });

    res.json({ total, completed, inProgress, todo, overdue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/tasks/:id ────────────────────────────────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project",    "name")
      .populate("assignedTo", "name email")
      .populate("createdBy",  "name email");

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Member can only view their own tasks
    if (
      req.user.role !== "ADMIN" &&
      !task.assignedTo?._id.equals(req.user._id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/tasks (admin) ───────────────────────────────────
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, dueDate, status, assignedTo, project } = req.body;
    if (!title || !project)
      return res.status(400).json({ message: "Title and project are required" });

    // Verify project exists
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: "Project not found" });

    const task = await Task.create({
      title, description, dueDate, status, assignedTo, project,
      createdBy: req.user._id,
    });

    const populated = await task.populate([
      { path: "project",    select: "name" },
      { path: "assignedTo", select: "name email" },
      { path: "createdBy",  select: "name email" },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/tasks/:id ────────────────────────────────────────
// Admin: full edit. Member: status only on their tasks.
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role === "MEMBER") {
      // Member can only update status of their own task
      if (!task.assignedTo?.equals(req.user._id))
        return res.status(403).json({ message: "Access denied" });

      if (!req.body.status)
        return res.status(400).json({ message: "Members may only update task status" });

      task.status = req.body.status;
    } else {
      // Admin can update all fields
      const { title, description, dueDate, status, assignedTo, project } = req.body;
      if (title)      task.title       = title;
      if (description !== undefined) task.description = description;
      if (dueDate !== undefined)     task.dueDate     = dueDate;
      if (status)     task.status      = status;
      if (assignedTo !== undefined)  task.assignedTo  = assignedTo;
      if (project)    task.project     = project;
    }

    await task.save();

    const populated = await task.populate([
      { path: "project",    select: "name" },
      { path: "assignedTo", select: "name email" },
      { path: "createdBy",  select: "name email" },
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/tasks/:id (admin) ─────────────────────────────
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
