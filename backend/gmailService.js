const { google } = require("googleapis");
require("dotenv").config();
const { extractJobInfo } = require('./utils/emailParser');

// Authenticate with Google
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

async function fetchJobEmails() {
  try {
    // Search filters
    const responseFilters = [
      'received your application',
      'application received',
      'thank you for applying',
      'thank you for your application',
      'application confirmation',
      'application status',
      'regarding your application'
    ].map(term => `subject:"${term}"`);

    const senderFilters = [
      'talent acquisition',
      'talent sourcing',
      'recruiting team',
      'hiring team',
      'people operations'
    ].map(term => `from:"${term}"`);

    const query = `(${responseFilters.join(' OR ')}) OR (${senderFilters.join(' OR ')})`;
    console.log('Fetching job emails...');

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
        const content = email.data.snippet;
        
        // Use OpenAI to extract job info
        const jobInfo = await extractJobInfo(subject, from, content);
        
        // Detect platform
        const platform = from.toLowerCase().includes('workday') ? 'workday' :
                        from.toLowerCase().includes('greenhouse') ? 'greenhouse' :
                        from.toLowerCase().includes('lever') ? 'lever' :
                        'other';

        return {
          id: msg.id,
          _id: msg.id,
          ...jobInfo,  // Spread the OpenAI extracted info
          dateApplied: new Date(parseInt(email.data.internalDate)).toISOString(),
          fromEmail: true,
          
          // Store raw email data
          emailId: msg.id,
          emailSubject: subject,
          emailFrom: from,
          emailContent: content,
          
          // Store original values
          originalCompany: jobInfo.company,
          originalPosition: jobInfo.position,
          
          platform,
          wasEdited: false
        };
      })
    );

    return emails.sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied));
  } catch (error) {
    console.error("Error fetching emails:", error);
    return [];
  }
}

module.exports = fetchJobEmails;
