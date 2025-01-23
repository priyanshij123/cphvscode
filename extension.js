const vscode = require('vscode');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function activate(context) {
    console.log('Congratulations, your extension "cph-vscode" is now active!');

    const fetchTestCasesCommand = vscode.commands.registerCommand('cph-vscode.fetchTestCases', async function () {
        const url = await vscode.window.showInputBox({
            placeHolder: 'Enter the LeetCode problem URL',
            prompt: 'Please enter the URL of a LeetCode problem (e.g., https://leetcode.com/problems/...)'
        });

        if (url) {
            console.log(`LeetCode problem URL: ${url}`);
            vscode.window.showInformationMessage(`LeetCode problem URL: ${url}`);
            
            fetchTestCases(url).then((data) => {
                const inputs = data[0].map(clean);
                const outputs = data[1].map(clean);

                const directory = getTestCaseDirectory();
                saveTestCases(inputs, outputs, directory);
            }).catch((error) => {
                vscode.window.showErrorMessage(`Error fetching test cases: ${error.message}`);
            });
        } else {
            vscode.window.showErrorMessage('No URL entered!');
        }
    });

    context.subscriptions.push(fetchTestCasesCommand);

    const runTestCasesCommand = vscode.commands.registerCommand('cph-vscode.runTestCases', async function () {
        vscode.window.showInformationMessage('Running test cases...');

    try {
        await executeSolutionFile();

        const directory = getTestCaseDirectory();
        await executeCode(directory);

        vscode.window.showInformationMessage('Test cases completed successfully!');
    } catch (error) {
        vscode.window.showErrorMessage(`Error running test cases: ${error}`);
    }
});
    context.subscriptions.push(runTestCasesCommand);
}

function deactivate() {}

const fetchTestCases = async (url) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('.elfjS');

    const data = await page.evaluate(() => {
        const inputs = [];
        const outputs = [];

        const dataContainer = document.querySelector('.elfjS');
        const textList = dataContainer.querySelectorAll('pre');

        textList.forEach((textElement) => {
            const content = textElement.innerText.trim();

            const inputMatch = content.match(/^Input:\s*(.+)$/m);
            const outputMatch = content.match(/^Output:\s*(.+)$/m);

            if (inputMatch) inputs.push(inputMatch[1].trim());
            if (outputMatch) outputs.push(outputMatch[1].trim());
        });

        return [inputs, outputs];
    });

    await browser.close();
    return data;
};

const clean = (rawInput) => {
    let cleanedArray = rawInput
        .split(/\b[a-zA-Z_]+\s*=\s*/) 
        .filter(part => part.trim() !== "") 
        .map(part => part.trim()) 
        .map(part => part
            .replace(/"/g, '')
            .replace(/^\[|\]$/g, '')
            .replace(/\],\s*\[/g, '\n') 
            .replace(/[\[\]]/g, '') 
            .replace(/,/g, ' ') 
            .trim() 
        );

    let cleaned = cleanedArray.join('\n');
    return cleaned;
};

const saveTestCases = (inputs, outputs, directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    inputs.forEach((input, index) => {
        const inputFilePath = path.join(directory, `input_${index + 1}.txt`);
        fs.writeFileSync(inputFilePath, input, 'utf8');
        console.log(`Saved: ${inputFilePath}`);
    });

    outputs.forEach((output, index) => {
        const outputFilePath = path.join(directory, `output_${index + 1}.txt`);
        fs.writeFileSync(outputFilePath, output, 'utf8');
        console.log(`Saved: ${outputFilePath}`);
    });

    vscode.window.showInformationMessage(`Test cases saved in the "${directory}" folder.`);
};

const executeCode = (testCaseDir) => {
    return new Promise((resolve, reject) => {
        const inputFiles = fs.readdirSync(testCaseDir).filter((file) => file.startsWith("input_"));
        const outputFiles = fs.readdirSync(testCaseDir).filter((file) => file.startsWith("output_"));

        inputFiles.forEach((inputFile, index) => {
            const inputPath = path.join(testCaseDir, inputFile);
            const expectedOutputPath = path.join(testCaseDir, `output_${index + 1}.txt`);
            const actualOutputPath = path.join(testCaseDir, `output_actual_${index + 1}.txt`);

            const input = fs.readFileSync(inputPath, "utf8");
            let expectedOutput = fs.readFileSync(expectedOutputPath, "utf8").trim();
            let actualOutput = fs.readFileSync(actualOutputPath, "utf8").trim();

            expectedOutput = clean(expectedOutput);
            actualOutput = clean(actualOutput);

            const normalize = (str) => str.replace(/\s+/g, ' ').trim();

          const  normalexpectedOutput = normalize(expectedOutput);
          const normalactualOutput = normalize(actualOutput);

            console.log(`Test Case ${index + 1}:`);
            console.log(`Input: ${input}`);
            console.log(`Expected Output: ${expectedOutput}`);
            console.log(`Actual Output: ${actualOutput}`);

            if (normalexpectedOutput === normalactualOutput) {
                console.log("Passed\n");
            } else {
                console.log("Failed\n");
            }

            fs.writeFileSync(actualOutputPath, "", "utf8");
            if (index === inputFiles.length - 1) {
                resolve();
            }
        });
    });
};


const getTestCaseDirectory = () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        return path.join(workspaceFolders[0].uri.fsPath, 'test_cases');
    }
    return path.join(__dirname, 'test_cases');
};



const executeSolutionFile = () => {
    return new Promise((resolve, reject) => {
        const solutionFileCpp = path.join(__dirname, 'solution.cpp');
        const solutionFilePy = path.join(__dirname, 'solution.py');
        const solutionFile = fs.existsSync(solutionFileCpp)
            ? solutionFileCpp
            : fs.existsSync(solutionFilePy)
            ? solutionFilePy
            : null;

        if (!solutionFile) {
            vscode.window.showErrorMessage('Solution file (solution.cpp or solution.py) not found.');
            reject('Solution file not found.');
            return;
        }

        // Construct command
        const command = solutionFile.endsWith('.cpp')
            ? `g++ "${solutionFile}" -o solution && solution`
            : `python "${solutionFile}"`;

        // Execute command
        exec(command, (error, stdout, stderr) => {
            if (error || stderr) {
                vscode.window.showErrorMessage(`Error executing solution file: ${stderr || error.message}`);
                reject(`Error executing solution file: ${stderr || error.message}`);
            } else {
                console.log(stdout);
                resolve();
            }
        });
    });
};

module.exports = {
    activate,
    deactivate
};
