import nodemailer from 'nodemailer';
import { logger } from '@/utils/logger';

// Email configuration interface
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    address: string;
  };
}

// Get email configuration from environment
const getEmailConfig = (): EmailConfig => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || '',
    },
    from: {
      name: process.env.SMTP_FROM_NAME || 'MJ CHAUFFAGE',
      address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@mjchauffage.dz',
    },
  };

  return config;
};

// Create and export transporter
let transporter: nodemailer.Transporter | null = null;

export const getEmailTransporter = (): nodemailer.Transporter => {
  if (transporter) {
    return transporter;
  }

  const config = getEmailConfig();

  // Check if SMTP is configured
  if (!config.auth.user || !config.auth.pass) {
    logger.warn('SMTP credentials not configured. Email sending will be disabled.');
    
    // Return a mock transporter for development/testing
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    }) as any;
    
    return transporter!;
  }

  try {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      // Additional options for better compatibility
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });

    logger.info('Email transporter initialized successfully', {
      host: config.host,
      port: config.port,
      user: config.auth.user,
    });

    return transporter!;
  } catch (error) {
    logger.error('Failed to initialize email transporter', { error });
    
    // Return mock transporter on error
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    }) as any;
    
    return transporter!;
  }
};

// Verify SMTP connection
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    const transporter = getEmailTransporter();
    
    // Skip verification for mock transporter
    if ((transporter as any).jsonTransport) {
      logger.info('Using mock email transporter (SMTP not configured)');
      return true;
    }

    await transporter.verify();
    logger.info('SMTP connection verified successfully');
    return true;
  } catch (error) {
    logger.error('SMTP connection verification failed', { error });
    return false;
  }
};

// Get "from" address
export const getFromAddress = (): string => {
  const config = getEmailConfig();
  return `"${config.from.name}" <${config.from.address}>`;
};

// Email configuration export
export const emailConfig = getEmailConfig();

