import mongoose from "mongoose";

const echipamentSchema = new mongoose.Schema({
  denumire: {
    type: String,
    required: true,
  },
  producator: String,
  dataAchizitionare: {
    type: Date,
    required: true,
  },
  stare: {
    type: String,
    enum: ["functional", "defect", "service"],
    default: "functional",
  },
});

export default mongoose.models.Echipament || mongoose.model("Echipament", echipamentSchema);