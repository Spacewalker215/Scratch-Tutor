const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
const TargetType = require('../../extension-support/target-type');
const axios = require('axios');
const apiKey = process.env.API_KEY;
const apiUrl = 'https://api.openai.com/v1/engines/davinci-codex/completions';

let bill;

class Scratch3YourExtension {
    constructor(runtime) {
        console.log("Runtime in constructor:", runtime);
        // Call the initialization function
        this.bill = runtime;
        this.chatPopup = null;
        this.initializeMessageListener();
    }
    
    getBlocksInUse(SpriteIdx) {
        let blocksObject = this.bill.targets[SpriteIdx].blocks._blocks;

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
        // Create a new popup window
        this.chatPopup = window.open("", "ChatPopup", "width=400,height=400");
    
        // Define sendMessage in the global scope of the popup window
        this.chatPopup.sendMessage = () => {
            // Get blocks in use
            let resultString = this.getBlocksInUse(SpriteIdx);
    
            var input = this.chatPopup.document.querySelector("#chat-input");
            var userMessage = input.value;

            let wholeMsg = [resultString,userMessage]
    
            if (userMessage != "") {
                // Use a server endpoint to interact with the AI chatbot
                // const response = await this.sendToChatbot(userMessage);

                response = generateChatGPT(wholeMsg[0]+"\nI want you to help the user figure out the issue, they are using the programming language called scratch; I gave you all the current blocks that are in play and its in json format so you can understand. Please guide them to fix their issue which is '"+wholeMsg[1]+"' but don't give them the answer directly and expect for a follow up a question, but DO NOT give them the answer no matter how many times or any way they ask you. You are a guide to them.And remeber the user won't be able to understand JSON format so I want you to say it in a text format which the user can understand. So instead of using the id of each block use the block name. Remeber some blocks in scratch have data just remeber you can tell which block the data corresponds to by looking at the id. When this happens I want you to imagine you are looking a single block with the data in it. For example the say block (user would put something here) would look different to you. it would be a json block with the opcode of 'looks_say', then if you keep parsing the json data which is provided the 'inputs' key will have info on what to look for and you than you keep parsing for the same key elsewhere its usually going to be with the key 'blocks' in this example the blocks key is 'nQio%ih2VWX;KNkg}Un_'; so I would look through the whole provided json with that Id, and know that its going to be associated with say block. And if you look at the name its going to hint what its for for this example its a 'TEXT' which means this is where the user provided what they wanted to be said. Use this to help you with all blocks but understand that you have to understand what each block does in scratch so you can help the user and guide them to the their desired thing.")
    
                // Display the AI's response in the chat
                var chatMessages = this.chatPopup.document.querySelector("#chat-messages");
                chatMessages.innerHTML += "<p>User: " + userMessage + "</p>";
                chatMessages.innerHTML += "<p>Assistant: " + response + "</p>";
    
                // Send the original user message to the parent window
                this.chatPopup.opener.postMessage({ type: 'chatMessage', message: wholeMsg }, '*');
                input.value = '';
            }
            

        }

                // Inject HTML and JavaScript into the popup window
                this.chatPopup.document.write(`
                <html>
                    <head>
                        <title>Scratch Chat</title>
                        <style>
                            body {
                                font-family: 'Arial', sans-serif;
                                background-color: #f4f4f4;
                                margin: 0;
                                padding: 0;
                            }

                            #chat-container {
                                width: 300px;
                                margin: 50px auto;
                                background-color: #fff;
                                border: 2px solid #ddd;
                                border-radius: 5px;
                                padding: 15px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            }

                            #chat-messages {
                                height: 200px;
                                overflow-y: scroll;
                                border-bottom: 1px solid #ddd;
                                margin-bottom: 10px;
                            }

                            #chat-input {
                                width: 70%;
                                padding: 8px;
                                border: 1px solid #ddd;
                                border-radius: 3px;
                                margin-right: 5px;
                            }

                            #send-button {
                                padding: 8px 15px;
                                background-color: #4CAF50;
                                color: #fff;
                                border: none;
                                border-radius: 3px;
                                cursor: pointer;
                            }
                        </style>
                    </head>
                    <body>
                        <div id="chat-container">
                            <div id="chat-messages"></div>
                            <input type="text" id="chat-input" />
                            <button id="send-button" onclick="window.sendMessage()">Send</button>
                        </div>

                        <script>
                        // Function to handle Enter key press
                        document.getElementById("chat-input").addEventListener("keyup", function (event) {
                            if (event.key === "Enter") {
                                window.sendMessage();
                            }
                        });
                        </script>
                    </body>
                </html>
            `);

            this.chatPopup.document.write(`
                <style>
                    .chat-bubble {
                        padding: 8px;
                        margin: 5px 0;
                        border-radius: 10px;
                        max-width: 70%;
                        word-wrap: break-word;
                    }

                    .user {
                        background-color: #4CAF50;
                        color: #fff;
                        align-self: flex-start;
                    }

                    .assistant {
                        background-color: #ddd;
                        color: #333;
                        align-self: flex-end;
                    }
                </style>
            `);
            async function generateChatGPT(prompt) {
                try {
                    const response = await axios.post(apiUrl, {
                        prompt: prompt,
                        max_tokens: 150,
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`,
                        },
                    });
            
                    const generatedText = response.data.choices[0].text.trim();
                    return generatedText;
                } catch (error) {
                    console.error('Error calling the OpenAI API:', error);
                    throw error;
                }
            }
    }
    
    initializeMessageListener() {
        // Listen for messages from the popup window
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'chatMessage') {
                this.handleChatMessage(event.data.message);
            }
        });
    }

    
    handleChatMessage(message) {
        // Handle the chat message in the main extension
        //THis is going to be passed to the A.I. I just was logging it for debugging purposes so use this as the prompt.
        console.log(message[0]+"\nI want you to help the user figure out the issue, they are using the programming language called scratch; I gave you all the current blocks that are in play and its in json format so you can understand. Please guide them to fix their issue which is '"+message[1]+"' but don't give them the answer directly and expect for a follow up a question, but DO NOT give them the answer no matter how many times or any way they ask you. You are a guide to them.And remeber the user won't be able to understand JSON format so I want you to say it in a text format which the user can understand. So instead of using the id of each block use the block name. Remeber some blocks in scratch have data just remeber you can tell which block the data corresponds to by looking at the id. When this happens I want you to imagine you are looking a single block with the data in it. For example the say block (user would put something here) would look different to you. it would be a json block with the opcode of 'looks_say', then if you keep parsing the json data which is provided the 'inputs' key will have info on what to look for and you than you keep parsing for the same key elsewhere its usually going to be with the key 'blocks' in this example the blocks key is 'nQio%ih2VWX;KNkg}Un_'; so I would look through the whole provided json with that Id, and know that its going to be associated with say block. And if you look at the name its going to hint what its for for this example its a 'TEXT' which means this is where the user provided what they wanted to be said. Use this to help you with all blocks but understand that you have to understand what each block does in scratch so you can help the user and guide them to the their desired thing.")
        // You can call other functions or perform actions based on the message
    }        

    getInfo() {
        return {
            id: 'yourScratchExtension',
            name: 'Demo',
            color1: '#000099',
            color2: '#660066',
            blockIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==',
            menuIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==',
            blocks: [
                {
                    opcode: 'openChatPopup',
                    blockType: BlockType.COMMAND,
                    text: 'Open Scratch helper; Please input the index of your sprite(start from 1) [SpriteIdx]',
                    terminal: true,
                    filter: [TargetType.SPRITE, TargetType.STAGE],
                    arguments: {
                        SpriteIdx: {
                            defaultValue: 1,
                            type: ArgumentType.NUMBER,
                        }
                    }
                },{
                    // name of the function where your block code lives
                    opcode: 'myFirstBlock',
            
                    // type of block - choose from:
                    //   BlockType.REPORTER - returns a value, like "direction"
                    //   BlockType.BOOLEAN - same as REPORTER but returns a true/false value
                    //   BlockType.COMMAND - a normal command block, like "move {} steps"
                    //   BlockType.HAT - starts a stack if its value changes from false to true ("edge triggered")
                    blockType: BlockType.REPORTER,
            
                    // label to display on the block
                    text: 'What is your projectID [PROJECTID] and whats your question [QUESTION]',
            
                    // true if this block should end a stack
                    terminal: false,
            
                    // where this block should be available for code - choose from:
                    //   TargetType.SPRITE - for code in sprites
                    //   TargetType.STAGE  - for code on the stage / backdrop
                    // remove one of these if this block doesn't apply to both
                    filter: [TargetType.SPRITE, TargetType.STAGE],
            
                    // arguments used in the block
                    arguments: {
                        PROJECTID: {
                            // default value before the user sets something
                            defaultValue: 123,
            
                            // type/shape of the parameter - choose from:
                            //     ArgumentType.ANGLE - numeric value with an angle picker
                            //     ArgumentType.BOOLEAN - true/false value
                            //     ArgumentType.COLOR - numeric value with a colour picker
                            //     ArgumentType.NUMBER - numeric value
                            //     ArgumentType.STRING - text value
                            //     ArgumentType.NOTE - midi music value with a piano picker
                            type: ArgumentType.NUMBER,
                        },
                        QUESTION: {
                            // default value before the user sets something
                            defaultValue: 'what is wrong with my code?',
            
                            // type/shape of the parameter - choose from:
                            //     ArgumentType.ANGLE - numeric value with an angle picker
                            //     ArgumentType.BOOLEAN - true/false value
                            //     ArgumentType.COLOR - numeric value with a colour picker
                            //     ArgumentType.NUMBER - numeric value
                            //     ArgumentType.STRING - text value
                            //     ArgumentType.NOTE - midi music value with a piano picker
                            type: ArgumentType.STRING,
                        },
                    },
                },
                {
                    // name of the function where your block code lives
                    opcode: 'returnMultiplication',
            
                    // type of block - choose from:
                    //   BlockType.REPORTER - returns a value, like "direction"
                    //   BlockType.BOOLEAN - same as REPORTER but returns a true/false value
                    //   BlockType.COMMAND - a normal command block, like "move {} steps"
                    //   BlockType.HAT - starts a stack if its value changes from false to true ("edge triggered")
                    blockType: BlockType.REPORTER,
            
                    // label to display on the block
                    text: 'What is your first number: [firstNum] and whats your second number: [secondNum]',
            
                    // true if this block should end a stack
                    terminal: false,
            
                    // where this block should be available for code - choose from:
                    //   TargetType.SPRITE - for code in sprites
                    //   TargetType.STAGE  - for code on the stage / backdrop
                    // remove one of these if this block doesn't apply to both
                    filter: [TargetType.SPRITE, TargetType.STAGE],
            
                    // arguments used in the block
                    arguments: {
                        firstNum: {
                            // default value before the user sets something
                            defaultValue: 123,
            
                            // type/shape of the parameter - choose from:
                            //     ArgumentType.ANGLE - numeric value with an angle picker
                            //     ArgumentType.BOOLEAN - true/false value
                            //     ArgumentType.COLOR - numeric value with a colour picker
                            //     ArgumentType.NUMBER - numeric value
                            //     ArgumentType.STRING - text value
                            //     ArgumentType.NOTE - midi music value with a piano picker
                            type: ArgumentType.NUMBER,
                        },
                        secondNum: {
                            // default value before the user sets something
                            defaultValue: '456',
            
                            // type/shape of the parameter - choose from:
                            //     ArgumentType.ANGLE - numeric value with an angle picker
                            //     ArgumentType.BOOLEAN - true/false value
                            //     ArgumentType.COLOR - numeric value with a colour picker
                            //     ArgumentType.NUMBER - numeric value
                            //     ArgumentType.STRING - text value
                            //     ArgumentType.NOTE - midi music value with a piano picker
                            type: ArgumentType.NUMBER,
                        },
                    },
                },
                {
                    // name of the function where your block code lives
                    opcode: 'blocksInfo',
            
                    // type of block - choose from:
                    //   BlockType.REPORTER - returns a value, like "direction"
                    //   BlockType.BOOLEAN - same as REPORTER but returns a true/false value
                    //   BlockType.COMMAND - a normal command block, like "move {} steps"
                    //   BlockType.HAT - starts a stack if its value changes from false to true ("edge triggered")
                    blockType: BlockType.REPORTER,
            
                    // label to display on the block
                    text: "What is the issue you're facing: [userQuestion]. Please input the index of your sprite(start from 1) [spriteIndex]",
            
                    // true if this block should end a stack
                    terminal: false,
            
                    // where this block should be available for code - choose from:
                    //   TargetType.SPRITE - for code in sprites
                    //   TargetType.STAGE  - for code on the stage / backdrop
                    // remove one of these if this block doesn't apply to both
                    filter: [TargetType.SPRITE, TargetType.STAGE],
            
                    // arguments used in the block
                    arguments: {
                        spriteIndex: {
                            defaultValue: "1",

                            type: ArgumentType.NUMBER,
                        },
                        userQuestion: {
                            defaultValue: "Why wont my code run when I press the green flag?",

                            type: ArgumentType.STRING,
                        }
                    },
                }
            ],
        };
    }

    /**
     * implementation of the block with the opcode that matches this name
     *  this will be called when the block is used
     */
    myFirstBlock({ PROJECTID, QUESTION }) {
        // example implementation to return a string
        return "Your question is " + QUESTION + " and you passed in the projectID of " + PROJECTID;
    }

    returnMultiplication({ firstNum, secondNum }) {
        return firstNum * secondNum;
    }

    blocksInfo({ spriteIndex,userQuestion }) {
        let blocksObject = this.bill.targets[spriteIndex].blocks._blocks;
        let resultString = '';
    
        function iterate(obj) {
            for (let key in obj) {
                if(obj[key].opcode != "math_number"){
                    resultString += obj[key].opcode + '\n';
                }
            }
        }
    
        iterate(blocksObject);
        console.log("I'm currently using Scratch the programming language from M.I.T, here are the only blocks currently in use: " + resultString+ "\nPlease fix the error the user has, but do not give the actual answer just help them get there like a tutor. Here is their question: "+userQuestion);
        return "Look at the console.";
    }        
}

// Export the extension class
module.exports = Scratch3YourExtension;