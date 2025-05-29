import { Button, Heading, Hr, Section, Text } from '@react-email/components';
import * as React from 'react';

import {
  BaseEmailTemplate,
  buttonBase,
  headingMd,
  highlightedBox,
  textBase,
  textLg,
} from './BaseTemplate';

interface ContactConfirmationEmailProps {
  name: string;
  message: string;
}

export const ContactConfirmationEmail = ({ name, message }: ContactConfirmationEmailProps) => {
  return (
    <BaseEmailTemplate previewText="Thanks for contacting Hirelytics">
      <Section
        style={{
          backgroundColor: '#4f46e5',
          padding: '40px 24px',
          textAlign: 'center',
        }}
      >
        <Heading
          as="h1"
          style={{
            color: '#ffffff',
            fontSize: '30px',
            fontWeight: '600',
            margin: '0',
          }}
        >
          Thank You for Contacting Us!
        </Heading>
      </Section>

      <Section style={{ padding: '24px', backgroundColor: '#ffffff' }}>
        <Text style={textLg}>Hi {name},</Text>

        <Text style={textBase}>
          Thank you for reaching out to Hirelytics! We have received your message and will get back
          to you as soon as possible.
        </Text>

        <Section style={highlightedBox}>
          <Heading as="h3" style={headingMd}>
            Your Message
          </Heading>
          <Text style={textBase}>{message}</Text>
        </Section>

        <Text style={textBase}>
          Our team will review your message and respond within 1-2 business days.
        </Text>

        <Button href="https://hirelytics.app" style={buttonBase}>
          Visit Hirelytics
        </Button>

        <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />

        <Text style={textBase}>
          Best regards,
          <br />
          <strong>The Hirelytics Team</strong>
        </Text>
      </Section>
    </BaseEmailTemplate>
  );
};

export default ContactConfirmationEmail;
