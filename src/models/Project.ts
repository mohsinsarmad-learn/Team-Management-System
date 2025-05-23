import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IProject extends Document {
  ProjectId: string;
  title: string;
  description: string;
  createdBy: string; // Project Manager
  updatedAt: Date;
  createdAt: Date;
  status: string;
}

const projectSchema = new Schema<IProject>(
  {
    ProjectId: { type: String, unique: true },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },
    createdBy: { type: String, required: [true, "CreaterID is required"] },
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Pre-save hook to assign auto-incremented `ProjectId`
projectSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  // Find the last task document and extract its teamId number
  const lastProject = await mongoose
    .model<IProject>("Project")
    .findOne({}, { ProjectId: 1 })
    .sort({ ProjectId: -1 });

  let newProjectNumber = 1; // Default for the first Project

  if (lastProject && lastProject.ProjectId) {
    const match = lastProject.ProjectId.match(/(\d+)$/); // Extract numeric part from ProjectId
    const maxNumber = match ? parseInt(match[0], 10) : 0;
    newProjectNumber = maxNumber + 1;
  }
  const paddedProjectNumber = String(newProjectNumber).padStart(5, "0"); // 5 digits padding
  this.ProjectId = `Project-${paddedProjectNumber}`;

  next();
});

const Project = models?.Project || model<IProject>("Project", projectSchema);

export default Project;
