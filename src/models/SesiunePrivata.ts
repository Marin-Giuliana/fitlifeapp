import mongoose from "mongoose";

const sesiunePrivataSchema = new mongoose.Schema({
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
  },
  dataSesiune: {
    type: Date,
    required: true,
  },
  oraSesiune: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["confirmata", "anulata", "finalizata"],
    default: "confirmata",
  },
});

export default mongoose.models.SesiunePrivata || mongoose.model("SesiunePrivata", sesiunePrivataSchema);