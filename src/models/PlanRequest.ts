import mongoose from "mongoose";

const planRequestSchema = new mongoose.Schema({
  membru: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nume: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  antrenor: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nume: {
      type: String,
      required: true,
    },
  },
  tipPlan: {
    type: String,
    enum: ["alimentar", "exercitii", "ambele"],
    required: true,
  },
  mesaj: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed"],
    default: "pending",
  },
  raspuns: {
    type: String,
    default: "",
  },
  dataCrearii: {
    type: Date,
    default: Date.now,
  },
  dataRaspunsului: {
    type: Date,
  },
}, {
  timestamps: true
});

export default mongoose.models.PlanRequest || mongoose.model("PlanRequest", planRequestSchema);