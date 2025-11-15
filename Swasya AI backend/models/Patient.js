import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uhid: { type: String, unique: true, required: true }, // Unique Health ID
  age: Number,
  gender: String,
  contact: String,
  createdAt: { type: Date, default: Date.now }
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
