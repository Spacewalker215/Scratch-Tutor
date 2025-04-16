// Requirements for the program
require('regenerator-runtime/runtime'); // Code doesn't work without this
const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
const TargetType = require('../../extension-support/target-type');

/**
 * Improved System Prompt for the AI Tutor
 */
const thePrompt = `
You are Scratch Helper AI, a super friendly, enthusiastic, and patient programming assistant specifically designed for kids aged 9-13 learning Scratch. Your main goal is to help them learn by guiding them to find solutions themselves, NOT by giving them direct answers or finished code. Imagine you're a helpful older sibling or a cool camp counselor who loves Scratch!

**Core Mission:** Guide, Encourage, and Inspire Exploration!

**Key Guidelines:**

1.  **Be Super Positive & Patient:** Always use encouraging language ("Great question!", "Awesome idea!", "You're thinking like a programmer!"). Be patient even if the user asks similar things repeatedly.
2.  **NEVER Give Direct Answers/Code:** This is the most important rule. Instead of saying "use the 'move 10 steps' block", ask guiding questions like, "Hmm, how do you think we could make the sprite move?", "Have you looked in the blue 'Motion' blocks? Maybe one of those could help?", or "What have you tried so far?".
3.  **Simple Language:** Use words that a 9-13 year old can easily understand. Avoid jargon. Explain Scratch terms simply (e.g., "A 'sprite' is like a character or object in your game!").
4.  **Break It Down:** If they ask about a complex task (e.g., "How do I make a score?"), break it into tiny, manageable steps. "Making a score is a cool goal! First, we need a way to *remember* the score. Have you seen any blocks that look like they can hold information, maybe in the 'Variables' section?"
5.  **Focus on Concepts:** Explain the 'why' behind blocks or ideas. "The 'forever' block is neat because it makes the blocks inside it run over and over again without stopping!"
6.  **Use Provided Context:** The user might provide the blocks they are currently using. Refer to these specifically if relevant to their question.
7.  **Praise Effort & Creativity:** Celebrate their attempts and ideas! "Wow, using a 'repeat' block there is a clever approach!"
8.  **Remember the Conversation:** Try to recall previous parts of the chat to provide contextually relevant help.
9.  **Stay On Topic (Scratch):** Gently steer conversations back to Scratch if they go too off-topic.
10. **Suggest Next Steps & FAQs:** If the user seems stuck or finishes a thought, suggest common next questions or problems in a friendly way. Format these suggestions clearly, maybe like this:
    *   "Need more ideas? You could ask:"
    *   "[Suggestion] How do I make my sprite talk?"
    *   "[Suggestion] Why isn't my loop stopping?"
    *   "[Suggestion] What does the 'if...then' block do?"

**Example Interactions:**

*   **User:** "How do I make my cat jump?"
    *   **Good AI:** "Making characters jump is fun! How do things move up and down on the Scratch stage? Which axis controls vertical movement? Maybe look for blocks that change that!"
    *   **Bad AI:** "Use the 'change y by 10' block."
*   **User:** "My code doesn't work."
    *   **Good AI:** "Okay, let's figure this out together! Can you describe what you *want* the code to do, and what it's *actually* doing right now? Which part seems to be the trickiest?"
    *   **Bad AI:** "Your 'if' statement is wrong. Change it to..."
*   **User:** "Just give me the script for Tic Tac Toe."
    *   **Good AI:** "Building Tic Tac Toe is a great project! It shows you're ready for a challenge! I can definitely help you think through the steps. What's the very first thing someone does when they play Tic Tac Toe?"

**Scratchblocks:**
When explaining blocks, you can use the scratchblocks format like this:

\`\`\`scratch
when green flag clicked // This block starts the script!
move (10) steps // This makes the sprite move forward a bit.
if <touching [edge v]?> then // Check if the sprite hit the edge...
  turn right (180) degrees // ...if yes, turn around!
end
\`\`\`

Remember: You are a guide, not an answer key. Be the fun, helpful tutor that makes learning Scratch exciting!
`;

let chatPopupInstance = null; // Variable to hold the single popup instance

class Scratch3YourExtension {
    constructor(runtime) {
        this.runtime = runtime;
    }

    /**
     * Extracts relevant block opcode information from the specified sprite.
     * @param {number} spriteIdx - The 1-based index of the sprite.
     * @returns {string} - A string listing the opcodes used in the sprite.
     */
    getBlocksInUse(spriteIdx) {
        // Adjust index to be 0-based for accessing the targets array
        const targetIndex = spriteIdx > 0 ? spriteIdx : 1; // Default to sprite 1 if invalid index provided
        const target = this.runtime.targets[targetIndex];

        if (!target || !target.blocks || !target.blocks._blocks) {
            console.warn(`Sprite index ${spriteIdx} not found or has no blocks.`);
            return "No blocks found for this sprite.";
        }

        const blocksObject = target.blocks._blocks;
        let resultString = 'Blocks currently in use:\n';
        const opcodesSeen = new Set(); // Keep track of opcodes added

        // Extract opcode information
        for (const blockId in blocksObject) {
            const block = blocksObject[blockId];
            // Optionally filter out common/less relevant blocks like reporters inside inputs
            if (block && block.opcode && !block.shadow) { // block.shadow checks if it's a default value block
                 // Avoid adding simple reporters multiple times if they are used in many places
                 // Also track opcodes added to prevent duplicates from different blocks with same opcode
                 if (!['argument_reporter_string_number', 'argument_reporter_boolean', 'math_number', 'text', 'colour_picker'].includes(block.opcode) && !opcodesSeen.has(block.opcode)) {
                    resultString += `- ${block.opcode}\n`;
                    opcodesSeen.add(block.opcode);
                 } else if (!opcodesSeen.has(block.opcode)) { // Add simple reporters only once
                     resultString += `- ${block.opcode}\n`;
                     opcodesSeen.add(block.opcode);
                 }
            }
        }
        console.log(`Blocks context for sprite ${spriteIdx}: ${resultString}`);
        return resultString.length > 'Blocks currently in use:\n'.length ? resultString : "No relevant blocks found in this sprite.";
    }


    /**
     * Opens a chat popup window or focuses the existing one.
     * @param {object} args - The arguments object.
     * @param {number} args.SpriteIdx - The 1-based index of the sprite context.
     */
    openChatPopup({ SpriteIdx }) {
        const spriteIdx = SpriteIdx || 1; // Default to sprite 1

        // --- Singleton Logic ---
        if (chatPopupInstance && !chatPopupInstance.closed) {
            chatPopupInstance.focus();
            console.log("Chat popup already open. Focusing existing window.");
            return;
        }
        // --- End Singleton Logic ---

        console.log("Opening new chat popup.");
        chatPopupInstance = window.open("", "ChatPopup", "width=800,height=800,scrollbars=yes,resizable=yes");

        if (!chatPopupInstance) {
            alert("Popup blocked! Please allow popups for this site to use the chat feature.");
            return;
        }

        chatPopupInstance.extensionInstance = this;
        chatPopupInstance.spriteContextIndex = spriteIdx;

        // This function will now be called by the popup, passing the key and mode
        chatPopupInstance.sendMessageToAI = async (userMessage, apiKey, apiMode) => {
            const instance = chatPopupInstance.extensionInstance;
            const currentSpriteIdx = chatPopupInstance.spriteContextIndex;

             // Define or access icons within this function's scope
             const ICONS = {
                user: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Crect width='30' height='30' rx='15' fill='%234caf50'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-size='16' font-family='sans-serif' dy='.1em'%3EU%3C/text%3E%3C/svg%3E",
                assistant: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Crect width='30' height='30' rx='15' fill='%23d3d3d3'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23333333' font-size='16' font-family='sans-serif' dy='.1em'%3EA%3C/text%3E%3C/svg%3E",
                error: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Crect width='30' height='30' rx='15' fill='%23ff0000'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-size='16' font-family='sans-serif' dy='.1em'%3EE%3C/text%3E%3C/svg%3E",
                thinking: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Crect width='30' height='30' rx='15' fill='%23d3d3d3'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23333333' font-size='16' font-family='sans-serif' dy='.1em'%3EA%3C/text%3E%3C/svg%3E" // Same as assistant
             };

            if (!instance || userMessage === "" || !apiKey || !apiMode) {
                console.warn("sendMessageToAI called with missing arguments.");
                 let chatMessages = chatPopupInstance.document.querySelector("#chat-messages");
                 if(chatMessages && !apiKey) {
                     // Use the ICONS object here too
                     chatMessages.innerHTML += `
                        <div class="chat-bubble assistant error">
                            <img src="${ICONS.error}" alt="Error">
                            <div class="bubble-content"><span>Cannot send message: API Key is missing. Please reload the popup.</span></div>
                        </div>`;
                     chatMessages.scrollTop = chatMessages.scrollHeight;
                 }
                return;
            }

            let blocksContext = instance.getBlocksInUse(currentSpriteIdx);
            let combinedInput = `Current Blocks Context:\n${blocksContext}\n\nUser Question:\n${userMessage}`;

            let chatMessages = chatPopupInstance.document.querySelector("#chat-messages");
            if (!chatMessages) return;

            // ** Add User Message **
            chatMessages.innerHTML += `
                <div class="chat-bubble user">
                    <img src="${ICONS.user}" alt="User">
                    <div class="bubble-content"><span>${userMessage.replace(/</g, "<").replace(/>/g, ">")}</span></div>
                </div>`; // Basic escaping for user input
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // ** Add Thinking Indicator **
            const thinkingId = `thinking-${Date.now()}`;
            chatMessages.innerHTML += `
                <div class="chat-bubble assistant thinking" id="${thinkingId}">
                    <img src="${ICONS.thinking}" alt="Thinking">
                    <div class="bubble-content"><span>Thinking...</span></div>
                </div>`;
             chatMessages.scrollTop = chatMessages.scrollHeight;

            try {
                // Call the AI function with the key and mode from the popup
                let response = await instance.generateAIResponse(combinedInput, apiKey, apiMode);

                // ** Remove Thinking Indicator **
                 const thinkingBubble = chatPopupInstance.document.getElementById(thinkingId);
                 if (thinkingBubble) thinkingBubble.remove();

                // Process response into paragraphs
                // Basic escaping for AI response before adding tags - prevents simple HTML injection
                const escapedResponse = response.replace(/</g, "<").replace(/>/g, ">");
                let responseLines = escapedResponse.split('\n').map(line => `<p>${line || ' '}</p>`).join('');

                // ** Add Assistant Response **
                 chatMessages.innerHTML += `
                    <div class="chat-bubble assistant">
                        <img src="${ICONS.assistant}" alt="Assistant">
                        <div class="bubble-content">${responseLines}</div>
                    </div>`;
                 chatMessages.scrollTop = chatMessages.scrollHeight;

            } catch (error) {
                 // ** Remove Thinking Indicator **
                 const thinkingBubble = chatPopupInstance.document.getElementById(thinkingId);
                 if (thinkingBubble) thinkingBubble.remove();

                console.error("Error during AI interaction:", error);
                 // ** Add Error Message **
                chatMessages.innerHTML += `
                    <div class="chat-bubble assistant error">
                        <img src="${ICONS.error}" alt="Error">
                        <div class="bubble-content"><span>Sorry, something went wrong: ${error.message}</span></div>
                    </div>`;
                 chatMessages.scrollTop = chatMessages.scrollHeight;
            } finally {
                 let input = chatPopupInstance.document.querySelector("#chat-input");
                 if (input) input.value = '';
            }
        };

        // Inject HTML and JavaScript into the popup window
        chatPopupInstance.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Scratch AI Tutor</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        /* --- Basic styles --- */
                        html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; } /* Prevent double scrollbars */
                        body { font-family: 'Comic Sans MS', cursive, sans-serif; background-color: #f0f8ff; display: flex; flex-direction: column; }
                        nav { display: flex; justify-content: space-around; background-color: #fff0f5; padding: 10px; width: 100%; box-sizing: border-box; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 0 0 10px 10px; flex-shrink: 0; }
                        nav button { background-color: transparent; border: 1px solid #ffb6c1; border-radius: 15px; cursor: pointer; font-size: 14px; padding: 8px 15px; transition: background-color 0.3s ease; margin: 0 5px; }
                        nav button:hover { background-color: #ffe0b2; }
                        nav button.active { background-color: #ffddc1; font-weight: bold; }

                        .content-area { flex-grow: 1; width: 100%; display: flex; flex-direction: column; overflow: hidden; padding: 10px; box-sizing: border-box; } /* Use full width inside body */

                        /* --- Containers --- */
                        #chat-container, #scratchblocks-container {
                            background-color: #ffffff; border: 2px solid #ccc; border-radius: 10px;
                            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                            display: none; /* Initially hidden */
                            flex-grow: 1; /* Take remaining space */
                            overflow: hidden; /* Prevent content spilling */
                            flex-direction: column;
                            width: 100%; /* Fill content-area */
                            box-sizing: border-box;
                        }
                        #chat-container { display: flex; /* Show chat by default later */ }
                        #scratchblocks-container iframe { width: 100%; height: 100%; border: none; }

                        /* --- Chat Area --- */
                        #chat-messages {
                            flex-grow: 1; /* Allow messages to take space */
                            overflow-y: auto; /* Scroll for messages */
                            padding: 10px;
                            box-sizing: border-box;
                        }
                        .chat-bubble {
                            display: flex; align-items: flex-start;
                            padding: 10px 12px; margin: 8px 0; border-radius: 15px;
                            max-width: 85%; word-wrap: break-word; /* Already here */
                            box-shadow: 0 1px 3px rgba(0,0,0,0.1); line-height: 1.4;
                        }
                        .chat-bubble img { width: 30px; height: 30px; margin-right: 10px; border-radius: 50%; flex-shrink: 0; }

                        /* *** NEW: Wrapper for bubble text content *** */
                        .bubble-content {
                             flex-grow: 1; /* Allow content to fill space */
                             max-width: 100%; /* Prevent overflow */
                             overflow-wrap: break-word; /* Ensure wrapping works */
                             word-wrap: break-word; /* Legacy */
                             word-break: break-word; /* Aggressive wrapping if needed */
                        }
                        /* *** NEW: Style for paragraphs inside the bubble content *** */
                        .bubble-content p {
                            margin: 0 0 5px 0; /* Spacing between paragraphs */
                            max-width: 100%; /* Ensure paragraph doesn't try to exceed container */
                            overflow-wrap: break-word;
                            word-wrap: break-word;
                            word-break: break-word;
                        }
                        .bubble-content p:last-child { margin-bottom: 0; }

                        /* --- Bubble Types --- */
                        .user { background-color: #a0e7e5; color: #333; align-self: flex-start; border-bottom-left-radius: 5px; }
                        .assistant { background-color: #f8cdda; color: #333; align-self: flex-end; margin-left: auto; border-bottom-right-radius: 5px; }
                        .error { background-color: #ffdddd; color: #d8000c; border: 1px solid #ffacac; }
                        .info { background-color: #eef; color: #339; border: 1px solid #aac; }
                        .thinking { font-style: italic; color: #555; background-color: #f0f0f0; }

                        /* --- Input Area --- */
                        #input-container { display: flex; padding: 10px; border-top: 1px solid #eee; flex-shrink: 0; }
                        #chat-input { flex-grow: 1; padding: 10px; border: 1px solid #ccc; border-radius: 20px; margin-right: 10px; }
                        #send-button { padding: 10px 20px; background-color: #ff8fab; color: #fff; border: none; border-radius: 20px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-weight: bold; }
                        #send-button:hover { background-color: #ff74a4; }
                        #chat-input:disabled, #send-button:disabled { background-color: #eee; cursor: not-allowed; opacity: 0.7; }

                        /* --- Scrollbar styling (optional) --- */
                        #chat-messages::-webkit-scrollbar { width: 8px; }
                        #chat-messages::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                        #chat-messages::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
                        #chat-messages::-webkit-scrollbar-thumb:hover { background: #aaa; }
                    </style>
                </head>
                <body>
                    <nav>
                        <button id="nav-chat" onclick="showTab('chat')">AI Tutor Chat</button>
                        <button id="nav-scratchblocks" onclick="showTab('scratchblocks')">Scratch Block Translator</button>
                    </nav>
                    <div class="content-area">
                        <div id="chat-container">
                            <div id="chat-messages">
                                <!-- Welcome message added via JS -->
                            </div>
                            <div id="input-container">
                                <input type="text" id="chat-input" placeholder="Configuring..." disabled/>
                                <button id="send-button" disabled>Send</button>
                            </div>
                        </div>
                        <div id="scratchblocks-container">
                            <iframe src="https://scratchblocks.github.io"></iframe>
                        </div>
                    </div>

                    <script>
                        // --- Variables to hold API configuration ---
                        let selectedApiKey = null;
                        let selectedApiMode = 'openai'; // Default mode

                        // --- Icon Data URIs ---
                        const ICONS = {
                            user: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Crect width='30' height='30' rx='15' fill='%234caf50'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-size='16' font-family='sans-serif' dy='.1em'%3EU%3C/text%3E%3C/svg%3E",
                            assistant: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Crect width='30' height='30' rx='15' fill='%23d3d3d3'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23333333' font-size='16' font-family='sans-serif' dy='.1em'%3EA%3C/text%3E%3C/svg%3E",
                            error: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Crect width='30' height='30' rx='15' fill='%23ff0000'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-size='16' font-family='sans-serif' dy='.1em'%3EE%3C/text%3E%3C/svg%3E",
                            info: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Crect width='30' height='30' rx='15' fill='%238888ff'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-size='16' font-family='sans-serif' dy='.1em'%3EI%3C/text%3E%3C/svg%3E",
                            thinking: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Crect width='30' height='30' rx='15' fill='%23d3d3d3'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23333333' font-size='16' font-family='sans-serif' dy='.1em'%3EA%3C/text%3E%3C/svg%3E" // Same as assistant
                        };

                        // --- DOM Elements ---
                        const chatInput = document.getElementById("chat-input");
                        const sendButton = document.getElementById("send-button");
                        const chatContainer = document.getElementById("chat-container");
                        const scratchblocksContainer = document.getElementById("scratchblocks-container");
                        const navChat = document.getElementById("nav-chat");
                        const navScratchblocks = document.getElementById("nav-scratchblocks");
                        const chatMessages = document.getElementById('chat-messages');

                        // Function to switch tabs
                        function showTab(tabName) {
                            if (tabName === 'chat') {
                                chatContainer.style.display = "flex";
                                scratchblocksContainer.style.display = "none";
                                navChat.classList.add('active');
                                navScratchblocks.classList.remove('active');
                            } else if (tabName === 'scratchblocks') {
                                chatContainer.style.display = "none";
                                scratchblocksContainer.style.display = "block";
                                navChat.classList.remove('active');
                                navScratchblocks.classList.add('active');
                            }
                        }

                        // Handle sending message
                        function handleSend() {
                            const userMessage = chatInput.value.trim();
                            if (userMessage && selectedApiKey && selectedApiMode) {
                                window.sendMessageToAI(userMessage, selectedApiKey, selectedApiMode);
                            } else if (!selectedApiKey) {
                                 addMessage('assistant error', 'API Key is missing. Please reload the popup (Ctrl+R or Cmd+R) and provide a key.', 'error');
                            }
                        }

                        // Helper to add messages to chat
                        function addMessage(bubbleClass, text, iconType = 'info') {
                             const iconUrl = ICONS[iconType] || ICONS.assistant;
                             const altText = iconType.charAt(0).toUpperCase() + iconType.slice(1);
                             // Basic HTML escaping for the text before putting it in span
                             const escapedText = text.replace(/</g, "<").replace(/>/g, ">");

                             chatMessages.innerHTML += \`
                                <div class="chat-bubble \${bubbleClass}">
                                    <img src="\${iconUrl}" alt="\${altText}">
                                    <div class="bubble-content"><span>\${escapedText}</span></div>
                                </div>\`;
                             chatMessages.scrollTop = chatMessages.scrollHeight;
                        }

                        // --- Event Listeners ---
                        sendButton.addEventListener("click", handleSend);
                        chatInput.addEventListener("keyup", function (event) {
                            if (event.key === "Enter" && !sendButton.disabled) {
                                handleSend();
                            }
                        });

                         window.addEventListener('beforeunload', () => {
                              if (window.opener && window.opener.chatPopupInstance === window) {
                                   window.opener.chatPopupInstance = null;
                                   console.log("Chat popup closed, instance cleared.");
                              }
                         });

                        // --- Initial Setup on Load ---
                        window.onload = () => {
                            chatMessages.innerHTML = ''; // Clear placeholder
                            addMessage('assistant info', "Hi there! I'm your Scratch Helper AI. Let's set up the connection.", 'info');

                            // 1. Ask about the mode
                            let modeInput = prompt("Use alternative AI endpoint (Y/N)? [Default: N]", "N");
                            // Handle null case (user clicked Cancel) as 'N'
                            modeInput = (modeInput === null) ? "n" : modeInput.trim().toLowerCase();


                            if (modeInput === 'y') {
                                selectedApiMode = 'github';
                                addMessage('assistant info', "Alternative endpoint selected.", 'info');
                                // 2. Ask for the key for this mode
                                selectedApiKey = prompt("Please enter your API Key:");

                                if (!selectedApiKey || selectedApiKey.trim() === "") {
                                    addMessage('assistant error', "No key provided for alternative endpoint. Switching to default OpenAI mode.", 'error');
                                    selectedApiMode = 'openai';
                                    selectedApiKey = null;
                                }
                            } else {
                                selectedApiMode = 'openai';
                                addMessage('assistant info', "Default OpenAI endpoint selected.", 'info');
                                selectedApiKey = null;
                            }

                            // 3. If we need the OpenAI key
                            if (selectedApiMode === 'openai' && !selectedApiKey) {
                                selectedApiKey = prompt("Please enter your OpenAI API Key:");
                            }

                            // 4. Final Validation and UI update
                            if (selectedApiKey && selectedApiKey.trim() !== "") {
                                 addMessage('assistant info', \`Setup complete using \${selectedApiMode === 'github' ? 'Alternative' : 'OpenAI'} AI endpoint. Ask me anything about Scratch!\`, 'info');
                                chatInput.disabled = false;
                                sendButton.disabled = false;
                                chatInput.placeholder = "Ask a question about Scratch...";
                                chatInput.focus();
                            } else {
                                addMessage('assistant error', 'API Key not provided or invalid. AI features are disabled. Please reload the popup (Ctrl+R or Cmd+R) to try again.', 'error');
                                chatInput.placeholder = "AI Disabled - Reload popup to enter API Key";
                                chatInput.disabled = true; // Ensure disabled
                                sendButton.disabled = true; // Ensure disabled
                            }

                            showTab('chat'); // Ensure chat is visible
                        };
                    </script>
                </body>
            </html>
        `);
        chatPopupInstance.document.close(); // Important after writing content
    }

    /**
     * Generates the AI response using the specified API mode and key.
     * @param {string} prompt - The combined context and user prompt.
     * @param {string} apiKey - The API key provided by the user.
     * @param {'github' | 'openai'} apiMode - The selected API mode.
     * @returns {Promise<string>} - The AI's response text.
     */
    async generateAIResponse(prompt, apiKey, apiMode) {
        let apiUrl;
        let headers;
        let bodyPayload; // Use a different name than 'body'
        let modelName;

        if (!apiKey) {
            console.error("generateAIResponse called without an API key.");
            throw new Error("API Key is missing.");
        }

        // --- Conversation History Handling ---
        let conversationHistory = [];
        if (chatPopupInstance && !chatPopupInstance.closed) {
            if (!chatPopupInstance.conversationHistory) {
                chatPopupInstance.conversationHistory = []; // Initialize if doesn't exist
            }
            // Extract only the user question part for history
            const userQuestionPrefix = "User Question:\n";
            const userQuestionIndex = prompt.lastIndexOf(userQuestionPrefix);
            const userQuestion = userQuestionIndex !== -1 ? prompt.substring(userQuestionIndex + userQuestionPrefix.length) : prompt;

            // Add latest user message before sending
            chatPopupInstance.conversationHistory.push({ role: 'user', content: userQuestion });

            // Limit history size
            const maxHistoryLength = 10; // Keep last 10 messages (5 user, 5 assistant)
            if (chatPopupInstance.conversationHistory.length > maxHistoryLength) {
               chatPopupInstance.conversationHistory = chatPopupInstance.conversationHistory.slice(-maxHistoryLength);
            }
            conversationHistory = chatPopupInstance.conversationHistory; // Use potentially pruned history
        } else {
            console.warn("Chat popup not available for history tracking.");
        }
        // --- End History Handling ---


        // --- Construct Messages Array ---
        const messages = [
           { role: 'system', content: thePrompt },
           // Add historical messages *before* the current prompt
           // Exclude the last user message because it's part of the current full prompt
           ...conversationHistory.slice(0, -1),
            // Add the latest full prompt (context + user question) as the final user message
           { role: 'user', content: prompt }
       ];
       // --- End Construct Messages ---


        if (apiMode === 'github') {
            // --- GitHub/Azure AI Configuration ---
            console.log("Calling GitHub/Azure AI endpoint (alternative)...");
            apiUrl = 'https://models.inference.ai.azure.com/chat/completions';
            modelName = 'gpt-4.1'; // As requested for this path
            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`, // Use the provided key
            };
            bodyPayload = {
                model: modelName,
                messages: messages,
                temperature: 0.7,
                top_p: 1.0,
                max_tokens: 400,
            };

        } else { // Default to 'openai'
            // --- OpenAI Configuration ---
            console.log("Calling OpenAI endpoint (default)...");
            apiUrl = 'https://api.openai.com/v1/chat/completions';
            modelName = 'gpt-4o-mini'; // Default modern model for OpenAI
             headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`, // Use the provided key
            };
            bodyPayload = {
                model: modelName,
                messages: messages,
                max_tokens: 400,
                temperature: 0.7,
            };
        }

        try {
            // Use the browser's native fetch
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(bodyPayload), // Stringify the payload here
            });

            if (!response.ok) {
                let errorBody = `API Error (${response.status})`;
                let errorMessage = `AI API request failed. Status: ${response.status}`; // Default error message
                try {
                    // Try to parse specific error message from API
                    const errorJson = await response.json();
                    if (errorJson.error && errorJson.error.message) {
                        errorMessage = errorJson.error.message; // Use API's error message
                    }
                     errorBody += `: ${JSON.stringify(errorJson)}`;
                } catch (e) {
                    try { // Fallback to text if JSON parsing fails
                       const errorText = await response.text();
                       errorMessage = errorText.substring(0, 100); // Show first part of text error
                       errorBody += `: ${errorText}`;
                    } catch (e2) { /* Ignore further errors reading body */ }
                }
               console.error(errorBody);
               throw new Error(errorMessage); // Throw specific or generic error for user
           }


            const responseData = await response.json();

            if (responseData.choices && responseData.choices.length > 0 && responseData.choices[0].message) {
                const generatedMessage = responseData.choices[0].message.content.trim();
                // Add AI response to history
                 if (chatPopupInstance && !chatPopupInstance.closed) {
                     chatPopupInstance.conversationHistory.push({ role: 'assistant', content: generatedMessage });
                 }
                return generatedMessage;
            } else {
                console.error('Error: Invalid response structure from AI API.', responseData);
                throw new Error('Received an invalid or empty response from the AI.');
            }
        } catch (error) {
            console.error('Error calling the AI API:', error);
            // Re-throw the error so the calling function (sendMessageToAI) can display it
            throw error; // Pass the original or parsed error message up
        }
    }


    // --- Block Definition ---
    getInfo() {
        return {
            id: 'scratchAIHelper', // Unique ID for the extension
            name: 'Scratch AI Tutor', // Name shown in Scratch UI
            color1: '#0fbd8c', // Primary color for blocks
            color2: '#660066', // Secondary color (border, etc.)
            // Block Icon (Base64 encoded image) - Using your original icon
            blockIconURI: 'data:image/png;base64,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',
            // Menu Icon (Base64 encoded image) - Using your original icon
            menuIconURI: 'data:image/png;base64,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',
            blocks: [
                {
                    opcode: 'openChatPopup', // Function name in the class
                    blockType: BlockType.COMMAND, // Type of block (command, reporter, etc.)
                    text: 'Open AI Tutor for sprite [SpriteIdx]', // Text displayed on the block
                    terminal: false, // Does this block end a script? (Usually false for popups)
                    filter: [TargetType.SPRITE, TargetType.STAGE], // Where can this block be used?
                    arguments: {
                        SpriteIdx: { // Argument definition
                            type: ArgumentType.NUMBER, // Type of input
                            defaultValue: 1, // Default value if user doesn't change it
                        }
                    }
                },
            ],
        };
    }
}

module.exports = Scratch3YourExtension; // Export the class for Scratch to load