import express from 'express';

const router = express.Router();

// GET /api/users - placeholder
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Users endpoint - coming soon!',
    data: {
      features: [
        'User registration/authentication',
        'User preferences',
        'Listening history',
        'Personalized recommendations'
      ]
    }
  });
});

export default router; 