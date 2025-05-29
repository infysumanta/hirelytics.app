import { render } from '@react-email/render';

import AdminNotificationEmail from './templates/AdminNotificationEmail';
import ContactConfirmationEmail from './templates/ContactConfirmationEmail';
import ContactNotificationEmail from './templates/ContactNotificationEmail';
import WaitlistConfirmationEmail from './templates/WaitlistConfirmationEmail';

interface WaitlistEmailData {
  name: string;
  email: string;
  reason?: string;
  submittedAt: Date;
}

interface ContactEmailData {
  name: string;
  email: string;
  message: string;
  submittedAt: Date;
}

/**
 * Renders the admin notification email to HTML
 */
export function renderAdminNotificationEmail(data: WaitlistEmailData): Promise<string> {
  return render(
    AdminNotificationEmail({
      name: data.name,
      email: data.email,
      reason: data.reason,
      submittedAt: data.submittedAt,
    })
  );
}

/**
 * Renders the waitlist confirmation email to HTML
 */
export function renderWaitlistConfirmationEmail(name: string): Promise<string> {
  return render(
    WaitlistConfirmationEmail({
      name,
    })
  );
}

/**
 * Renders the contact confirmation email to HTML
 */
export function renderContactConfirmationEmail({
  name,
  message,
}: {
  name: string;
  message: string;
}): Promise<string> {
  return render(
    ContactConfirmationEmail({
      name,
      message,
    })
  );
}

/**
 * Renders the contact notification email to HTML
 */
export function renderContactNotificationEmail(data: ContactEmailData): Promise<string> {
  return render(
    ContactNotificationEmail({
      name: data.name,
      email: data.email,
      message: data.message,
      submittedAt: data.submittedAt,
    })
  );
}
