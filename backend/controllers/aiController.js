const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const Product = require('../models/productModel');

// Initialize AI clients
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Choose provider based on secondary env var or default to OpenAI then Gemini
const PREFERRED_PROVIDER = process.env.AI_PROVIDER || (process.env.OPENAI_API_KEY ? 'openai' : 'gemini');

exports.chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
            return res.status(200).json({ 
                success: true, 
                reply: "I'm sorry, my AI brain isn't fully connected yet (API Key missing). I'm a Heritage Harvest assistant in training! How else can I help you today?" 
            });
        }

        console.log(`[AI-DEBUG] Provider: ${PREFERRED_PROVIDER}, GeminiKey: ${!!process.env.GEMINI_API_KEY}, OpenAIKey: ${!!process.env.OPENAI_API_KEY}`);

        // Fetch product context
        const products = await Product.find({}, 'name description price category stock');
        const productContext = products.map(p => 
            `- ${p.name}: ${p.description} (Price: ₹${p.price}, Category: ${p.category})`
        ).join('\n');

        const systemInstruction = `
            You are "Harvest Concierge", the premium AI assistant for Heritage Harvest, an authentic brand specializing in traditional Jaggery and Ghee products.
            
            Your personality:
            - Warm, welcoming, and professional.
            - Knowledgeable about traditional Indian wellness and natural sweeteners.
            - Helpful and concise.
            
            Context about our products:
            ${productContext || 'No products available currently.'}
            
            General Information:
            - Shipping: We deliver across India. Standard shipping takes 3-5 business days.
            - Values: We believe in purity, tradition, and health. No chemicals or preservatives.
            
            Rules (STRICT):
            - ONLY talk about Heritage Harvest products (Jaggery, Ghee, and related traditional wellness).
            - DO NOT answer questions about unrelated topics like mobile phones, electronics, other apps, or external businesses.
            - If a user asks something unrelated, respond with: "I'm sorry, I am specifically trained to assist with Heritage Harvest products and wellness. I can't help with that, but I'd love to tell you about our pure Jaggery and A2 Ghee!"
            - If a user asks about a product we don't have, politely guide them to our actual offerings.
            - Always maintain a premium, helpful tone.
            - If you don't know something about our products, suggest they contact our support team at support@heritageharvest.com.
        `;


        let reply = "";

        // Attempt Preferred Provider
        try {
            if (PREFERRED_PROVIDER === 'openai' && openai) {
                console.log("[AI-DEBUG] Attempting OpenAI...");
                const messages = [
                    { role: "system", content: systemInstruction },
                    ...(history || []).map(h => ({
                        role: h.role === 'model' || h.role === 'ai' ? 'assistant' : 'user',
                        content: h.parts?.[0]?.text || h.text || ""
                    })),
                    { role: "user", content: message }
                ];
                const response = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: messages,
                    max_tokens: 500,
                });
                reply = response.choices[0].message.content;
            } else if (genAI) {
                console.log("[AI-DEBUG] Attempting Gemini (flash-latest)...");
                const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                
                // Ensure history is valid for Gemini (alternating, starts with user)
                let validHistory = (history || []).filter(h => h.role === 'user' || h.role === 'model');
                if (validHistory.length > 0 && validHistory[0].role !== 'user') {
                    validHistory.shift(); // Remove first message if it's model
                }

                const chat = model.startChat({
                    history: validHistory,
                    generationConfig: { maxOutputTokens: 500 },
                });

                const fullPrompt = history && history.length > 0 ? message : `${systemInstruction}\n\nUser: ${message}`;
                const result = await chat.sendMessage(fullPrompt);

                const response = await result.response;
                reply = response.text();
            } else {
                throw new Error("No AI client successfully initialized");
            }
        } catch (apiError) {
            console.error(`[AI-DEBUG] ${PREFERRED_PROVIDER} API Error:`, apiError.message);
            
            // Auto-fallback if the first one fails and we have the other key
            if (PREFERRED_PROVIDER === 'openai' && genAI) {
                console.log("[AI-DEBUG] Falling back to Gemini (flash-latest)...");
                const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                
                let validHistory = (history || []).filter(h => h.role === 'user' || h.role === 'model');
                if (validHistory.length > 0 && validHistory[0].role !== 'user') {
                    validHistory.shift();
                }

                const chat = model.startChat({
                    history: validHistory,
                    generationConfig: { maxOutputTokens: 500 },
                });

                const fullPrompt = history && history.length > 0 ? message : `${systemInstruction}\n\nUser: ${message}`;
                const result = await chat.sendMessage(fullPrompt);

                const response = await result.response;
                reply = response.text();
            } else {
                throw apiError; // Re-throw if no fallback available
            }
        }

        res.status(200).json({
            success: true,
            reply: reply
        });

    } catch (error) {
        console.error('[AI-DEBUG] FINAL CATCH:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Internal server error in AI Assistant',
            reply: "I'm having a bit of a moment with my API quota. Please try again in a few seconds!"
        });
    }
};
