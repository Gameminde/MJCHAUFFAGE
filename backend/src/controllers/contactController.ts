import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

export class ContactController {
  static async handleContactForm(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { firstName, lastName, email, phone, serviceType, message, wilaya } = req.body;

    // Simulate contact form submission (email functionality disabled due to AWS SDK conflicts)
    console.log('Contact form submitted:', { firstName, lastName, email, phone, serviceType, message, wilaya });
    
    // In a real implementation, we would send an email here
    // For now, we'll just return a success response
    res.status(200).json({ 
      success: true, 
      message: 'Thank you for your message! We will get back to you soon.' 
    });
  }
}
