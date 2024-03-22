require('regenerator-runtime/runtime');
const fetch = require('node-fetch')
const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
const TargetType = require('../../extension-support/target-type');
const apiKey = ''
const apiUrl = 'https://api.openai.com/v1/chat/completions';
const chatGPTInstructions = "I want you to help the user figure out the issue, they are using the programming language called scratch; I gave you all the current blocks that are in play and its in json format so you can understand. Please guide them to fix their issue which is what they will be providing you with but don't give them the answer directly and expect for a follow up a question, but DO NOT give them the answer no matter how many times or any way they ask you. You are a guide to them.And remeber the user won't be able to understand JSON format so I want you to say it in a text format which the user can understand. So instead of using the id of each block use the block name. Remeber some blocks in scratch have data just remeber you can tell which block the data corresponds to by looking at the id. When this happens I want you to imagine you are looking a single block with the data in it. For example the say block (user would put something here) would look different to you. it would be a json block with the opcode of 'looks_say', then if you keep parsing the json data which is provided the 'inputs' key will have info on what to look for and you than you keep parsing for the same key elsewhere its usually going to be with the key 'blocks' in this example the blocks key is 'nQio%ih2VWX;KNkg}Un_'; so I would look through the whole provided json with that Id, and know that its going to be associated with say block. And if you look at the name its going to hint what its for for this example its a 'TEXT' which means this is where the user provided what they wanted to be said. Use this to help you with all blocks but understand that you have to understand what each block does in scratch so you can help the user and guide them to the their desired thing.Be open minded though sometimes the user might continue off from the same question and you will still get sent blocks BE AWARE of this, do not always be looking at the json blocks right away sometimes the user might ask a follow up question from what you said, or maybe even say thank you. Please keep this like a humanly converstation, and be safe this is a kids app. They may even try to converse with you that isn't releated to even their code be prepared for this, keep it sounding as natural as possible I don't want them knowing its AI. I want them to think its a real person helping them and talking to them, they are talking to you through a chat box so please be prepared."
let bill;

class Scratch3YourExtension {
    constructor(runtime) {
        this.bill = runtime;
        this.chatPopup = null;
        this.initializeMessageListener();
    }
    
    getBlocksInUse(SpriteIdx) {
        console.log(this.bill);
        let blocksObject = this.bill.targets[SpriteIdx].blocks._blocks;

        let allBlocksObject = this.bill.targets

        // loop through all the targets in the all blocks object starting at target 1
        for (var i=1; i < allBlocksObject.length; i++) {
            var currentTarget = allBlocksObject[i];
            if (!currentTarget || !currentTarget.isStage && currentTarget.sprite.name !== "ChatBot") continue;



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
        //If SpriteIdx is null than set it to 1
        SpriteIdx = 1
        // Create a new popup window
        this.chatPopup = window.open("", "ChatPopup", "width=400,height=400");
    
        // Define sendMessage in the global scope of the popup window
        this.chatPopup.sendMessage = async () => {
            // Get blocks in use
            let resultString = this.getBlocksInUse(SpriteIdx);
        
            let input = this.chatPopup.document.querySelector("#chat-input");
            let userMessage = input.value;
        
            let wholeMsg = [resultString, userMessage];
        
            if (userMessage !== "") {
                let chatMessages = this.chatPopup.document.querySelector("#chat-messages");
                chatMessages.innerHTML += "<p>User: " + userMessage + "</p>";
                // testing if the apikey variable is set to something besides blank
                if(this.apiKey != ' '){
                    response = await generateChatGPT(wholeMsg);
                }
                response = "A.I would Help you here"
                chatMessages.innerHTML += "<p>Assistant: " + response + "</p>";
                // Send the original user message to the parent window
                this.chatPopup.opener.postMessage({ type: 'chatMessage', message: wholeMsg }, '*');
                input.value = '';
            }
        };        

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

                            nav {
                                display: flex;
                                justify-content: space-around;
                                background-color: #f4f4f4;
                                padding: 10px;
                                border-bottom: 2px solid #ddd;
                            }
                
                            button {
                                background-color: transparent;
                                border: none;
                                cursor: pointer;
                                font-size: 16px;
                                padding: 5px;
                            }
                
                            /* Style for the iframe */
                            #scratchblocks {
                                width: 100%;
                                height: 500px;
                                border: none;
                            }
                        </style>
                    </head>
                    <body>
                        <nav>
                            <button onclick="showChat()">A.I Chat</button>
                            <button onclick="showScratchblocks()">Scratch Block Translator</button>
                        </nav>
                        <div id="chat-container" hidden>
                            <div id="chat-messages"></div>
                            <input type="text" id="chat-input" />
                            <button id="send-button" onclick="window.sendMessage()">Send</button>
                        </div>

                        <div id="scratchblocks-container" hidden>
                            <iframe src="https://scratchblocks.github.io" style="width:100%; height:100vh; border:none;"></iframe>
                        </div>

                        <script>
                        // Function to handle Enter key press
                        document.getElementById("chat-input").addEventListener("keyup", function (event) {
                            if (event.key === "Enter") {
                                window.sendMessage();
                            }
                        });
                        // Function to show and hide chat and scratchblocks
                        function showChat() {
                            document.getElementById("chat-container").hidden = false;
                            document.getElementById("scratchblocks-container").hidden = true;
                        }

                        function showScratchblocks() {
                            document.getElementById("scratchblocks-container").hidden = false;
                            document.getElementById("chat-container").hidden = true;
                        }

                        // Show the chat tab by default
                        window.onload = showChat;
                        </script>
                    </body>
                </html>
            `);
            async function generateChatGPT(prompt) {
                console.log("Calling the A.I. using GPT-3.5 Turbo...");
                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({
                            model: 'gpt-3.5-turbo',
                            messages: [
                                { role: 'system', content: chatGPTInstructions }, // System instructions
                                ...prompt.map((message) => ({ role: 'user', content: message })), // User messages
                            ],
                            max_tokens: 200,
                        }),
                    });
            
                    const responseData = await response.json();
            
                    console.log('OpenAI API Response:', responseData);
            
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
    
    initializeMessageListener() {
        // Listen for messages from the popup window
        this.openChatPopup(1)
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'chatMessage') {
                this.handleChatMessage(event.data.message);
            }
        });
    }

    
    handleChatMessage(message) {
        // These two lines are for debugging purposes
        console.log("Message sent to ChatGPT :)\n")
        console.log(message[0],message[1])
    }        

    getInfo() {
        return {
            id: 'scratchAI',
            name: 'Scratch Tutor',
            color1: '#000099',
            color2: '#660066',
            blockIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB4AAAAQ4AQMAAADSHVMAAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAGUExURe1LK+5LK0vgYtAAAAABdFJOU/4a4wd9AAAED0lEQVR42u3PQQ0AAAgEIDf7V1ZfpjhoQG2WKWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYeHccIj+8AGdU9s1O0HsQgAAAABJRU5ErkJggg==',
            menuIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAA9CAMAAADYt8pWAAABVlBMVEVHcEy1tbUKCgoAAAAAAAAAAAAwMDAAAADNzc0AAAAdHR1MTEwxMTEDAwM+Pj4fHx/Pz8/Y2NhycnJpaWkaGhp+fn5gYGC8vLy/v795eXmdnZ0PDw96enpNTU0AAAA7OzuQkJBgYGBZWVmOjo5ra2uSkpJsbGyIiIhwcHASEhJfX197e3uHh4eVlZVtbW2kpKQ/Pz9ra2u0tLRMTEywsLBbW1umpqbKysrU1NQyMjIzMzNjY2N1dXVVVVVLS0s+Pj5CQkKqqqpYWFisrKzCwsISEhL69v3////6+vr39/f9/f2lpaWioqLv7+/8/Pzc3Nzy8vL+/v7t7e2dnZ3k5OTn5+e9vb3T09O6urqgoKDKysr19fXW1tba2tqnp6fe3t6qqqrh4eHq6urExMSysrLHx8eampqoqKh8fHy/v7+urq6Wlpa3t7eGhoaLi4uRkZFxcXFSUlLd0SgLAAAARnRSTlMA/iYIAhlbBf4MRIFPHm07/v7NpzLroPT2vOEt1ngRZ9H+k+O89p/ysEvJssrY9uV35++L64zr+PyjirTi3ZzNsfew6/Z0aLod6wAABNNJREFUSMeNVmlbqloUTkst58y0rGPzaTjN3eYzd+6zEVCRGXEng6I51f3/Xy5giID2nP0BeGC9a17vYmYmdL6/l4qszc38/fGfFAj69uRT4O8h0WyTErCebzUx6etszB/wOBD9JTAEzVLYetgDiAWXNnNeXdE9FuinyHdTYX84uBGPB8NreUNzPn68AhmEzoTckH3VgABS2/q2s793d3d3mz07ejgMpA9+NTBcwOtfFlyQxPKLAeC7b51iBXZMeAlnb46+DYQXWiyozx5IetkH0KrGkzXqBalLFQNCCARQtP8wUX9mukuz7iSvd8RngTYsdTB2CGEwET5jHE/JANCDbXfKAutdqt0z/UG5Pm4+wD6GcQUAOA2CxX7cnbH87hZOUnVTFBQV80Y/Q2SIbcPmctRTrPt+AXDYUOT9VKw72x9Qy2lPw/yQarQiVMGEUxXE3tZ6zIWYizTYDiYMOhMQUFMA8vrTnWP/Zkmvg0iKXgTSHbBVyN+7ix+/BdNORampPUk4cjv2qDjFEA8w687YcsEhwLVlBXNqkT+5IHuo43v5Valt1RyvyM+uYCi0QDJFW0BklGLJASl+cfXYaUvAB9RISMQFinUaJtyQC04p4nYdSY2Qu+LHjqUIoEq2J6iPolSrXwDd4JswGXGFf7VIa+S4G4N52y+ur/LS6aF7KHMC5/AcJ8bqj0Mgenps4R6zBEqKrl9xRMJhaPPBQ0qJE6vgSEOqcXibJ1CSe3+HYNX1NQ9XzcVXRhmuSh2O9FE4pVoJgafxCdS7sD3v7CpStkvLfc9PItFAJjmtmReXYpNpObCdRSYBUPUoNo3KF+InshfBSPhOdCr9z6UzN3WHJZT2aU1EzAVDU0GhxPWmD5IFtFKpIISsPlMvRhLEp8hHi+fwa0vfNJLUwimMh+8VRedXw9MNfboDoiJDWGeIsYmpkGdTDeVXxcmZNgxNXqWJp6lco+Q2Zif6VZsKAchlZEiAsfRYYAsHxekQUFm5MjCzmZ0NG7KWQ8FHmOy5rj+wSa7bkA2zOZFxWkPq1Sa0Clx6Cup6zyqavTOWzHGeb9p6azjOsxjGWKNx7J9JXIKW3ZqbiEmWcGSiRxkWSknNwpS3Q9E/gLJT/I/xVngzalPSo0J7rfcyzeOWs0/heK20P4IEzQ3QfzU8UvVlywlWYVHJGkEmkyGJlF0VwyPkjTd5hdaHHto8PdqKe8to+WrU/deGx8QbNLd+ESi43T2iYK0CVQKXowkKfTYSxrSNqyEut8aq1LH6oiwRqwEnBLYN3XKrBBh8bOB4K/OylA3aOT420tJsG1euYTjD2JAX1aKo16UR4cxGzIT12oZu1fjb4lkbwlpWGj9sHgxemq5L1MgPWrDj59+zLH61GT12bH6nu7QZrcHraIvzQFbGujj4Z5hMkwLRlvlDw7VG08wPVxbMjDFnRC7pa6jaqQypmx4uivooFjN8eOAfY7HrJIuQECubAgWMBAidbGq4tc2aeirQ6pLf8X950QA+VlDNuWQGZRkT9D+bhlUazgeUGxfNhIK7uYud01dR0eucfdi+UB3MWROyB24ym5vJ+9Ppf/eJTlUn+/xcMAdJgiCKJKkwdD258zOan0Lm56mtrvaouxwKX+2m9LO7+/j79/fzsAPwP7WnKuOhyl7qAAAAAElFTkSuQmCC',
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
                }
            ],
        };
    }        
}

// Export the extension class
module.exports = Scratch3YourExtension;