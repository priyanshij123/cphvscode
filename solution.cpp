#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> num_map;  
    vector<int> result;

    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (num_map.find(complement) != num_map.end()) {
            result.push_back(num_map[complement]);
            result.push_back(i);
            return result;
        }
        num_map[nums[i]] = i;
    }

    return result;  
}

bool parseInputFile(const string& inputFilePath, vector<int>& nums, int& target) {
    ifstream inputFile(inputFilePath);
    if (!inputFile.is_open()) {
        cerr << "Error: Could not open file " << inputFilePath << endl;
        return false;
    }

    string line;
  
    getline(inputFile, line);
    stringstream ss(line);
    string num;
    while (ss >> num) {
        try {
            nums.push_back(stoi(num));  
        } catch (const std::invalid_argument& e) {
            cerr << "Error: Invalid number format in input line: " << num << endl;
            inputFile.close();
            return false;
        }
    }

    getline(inputFile, line);
    target = stoi(line);  

    inputFile.close();
    return true;
}

void writeOutputFile(const string& outputFilePath, const vector<int>& result) {
    ofstream outputFile(outputFilePath);
    if (!outputFile.is_open()) {
        cerr << "Error: Could not open file " << outputFilePath << endl;
        return;
    }

    if (!result.empty()) {
        outputFile << result[0] << " " << result[1] << endl;
    } else {
        outputFile << "No solution found";
    }

    outputFile.close();
}

bool fileExists(const string& filePath) {
    ifstream file(filePath);
    return file.is_open();
}

int main() {
    //user needs to specify directory of test_cases folder//
    string baseDir = "D:/html/open_project/cph-vscode/test_cases"; 

    int testCaseNumber = 1;

    while (true) {
        string inputFileName = baseDir + "/input_" + to_string(testCaseNumber) + ".txt";
        string outputFileName = baseDir + "/output_actual_" + to_string(testCaseNumber) + ".txt";
        
        if (!fileExists(inputFileName)) {
            cout << "No more test case files found. Exiting." << endl;
            break;
        }

        vector<int> nums;
        int target;
        if (!parseInputFile(inputFileName, nums, target)) {
            break;  
        }

        vector<int> result = twoSum(nums, target);

        writeOutputFile(outputFileName, result);

        cout << "Processed: " << inputFileName << " -> " << outputFileName << endl;

        testCaseNumber++;
    }

    return 0;
}
