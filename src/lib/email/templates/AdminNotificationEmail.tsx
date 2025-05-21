import * as React from "react";
import { Section, Heading, Text, Link } from "@react-email/components";
import {
  BaseEmailTemplate,
  headingLg,
  textBase,
  textLg,
  highlightedBox,
} from "./BaseTemplate";

interface AdminNotificationEmailProps {
  name: string;
  email: string;
  reason?: string;
  submittedAt: Date;
}

export const AdminNotificationEmail = ({
  name,
  email,
  reason,
  submittedAt,
}: AdminNotificationEmailProps) => {
  const formattedDate = submittedAt.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <BaseEmailTemplate previewText={`New Waitlist Submission from ${name}`}>
      <Section style={{ padding: "24px", backgroundColor: "#ffffff" }}>
        <Heading as="h1" style={headingLg}>
          New Waitlist Submission
        </Heading>
        <Text style={textLg}>
          A new user has joined the Hirelytics waitlist. Here are their details:
        </Text>

        <Section style={highlightedBox}>
          <Text style={textBase}>
            <strong>Name:</strong> {name}
          </Text>
          <Text style={textBase}>
            <strong>Email:</strong>{" "}
            <Link
              href={`mailto:${email}`}
              style={{ color: "#4f46e5", textDecoration: "underline" }}
            >
              {email}
            </Link>
          </Text>
          <Text style={textBase}>
            <strong>Reason:</strong> {reason || <em>Not provided</em>}
          </Text>
          <Text style={textBase}>
            <strong>Submitted:</strong> {formattedDate}
          </Text>
        </Section>

        <Text style={textBase}>
          You can view and manage all waitlist entries in the{" "}
          <Link
            href="https://hirelytics.app/dashboard/admin/waitlist"
            style={{ color: "#4f46e5", textDecoration: "underline" }}
          >
            admin dashboard
          </Link>
          .
        </Text>
      </Section>
    </BaseEmailTemplate>
  );
};

export default AdminNotificationEmail;
