'use client';
import Clarity from '@microsoft/clarity';
import { useEffect } from 'react';

const clarityId = process.env.NEXT_PUBLIC_MICROSOFT_CLARITY_PROJECT_ID!;

const MicrosoftClarity = () => {
  useEffect(() => {
    console.log(clarityId);
    if (clarityId) {
      Clarity.init(clarityId);
      Clarity.consent();
    }
  }, []);

  return null;
};

export default MicrosoftClarity;
