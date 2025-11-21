// Type definitions to override problematic AWS SDK types
// This is a workaround for the nodemailer AWS SDK dependency issues

declare module '@aws-sdk/client-ses' {
  export class SES {
    constructor(config: any);
  }
  export interface SendEmailCommand {}
  export interface SendEmailCommandInput {}
  export interface SendEmailCommandOutput {}
  export = SES;
}

declare module '@aws-sdk/client-sesv2' {
  export class SESv2 {
    constructor(config: any);
  }
  export interface SendEmailCommand {}
  export interface SendEmailCommandInput {}
  export interface SendEmailCommandOutput {}
  export = SESv2;
}

declare module '@aws-sdk/client-sesv2/dist-types/index' {
  const client: any;
  export = client;
}
