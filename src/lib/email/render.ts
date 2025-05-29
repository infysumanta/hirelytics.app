import { render } from '@react-email/render';

import AdminNotificationEmail from './templates/AdminNotificationEmail';
import WaitlistConfirmationEmail from './templates/WaitlistConfirmationEmail';

interface WaitlistEmailData {
  name: string;
  email: string;
  reason?: string;
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
