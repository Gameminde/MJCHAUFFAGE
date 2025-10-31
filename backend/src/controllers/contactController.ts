import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

export class ContactController {
  static async handleContactForm(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    // Destructure contact form data (for future use when saving to database)
    // const { firstName, lastName, email, phone, serviceType, message, wilaya } = req.body;

    // In a real implementation, we would save to database and send email
    // For now, we'll just return a success response
    res.status(200).json({ 
      success: true, 
      message: 'Thank you for your message! We will get back to you soon.' 
    });
  }
}
