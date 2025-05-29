import { Heading, Link, Section, Text } from '@react-email/components';
import * as React from 'react';

import { BaseEmailTemplate, headingLg, highlightedBox, textBase, textLg } from './BaseTemplate';

interface ContactNotificationEmailProps {
  name: string;
  email: string;
  message: string;
  submittedAt: Date;
}

export const ContactNotificationEmail = ({
  name,
  email,
  message,
  submittedAt,
}: ContactNotificationEmailProps) => {
  const formattedDate = submittedAt.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <BaseEmailTemplate previewText={`New Contact Form Submission from ${name}`}>
      <Section style={{ padding: '24px', backgroundColor: '#ffffff' }}>
        <Heading as="h1" style={headingLg}>
          New Contact Form Submission
        </Heading>

        <Text style={textLg}>
          A new contact form submission has been received. Here are the details:
        </Text>

        <Section style={highlightedBox}>
          <Text style={textBase}>
            <strong>Name:</strong> {name}
          </Text>
          <Text style={textBase}>
            <strong>Email:</strong>{' '}
            <Link
              href={`mailto:${email}`}
              style={{ color: '#4f46e5', textDecoration: 'underline' }}
            >
              {email}
            </Link>
          </Text>
          <Text style={textBase}>
            <strong>Message:</strong>
            <br />
            {message}
          </Text>
          <Text style={textBase}>
            <strong>Submitted:</strong> {formattedDate}
          </Text>
        </Section>

        <Text style={textBase}>
          You can view and manage all contact submissions in the{' '}
          <Link
            href="https://hirelytics.app/dashboard/contact-submissions"
            style={{ color: '#4f46e5', textDecoration: 'underline' }}
          >
            admin dashboard
          </Link>
          .
        </Text>
      </Section>
    </BaseEmailTemplate>
  );
};

export default ContactNotificationEmail;
