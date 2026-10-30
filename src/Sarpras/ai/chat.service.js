/*
==========================================================
Sarprasin 2.0
AI Chat Service
File : src/services/ai/chat.service.js
Version : 2.0.0
==========================================================
*/

import assistantService from "./assistant.service.js";

class ChatService {

    constructor() {

        this.messages = [];

        this.maxHistory = 20;

    }

    /* ==================================================
       SYSTEM PROMPT
    ================================================== */

    setSystemPrompt(prompt) {

        this.messages = [

            {

                role: "system",

                content: prompt

            }

        ];

    }

    /* ==================================================
       USER MESSAGE
    ================================================== */

    addUserMessage(content) {

        this.messages.push({

            role: "user",

            content

        });

        this.trimHistory();

    }

    /* ==================================================
       ASSISTANT MESSAGE
    ================================================== */

    addAssistantMessage(content) {

        this.messages.push({

            role: "assistant",

            content

        });

        this.trimHistory();

    }

    /* ==================================================
       SEND
    ================================================== */

    async send(message, options = {}) {

        this.addUserMessage(message);

        const response = await assistantService.chat(

            this.messages,

            options

        );

        if (response.success) {

            this.addAssistantMessage(

                response.message ||

                response.content ||

                ""

            );

        }

        return response;

    }

    /* ==================================================
       HISTORY
    ================================================== */

    getHistory() {

        return [...this.messages];

    }

    /* ==================================================
       CLEAR
    ================================================== */

    clear() {

        this.messages = [];

    }

    /* ==================================================
       REMOVE LAST
    ================================================== */

    removeLast() {

        this.messages.pop();

    }

    /* ==================================================
       LIMIT
    ================================================== */

    trimHistory() {

        if (

            this.messages.length <=

            this.maxHistory

        ) {

            return;

        }

        const system = this.messages.find(

            item =>

                item.role === "system"

        );

        const history = this.messages.filter(

            item =>

                item.role !== "system"

        );

        this.messages = [

            ...(system ? [system] : []),

            ...history.slice(

                -this.maxHistory

            )

        ];

    }

    /* ==================================================
       EXPORT
    ================================================== */

    exportConversation() {

        return JSON.stringify(

            this.messages,

            null,

            2

        );

    }

    /* ==================================================
       IMPORT
    ================================================== */

    importConversation(json) {

        try {

            this.messages = JSON.parse(json);

            return true;

        }

        catch {

            return false;

        }

    }

}

const chatService = new ChatService();

export default chatService;

export {

    ChatService

};
