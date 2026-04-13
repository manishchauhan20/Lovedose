import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

type EmailProps = {
  heading: string;
  previewText: string;
  intro: string;
  url: string;
  buttonLabel: string;
  details?: string[];
  secondaryUrl?: string;
  secondaryLabel?: string;
};

export function Email({
  heading,
  previewText,
  intro,
  url,
  buttonLabel,
  details = [],
  secondaryUrl,
  secondaryLabel,
}: EmailProps) {
  return (
    <Html lang="en">
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Jost:wght@300;400;500&display=swap');
        `}</style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={body}>
        <Container style={wrapper}>

          {/* Top gold line */}
          <Section style={topLine} />

          {/* Brand header */}
          <Section style={header}>
            <Text style={brandName}>LOVEDOSE</Text>
            <Text style={brandTagline}>premium proposals</Text>
          </Section>

          {/* Ornament */}
          <Section style={ornamentRow}>
            <Text style={ornament}>✦</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={headingStyle}>{heading}</Heading>

            <Hr style={thinLine} />

            <Text style={introText}>{intro}</Text>

            {/* Details */}
            {details.length > 0 && (
              <Section style={detailsBlock}>
                {details.map((detail, i) => (
                  <Row key={i} style={detailRow}>
                    <Column style={bulletCol}>
                      <Text style={bulletStyle}>◆</Text>
                    </Column>
                    <Column>
                      <Text style={detailText}>{detail}</Text>
                    </Column>
                  </Row>
                ))}
              </Section>
            )}

            {/* CTA Buttons */}
            <Section style={buttonGroup}>
              <Button href={url} style={primaryButton}>
                {buttonLabel}
              </Button>
              {secondaryUrl && secondaryLabel && (
                <Button href={secondaryUrl} style={ghostButton}>
                  {secondaryLabel}
                </Button>
              )}
            </Section>

            {/* Plain-text fallback links */}
            <Hr style={thinLine} />
            <Text style={fallbackLabel}>Or copy the link below:</Text>
            <Text style={fallbackLink}>{url}</Text>
            {secondaryUrl && (
              <Text style={fallbackLink}>{secondaryUrl}</Text>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} LoveDose &nbsp;·&nbsp; Crafted with love
            </Text>
            <Text style={footerSub}>
              You received this because an account action was performed on your behalf.
              If this wasn&apos;t you, please ignore this email.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

export default Email;

/* ─── Styles ──────────────────────────────────────────── */

const body: React.CSSProperties = {
  backgroundColor: "#0c0b09",
  margin: "0",
  padding: "40px 12px",
};

const wrapper: React.CSSProperties = {
  backgroundColor: "#0c0b09",
  maxWidth: "600px",
  margin: "0 auto",
  borderRadius: "4px",
  overflow: "hidden",
  border: "1px solid #2a2218",
};

const topLine: React.CSSProperties = {
  background: "linear-gradient(90deg, #8b6914, #d4af37, #8b6914)",
  height: "2px",
};

const header: React.CSSProperties = {
  backgroundColor: "#100e0a",
  padding: "32px 48px 24px",
  textAlign: "center" as const,
  borderBottom: "1px solid #1e1a12",
};

const brandName: React.CSSProperties = {
  fontFamily: "'Jost', Helvetica, sans-serif",
  fontSize: "11px",
  fontWeight: 500,
  color: "#d4af37",
  letterSpacing: "0.5em",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
};

const brandTagline: React.CSSProperties = {
  fontFamily: "'Jost', Helvetica, sans-serif",
  fontSize: "10px",
  fontWeight: 300,
  color: "#5a4e3a",
  letterSpacing: "0.3em",
  margin: 0,
  textTransform: "uppercase" as const,
};

const ornamentRow: React.CSSProperties = {
  backgroundColor: "#100e0a",
  textAlign: "center" as const,
  padding: "0 0 4px",
};

const ornament: React.CSSProperties = {
  color: "#2e2518",
  fontSize: "16px",
  margin: "0",
  lineHeight: "1",
};

const content: React.CSSProperties = {
  padding: "48px 52px 40px",
  backgroundColor: "#110f0b",
};

const headingStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: "32px",
  fontWeight: 500,
  color: "#f0e6d0",
  margin: "0 0 24px",
  lineHeight: "1.25",
  letterSpacing: "-0.01em",
};

const thinLine: React.CSSProperties = {
  borderColor: "#201c14",
  margin: "0 0 24px",
};

const introText: React.CSSProperties = {
  fontFamily: "'Jost', Helvetica, sans-serif",
  fontSize: "15px",
  fontWeight: 300,
  color: "#c4b89a",
  lineHeight: "1.8",
  margin: "0 0 32px",
};

const detailsBlock: React.CSSProperties = {
  backgroundColor: "#0f0d09",
  border: "1px solid #2a2218",
  borderLeft: "2px solid #d4af37",
  padding: "20px 24px",
  marginBottom: "36px",
  borderRadius: "0 3px 3px 0",
};

const detailRow: React.CSSProperties = {
  marginBottom: "10px",
};

const bulletCol: React.CSSProperties = {
  width: "20px",
  verticalAlign: "top",
};

const bulletStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "6px",
  color: "#d4af37",
  margin: "5px 0 0",
  lineHeight: "1",
};

const detailText: React.CSSProperties = {
  fontFamily: "'Jost', Helvetica, sans-serif",
  fontSize: "13.5px",
  fontWeight: 400,
  color: "#b0a080",
  margin: 0,
  lineHeight: "1.6",
};

const buttonGroup: React.CSSProperties = {
  marginBottom: "36px",
};

const primaryButton: React.CSSProperties = {
  backgroundColor: "#d4af37",
  borderRadius: "2px",
  color: "#0c0b09",
  display: "inline-block",
  fontFamily: "'Jost', Helvetica, sans-serif",
  fontSize: "11px",
  fontWeight: 500,
  letterSpacing: "0.18em",
  padding: "15px 32px",
  textDecoration: "none",
  textTransform: "uppercase" as const,
  marginRight: "12px",
};

const ghostButton: React.CSSProperties = {
  backgroundColor: "transparent",
  border: "1px solid #3a3020",
  borderRadius: "2px",
  color: "#c4a84a",
  display: "inline-block",
  fontFamily: "'Jost', Helvetica, sans-serif",
  fontSize: "11px",
  fontWeight: 500,
  letterSpacing: "0.18em",
  padding: "15px 32px",
  textDecoration: "none",
  textTransform: "uppercase" as const,
};

const fallbackLabel: React.CSSProperties = {
  fontFamily: "'Jost', Helvetica, sans-serif",
  fontSize: "11px",
  color: "#4a4030",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  margin: "0 0 6px",
};

const fallbackLink: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "12px",
  color: "#5a4e38",
  margin: "0 0 4px",
  wordBreak: "break-all" as const,
};

const footer: React.CSSProperties = {
  backgroundColor: "#0a0906",
  borderTop: "1px solid #1a1710",
  padding: "24px 48px",
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  fontFamily: "'Jost', Helvetica, sans-serif",
  fontSize: "11px",
  color: "#3a3228",
  letterSpacing: "0.12em",
  margin: "0 0 8px",
};

const footerSub: React.CSSProperties = {
  fontFamily: "'Jost', Helvetica, sans-serif",
  fontSize: "11px",
  color: "#2e2820",
  lineHeight: "1.6",
  margin: 0,
};
