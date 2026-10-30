/*
==========================================================
Sarprasin 2.0
AI Assistant Service
File : src/services/ai/assistant.service.js
Version : 2.0.0
==========================================================

AI Provider Layer

Supported (Roadmap)

- OpenAI
- Google Gemini
- Claude
- Ollama
- DeepSeek
- OpenRouter
- Local LLM

==========================================================
*/

import {

    AI_PROVIDER

} from "../../config/env.js";

/* ======================================================
   Assistant Service
====================================================== */

class AssistantService {

    constructor() {

        this.provider = AI_PROVIDER || "disabled";

    }

    /* ==================================================
       GET PROVIDER
    ================================================== */

    getProvider() {

        return this.provider;

    }

    /* ==================================================
       SET PROVIDER
    ================================================== */

    setProvider(provider) {

        this.provider = provider;

    }

    /* ==================================================
       CHAT
    ================================================== */

    async chat(messages = [], options = {}) {

        switch (this.provider) {

            case "openai":

                return this.chatOpenAI(

                    messages,

                    options

                );

            case "gemini":

                return this.chatGemini(

                    messages,

                    options

                );

            case "claude":

                return this.chatClaude(

                    messages,

                    options

                );

            case "ollama":

                return this.chatOllama(

                    messages,

                    options

                );

            case "deepseek":

                return this.chatDeepSeek(

                    messages,

                    options

                );

            default:

                return {

                    success: false,

                    provider: "disabled",

                    message:

                        "AI Provider belum dikonfigurasi."

                };

        }

    }

    /* ==================================================
       EMBEDDING
    ================================================== */

    async embedding(text) {

        return {

            success: false,

            message:

                "Embedding belum diimplementasikan."

        };

    }

    /* ==================================================
       OCR
    ================================================== */

    async ocr(file) {

        return {

            success: false,

            message:

                "OCR belum tersedia."

        };

    }

    /* ==================================================
       IMAGE ANALYSIS
    ================================================== */

    async analyzeImage(file) {

        return {

            success: false,

            message:

                "Vision belum tersedia."

        };

    }

    /* ==================================================
       SUMMARIZE
    ================================================== */

    async summarize(text) {

        return this.chat([

            {

                role: "system",

                content:

                    "Ringkas teks berikut."

            },

            {

                role: "user",

                content: text

            }

        ]);

    }

    /* ==================================================
       OPENAI
    ================================================== */

    async chatOpenAI() {

        console.log(

            "OpenAI Provider"

        );

        return {

            success: true,

            provider: "openai"

        };

    }

    /* ==================================================
       GEMINI
    ================================================== */

    async chatGemini() {

        console.log(

            "Gemini Provider"

        );

        return {

            success: true,

            provider: "gemini"

        };

    }

    /* ==================================================
       CLAUDE
    ================================================== */

    async chatClaude() {

        console.log(

            "Claude Provider"

        );

        return {

            success: true,

            provider: "claude"

        };

    }

    /* ==================================================
       OLLAMA
    ================================================== */

    async chatOllama() {

        console.log(

            "Ollama Provider"

        );

        return {

            success: true,

            provider: "ollama"

        };

    }

    /* ==================================================
       DEEPSEEK
    ================================================== */

    async chatDeepSeek() {

        console.log(

            "DeepSeek Provider"

        );

        return {

            success: true,

            provider: "deepseek"

        };

    }

}

/* ======================================================
   Singleton
====================================================== */

const assistantService =

    new AssistantService();

/* ======================================================
   Export
====================================================== */

export default assistantService;

export {

    AssistantService

};
