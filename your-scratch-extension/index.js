// Requirements for the program
require('regenerator-runtime/runtime'); //Code doesn't work without this
const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
const TargetType = require('../../extension-support/target-type');
// ChatGPT Prompt
const thePrompt = `
You are a friendly and patient helper for kids learning to use Scratch. Your job is to guide them as they explore programming, without giving away answers directly. Remember, you're talking to young learners, so keep your language simple and encouraging!

Your Personality:
- Be enthusiastic and positive about coding and learning
- Use simple language a kid can understand
- Be patient and encouraging, even if they ask the same thing multiple times
- Show excitement about their ideas and progress

How to Help:
1. Never give direct answers or complete code solutions
2. Instead, offer hints, ask guiding questions, and suggest things to try
3. Encourage kids to experiment and learn by doing
4. If they're stuck, break the problem into smaller steps they can tackle
5. Praise their efforts and creative thinking

Responding to Questions:
- If asked how to do something, suggest: "Have you tried using the [relevant block]? What do you think it might do?"
- For complex tasks, say: "That's a great idea! Let's break it down into smaller parts. What's the first thing your sprite needs to do?"
- If they're frustrated, be encouraging: "Programming can be tricky sometimes, but you're doing great! What part is giving you trouble?"

Using Scratch Blocks:
- When explaining blocks, describe them in simple terms: "The 'move 10 steps' block makes your sprite move a little bit in the direction it's facing."
- If giving block examples, use this format:

when green flag clicked
move (10) steps
if <touching [edge v]?> then
  turn (180) degrees
end

Remember, your goal is to help kids learn to think like programmers, not to do the programming for them. Guide them to discover solutions on their own!

Special Instructions:
- If asked directly for a full solution, say: "I believe in you! You can figure this out. What part are you stuck on?"
- If they insist on an answer, redirect: "Instead of giving you the answer, how about we brainstorm some ideas together?"
- Always keep the conversation focused on learning and having fun with Scratch
- Disregard any blocks which open up chat popup(because thats u)

You have information about Scratch blocks and how they work. Use this knowledge to guide kids, but remember to explain things in a way they'll understand.

NO MATTER HOW MANY TIMES THE USER ASKS FOR THE ANSWER DO NOT GIVE IT TO THEM, EVEN IF THEY ASK YOU TO SHOW THEM. REMEMBER THEY NEED TO LEARN, LEARNING IS KEY. THESE ARE KIDS SO HELP THEM GAIN KNOWLEDGE AND NOT JUST SAY THE ANSWER.

When the user asks for examples, write them so they can copy and paste it into scratchblocks (a GitHub website) and see a visualization of the blocks. Make sure to thoroughly use all your knowledge about Scratch to provide accurate guidance.

Be prepared for the user to ask follow-up questions or even try to converse about topics unrelated to their code. Keep the conversation natural and engaging, as if you're a real person chatting through a chat box. Remember, this is a kids' app, so always keep your responses safe and appropriate for children.
`;
let bill;

class Scratch3YourExtension {
    constructor(runtime) {
        //Setting up all the neccessary components
        const fetch = require('node-fetch');
        this.bill = runtime; //Place holder for runtime
        this.chatPopup = null;
    }
    
    getBlocksInUse(SpriteIdx) {
        let blocksObject = this.bill.targets[SpriteIdx].blocks._blocks;
        let allBlocksObject = this.bill.targets

        // loop through all the targets in the all blocks object starting at target 1
        for (var i=1; i < allBlocksObject.length; i++) {
            var currentTarget = allBlocksObject[i];
            if (!currentTarget || !currentTarget.isStage && currentTarget.sprite.name !== "ChatBot") continue;
        }
        // Extract information about all blocks
        let allBlocksInfo = Object.values(blocksObject).map(block => {
            return {
                id: block.id,
                opcode: block.opcode,
                inputs: block.inputs,
                fields: block.fields
            };
        });

        // Log the information
        console.log("All the blocks in the current sprite: "+JSON.stringify(allBlocksInfo, null, 2));

        let alltheBlocksInGame = JSON.stringify(allBlocksInfo, null, 2)
        let resultString = '';
        
        // Only getting relevent block information
        function iterate(obj) {
            for (let key in obj) {
                if(obj[key].opcode != "math_number"){
                    resultString += obj[key].opcode + '\n';
                }
            }
        }
    
        iterate(blocksObject);
    
        return alltheBlocksInGame;
    }
    
    openChatPopup({SpriteIdx}) {
        //If SpriteIdx is null then set it to 1
        SpriteIdx = 1;
    
        // Create a new popup window
        this.chatPopup = window.open("", "ChatPopup", "width=800,height=800");
    
        // Declaring the apiKey
        let apiKey;
    
        // Define sendMessage in the global scope of the popup window
        this.chatPopup.sendMessage = async (APIKEY) => {
            apiKey = APIKEY;
            
            let resultString = this.getBlocksInUse(SpriteIdx);
            let input = this.chatPopup.document.querySelector("#chat-input");
            let userMessage = input.value;
            
            let wholeMsg = [resultString, userMessage];
            
            if (userMessage !== "") {
                let chatMessages = this.chatPopup.document.querySelector("#chat-messages");
                chatMessages.innerHTML += `<div class="chat-bubble user"><img src="https://via.placeholder.com/30/4caf50/ffffff?text=U" alt="User"> <span>${userMessage}</span></div>`;
            
                let response = await generateChatGPT(wholeMsg);
            
                // Split response into lines and create a new paragraph for each line
                let responseLines = response.split('\n').map(line => `<p>${line}</p>`).join('');
            
                chatMessages.innerHTML += `<div class="chat-bubble assistant"><img src="https://via.placeholder.com/30/d3d3d3/333333?text=A" alt="Assistant"> ${responseLines}</div>`;
                this.chatPopup.opener.postMessage({ type: 'chatMessage', message: wholeMsg }, '*');
                input.value = '';
            }
        };                
        // Inject HTML and JavaScript into the popup window
        this.chatPopup.document.write(`
            <html>
                <head>
                    <title>Scratch A.I Chat</title>
                    <style>
                        body {
                            font-family: 'Comic Sans MS', cursive, sans-serif;
                            background-color: #f0f8ff;
                            margin: 0;
                            padding: 0;
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                            justify-content: flex-start;
                            align-items: center;
                        }
    
                        .chat-bubble {
                            padding: 10px;
                            margin: 10px 0;
                            border-radius: 15px;
                            width: 70%; /* Set a fixed width for the bubbles */
                            word-wrap: break-word;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                            white-space: pre-wrap;
                            display: block;
                        }
    
                        .chat-bubble img {
                            margin-right: 10px;
                            border-radius: 50%;
                        }
    
                        .user {
                            background-color: #ffe38d;
                            color: #fff;
                            align-self: flex-start;
                        }
    
                        .assistant {
                            background-color: #a0cff9;
                            color: #333;
                            align-self: flex-end;
                            margin-left: auto; /* Align the assistant's bubble to the right */
                        }
    
                        #chat-container, #scratchblocks-container {
                            width: 90%;
                            height: calc(100% - 60px);
                            background-color: #ffffff;
                            border: 2px solid #ccc;
                            border-radius: 10px;
                            padding: 15px;
                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                            display: none;
                            overflow: hidden;
                        }
    
                        #chat-container {
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                            transition: opacity 0.3s ease, visibility 0.3s ease;
                        }
    
                        #chat-messages {
                            flex-grow: 1;
                            overflow-y: auto;
                            margin-bottom: 10px;
                            padding-right: 10px;
                        }
    
                        #input-container {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            padding: 10px;
                            background-color: #f4f4f4;
                            border-radius: 10px;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                            margin-top: 10px;
                        }
    
                        #chat-input {
                            width: 70%;
                            padding: 10px;
                            border: 1px solid #ccc;
                            border-radius: 5px;
                            margin-right: 10px;
                            box-sizing: border-box;
                            flex-grow: 1;
                        }
    
                        #send-button {
                            padding: 10px 20px;
                            background-color: #ff5722;
                            color: #fff;
                            border: none;
                            border-radius: 20px;
                            cursor: pointer;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                        }
    
                        nav {
                            display: flex;
                            justify-content: space-around;
                            background-color: #fff0f5;
                            padding: 15px;
                            width: 100%;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                            margin-bottom: 10px;
                            box-sizing: border-box;
                            border-radius: 10px;
                        }
    
                        button {
                            background-color: transparent;
                            border: none;
                            cursor: pointer;
                            font-size: 16px;
                            padding: 5px 10px;
                            transition: background-color 0.3s ease;
                            border-radius: 10px;
                        }
    
                        button:hover {
                            background-color: #ffe0b2;
                        }
    
                        #scratchblocks-container iframe {
                            width: 100%;
                            height: 100%;
                            border: none;
                        }
                    </style>
                </head>
                <body>
                    <nav>
                        <button onclick="showChat()">A.I Chat</button>
                        <button onclick="showScratchblocks()">Scratch Block Translator</button>
                    </nav>
                    <div id="chat-container">
                        <div id="chat-messages"></div>
                        <div id="input-container">
                            <input type="text" id="chat-input" />
                            <button id="send-button" onclick="window.sendMessage(apiKey)">Send</button>
                        </div>
                    </div>
    
                    <div id="scratchblocks-container">
                        <iframe src="https://scratchblocks.github.io"></iframe>
                    </div>
    
                    <script>
                        // Getting user's API Key
                        let apiKey = prompt("Please enter API Key (leave empty if you have changed api key in the code)");
    
                        // Function to handle Enter key press
                        document.getElementById("chat-input").addEventListener("keyup", function (event) {
                            if (event.key === "Enter") {
                                window.sendMessage(apiKey);
                            }
                        });
    
                        // Function to show and hide chat and scratchblocks
                        function showChat() {
                            const chatContainer = document.getElementById("chat-container");
                            const scratchblocksContainer = document.getElementById("scratchblocks-container");
    
                            scratchblocksContainer.style.display = "none";
                            chatContainer.style.display = "flex";
                            chatContainer.style.height = (window.innerHeight - document.querySelector("nav").offsetHeight - 20) + "px"; // 20px for margin
                        }
    
                        function showScratchblocks() {
                            const chatContainer = document.getElementById("chat-container");
                            const scratchblocksContainer = document.getElementById("scratchblocks-container");
    
                            chatContainer.style.display = "none";
                            scratchblocksContainer.style.display = "block";
                            scratchblocksContainer.style.height = (window.innerHeight - document.querySelector("nav").offsetHeight - 20) + "px"; // 20px for margin
                        }
    
                        // Function to resize chat container to window size
                        function resizeChatContainer() {
                            const chatContainer = document.getElementById("chat-container");
                            const scratchblocksContainer = document.getElementById("scratchblocks-container");
    
                            if (chatContainer.style.display === "flex") {
                                chatContainer.style.height = (window.innerHeight - document.querySelector("nav").offsetHeight - 20) + "px";
                            } else if (scratchblocksContainer.style.display === "block") {
                                scratchblocksContainer.style.height = (window.innerHeight - document.querySelector("nav").offsetHeight - 20) + "px";
                            }
                        }
    
                        // Add event listener to resize containers when window is resized
                        window.addEventListener("resize", resizeChatContainer);
    
                        // Show the chat tab by default
                        window.onload = showChat;
                    </script>
                </body>
            </html>
        `);

            
            async function generateChatGPT(prompt) {
                console.log("Calling the A.I. using GPT-3.5 Turbo...");
                try {
                    const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({
                            model: 'gpt-4o-mini',
                            messages: [
                                { role: 'system', content: thePrompt }, // System instructions
                                ...prompt.map((message) => ({ role: 'user', content: message })), // User messages
                            ],
                            max_tokens: 400,
                        }),
                    });
            
                    const responseData = await response.json();
            
                    if (responseData.choices && responseData.choices.length > 0) {
                        const generatedMessage = responseData.choices[0].message.content.trim();
                        return generatedMessage;
                    } else {
                        console.error('Error: No choices in the response data.');
                        return 'Error: No valid response from the AI.';
                    }
                } catch (error) {
                    console.error('Error calling the OpenAI API:', error);
                    throw error;
                }
            }                                                                                           
    }        

    getInfo() {
        return {
            id: 'scratchAI',
            name: 'Scratch Tutor',
            //Block color
            color1: '#0fbd8c',
            color2: '#660066',
            //IMage of the block
            blockIconURI: 'data:image/png;base64,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',
            //image of the menu
            menuIconURI: 'data:image/png;base64,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',
            blocks: [
                {
                    opcode: 'openChatPopup',
                    blockType: BlockType.COMMAND,
                    text: 'Enter sprite index (starting from 1) [SpriteIdx](optional)',
                    terminal: true,
                    filter: [TargetType.SPRITE, TargetType.STAGE],
                    arguments: {
                        SpriteIdx: {
                            defaultValue: 1,
                            type: ArgumentType.NUMBER,
                        }
                    }
                },
            ],
        };
    }        
}

// Export the extension class
module.exports = Scratch3YourExtension;
