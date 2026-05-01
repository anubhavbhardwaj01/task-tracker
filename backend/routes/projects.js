// routes/projects.js — Project CRUD + member management
const express = require("express");
const router  = express.Router();
const Project = require("../models/Project");
const User    = require("../models/User");
const Task    = require("../models/Task");
const { protect, adminOnly } = require("../middleware/auth");

// ── GET /api/projects — list projects ────────────────────────
// Admin sees all; Member sees only their projects
router.get("/", protect, async (req, res) => {
  try {
    const query =
      req.user.role === "ADMIN"
        ? {}
        : { members: req.user._id };

    const projects = await Project.find(query)
      .populate("createdBy", "name email")
      .populate("members",   "name email role")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/projects/:id ─────────────────────────────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members",   "name email role");
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Members can only view their own projects
    if (
      req.user.role !== "ADMIN" &&
      !project.members.some((m) => m._id.equals(req.user._id))
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/projects (admin) ────────────────────────────────
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    if (!name) return res.status(400).json({ message: "Project name required" });

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members:   members || [],
    });

    // Add project reference to each member
    if (members?.length) {
      await User.updateMany(
        { _id: { $in: members } },
        { $addToSet: { projects: project._id } }
      );
    }

    const populated = await project.populate([
      { path: "createdBy", select: "name email" },
      { path: "members",   select: "name email role" },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/projects/:id (admin) ─────────────────────────────
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Remove project from old members not in new list
    const oldMembers = project.members.map(String);
    const newMembers = members || oldMembers;
    const removed    = oldMembers.filter((m) => !newMembers.includes(m));
    const added      = newMembers.filter((m) => !oldMembers.includes(m));

    if (removed.length)
      await User.updateMany({ _id: { $in: removed } }, { $pull: { projects: project._id } });
    if (added.length)
      await User.updateMany({ _id: { $in: added }   }, { $addToSet: { projects: project._id } });

    project.name        = name        || project.name;
    project.description = description ?? project.description;
    project.members     = newMembers;
    await project.save();

    const populated = await project.populate([
      { path: "createdBy", select: "name email" },
      { path: "members",   select: "name email role" },
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/projects/:id (admin) ──────────────────────────
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Cascade delete tasks
    await Task.deleteMany({ project: project._id });

    // Remove project ref from all members
    await User.updateMany(
      { _id: { $in: project.members } },
      { $pull: { projects: project._id } }
    );

    await project.deleteOne();
    res.json({ message: "Project and associated tasks deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
