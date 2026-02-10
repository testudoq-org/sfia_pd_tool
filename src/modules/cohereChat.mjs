/* eslint-env browser */
// Cohere Chat helper utilities
export async function sendCohereChatRequest(apiKey, userContent, options = {}) {
    const model = options.model || 'command-xlarge';
    const max_tokens = options.max_tokens || 1000;
    const temperature = (options.temperature === undefined) ? 0.3 : options.temperature;

    const systemPrompt = 'You are a helpful assistant. Reword the user supplied questions for clarity and provide additional thought-provoking questions with examples where relevant. Only output the questions and examples—no introductions, explanations, or concluding remarks.';

    const body = {
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `${userContent}` }
        ],
        max_tokens,
        temperature
    };

    const res = await globalThis.fetch('https://api.cohere.ai/chat', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => 'No response body');
        throw new Error(`Cohere API returned status ${res.status}: ${errText}`);
    }

    const data = await res.json().catch(() => null);
    return parseCohereAssistantText(data);
}

export function parseCohereAssistantText(data) {
    if (!data) return '';

    const candidates = [
        data.message?.content,
        data.choices?.[0]?.message?.content,
        data.output?.[0]?.content,
        data.generations?.[0]?.text,
        data.text
    ];

    for (const c of candidates) {
        if (!c) continue;
        if (typeof c === 'string') return c;
        if (Array.isArray(c)) {
            if (c.every(item => typeof item === 'string')) return c.join('\n');
            if (c[0]?.text) return c.map(x => x.text).join('\n');
            if (c[0]?.content) return c.map(x => (typeof x.content === 'string' ? x.content : JSON.stringify(x.content))).join('\n');
        }
        if (typeof c === 'object') {
            if (typeof c.content === 'string') return c.content;
            if (typeof c.text === 'string') return c.text;
        }
    }

    return '';
}
