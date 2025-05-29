import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { connectToDatabase } from '@/lib/mongodb';
import { JobApplication } from '@/models/job-application';

// Schema for validating request body
const interruptInterviewSchema = z.object({
  applicationId: z.string(),
  reason: z.enum(['timer_expired', 'technical_issue', 'user_action']),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { applicationId, reason } = interruptInterviewSchema.parse(body);

    // Connect to database
    await connectToDatabase();

    // Get application details
    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Update interview state to mark as interrupted
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      'interviewState.currentPhase': 'interrupted',
      'interviewState.interruptedAt': new Date(),
      'interviewState.interruptionReason': reason,
    };

    // If timer expired, also mark timer as expired
    if (reason === 'timer_expired') {
      updateData['interviewState.isTimerExpired'] = true;
    }

    await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        $set: updateData,
      },
      { new: true }
    );

    // Add a system message to the chat history about the interruption
    let interruptionMessage = '';
    switch (reason) {
      case 'timer_expired':
        interruptionMessage =
          'Interview time has expired. The interview session has been automatically ended.';
        break;
      case 'technical_issue':
        interruptionMessage = 'Interview was interrupted due to a technical issue.';
        break;
      case 'user_action':
        interruptionMessage = 'Interview was ended by user action.';
        break;
    }

    const systemMessage = {
      text: interruptionMessage,
      sender: 'system',
      timestamp: new Date(),
    };

    await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        $push: {
          interviewChatHistory: systemMessage,
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Interview interrupted successfully',
      reason,
    });
  } catch (error) {
    console.error('Error interrupting interview:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
