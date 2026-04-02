# Scratch Helper

An AI-powered tutoring assistant for [Scratch](https://scratch.mit.edu/), the visual programming language by MIT. Scratch Helper sits inside the Scratch editor as a custom extension and gives kids (ages 9-13) guided, conversational help as they build projects -- without just handing them the answer.

## What it does

- **AI Chat** -- Ask questions about your Scratch project and get step-by-step guidance from an AI tutor that encourages exploration over copy-paste solutions.
- **Block Context** -- The tutor can see which blocks you're already using, so its advice stays relevant to your actual code.
- **Scratch Block Translator** -- A built-in tab powered by [scratchblocks](https://github.com/scratchblocks/scratchblocks) that renders block notation so you can visualize suggestions.

## Quick Start

1. Press the blue **extension button** (bottom-left corner of the Scratch editor).
2. Click your extension. A new **"Scratch AI Tutor"** category will appear.
3. Drag the `Open AI Tutor for sprite [1]` block into your workspace or click it directly. You only need to do this once per session.
4. A popup window will open. If it doesn't, check your browser's popup-blocker settings.
5. Choose your AI endpoint (OpenAI or an alternative Azure-hosted model) and paste in your API key.
6. Start chatting. The **AI Tutor Chat** tab is where you ask questions; the **Scratch Block Translator** tab lets you paste block notation to preview it visually.

**Video walkthrough:** [Watch on Vimeo](https://vimeo.com/975649020?share=copy)

**Live demo:** [Open Scratch Helper](https://spacewalker215.github.io/Scratch-Tutor/scratch/)

## Prerequisites

You need an API key from one of the supported providers:

- **OpenAI** -- [Get a key here](https://platform.openai.com/api-keys)
- **GitHub Models (Azure AI)** -- Use a GitHub personal access token with the Models scope.

Your key is held in browser memory only and is discarded when the popup window closes. It is never sent anywhere except the AI provider you selected.

## Local Development (Codespaces)

If you'd rather run everything locally and keep your API key out of the browser prompt, follow these steps:

1. Click the green **Code** button on this repo, select **Codespaces**, and create a new Codespace.
2. Once the Codespace loads, create a `.env` file in the project root:
   ```
   OPEN_AI_APIKEY="your-key-here"
   ```
3. In `your-scratch-extension/index.js`, uncomment line 210 to read the key from the environment.
4. Run the setup scripts in order:
   ```bash
   ./0-setup.sh
   ./1-add-dependency.sh
   ./5-compile.sh
   ```
5. A forwarded port will appear. Click **Open in Browser** (or check the **Ports** tab) to launch the editor.

## Customization

All extension logic lives in `your-scratch-extension/index.js`. Edit that file to change the system prompt, swap AI models, adjust token limits, or add new Scratch blocks.

## Project Structure

```
your-scratch-extension/   Extension source (index.js)
dependencies/             Scratch VM package manifest and lock file
patches/                  Git patches applied to scratch-vm and scratch-gui
0-setup.sh ... 5-compile.sh   Build and setup scripts
```

## License

See [LICENSE](LICENSE) for details.
