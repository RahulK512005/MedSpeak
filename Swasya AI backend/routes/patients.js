import express from 'express';
import Patient from '../models/Patient.js';

const router = express.Router();

// GET /api/patients - Get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/patients - Create new patient
router.post('/', async (req, res) => {
  try {
    // Check if patient with UHID already exists
    if (req.body.uhid) {
      const existingPatient = await Patient.findOne({ uhid: req.body.uhid });
      if (existingPatient) {
        return res.status(200).json(existingPatient); // Return existing patient instead of error
      }
    }
    
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    console.error('Error creating patient:', err);
    // Handle duplicate UHID error
    if (err.code === 11000) {
      const existingPatient = await Patient.findOne({ uhid: req.body.uhid });
      if (existingPatient) {
        return res.status(200).json(existingPatient);
      }
      return res.status(400).json({ error: 'Patient with this UHID already exists' });
    }
    res.status(400).json({ error: err.message });
  }
});

// GET /api/patients/:uhid - Get patient by UHID
router.get('/:uhid', async (req, res) => {
  try {
    const patient = await Patient.findOne({ uhid: req.params.uhid });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
