import express from 'express';
import Patient from '../models/Patient.js';
import Consultation from '../models/Consultation.js';

const router = express.Router();

// Get all patients with their latest consultation
router.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.aggregate([
      {
        $lookup: {
          from: 'consultations',
          localField: '_id',
          foreignField: 'patientId',
          as: 'consultations'
        }
      },
      {
        $addFields: {
          latestConsultation: { $arrayElemAt: [{ $sortArray: { input: '$consultations', sortBy: { date: -1 } } }, 0] }
        }
      },
      {
        $project: {
          name: 1,
          uhid: 1,
          age: 1,
          gender: 1,
          contact: 1,
          createdAt: 1,
          latestConsultation: 1
        }
      }
    ]);
    
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all consultations with patient details
router.get('/consultations', async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('patientId', 'name uhid age gender contact')
      .sort({ date: -1 });
    
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;