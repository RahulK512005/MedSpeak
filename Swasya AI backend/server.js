import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import patientRoutes from './routes/patients.js';
import consultationRoutes from './routes/consultations.js';

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/patients', patientRoutes);
app.use('/api/consultations', consultationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
