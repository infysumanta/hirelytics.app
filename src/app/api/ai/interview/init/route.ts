import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getJobById } from '@/actions/jobs';
import { generateGeminiText } from '@/lib/ai-utils';
import { uploadAudioToS3 } from '@/lib/audio-utils';
import { serverTextToSpeech } from '@/lib/deepgram-tts';
import { connectToDatabase } from '@/lib/mongodb';
import { JobApplication } from '@/models/job-application';

// Schema for validating request body
const initInterviewSchema = z.object({
  applicationId: z.string(),
  forceRestart: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { applicationId, forceRestart } = initInterviewSchema.parse(body);

    // Connect to database
    await connectToDatabase();

    // Get application details
    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Get job details
    const job = await getJobById(application.jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if there's existing chat history and we're not forcing a restart
    const existingChatHistory = application.interviewChatHistory || [];

    if (existingChatHistory.length > 0 && !forceRestart) {
      // Check if the interview is already completed
      const interviewState = application.interviewState || {};
      const isCompleted = interviewState.currentPhase === 'completed';

      // Define an interface for our message structure
      interface InterviewMessage {
        text?: string;
        sender?: 'ai' | 'user' | 'system';
        timestamp?: Date;
        questionId?: string;
        questionCategory?: string;
        feedback?: string;
        audioS3Key?: string;
        audioS3Bucket?: string;
        audioUrl?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any; // For any other properties
      }

      // Debug the chat history first
      console.log('[Interview Init] Processing existing chat history', {
        count: existingChatHistory.length,
        firstMessage: existingChatHistory[0]
          ? {
              text: typeof existingChatHistory[0].text,
              sender: existingChatHistory[0].sender,
              hasAudioS3Key: !!existingChatHistory[0].audioS3Key,
            }
          : null,
      });

      // Ensure all AI messages have audioUrl (in case they're missing from legacy data)
      // Convert MongoDB documents to plain JavaScript objects
      const processedChatHistory = await Promise.all(
        existingChatHistory.map(async (message: InterviewMessage, index: number) => {
          // Create a new plain object with only the properties we need
          // This avoids MongoDB document methods and metadata
          const plainMessage = {
            text: message.text || '',
            sender: message.sender || 'system',
            timestamp: message.timestamp || new Date(),
            questionId: message.questionId || undefined,
            questionCategory: message.questionCategory || undefined,
            feedback: message.feedback || undefined,
            audioS3Key: message.audioS3Key || undefined,
            audioS3Bucket: message.audioS3Bucket || undefined,
            audioUrl: message.audioUrl || undefined,
            // Add any other properties that might be needed
          };

          // Debug first message details
          if (index === 0) {
            console.log('[Interview Init] First message converted', {
              original: {
                textType: typeof message.text,
                senderType: typeof message.sender,
                audioKeyExists: !!message.audioS3Key,
                keys: Object.keys(message).slice(0, 5), // Show first 5 keys
              },
              converted: {
                textType: typeof plainMessage.text,
                senderType: typeof plainMessage.sender,
                audioKeyExists: !!plainMessage.audioS3Key,
              },
            });
          }

          // Only process AI messages that have S3 info but lack audioUrl
          if (
            plainMessage.sender === 'ai' &&
            plainMessage.audioS3Key &&
            plainMessage.audioS3Bucket &&
            !plainMessage.audioUrl
          ) {
            try {
              // Generate a fresh audio URL from the S3 keys
              const { getAudioSignedUrl } = await import('@/lib/audio-utils');
              const audioUrl = await getAudioSignedUrl(
                plainMessage.audioS3Key,
                plainMessage.audioS3Bucket
              );

              // Debug URL generation
              console.log(`[Interview Init] Generated audio URL for message ${index}`, {
                audioUrl: audioUrl.substring(0, 50) + '...', // Show truncated URL for privacy
              });

              // Return the message with the new audioUrl
              return {
                ...plainMessage,
                audioUrl,
              };
            } catch (error) {
              console.error(
                `[Interview Init] Failed to generate audio URL for message ${index}:`,
                error
              );
              return plainMessage;
            }
          }
          return plainMessage;
        })
      );

      // Debug the processed history
      console.log('[Interview Init] Processed chat history', {
        count: processedChatHistory.length,
        firstMessageHasAudioUrl: processedChatHistory[0]?.audioUrl ? true : false,
      });

      // Create a sanitized version of the chat history that's safe for client consumption
      const sanitizedChatHistory = processedChatHistory.map((msg) => ({
        text: msg.text || '',
        sender: msg.sender || 'system',
        timestamp: msg.timestamp || new Date(),
        questionId: msg.questionId,
        questionCategory: msg.questionCategory,
        feedback: msg.feedback,
        audioS3Key: msg.audioS3Key,
        audioS3Bucket: msg.audioS3Bucket,
        audioUrl: msg.audioUrl,
      }));

      // Return the existing chat history with added audioUrls where needed
      return NextResponse.json({
        greeting: null, // No need for new greeting
        jobTitle: job.title,
        companyName: job.companyName,
        applicationId,
        hasExistingChat: true,
        chatHistory: sanitizedChatHistory,
        isCompleted: isCompleted,
      });
    }

    // Create system prompt for initialization with job description and resume details
    const initPrompt = `
      You are an AI interviewer named "Hirelytics AI" for ${
        job.companyName
      }. You're conducting an interview for the ${job.title} position.

      JOB DESCRIPTION:
      ${job.description || 'No detailed job description available.'}

      REQUIRED SKILLS:
      ${job.skills?.join(', ') || 'not specified'}.

      CANDIDATE'S RESUME:
      """
      ${application.parsedResume?.extractedText || 'No resume text available'}
      """

      You'll be conducting a structured interview process with the following phases:

      1. Introduction: Introduce yourself as "Hirelytics AI" with a brief welcome message and explain the interview process.
      2. Brief Candidate Introduction: Ask the candidate for a brief introduction/overview of their background.
      3. Technical Questions: After their introduction, provide brief feedback and then proceed to ask 3 technical questions, one at a time.
      4. Project Discussion: After technical questions, ask about their most significant project and ask 3 follow-up questions about it.
      5. Behavioral Questions: Ask 3 behavioral questions about work environment preferences and collaboration style.
      6. Conclusion: Thank the candidate with a professional closing message.

      Your initial response should be just the introduction and request for the candidate to introduce themselves. Be professional, confident, and take control of the interview process. Explain that you are Hirelytics AI and you'll be asking technical, project-related, and behavioral questions, and that you'll provide evaluation feedback after the interview. Set the expectation that you'll be guiding the conversation structure. Keep responses concise (2-3 sentences maximum).
    `;

    // Generate initial greeting and question
    const initialGreeting = await generateGeminiText(initPrompt, 'gemini-2.0-flash-lite');

    // Create a system message with job description and complete parsed resume data
    const systemMessage = `
# Interview for: ${job.title} at ${job.companyName}

## Job Description:
${job.description || 'No detailed job description available.'}

## Required Skills:
${job.skills?.join(', ') || 'not specified'}.

## Resume Data:
${
  application.parsedResume
    ? `
Skills: ${application.parsedResume.skills?.join(', ') || 'Not specified'}

Experience: ${application.parsedResume.experience?.years || 'Unknown'} years
${
  application.parsedResume.experience?.companies?.length
    ? `Companies: ${application.parsedResume.experience.companies.join(', ')}`
    : 'No company information available'
}

Education: ${
        application.parsedResume.education
          ?.map(
            (edu: { degree?: string; institution?: string }) =>
              `${edu.degree || 'Degree'} - ${edu.institution || 'Institution'}`
          )
          .join('\n') || 'No education information available'
      }

About: ${application.parsedResume.about || 'No summary available'}
`
    : 'Resume data not available.'
}
    `.trim();

    // Get the current application to ensure we have the most up-to-date state
    const currentApplication = await JobApplication.findById(applicationId);
    if (!currentApplication) {
      return NextResponse.json({ error: 'Application no longer exists' }, { status: 404 });
    }

    // Create AI greeting message
    const aiGreetingMessage = {
      text: initialGreeting,
      sender: 'ai',
      timestamp: new Date(),
      audioS3Key: '',
      audioS3Bucket: '',
      audioUrl: '',
    };

    // Initialize the chat history if it doesn't exist yet or if we're forcing a restart
    if (
      !currentApplication.interviewChatHistory ||
      currentApplication.interviewChatHistory.length === 0 ||
      forceRestart
    ) {
      // If we're forcing a restart, log it
      if (forceRestart) {
        console.log(`[Interview Init] Forcing restart for application ${applicationId}`);
      }

      // Create messages array
      const messages = [
        {
          text: systemMessage,
          sender: 'system',
          timestamp: new Date(),
        },
      ];

      // Generate and save audio for AI greeting
      try {
        // Convert AI greeting to speech
        const audioBuffer = await serverTextToSpeech(initialGreeting);

        if (audioBuffer) {
          // Upload audio to S3
          const audioS3Data = await uploadAudioToS3(audioBuffer, applicationId);

          // Add S3 info to the AI greeting message
          aiGreetingMessage.audioS3Key = audioS3Data.s3Key;
          aiGreetingMessage.audioS3Bucket = audioS3Data.s3Bucket;

          // Generate signed URL for immediate playback
          const { getAudioSignedUrl } = await import('@/lib/audio-utils');
          const audioUrl = await getAudioSignedUrl(audioS3Data.s3Key, audioS3Data.s3Bucket);

          // Add audio URL to the message for immediate playback
          aiGreetingMessage.audioUrl = audioUrl;

          console.log(`[Interview Init] Audio generated and uploaded to ${audioS3Data.s3Key}`);
        }
      } catch (audioError) {
        console.error('[Interview Init] Error generating or uploading audio:', audioError);
        // Continue with the flow even if audio generation fails
      }

      // Add AI greeting to messages
      messages.push(aiGreetingMessage);

      // Save both system message and initial AI greeting to the database and initialize interview state
      await JobApplication.findByIdAndUpdate(
        applicationId,
        {
          $set: {
            interviewChatHistory: messages,
            interviewState: {
              currentPhase: 'introduction',
              technicalQuestionsAsked: 0,
              projectQuestionsAsked: 0,
              behavioralQuestionsAsked: 0,
              askedQuestions: [],
              timerStartedAt: new Date(),
              timerDurationMinutes: job.interviewDuration,
              isTimerExpired: false,
            },
          },
        },
        { new: true }
      );
    }

    // Create the messages that will be returned as the initial chat history
    const initialChatHistory = [
      {
        text: systemMessage,
        sender: 'system',
        timestamp: new Date(),
      },
      {
        text: initialGreeting,
        sender: 'ai',
        timestamp: new Date(),
        // Include all audio-related properties
        audioUrl: aiGreetingMessage.audioUrl,
        audioS3Key: aiGreetingMessage.audioS3Key,
        audioS3Bucket: aiGreetingMessage.audioS3Bucket,
      },
    ];

    return NextResponse.json({
      greeting: initialGreeting,
      jobTitle: job.title,
      companyName: job.companyName,
      applicationId,
      hasExistingChat: false,
      chatHistory: initialChatHistory, // Return the newly created messages with audioUrl
      initialAudioS3Key: aiGreetingMessage.audioS3Key,
      initialAudioS3Bucket: aiGreetingMessage.audioS3Bucket,
      // Include the direct audio URL for immediate playback
      audioUrl: aiGreetingMessage.audioUrl,
    });
  } catch (error) {
    console.error('Error initializing interview:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
