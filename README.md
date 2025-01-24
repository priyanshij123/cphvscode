# CPH vscode extension
The CPH (Competitive Programming Helper) vscode extension automates fetching test cases from LeetCode problems and enables users to test their solutions directly within VS Code. With features to fetch, run, and manage test cases efficiently, this extension simplifies the workflow for competitive programmers.

## 📋 Features

Fetches test cases from LeetCode problem descriptions.
Stores input and output test cases in separate text files.
Allows users to run test cases directly in the extension host window.
Supports editing and adding custom test cases.

## 🚀How it works

 1)download the Repository
https://github.com/priyanshij123/cphvscode.git  

2)Open the repository in a new VS Code window.

3)Debug the Extension:
Start debugging to launch the Extension Host window.

4)Fetching Test Cases:

Open the Command Palette (Ctrl + Shift + P ).

Search for CPH: Fetch Test Cases.

Paste the URL of the LeetCode problem when prompted.

Input and output test cases will be saved in separate .txt files in the working directory.


5)Write Your Solution:

Write your solution in the solution file using the provided template.
"Specify the test case directory in the solution file according to your PC's setup."


Reload the Extension Host window.
Use the Command Palette to run the CPH: Run Test Cases command.
View test results (Passed or Failed) in the debug console.

Use the extension to edit or add custom test cases as needed.


## Extension Settings

make sure the extension has launch.json file 


	{"version": "0.2.0",
 
	"configurations": [
 
		{
  
			"name": "Run Extension",
   
			"type": "extensionHost",
   
			"request": "launch",
   
			"args": [
   
				"--extensionDevelopmentPath=${workspaceFolder}"
    
			]
   
		}
  
	]}
 



## ⚡ Commands

CPH:Fetch Test Cases : Fetch test cases from a LeetCode problem URL.

CPH:Run Test Cases :	Execute the solution file against fetched test cases.


## 🖥 Requirements

Visual Studio Code installed on your machine.

Node.js installed .

Puppeteer (install using npm install puppeteer).

Python and/or C++ compiler installed locally.



**Enjoy!**
