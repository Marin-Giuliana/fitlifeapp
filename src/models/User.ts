import mongoose from "mongoose";

const abonamentSchema = new mongoose.Schema({
  tipAbonament: {
    type: String,
    enum: ["Standard", "Standard+", "Premium"],
    required: true,
  },
  dataInceput: {
    type: Date,
    required: true,
  },
  dataSfarsit: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["valabil", "expirat"],
    default: "valabil",
  },
});

const userSchema = new mongoose.Schema({
  nume: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  parola: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    required: false,
  },
  dataNasterii: Date,
  sex: String,
  rol: {
    type: String,
    enum: ["admin", "antrenor", "membru"],
    required: true,
  },
  antrenor: {
    dataAngajarii: Date,
    specializari: [String],
  },
  membru: {
    dataInregistrare: {
      type: Date,
      default: Date.now,
    },
    sedintePT: {
      type: Number,
      default: 0,
    },
    abonamente: [abonamentSchema],
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);