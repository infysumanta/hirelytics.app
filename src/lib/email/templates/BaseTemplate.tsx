import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BaseEmailProps {
  previewText: string;
  children: React.ReactNode;
  footerText?: string;
}

export const BaseEmailTemplate = ({
  previewText,
  children,
  footerText = `© ${new Date().getFullYear()} Hirelytics. All rights reserved.`,
}: BaseEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://hirelytics.app/images/hirelytics-full-logo.svg"
              width="120"
              height="36"
              alt="Hirelytics"
              style={logo}
            />
          </Section>

          {children}

          <Hr style={hr} />

          <Section style={footer}>
            <Text>{footerText}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Heading styles for consistent look across templates
export const headingLg = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#111827',
  margin: '16px 0',
};

export const headingMd = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#111827',
  margin: '16px 0',
};

export const headingSm = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '16px 0',
};

// Text style variations
export const textBase = {
  fontSize: '14px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  color: '#374151',
  lineHeight: '24px',
};

export const textSm = {
  ...textBase,
  fontSize: '12px',
};

export const textLg = {
  ...textBase,
  fontSize: '16px',
};

// Base Button style
export const buttonBase = {
  backgroundColor: '#4f46e5',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};

// Container for highlighted content
export const highlightedBox = {
  padding: '16px',
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  margin: '24px 0',
};

// Color schemes
export const colorSchemes = {
  indigo: '#4f46e5',
  blue: '#2563eb',
  purple: '#7c3aed',
  teal: '#0d9488',
};

// Main styles
const main = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '24px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
  borderBottom: '1px solid #e5e7eb',
};

const logo = {
  margin: '0 auto',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
};
