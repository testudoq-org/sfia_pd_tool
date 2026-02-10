/* eslint-env node, browser */
/* global module, console */
// Cohere Chat helper utilities (CommonJS for test compatibility)
// Cohere Chat API v2 endpoint
const COHERE_CHAT_URL = 'https://api.cohere.com/v2/chat';

// Default model — use a current Cohere model (command-a-03-2025 is the latest)
const DEFAULT_MODEL = 'command-a-03-2025';

async function sendCohereChatRequest(apiKey, userContent, options = {}) {
    const model = options.model || DEFAULT_MODEL;
    const max_tokens = options.max_tokens || 1000;
    const temperature = (options.temperature === undefined) ? 0.3 : options.temperature;

    const systemPrompt = 'You are a helpful assistant. Reword the user supplied questions for clarity and provide additional thought-provoking questions with examples where relevant. Only output the questions and examples—no introductions, explanations, or concluding remarks.';

    // Validate user content to avoid sending empty messages to Cohere
    const trimmedContent = typeof userContent === 'string' ? userContent.trim() : '';
    if (!trimmedContent) {
        throw new Error('No content provided for Cohere Chat request');
    }

    // Cohere v2 Chat API: messages[].content is a plain string
    // See https://docs.cohere.com/reference/chat
    const body = {
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: trimmedContent }
        ],
        max_tokens,
        temperature
    };

    // Debug output to help diagnose client-side payload issues in DevTools
    console.debug('[Cohere v2] Request body:', JSON.stringify(body, null, 2));

    const res = await globalThis.fetch(COHERE_CHAT_URL, {
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

function extractFromArray(arr) {
    const normalized = arr.map(item => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') return item.text ?? item.content ?? JSON.stringify(item);
        return '';
    }).filter(Boolean);
    return normalized.length ? normalized.join('\n') : '';
}

function extractFromObject(obj) {
    if (typeof obj.content === 'string') return obj.content;
    if (typeof obj.text === 'string') return obj.text;
    try {
        return JSON.stringify(obj);
    } catch (e) {
        return '';
    }
}

function parseCohereAssistantText(data) {
    if (!data) return '';

    const candidates = [
        data.message?.content,
        data.choices?.[0]?.message?.content,
        data.output?.[0]?.content,
        data.generations?.[0]?.text,
        data.text
    ];

    const normalized = candidates.map(c => {
        if (!c) return '';
        if (typeof c === 'string') return c;
        if (Array.isArray(c)) return extractFromArray(c);
        if (c && typeof c === 'object') return extractFromObject(c);
        return '';
    });

    return normalized.find(Boolean) || '';
}

module.exports = { sendCohereChatRequest, parseCohereAssistantText };
