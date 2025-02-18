const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function extractJobInfo(subject, from, content) {
    const prompt = `
Analyze this job application email and extract key information:

Subject: ${subject}
From: ${from}
Content: ${content}

Rules:
1. For company: Extract the actual hiring company (ignore platforms like Workday/Greenhouse)
2. For position: Get the exact job title without extra words like "role" or "position"
3. For status: Determine if "Applied", "Interview", "Rejected", or "Accepted"

Return ONLY a JSON object like this:
{
    "company": "Actual company name",
    "position": "Clean job title",
    "status": "Current status"
}

Example good outputs:
- {"company": "Red Robin", "position": "IT Support Analyst", "status": "Applied"}
- {"company": "BAE Systems", "position": "Software Engineer", "status": "Interview"}
`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            messages: [{
                role: "user",
                content: prompt
            }],
            temperature: 0,  // More precise
            max_tokens: 150  // Short response
        });

        const result = JSON.parse(response.choices[0].message.content);
        return result;
    } catch (error) {
        console.error('OpenAI error:', error);
        // Fallback to basic extraction if OpenAI fails
        return {
            company: extractCompanyBasic(from),
            position: extractPositionBasic(subject),
            status: determineStatusBasic(subject, content)
        };
    }
}

// Basic fallback functions
function extractCompanyBasic(from) {
    const domainMatch = from.match(/@([^.]+)\./);
    return domainMatch ? domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1) : 'Unknown Company';
}

function extractPositionBasic(subject) {
    return subject
        .replace(/^(?:Re: |Fwd: |RE: |FWD: )+/, '')
        .replace(/thank you.*$/i, '')
        .replace(/application.*$/i, '')
        .trim();
}

function determineStatusBasic(subject, content) {
    const text = (subject + ' ' + content).toLowerCase();
    if (text.includes('interview') || text.includes('next steps')) return 'Interview';
    if (text.includes('unfortunately') || text.includes('not moving forward')) return 'Rejected';
    if (text.includes('offer') || text.includes('congratulations')) return 'Accepted';
    return 'Applied';
}

module.exports = {
    extractJobInfo
};
