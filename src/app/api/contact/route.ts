import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Contact } from '@/models/contact';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Define contact schema for validation
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const { name, email, message } = contactSchema.parse(body);

    // Connect to database
    await connectToDatabase();

    // Create contact entry
    const contact = await Contact.create({
      name,
      email,
      message,
    });

    // Send emails if Resend API key is configured
    if (process.env.RESEND_API_KEY) {
      const submittedAt = new Date();

      // Import email rendering utilities
      const { renderContactConfirmationEmail, renderContactNotificationEmail } = await import(
        '@/lib/email/render'
      );

      try {
        // Send confirmation email to user
        const userSend = await resend.emails.send({
          from: 'Hirelytics <contact@hirelytics.app>',
          to: email,
          subject: 'Thank you for contacting Hirelytics',
          html: await renderContactConfirmationEmail({
            name,
            message,
          }),
        });

        // Send notification email to admin
        if (process.env.ADMIN_EMAIL) {
          const adminSend = await resend.emails.send({
            from: 'Hirelytics <notification@hirelytics.app>',
            to: process.env.ADMIN_EMAIL,
            subject: 'New Contact Form Submission',
            html: await renderContactNotificationEmail({
              name,
              email,
              message,
              submittedAt,
            }),
          });
          console.log('Admin notification email sent:', adminSend);
        }

        console.log('Contact confirmation email sent:', userSend);
      } catch (emailError) {
        console.error('Failed to send contact emails:', emailError);
        // Continue processing even if email fails
      }
    }

    return NextResponse.json(
      { message: 'Message sent successfully! We will get back to you soon.', contact },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in contact form submission:', error);
    return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // Connect to database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Build query for search
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Contact.countDocuments(query);

    // Get contacts with pagination
    const contacts = await Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

    // Return contacts with pagination metadata
    return NextResponse.json({
      contacts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}
