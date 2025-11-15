import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  transcript: String,
  aiSummary: String,
  bulletSummary: String,
  medicineRecommendations: String,
  prescriptionData: Object,
  doctorNotes: String,
  date: { type: Date, default: Date.now }
});

const Consultation = mongoose.model('Consultation', consultationSchema);
export default Consultation;
