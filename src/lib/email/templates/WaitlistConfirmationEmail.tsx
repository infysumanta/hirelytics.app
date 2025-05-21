import * as React from "react";
import {
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import {
  BaseEmailTemplate,
  headingMd,
  headingSm,
  textBase,
  textLg,
  highlightedBox,
  buttonBase,
} from "./BaseTemplate";

interface WaitlistConfirmationEmailProps {
  name: string;
}

export const WaitlistConfirmationEmail = ({
  name,
}: WaitlistConfirmationEmailProps) => {
  return (
    <BaseEmailTemplate previewText="Thanks for joining the Hirelytics waitlist!">
      <Section
        style={{
          backgroundColor: "#4f46e5",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <Heading
          as="h1"
          style={{
            color: "#ffffff",
            fontSize: "30px",
            fontWeight: "600",
            margin: "0",
          }}
        >
          Thanks for Joining Our Waitlist!
        </Heading>
      </Section>

      <Section style={{ padding: "24px", backgroundColor: "#ffffff" }}>
        <Text style={textLg}>Hi {name},</Text>

        <Text style={textBase}>
          Thank you for your interest in Hirelytics! We&apos;re excited to have
          you on our waitlist.
        </Text>

        <Section style={highlightedBox}>
          <Heading as="h3" style={headingSm}>
            What happens next?
          </Heading>
          <Text style={textBase}>
            We&apos;ll notify you as soon as registration opens for new users.
            You&apos;ll be among the first to know!
          </Text>
        </Section>

        <Heading as="h2" style={headingMd}>
          Why Choose Hirelytics?
        </Heading>

        <Row style={{ paddingTop: "12px", paddingBottom: "12px" }}>
          <Column style={{ width: "24px", verticalAlign: "top" }}>✅</Column>
          <Column>
            <Text style={{ ...textBase, margin: "0" }}>
              <strong>AI-Powered Recruiting:</strong> Automated technical
              interviews with state-of-the-art AI
            </Text>
          </Column>
        </Row>

        <Row style={{ paddingTop: "12px", paddingBottom: "12px" }}>
          <Column style={{ width: "24px", verticalAlign: "top" }}>✅</Column>
          <Column>
            <Text style={{ ...textBase, margin: "0" }}>
              <strong>Efficient Matching:</strong> Intelligent candidate-job
              matching algorithms
            </Text>
          </Column>
        </Row>

        <Row style={{ paddingTop: "12px", paddingBottom: "12px" }}>
          <Column style={{ width: "24px", verticalAlign: "top" }}>✅</Column>
          <Column>
            <Text style={{ ...textBase, margin: "0" }}>
              <strong>Data Insights:</strong> Comprehensive analytics and
              reporting tools
            </Text>
          </Column>
        </Row>

        <Row style={{ paddingTop: "12px", paddingBottom: "24px" }}>
          <Column style={{ width: "24px", verticalAlign: "top" }}>✅</Column>
          <Column>
            <Text style={{ ...textBase, margin: "0" }}>
              <strong>Seamless Experience:</strong> Modern, intuitive interface
              for both recruiters and candidates
            </Text>
          </Column>
        </Row>

        <Button href="https://hirelytics.app/learn-more" style={buttonBase}>
          Learn More About Hirelytics
        </Button>

        <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />

        <Text style={textBase}>
          We&apos;re working hard to create the best recruitment platform
          possible and can&apos;t wait for you to try it.
        </Text>

        <Text style={textBase}>
          Best regards,
          <br />
          <strong>Sumanta Kabiraj</strong>
          <br />
          <em>Founder, CEO, Hirelytics</em>
        </Text>
      </Section>
    </BaseEmailTemplate>
  );
};

export default WaitlistConfirmationEmail;
