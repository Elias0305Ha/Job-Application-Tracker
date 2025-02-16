const { google } = require("googleapis");
require("dotenv").config();

// Authenticate with Google
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback" // Redirect URL
);

// Set refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Create Gmail API instance
const gmail = google.gmail({ version: "v1", auth: oauth2Client });

async function fetchJobEmails() {
  try {
    // Search for job-related emails with combined filters
    // Application response filters
    const responseFilters = [
      'received your application',
      'application received',
      'thank you for applying',
      'thank you for your application',
      'application confirmation',
      'application status',
      'regarding your application',
      'response to your application'
    ].map(term => `subject:"${term}"`);

    // Recruiting team variations
    const senderFilters = [
      'talent acquisition',
      'talent sourcing',
      'talent team',
      'recruiting team',
      'recruitment team',
      'hiring team',
      'people operations',
      'talent operations',
      'candidate experience',
      'recruiting coordinator',
      'recruitment specialist',
      'talent specialist',
      'hiring coordinator',
      'talent partner',
      'recruiting partner'
    ].map(term => `from:"${term}"`);

    // Combine all filters
    const query = `(${responseFilters.join(' OR ')}) OR (${senderFilters.join(' OR ')}) -subject:"apply now" -subject:"job alert" -subject:"new jobs" -subject:"job opportunity"`;
    console.log('Gmail query:', query);

    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 100
    });

    if (!response.data.messages) return [];

    const emails = await Promise.all(
      response.data.messages.map(async (msg) => {
        const email = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: 'full'
        });
        
        const headers = email.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const from = headers.find(h => h.name === 'From')?.value || '';
        const content = email.data.snippet.toLowerCase();
        
        // Determine status from content with more specific phrases
        let status = 'Applied';
        const combinedText = (subject + ' ' + content).toLowerCase();
        
        if (combinedText.includes('interview') || 
            combinedText.includes('next steps') ||
            combinedText.includes('meet with') ||
            combinedText.includes('schedule a') ||
            combinedText.includes('meeting invitation')) {
          status = 'Interview';
        } else if (combinedText.includes('unfortunately') || 
                   combinedText.includes('not moving forward') ||
                   combinedText.includes('other candidates') ||
                   combinedText.includes('not selected') ||
                   combinedText.includes('position has been filled')) {
          status = 'Rejected';
        } else if (combinedText.includes('offer') || 
                   combinedText.includes('congratulations') ||
                   combinedText.includes('welcome aboard') ||
                   combinedText.includes('pleased to inform')) {
          status = 'Accepted';
        }
        
        // Extract company name from subject or sender
        const companyMatch = 
          subject.match(/from ([^-]+)/) || // "from Company"
          subject.match(/at ([^-]+)/) ||   // "at Company"
          from.match(/([^@<]+)@/) ||       // part before @ in email
          from.match(/^([^<]+)/);          // sender name
        
        const companyName = companyMatch ? companyMatch[1].trim() : 'Unknown Company';
        
        return {
          id: msg.id,
          _id: msg.id,
          subject,
          from,
          snippet: email.data.snippet,
          company: companyName,
          position: subject.replace(/Re: |Fwd: /, ''),
          status,
          dateApplied: new Date(parseInt(email.data.internalDate)).toISOString(),
          fromEmail: true
        };
      })
    );

    // Sort by date and return
    return emails.sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied));
  } catch (error) {
    console.error("Error fetching emails:", error);
    return [];
  }
}

// Export the function
module.exports = fetchJobEmails;
