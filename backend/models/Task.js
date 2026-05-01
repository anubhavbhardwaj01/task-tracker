// models/Task.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status:      { type: String, enum: ["Todo", "In-Progress", "Done"], default: "Todo" },
    dueDate:     { type: Date },
    project:     { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Virtual: detect overdue
taskSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate || this.status === "Done") return false;
  return new Date() > new Date(this.dueDate);
});

taskSchema.set("toJSON", { virtuals: true });
taskSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Task", taskSchema);
