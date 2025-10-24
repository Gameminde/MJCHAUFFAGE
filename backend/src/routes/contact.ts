
import { Router } from 'express';
import { body } from 'express-validator';
import { ContactController } from '../controllers/contactController';

const router = Router();

const contactValidationRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.'),
  body('email').isEmail().withMessage('Please provide a valid email address.'),
  body('phone').trim().notEmpty().withMessage('Phone number is required.'),
  body('serviceType').trim().notEmpty().withMessage('Service type is required.'),
  body('wilaya').trim().notEmpty().withMessage('Wilaya is required.'),
  body('message').trim().notEmpty().withMessage('Message is required.'),
];

router.post(
  '/',
  contactValidationRules,
  ContactController.handleContactForm
);

export default router;
