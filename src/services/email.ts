import emailjs from '@emailjs/browser';

export interface EmailParams {
  to_email: string;
  to_name: string;
  from_name: string;
  subject: string;
  message: string;
  reply_to?: string;
}

/**
 * Initialize EmailJS with public key
 */
export function initEmailJS(publicKey: string) {
  emailjs.init({
    publicKey: publicKey,
  });
}

/**
 * Send email using EmailJS
 */
export async function sendEmail(
  serviceId: string,
  templateId: string,
  params: EmailParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await emailjs.send(serviceId, templateId, {
      to_email: params.to_email,
      to_name: params.to_name,
      from_name: params.from_name,
      subject: params.subject,
      message: params.message,
      reply_to: params.reply_to || params.from_name,
    });

    if (response.status === 200) {
      return { success: true };
    } else {
      return { success: false, error: `Email service returned status ${response.status}` };
    }
  } catch (error) {
    console.error('EmailJS error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
    return { success: false, error: errorMessage };
  }
}

/**
 * Check if EmailJS is properly configured
 */
export function isEmailConfigured(publicKey: string, serviceId: string, templateId: string): boolean {
  return publicKey.length > 0 && serviceId.length > 0 && templateId.length > 0;
}
