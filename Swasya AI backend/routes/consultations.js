import express from 'express';
import Consultation from '../models/Consultation.js';
import Patient from '../models/Patient.js';

const router = express.Router();

// GET /api/consultations - Get all consultations
router.get('/', async (req, res) => {
  try {
    const consultations = await Consultation.find().populate('patientId', 'name uhid age gender').sort({ date: -1 });
    const formatted = consultations.map(c => ({
      _id: c._id,
      id: c._id.toString(),
      patientId: c.patientId?._id,
      uhid: c.patientId?.uhid || '',
      patientName: c.patientId?.name || '',
      age: c.patientId?.age || 0,
      gender: c.patientId?.gender || '',
      timestamp: c.date,
      summary: c.aiSummary || 'No summary available',
      transcripts: c.transcript,
      prescriptions: c.prescriptionData ? 1 : 0,
      prescriptionImage: c.prescriptionData?.image,
      aiModel: 'Gemini',
      status: 'completed'
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/consultations - Save a new consultation
router.post('/', async (req, res) => {
  try {
    console.log('Received consultation data:', JSON.stringify(req.body, null, 2));
    const { uhid, transcripts, summary, prescriptionImage, prescriptions, patientName, age, gender } = req.body;
    
    // Validate required fields
    if (!uhid) {
      return res.status(400).json({ error: 'UHID is required' });
    }
    
    // Find or create patient
    let patient = await Patient.findOne({ uhid });
    if (!patient) {
      // Validate patient data before creating
      if (!patientName) {
        return res.status(400).json({ error: 'Patient name is required' });
      }
      
      try {
        patient = new Patient({
          uhid,
          name: patientName,
          age: age ? parseInt(age) : undefined,
          gender: gender || undefined
        });
        await patient.save();
        console.log('Created new patient:', patient._id);
      } catch (patientError) {
        console.error('Error creating patient:', patientError);
        // Handle duplicate UHID error
        if (patientError.code === 11000) {
          patient = await Patient.findOne({ uhid });
          if (!patient) {
            return res.status(400).json({ error: 'Patient with this UHID already exists but could not be retrieved' });
          }
        } else {
          return res.status(400).json({ error: `Failed to create patient: ${patientError.message}` });
        }
      }
    }

    // Create consultation
    try {
      const consultation = new Consultation({
        patientId: patient._id,
        transcript: transcripts || '',
        aiSummary: summary || 'No summary available',
        prescriptionData: prescriptionImage ? { image: prescriptionImage } : null,
        date: new Date()
      });

      await consultation.save();
      console.log('Consultation saved successfully:', consultation._id);
      
      // Format response to match frontend expectations
      const formatted = {
        _id: consultation._id,
        id: consultation._id.toString(),
        patientId: patient._id,
        uhid: patient.uhid,
        patientName: patient.name,
        age: patient.age,
        gender: patient.gender,
        timestamp: consultation.date,
        summary: consultation.aiSummary || 'No summary available',
        transcripts: consultation.transcript,
        prescriptions: consultation.prescriptionData ? 1 : 0,
        prescriptionImage: consultation.prescriptionData?.image,
        aiModel: 'Gemini',
        status: 'completed'
      };
      
      res.status(201).json(formatted);
    } catch (consultationError) {
      console.error('Error creating consultation:', consultationError);
      return res.status(400).json({ error: `Failed to create consultation: ${consultationError.message}` });
    }
  } catch (err) {
    console.error('Unexpected error in consultation route:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /api/consultations/patient/:uhid - Get all consultations for a patient by UHID
router.get('/patient/:uhid', async (req, res) => {
  try {
    const patient = await Patient.findOne({ uhid: req.params.uhid });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const consultations = await Consultation.find({ patientId: patient._id }).populate('patientId', 'name uhid age gender').sort({ date: -1 });
    const formatted = consultations.map(c => ({
      _id: c._id,
      id: c._id.toString(),
      patientId: c.patientId?._id,
      uhid: c.patientId?.uhid || '',
      patientName: c.patientId?.name || '',
      age: c.patientId?.age || 0,
      gender: c.patientId?.gender || '',
      timestamp: c.date,
      summary: c.aiSummary || 'No summary available',
      transcripts: c.transcript,
      prescriptions: c.prescriptionData ? 1 : 0,
      prescriptionImage: c.prescriptionData?.image,
      aiModel: 'Gemini',
      status: 'completed'
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/consultations/:id - Get consultation by ID
router.get('/:id', async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id).populate('patientId', 'name uhid age gender');
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });

    const formatted = {
      _id: consultation._id,
      id: consultation._id.toString(),
      patientId: consultation.patientId?._id,
      uhid: consultation.patientId?.uhid || '',
      patientName: consultation.patientId?.name || '',
      age: consultation.patientId?.age || 0,
      gender: consultation.patientId?.gender || '',
      timestamp: consultation.date,
      summary: consultation.aiSummary || 'No summary available',
      transcripts: consultation.transcript,
      prescriptions: consultation.prescriptionData ? 1 : 0,
      prescriptionImage: consultation.prescriptionData?.image,
      aiModel: 'Gemini',
      status: 'completed'
    };
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/consultations/:id - Delete consultation by ID
router.delete('/:id', async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id);
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });
    res.json({ message: 'Consultation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
