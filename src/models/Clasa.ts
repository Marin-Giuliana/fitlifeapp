import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  nume: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["inscris", "anulat", "prezent"],
    default: "inscris",
  },
});

const clasaSchema = new mongoose.Schema({
  tipClasa: {
    type: String,
    required: true,
  },
  nrLocuri: {
    type: Number,
    required: true,
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
  dataClasa: {
    type: Date,
    required: true,
  },
  oraClasa: {
    type: String,
    required: true,
  },
  participanti: [participantSchema],
});

export default mongoose.models.Clasa || mongoose.model("Clasa", clasaSchema);