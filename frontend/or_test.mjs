import fetch from 'node-fetch';

const OPENROUTER_API_KEY = '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';
const MODEL = 'deepseek/deepseek-chat';
const SYSTEM_PROMPT = "You are a test agent.";
const chatHistoryRef = [{role: 'user', content: 'Create a high priority ticket immediately for the employee shell hyphen 1001.'}];
const TOOLS = [
    {
        type: 'function',
        function: {
            name: 'create_itsm_ticket',
            description: 'Autonomously dispatch a critical service incident ticket.',
            parameters: {
                type: 'object',
                properties: {
                    emp_id: { type: 'string' },
                    short_description: { type: 'string' },
                    description: { type: 'string' },
                    category: { type: 'string' },
                    impact: { type: 'string' },
                    urgency: { type: 'string' }
                },
                required: ['short_description', 'description']
            }
        }
    }
];

async function test() {
    console.log("sending fetch...");
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...chatHistoryRef
                ],
                tools: TOOLS,
                tool_choice: 'auto',
                temperature: 0.3,
            })
        });
        const completion = await response.json();
        console.log(JSON.stringify(completion, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
