# Assignment 2: ATM System Automated Testing
Special Practitioner Topics in Digital Technology II [Section 119]

Student ID: 6733065121
Name: Nattarat Samartkit

## Project Overview
This project involves automated testing for a simulated ATM system using the Playwright framework. The goal is to verify financial transactions including deposit, withdrawal, and transfer functions, as well as authentication flows.

## System Functions and Requirements
1. Login: Requires a 6-digit Account Number and a 4-digit PIN. Successful login should hide Login/Register buttons and display the Logout button.
2. Logout: Terminates the session and returns the UI to the initial state.
3. Deposit: Maximum limit of 100,000 THB per transaction.
4. Withdrawal: Maximum limit of 50,000 THB per transaction. Includes overdraft verification.
5. Transfer: Requires a valid 10-digit recipient account (not the user's own). Limit of 200,000 THB per transaction with a 50-character remark.
6. History: Displays a record of all completed transactions.

## Test Data
Pre-registered accounts in the system:
- 123456 | PIN: 1234
- 789012 | PIN: 5678
- 345678 | PIN: 9999
- 567890 | PIN: 0000
- 246810 | PIN: 2468
- 135791 | PIN: 1357
- 468102 | PIN: 4681

## Folder Structure (in MCV : ZIP)
All files are organized under the student ID folder as per the assignment requirements:

HW2_6733065121/
├── .github/workflows/     # CI/CD configuration
├── tests/                 # Test script directory
│   ├── deposit.spec.js    # Deposit function tests
│   ├── login_invalid.spec.js # Failed login scenarios
│   ├── login_valid.spec.js   # Successful login and UI validation
│   ├── logout.spec.js     # Session termination tests
│   ├── transfer.spec.js   # Fund transfer and remark limit tests
│   └── withdraw.spec.js   # Withdrawal and overdraft tests
├── utils/                 # Helper functions and utilities
├── package.json           # Project dependencies
├── playwright.config.js   # Playwright configuration file
└── Assignment2 ATM instruction.pdf

## Installation and Execution

1. Install dependencies:
   npm install

2. Run all tests:
   npx playwright test

3. Run tests in headed mode:
   npx playwright test --headed

## Test Scenarios
- Login with incorrect password.
- Successful login and verification of UI element visibility (Login/Register hidden, Logout shown).
- Successful Deposit, Withdrawal, and Transfer within limits.
- Negative test: Withdrawal exceeding current balance.
- Character limit verification for transfer remarks.

---
Submitted as part of HW2 for Section 119.