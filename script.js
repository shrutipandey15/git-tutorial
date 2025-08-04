document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.user-input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleCommand(this);
        });
    });

    loadState();

    document.querySelectorAll('.git-graph-container').forEach(container => {
        renderGraph(container, gitRepo);
    });
});

// The state of the repository when the tutorial starts for the first time.
const initialGitRepo = {
    commits: {
        'c0': { parent: null, msg: 'Initial commit' }
    },
    branches: {
        'main': 'c0'
    },
    HEAD: 'main',
    workingDirectory: {
        'README.md': 'untracked'
    },
    stagingArea: {}
};
let gitRepo = JSON.parse(JSON.stringify(initialGitRepo)); 

const totalChapters = document.querySelectorAll('.chapter[data-chapter]').length;
let progress = {};

/**
 * Loads the tutorial state (user progress and repo simulation) from localStorage.
 */
function loadState() {
    const savedProgress = localStorage.getItem('gitTutorialProgress');
    if (savedProgress) {
        progress = JSON.parse(savedProgress);
    }

    const savedRepoState = localStorage.getItem('gitTutorialRepoState');
    if (savedRepoState) {
        gitRepo = JSON.parse(savedRepoState);
    }

    const REVIEW_INTERVAL = 30 * 1000; 

    document.querySelectorAll('.chapter[data-chapter]').forEach(chapter => {
        const chapterNum = chapter.dataset.chapter;
        if (progress[chapterNum]) {
            chapter.classList.add('completed');
            const timeSinceCompletion = Date.now() - progress[chapterNum].timestamp;
            if (timeSinceCompletion > REVIEW_INTERVAL) {
                chapter.classList.add('review-due');
            }
        }
    });
    updateProgressBar();
}

/**
 * Saves the current tutorial state (progress and repo) to localStorage.
 */
function saveState() {
    localStorage.setItem('gitTutorialProgress', JSON.stringify(progress));
    localStorage.setItem('gitTutorialRepoState', JSON.stringify(gitRepo));
}

/**
 * Resets all progress and the repository simulation. Triggered by the global reset button.
 */
function resetAllProgress() {
    if (confirm("Are you sure you want to reset all progress and start over? This cannot be undone.")) {
        localStorage.removeItem('gitTutorialProgress');
        localStorage.removeItem('gitTutorialRepoState');
        window.location.reload();
    }
}

/**
 * Renders the visual Git graph in a given chapter's container.
 * @param {HTMLElement} container - The div element to render the graph into.
 * @param {object} repoState - The current state of the gitRepo object.
 */
function renderGraph(container, repoState) {
    if (!container) return;
    container.innerHTML = '<h4>Git Graph</h4>'; // Reset container
    const graphDiv = document.createElement('div');
    graphDiv.className = 'git-graph';
    
    const commitMap = {};
    Object.keys(repoState.commits).forEach(id => {
        commitMap[id] = { ...repoState.commits[id], children: [], x: -1, y: 0 };
    });

    Object.keys(commitMap).forEach(id => {
        const parentId = commitMap[id].parent;
        if (parentId && commitMap[parentId]) {
            commitMap[parentId].children.push(id);
        }
    });
    
    function positionNode(id) {
        if (commitMap[id].x === -1) {
            if (commitMap[id].parent) {
                positionNode(commitMap[id].parent);
                commitMap[id].x = commitMap[commitMap[id].parent].x + 1;
            } else {
                commitMap[id].x = 0;
            }
        }
    }
    Object.keys(commitMap).forEach(id => positionNode(id));

    const commitLine = document.createElement('div');
    commitLine.className = 'commit-line';

    Object.keys(commitMap).forEach(commitId => {
        const commitNode = document.createElement('div');
        commitNode.className = 'commit-node';
        commitNode.textContent = commitId;
        commitNode.style.left = `${commitMap[commitId].x * 80}px`;
        
        let labelOffset = 0;
        for (const branchName in repoState.branches) {
            if (repoState.branches[branchName] === commitId) {
                const branchLabel = document.createElement('div');
                branchLabel.className = `branch-label ${branchName.replace('/', '-')}`;
                branchLabel.textContent = branchName;
                
                if (repoState.HEAD === branchName) {
                    branchLabel.innerHTML += ' <span class="head-pointer">(HEAD)</span>';
                    branchLabel.classList.add('head');
                }
                
                if (labelOffset > 0) {
                    branchLabel.style.top = `${45 + (labelOffset-1) * 30}px`;
                }
                labelOffset++;

                commitNode.appendChild(branchLabel);
            }
        }
        commitLine.appendChild(commitNode);
    });
    
    graphDiv.appendChild(commitLine);
    container.appendChild(graphDiv);
    
    if(container.innerHTML !== '<h4>Git Graph</h4>') {
         container.style.display = 'block';
    }
}

/**
 * Toggles the visibility of a command's hint text.
 * @param {HTMLElement} button - The hint button that was clicked.
 */
function showHint(button) {
    const hintText = button.closest('.terminal-line').nextElementSibling;
    if (hintText) {
        hintText.style.display = hintText.style.display === 'block' ? 'none' : 'block';
    }
}

/**
 * Updates the main progress bar at the top of the page.
 */
function updateProgressBar() {
    const progressFill = document.getElementById('progress');
    const completedCount = Object.keys(progress).length;
    if (progressFill) {
        const newProgress = (completedCount / totalChapters) * 100;
        progressFill.style.width = newProgress + '%';
    }
}

/**
 * Marks a chapter as complete and saves the state.
 * @param {string} chapterNumberStr - The chapter number to mark as complete.
 */
function updateProgressAndCompletion(chapterNumberStr) {
    const chapterNumber = parseInt(chapterNumberStr, 10);
    progress[chapterNumber] = { completed: true, timestamp: Date.now() };
    const chapterElement = document.querySelector(`.chapter[data-chapter="${chapterNumber}"]`);
    if (chapterElement) {
        chapterElement.classList.add('completed');
        chapterElement.classList.remove('review-due');
    }
    updateProgressBar();
    saveState(); 

    if (Object.keys(progress).length >= totalChapters) {
        setTimeout(showCelebration, 1000);
    }
}

/**
 * Displays the final celebration message.
 */
function showCelebration() {
    const commandCountEl = document.getElementById('commandCount');
    if (commandCountEl) commandCountEl.textContent = document.querySelectorAll('.git-cheatsheet code').length;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('celebration').style.display = 'block';
}

/**
 * Closes the final celebration message.
 */
function closeCelebration() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('celebration').style.display = 'none';
}

/**
 * Adds a new interactive line to a terminal for multi-step chapters.
 */
function addTerminalLine(terminalContent, promptText, placeholder, expected, terminalId) {
    const newLine = document.createElement('div');
    newLine.className = 'terminal-line';
    
    const promptSpan = document.createElement('span');
    promptSpan.className = 'prompt';
    promptSpan.textContent = promptText;

    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'user-input';
    newInput.placeholder = placeholder;
    newInput.setAttribute('data-expected', expected);
    newInput.setAttribute('data-terminal', terminalId);
    newInput.autocomplete = 'off';
    newInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') handleCommand(this); });
    
    const hintButton = document.createElement('button');
    hintButton.className = 'hint-button';
    hintButton.textContent = '💡';
    hintButton.onclick = function() { showHint(this); };
    
    newLine.appendChild(promptSpan);
    newLine.appendChild(newInput);
    newLine.appendChild(hintButton);
    
    terminalContent.appendChild(newLine);

    const hintDiv = document.createElement('div');
    hintDiv.className = 'hint-text';
    hintDiv.textContent = `Type: ${expected}`;
    terminalContent.appendChild(hintDiv);
    
    newInput.focus();
}

/**
 * Resets the progress for a single chapter. Note: This does not reset the main repo state.
 * @param {HTMLElement} button - The reset button that was clicked.
 */
function resetChapter(button) {
    const chapterElement = button.closest('.chapter');
    const chapterNum = parseInt(chapterElement.getAttribute('data-chapter'), 10);
    
    delete progress[chapterNum];

    chapterElement.classList.remove('completed');
    chapterElement.classList.remove('review-due');
    
    const terminalContent = chapterElement.querySelector('.terminal');
    const firstLine = terminalContent.querySelector('.terminal-line');
    
    while (firstLine.nextSibling) {
        terminalContent.removeChild(firstLine.nextSibling);
    }
    
    const input = firstLine.querySelector('input');
    input.value = '';
    input.disabled = false;
    
    chapterElement.querySelectorAll('.command-variations').forEach(el => el.style.display = 'none');
    
    updateProgressBar();
    saveState();
}

/**
 * Handles the logic for the interactive merge conflict editor.
 * @param {string} chapterId - The ID of the chapter containing the conflict.
 */
function resolveConflict(chapterId) {
    const editor = document.getElementById(`conflictEditor${chapterId}`);
    const textarea = document.getElementById(`conflictText${chapterId}`);
    const errorDiv = editor.querySelector('.error');
    const text = textarea.value;

    if (text.includes('<<<<<<<') || text.includes('=======') || text.includes('>>>>>>>')) {
        errorDiv.innerHTML = `❌ Still contains conflict markers! Delete the markers and the version of the code you don't want.`;
        errorDiv.style.display = 'block';
    } else if (text.trim() === '') {
        errorDiv.innerHTML = `❌ You deleted everything! Keep one of the h1 tags.`;
        errorDiv.style.display = 'block';
    } else {
        errorDiv.style.display = 'none';
        editor.innerHTML = `<span class="success">✓ File content saved. Now you must stage this change to mark the conflict as resolved.</span>`;
        const terminalContent = document.getElementById(`terminal${chapterId}`);
        setTimeout(() => addTerminalLine(terminalContent, 'main $', "Stage the fix: git add index.html", "git add index.html", chapterId + '-2'), 1000);
    }
}

/**
 * Generates the output for a 'git status' command based on the current repo state.
 */
function getGitStatus() {
    let output = `On branch ${gitRepo.HEAD}\n`;
    let stagedFiles = Object.keys(gitRepo.stagingArea);
    let unstagedFiles = Object.keys(gitRepo.workingDirectory);
    if (stagedFiles.length > 0) {
        output += '\nChanges to be committed:\n';
        stagedFiles.forEach(file => {
            output += `  <span class="status-staged">new file:   ${file}</span>\n`;
        });
    }
    if (unstagedFiles.length > 0) {
        output += '\nUntracked files:\n';
        unstagedFiles.forEach(file => {
            output += `  <span class="status-unstaged">${file}</span>\n`;
        });
    }
    if (stagedFiles.length === 0 && unstagedFiles.length === 0) {
        output += '\nnothing to commit, working tree clean';
    }
    return output;
}

/**
 * Returns the appropriate success message for a given command.
 * @param {string} command - The command that was successfully executed.
 */
function getSuccessMessage(command) {
    const cmdParts = command.toLowerCase().split(' ');
    const cmd = cmdParts[1];
    const messages = {
        'config': `✓ Config value set. Now Git knows who to blame.`,
        'clone': `✓ Cloning into 'project'...\nRemote 'origin' set to URL.\nCongratulations, the code is now your problem.`,
        'init': `✓ Fine. A .git folder now exists. Don't touch it.`,
        'status': getGitStatus(), 
        'add': `✓ 'README.md' is staged. Are you going to commit it this century?`,
        'commit': `✓ [main (root-commit) c1a2b3d] Add initial README\n 1 file changed, 1 insertion(+)\n create mode 100644 README.md`,
        'log': `commit c1a2b3d (HEAD -> main)\nAuthor: Your Name <you@example.com>\nDate:   Fri Aug 01 2025\n\n    Add initial README`,
        'branch': `✓ Great. Another reality to manage. Branch 'feature/login' created.`,
        'switch': `✓ Switched to branch 'feature/login'. Try not to break it.`,
        'stash': `✓ Saved working directory and index state WIP on feature/login: c1a2b3d Add initial README\nPoof! Your changes are gone, safely hidden away.`,
        'remote': `✓ Remote 'origin' added. It's the cloud's problem now.`,
        'push': `✓ Enumerating objects: 3, done.\nCounting objects: 100% (3/3), done.\nWriting objects: 100% (3/3), 230 bytes | 230.00 KiB/s, done.\nTotal 3 (delta 0), reused 0 (delta 0)\nTo https://github.com/user/repo.git\n * [new branch]      main -> main\nBranch 'main' set up to track remote branch 'main' from 'origin'.`,
        'fetch': `✓ From https://github.com/user/repo\n * [new branch]      main       -> origin/main\nDownloaded their changes. Now you can inspect them safely.`,
        'pull': `✓ From https://github.com/user/repo\n   c1a2b3d..e4f5g6h  main       -> origin/main\nUpdating c1a2b3d..e4f5g6h\nFast-forward\n README.md | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)\nTheir changes are now your changes.`,
        'merge': `✓ Updating c1a2b3d..e4f5g6h\nFast-forward\n login.js | 10 ++++++++++\n 1 file changed, 10 insertions(+)\n create mode 100644 login.js\nTimelines combined. Let's hope you didn't create a monster.`,
        'diff': `diff --git a/README.md b/README.md\nindex e69de29..a03db02 100644\n--- a/README.md\n+++ b/README.md\n@@ -0,0 +1 @@\n<span class="success">+Hello, world!</span>`,
        'reset': `✓ Unstaged changes after reset:\nM\tREADME.md\nYour mistake has been erased from local history. You're welcome.`,
        'revert': `✓ [main 3d4e5f6] Revert "Bad commit message"\n 1 file changed, 1 insertion(+), 1 deletion(-)\nA new commit has been made that undoes the last one. History is preserved, and you look responsible.`,
        'clean': `✓ Would remove untracked.log\nThat's what it would do. Add '-f' to actually do it.`,
        'rebase': `✓ In a real terminal, an editor would open with a list of your commits.\nYou have the power to rewrite time. Don't abuse it.`,
        'cherry-pick': `✓ [main 6g7h8i9] Copied commit a1b2c3d\nThat commit is now yours. The perfect crime.`,
        'reflog': `c1a2b3d HEAD@{0}: commit (initial): Add initial README\na4b5c6d HEAD@{1}: commit: Some other commit\nThere's your safety net.`,
        'blame': `^c1a2b3d (Your Name 2025-08-01 16:31:25 +0530 1) # My Project\nNow you know who to 'ask'.`,
        'tag': `✓ Tag 'v1.0' created. A glorious milestone.`,
        'bisect': `✓ Bisecting: 12 revisions left to test after this (roughly 4 steps)\nThe hunt begins.`,
        'worktree': `✓ Preparing worktree (new branch 'hotfix')\nHEAD is now at c1a2b3d\nA new folder '../hotfix' has been created. Go break things in there.`
    };
    return messages[cmd] || `✓ Command executed, I guess.`;
}

/**
 * The main handler for all user terminal input.
 * @param {HTMLElement} input - The input element that triggered the command.
 */
function handleCommand(input) {
    const expected = input.getAttribute('data-expected');
    const userInput = input.value.trim();
    const terminalId = input.getAttribute('data-terminal');
    const chapterElement = input.closest('.chapter');
    const chapterNum = chapterElement.getAttribute('data-chapter');
    const terminalContent = input.closest('.terminal');
    const graphContainer = chapterElement.querySelector('.git-graph-container');

    const prevError = terminalContent.querySelector('.error');
    if (prevError) prevError.remove();

    const normalizedUserInput = userInput.toLowerCase().replace(/\s+/g, ' ');
    const normalizedExpected = expected.toLowerCase().replace(/\s+/g, ' ');

    if (normalizedUserInput === normalizedExpected) {
        
        switch (terminalId) {
            case '4':
                if (gitRepo.workingDirectory['README.md']) {
                    delete gitRepo.workingDirectory['README.md'];
                    gitRepo.stagingArea['README.md'] = 'added';
                }
                break;
            case '5': 
                if (Object.keys(gitRepo.stagingArea).length > 0) {
                    const newCommitId = 'c' + (Object.keys(gitRepo.commits).length);
                    const parentCommit = gitRepo.branches[gitRepo.HEAD];
                    gitRepo.commits[newCommitId] = { parent: parentCommit, msg: `Commit ${newCommitId}` };
                    gitRepo.branches[gitRepo.HEAD] = newCommitId;
                    gitRepo.stagingArea = {};
                }
                break;
            case '7':
                gitRepo.branches['feature/login'] = gitRepo.branches[gitRepo.HEAD];
                break;
            case '7-2':
                gitRepo.HEAD = 'feature/login';
                break;
        }
        
        const successMessage = getSuccessMessage(expected);
        const output = document.createElement('div');
        output.className = 'output'; 
        output.innerHTML = successMessage;
        input.parentElement.insertAdjacentElement('afterend', output);
        input.disabled = true;

        if (graphContainer) {
            renderGraph(graphContainer, gitRepo);
        }
        
        let nextStep = null;
        switch (terminalId) {
            case '0':
                nextStep = () => addTerminalLine(terminalContent, '~ $', "Set your email: git config --global user.email 'you@example.com'", "git config --global user.email 'you@example.com'", '0-2');
                break;
            case '7':
                nextStep = () => addTerminalLine(terminalContent, 'main $', 'Switch to the new branch: git switch feature/login', 'git switch feature/login', '7-2');
                break;
        }

        if (nextStep) {
            setTimeout(nextStep, 1000);
        } else {
            updateProgressAndCompletion(chapterNum);
            const variationsBoxes = chapterElement.querySelectorAll('.command-variations');
            if(variationsBoxes.length > 0) {
                 setTimeout(() => {
                    variationsBoxes.forEach(box => box.style.display = 'block');
                    variationsBoxes[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 500);
            }
        }
    } else {
        const error = document.createElement('div');
        error.className = 'output error';
        error.innerHTML = `❌ <strong>Command not recognized.</strong><br>Expected a command similar to: <code>${expected}</code><br>You typed: <code>${userInput}</code>`;
        input.parentElement.insertAdjacentElement('afterend', error);
        input.value = '';
        input.focus();
    }
}

/**
 * Marks the .gitignore chapter as complete.
 * @param {HTMLElement} button - The save button that was clicked.
 */
function completeGitignoreChapter(button) {
    const chapterElement = button.closest('.chapter');
    const chapterNum = chapterElement.dataset.chapter;
    
    button.disabled = true;
    button.textContent = '✓ Saved!';
    
    updateProgressAndCompletion(chapterNum);
    
    const variationsBox = chapterElement.querySelector('.command-variations');
    if (variationsBox) {
        variationsBox.style.display = 'block';
    }
}

/**
 * Marks a conceptual chapter (like the PR chapter) as complete.
 * @param {HTMLElement} button - The confirmation button that was clicked.
 */
function completeConceptualChapter(button) {
    const chapterElement = button.closest('.chapter');
    const chapterNum = chapterElement.dataset.chapter;

    button.disabled = true;
    button.textContent = '✓ Understood!';
    button.style.background = '#27ae60';

    updateProgressAndCompletion(chapterNum);

    const variationsBox = chapterElement.querySelector('.command-variations');
    if (variationsBox) {
        variationsBox.style.display = 'block';
    }
}