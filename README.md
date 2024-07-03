# 🐱✨ Scratch Helper

## 📘 Introduction

Welcome to **Scratch Helper** — your friendly AI Copilot for Scratch! Designed with young learners in mind, this tool offers guidance and support to help kids explore and master Scratch, a popular visual programming language. Currently in its beta phase, we eagerly welcome your feedback and bug reports to enhance its functionality.

Say goodbye to countless hours spent on video tutorials just to understand a simple block in Scratch. With **Scratch Helper**, you can quickly get the assistance you need, making your learning journey smoother and more enjoyable.

---

## 🚀 How to Use Scratch Helper

Using Scratch Helper is a breeze! Follow these simple steps to get started:

1. **Press the blue extension button** in the bottom left corner.
2. **Click on your extension**.
3. A new category called **"scratch-tutor"** will appear, featuring a block that reads `Enter sprite index (starting from 1) [SpriteIdx] (optional)`. You can press the block itself or drag it into the workspace. Have an event trigger it (e.g., when the green flag is pressed). *(Note: You only need to open it once.)*
4. A **pop-up will appear**. *(If the popup doesn't appear, check your browser privacy settings.)* Enter or paste your API key into it.
5. **Two tabs will appear**: **A.I. Chat** and **Scratch Block Translator**. The latter is a GitHub project by blob8108, and you can find the repository [here](https://github.com/scratchblocks/scratchblocks).
6. Click on **A.I. Chat**, ask it anything about your code, and it will help guide you to the answer. You can copy the output blocks and paste them into the Scratch Block Translator to see what they look like.

📹 Here’s a video tutorial to get you started: [Watch Video](https://vimeo.com/959853686?share=copy)

🔗 [Get Started with Scratch Helper](https://spacewalker215.github.io/Scratch-Tutor/scratch/)

---

Explore, experiment, and, most importantly, have fun with Scratch! Your journey into the world of coding starts here.

---

## 📝 Important Notes

**You need an OpenAI API key to use this extension.**

🔗 [Get your API key here](https://platform.openai.com/api-keys)

*For privacy, your API key will only be saved in the local browser until the window is closed.*

### Alternative Secure Setup:

If you prefer a more secure setup for your API key, follow these steps:

1. **Clone the repository**.
2. **Open the repo in a Codespace**: Click the green 'Code' button, select 'Codespaces', and press 'Create Codespace'.
3. **Create a new file**: Once the Codespace has loaded all files, hover over 'SCRATCH-TUTOR' in the explorer and press the new file button.
4. **Name the file `.env`** and press Enter.
5. **Edit the `.env` file**: Open it and type `OPEN_AI_APIKEY="Paste your API-KEY here"`.
6. **Expand the "your-scratch-extension" folder**.
7. **Edit `index.js`**: Uncomment line 210.
8. **Run setup scripts**:
    - Type `./0-setup.sh` in the terminal and press Enter.
    - Type `./1-add-dependency.sh` and press Enter.
    - Type `./5-compile.sh` and press Enter.
9. **Access the port**: A port should appear; click 'Open port'. If not, go to the 'Ports' tab and click on one of the forwarded addresses (look for the one that doesn't originate from Codespace).

---

## 🔧 Customization

To customize the code, navigate to the **your-scratch-extension** folder and edit the `index.js` file.

---

Happy coding! 🎉