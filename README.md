# Dev's Dread: A Git Horror Story

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An interactive, narrative-driven Git tutorial disguised as existential dread. Learn over 25 essential Git commands through the eyes of Kael, a junior developer fueled by cold brew and the quiet terror of breaking the main branch. Guided by the sardonic senior dev, Seraphina, you'll tackle everything from your first commit to advanced Git sorcery.

This project was built to make learning Git more engaging and memorable by wrapping lessons in a relatable story.

**[➡️ Try the Live Tutorial Here!](https://shrutipandey15.github.io/git-tutorial/)**

## ✨ Features

* **Narrative-Driven Learning:** Follow a story that provides context for each command.
* **25+ Interactive Chapters:** Covers everything from `git config` and `git clone` to `git rebase` and `git bisect`.
* **Simulated Terminal:** A persistent terminal environment where your actions have consequences. The state is saved in `localStorage` so you can continue where you left off.
* **Dynamic Git Graph:** A real-time, visual representation of your branches and commits that updates as you execute commands.
* **Special Interactive Chapters:** Go beyond simple commands with dedicated interactive UIs for complex topics like merge conflicts and interactive rebase.
* **"Pro-Tips" Sections:** Each chapter includes advanced command variations and advice from "Senior Dev Seraphina."
* **Polished & Accessible:** Built with semantic HTML for better structure and accessibility features for screen reader users.

## 🛠️ Tech Stack

* **HTML5:** Structured with modern, semantic tags.
* **CSS3:** Styled with Flexbox, Grid, and custom animations.
* **Vanilla JavaScript (ES6+):** All interactivity, state management, and DOM manipulation are handled with plain JavaScript, with no external libraries.

## 🚀 Getting Started

No complex build steps are required to run this project locally.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/shrutipandey15/git-tutorial.git](https://github.com/shrutipandey15/git-tutorial.git)
    ```

2.  **Navigate to the directory:**
    ```bash
    cd git-tutorial
    ```

3.  **Open the file:**
    Open the `index.html` file directly in your web browser.

## 📖 How to Use

* Read the dialogue between Kael and Seraphina to understand the context of the current problem.
* Type the required Git command into the interactive terminal prompt and press `Enter`.
* Watch the repository state and the Git graph update in real-time based on your command.
* Read the "Pro-Tips" to learn advanced usage and best practices for each command.

## 🔮 Future Improvements

This project has a solid foundation, but there's always more to learn. Potential future enhancements include:

* A more robust state simulation for `git rebase` that actually modifies the commit objects and messages.
* A new chapter on resolving rebase conflicts (`git rebase --continue`).
* A true spaced repetition algorithm for the "Review Due" feature.

## 📄 License

This project is licensed under the MIT License.
