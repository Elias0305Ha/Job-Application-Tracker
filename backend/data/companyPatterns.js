// Common company domains and their proper names
const companyDomains = {
    'google': 'Google',
    'amazon': 'Amazon',
    'microsoft': 'Microsoft',
    'apple': 'Apple',
    'meta': 'Meta',
    'facebook': 'Facebook',
    'netflix': 'Netflix',
    'ibm': 'IBM',
    'oracle': 'Oracle',
    'salesforce': 'Salesforce',
    'intel': 'Intel',
    'cisco': 'Cisco',
    'adobe': 'Adobe',
    'vmware': 'VMware',
    'dell': 'Dell',
    'hp': 'HP',
    'twitter': 'Twitter',
    'linkedin': 'LinkedIn',
    'uber': 'Uber',
    'airbnb': 'Airbnb',
    'spotify': 'Spotify',
    'twilio': 'Twilio',
    'slack': 'Slack',
    'github': 'GitHub',
    'gitlab': 'GitLab'
};

// Generic domains to ignore
const genericDomains = [
    'gmail',
    'outlook',
    'hotmail',
    'yahoo',
    'aol',
    'mail',
    'notifications',
    'noreply',
    'no-reply',
    'donotreply',
    'do-not-reply',
    'careers',
    'jobs',
    'recruiting',
    'talent',
    'hr'
];

// Common position patterns in subject lines
const positionPatterns = [
    // Direct position mentions
    /(?:regarding|re:|for) (?:the )?(?:position of|role of|position as|role as) ([^,]+)/i,
    
    // Position with company
    /([^,]+?) (?:position|role|opportunity) (?:at|with) /i,
    
    // Position in parentheses
    /\(([^)]+(?:engineer|developer|programmer|analyst|manager|architect|designer|consultant)[^)]*)\)/i,
    
    // Job ID or Reference patterns
    /([^,]+), (?:ID|Ref|Reference|Job ID): [A-Z0-9]+/i,
    
    // Common tech role patterns
    /([^,]+?(?:engineer|developer|programmer|analyst|manager|architect|designer|consultant))/i
];

// Common email subject patterns for applications
const subjectPatterns = {
    application: [
        'application received',
        'application confirmation',
        'thank you for applying',
        'thank you for your application',
        'application status',
        'regarding your application',
        'received your application'
    ],
    interview: [
        'interview invitation',
        'schedule an interview',
        'interview request',
        'next steps',
        'phone screen',
        'technical interview'
    ],
    rejection: [
        'status update',
        'application status update',
        'thank you for your interest',
        'position update',
        'regarding your candidacy'
    ],
    offer: [
        'offer letter',
        'job offer',
        'welcome to the team',
        'offer details',
        'employment offer'
    ]
};

module.exports = {
    companyDomains,
    genericDomains,
    positionPatterns,
    subjectPatterns
};
