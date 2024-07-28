// src/posthog.js
import posthog from 'posthog-js';

posthog.init('phc_rFgruzXfM0sVjtQqnSihAynl1wr9goB6ocLhlEuAWJE', {
    api_host: 'https://us.i.posthog.com', // or your self-hosted PostHog instance
    autocapture: true,
    // Enable session recording
    session_recording: {
      recordCrossDomainIFrames: true // Optional: if you need to record across iframes
    }
  });

export default posthog;

