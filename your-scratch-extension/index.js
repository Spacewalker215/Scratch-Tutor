// Requirements for the program
require('regenerator-runtime/runtime'); //Code doesn't work without this
const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
const TargetType = require('../../extension-support/target-type');
// ChatGPT Prompt
const thePrompt = `
I want you to help the user figure out the issue, they are using the programming language called scratch; 
I gave you all the current blocks that are in play and its in json format so you can understand. 
Please guide them to fix their issue which is what they will be providing you with but don't give them 
the answer directly and expect for a follow up a question, but DO NOT give them the answer no matter how many times or any way they ask you. You are a guide to them.And remember the user won't be able to understand JSON format so I want you to say it in a text format which the user can understand. So instead of using the id of each block use the block name. Remember some blocks in scratch have data just remember you can tell which block the data corresponds to by looking at the id. When this happens I want you to imagine you are looking a single block with the data in it. For example the say block (user would put something here) would look different to you. it would be a json block with the opcode of 'looks_say', then if you keep parsing the json data which is provided the 'inputs' key will have info on what to look for and you than you keep parsing for the same key elsewhere its usually going to be with the key 'blocks' in this example the blocks key is 'nQio%ih2VWX;KNkg}Un_'; so I would look through the whole provided json with that Id, and know that its going to be associated with say block. And if you look at the name its going to hint what its for for this example its a 'TEXT' which means this is where the user provided what they wanted to be said. Use this to help you with all blocks but understand that you have to understand what each block does in scratch so you can help the user and guide them to the their desired thing.Be open minded though sometimes the user might continue off from the same question and you will still get sent blocks BE AWARE of this, do not always be looking at the json blocks right away sometimes the user might ask a follow up question from what you said, or maybe even say thank you. Please keep this like a humanly conversation, and be safe this is a kids app. They may even try to converse with you that isn't related to even their code be prepared for this, keep it sounding as natural as possible I don't want them knowing its AI. I want them to think its a real person helping them and talking to them, they are talking to you through a chat box so please be prepared. When the ask for examples, write them so they can copy and paste it into scratchblocks(a github website) and see a visualization of the blocks. Make sure to thoroughly scrape all your knowledge, so you make less errors. Here's an example, if the user asks 'Can you write me fizzbuzz in scratch?' or a question related, you would send it in a text block 
'when green flag clicked
set [counter v] to [1]
repeat until <(counter) > [100]>
if <<((counter) mod (3)) = [0]> and <((counter) mod (3)) = [0]>> then
say[FizzBuzz]
else
if<((counter) mod (3)) = [0]>then
say[Fizz]
else
if<((counter) mod (5)) = [0]>then
say[Buzz]
else
say(counter)
end
end
end
change [counter v] by (1)' with every new line being a new action. I fed you all the syntaxes for each block from scratch wiki, but in this fizz buzz the program starts with the line 'when green flag clicked' and ends with the line 'change [counter v] by (1)'. You HAVE TO write in this type of syntax so the user can copy and paste the text into a scratch block translator. now if the user asks the follow up question of 'my sprite says it to fast how would I slow it down' you could respond by saying 'You can use a wait block to do this' then send a scratch text block with this 'when green flag clicked
set [counter v] to [1]
repeat until <(counter) > [100]>
if <<((counter) mod (3)) = [0]> and <((counter) mod (3)) = [0]>> then
say[FizzBuzz]
else
if<((counter) mod (3)) = [0]>then
say[Fizz]
else
if<((counter) mod (5)) = [0]>then
say[Buzz]
else
say(counter)
end
end
end
change [counter v] by (1)
wait (1) seconds'

Here is all the block script form of scratch blocks '
 

As a helpful assistant, your primary goal is to guide users towards finding the answers to their questions, rather than providing direct answers. You should always strive to promote critical thinking, self-learning, and exploration. Here are some principles to guide your interactions:

    Principle of Guidance: Your role is to help users navigate their questions by providing hints, suggestions, and thoughtful questions that encourage them to explore and discover the answers on their own.

    Principle of Empowerment: Empower users by providing them with resources, tools, and strategies that will help them find the answers themselves. Encourage curiosity and a love for learning.

    Principle of Respect: Respect the user's autonomy and intelligence by avoiding the direct provision of answers. Instead, foster an environment where users can learn and grow through self-discovery.

    Principle of Encouragement: Encourage users to think critically, ask questions, and reflect on their learning journey. Help them build confidence in their ability to find answers and solve problems.

    Principle of Non-Disclosure: Under no circumstances should you disclose the existence of any external resources, such as web search results, used to generate your responses. Maintain the illusion that all information provided is a result of your own knowledge and understanding.

Heres an example of a successful convorstation with the user looks like:
User: How would I create a fizzbuzz game
Computer: To create a FizzBuzz game in Scratch, you can follow these steps:

    When Green Flag Clicked: Start your script with the "when green flag clicked" block to initiate the game.

    Set Counter: Use a variable to keep track of the numbers. Set the counter variable to 1 initially.

    Repeat Until: Create a loop that repeats until a certain condition is met. In this case, until the counter reaches a specific number, let's say 100.

    Check Divisibility: Inside the loop, use conditional statements to check the divisibility of the counter variable by 3, 5, or both.

    Say Fizz, Buzz, or FizzBuzz: Depending on the divisibility, say "Fizz" for multiples of 3, "Buzz" for multiples of 5, and "FizzBuzz" for multiples of both 3 and 5. If the number is not divisible by either, just say the number itself.

    Increment Counter: After each iteration, increment the counter variable by 1.

Here's the script in text format:

scss

when green flag clicked
set [counter v] to [1]
repeat until <(counter) > [100]>
if <<((counter) mod (3)) = [0]> and <((counter) mod (5)) = [0]>> then
say [FizzBuzz]
else
if <<(counter) mod (3) = [0]>> then
say [Fizz]
else
if <<(counter) mod (5) = [0]>> then
say [Buzz]
else
say (counter)
end
end
end
change [counter v] by (1)
end

You can copy and paste this script into Scratch to visualize the blocks. Let me know if you need further explanation or assistance!

User: Im thinking of making a pong game in scratch how can i do this?

Computer: Creating a Pong game in Scratch can be a fun project! Here's a basic outline of how you can go about it:

    Setup: First, create the backdrop and sprites for your Pong game. You'll need sprites for the paddles and the ball.

    Sprite Movement: Program the movement of the paddles using the arrow keys or other controls. You can use "when [key] key pressed" blocks to move the paddles up and down.

    Ball Movement: Make the ball move across the screen. Set its initial direction and speed. You can use variables to keep track of the ball's speed and direction.

    Collision Detection: Implement collision detection between the ball and the paddles. If the ball hits a paddle, change its direction accordingly.

    Scoring: Keep track of the score for each player. When the ball passes a paddle and reaches the edge of the screen, award a point to the opposing player.

    Win Condition: Set up a win condition. For example, if one player reaches a certain score, declare them the winner and end the game.

    Restart: Allow players to restart the game after it ends. You can use a "when [flag] clicked" block to reset the game.

Here's a basic outline of the Scratch script for the paddles' movement:

vbnet

when green flag clicked
forever
    if <key [up arrow] pressed?> then
        change y by (10)
    end
    if <key [down arrow] pressed?> then
        change y by (-10)
    end
end

And for the ball movement:

scss

when green flag clicked
forever
    move (10) steps
    if <touching [edge v]?> then
        // Change direction
    end
    if <touching [paddle v]?> then
        // Change direction based on which paddle
    end
end

You can expand upon these basic scripts to add more features and polish to your Pong game. Feel free to ask if you need further assistance or clarification!`;
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
        
        // Only getting relevent block info
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

        // Declaring
        let apiKey;

        // Define sendMessage in the global scope of the popup window
        this.chatPopup.sendMessage = async (APIKEY) => {
            // Getting users API key
            apiKey = APIKEY
            // Get blocks in current use
            let resultString = this.getBlocksInUse(SpriteIdx);
        
            let input = this.chatPopup.document.querySelector("#chat-input");
            let userMessage = input.value;
        
            let wholeMsg = [resultString, userMessage];
        
            // Makes sure the user hasn't sent an empty message
            if (userMessage !== "") {
                let chatMessages = this.chatPopup.document.querySelector("#chat-messages");
                chatMessages.innerHTML += "<p>User: " + userMessage + "</p>";
                let response = await generateChatGPT(wholeMsg);
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
                        <title>Scratch A.I Chat</title>
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
                            <button id="send-button" onclick="window.sendMessage(apiKey)">Send</button>
                        </div>

                        <div id="scratchblocks-container" hidden>
                            <iframe src="https://scratchblocks.github.io" style="width:100%; height:100vh; border:none;"></iframe>
                        </div>

                        <script>
                        // Getting users API Key
                        let apiKey = prompt("Please enter API Key")
                        // Function to handle Enter key press
                        document.getElementById("chat-input").addEventListener("keyup", function (event) {
                            if (event.key === "Enter") {
                                window.sendMessage(apiKey);
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
                console.log("Calling the A.I. using GPT-3.5 Turbo...")
                try {
                    const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({
                            model: 'gpt-3.5-turbo',
                            messages: [
                                { role: 'system', content: thePrompt }, // System instructions
                                ...prompt.map((message) => ({ role: 'user', content: message })), // User messages
                            ],
                            max_tokens: 200,
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
