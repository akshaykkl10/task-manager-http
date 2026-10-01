# System Information CLI

A command-line application built with Node.js and TypeScript that displays basic system information.

The project separates system-information collection from CLI command parsing and uses Vitest for automated testing.

## Requirements

Make sure the following are installed:

- Node.js
- npm

Check your installed versions:

```bash
node --version
npm --version
```

## Installation

Clone the repository and move into the project directory:

```bash
git clone <repository-url>
cd system-info-cli
```

Install the dependencies:

```bash
npm install
```

## Build

Compile the TypeScript source code:

```bash
npm run build
```

The compiled JavaScript files are generated inside the `dist/` directory.

## Usage

Run the CLI with:

```bash
npm start -- <command>
```

### Available Commands

#### Node.js Version

```bash
npm start -- version
```

Displays the currently installed Node.js version.

Example:

```text
Node.js: v22.19.0
```

#### Operating System

```bash
npm start -- os
```

Displays the operating-system platform and CPU architecture.

Example:

```text
Platform: linux
Architecture: x64
```

#### Memory Information

```bash
npm start -- memory
```

Displays total and currently available free system memory.

Example:

```text
Total memory: 15.49 GB
Free memory: 7.21 GB
```

#### Current Working Directory

```bash
npm start -- cwd
```

Displays the directory from which the CLI is being executed.

Example:

```text
Current working directory: /home/user/system-info-cli
```

#### Environment Variables

```bash
npm start -- env
```

Displays the names of available environment variables.

Environment variable values are intentionally not displayed to avoid exposing potentially sensitive information.

Example:

```text
HOME
PATH
SHELL
USER
```
### JSON Output

The CLI supports an optional `--json` flag for machine-readable output.


```bash
npm start -- os --json
```
For example:
```text
{
  "platform": "linux",
  "architecture": "x64"
}
```

## Invalid Commands

If an unsupported command is provided:

```bash
npm start -- unknown
```

the CLI reports an error and exits with a non-zero exit status.

Example:

```text
Unknown command. Available commands: version, os, memory, cwd, env
```

## Testing

The project uses Vitest for automated testing.

Run the test suite with:

```bash
npm test
```

The tests cover:

- Node.js version retrieval
- Operating-system information
- Memory information
- Current working directory
- Environment variable names
- Valid command parsing
- Invalid command handling
- Empty command arguments

## Project Structure

```text
system-info-cli/
├── src/
│   ├── cli.ts
│   └── systemInfo.ts
├── tests/
│   └── systemInfo.test.ts
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

### `src/systemInfo.ts`

Contains the functions responsible for collecting system information using Node.js APIs.

### `src/cli.ts`

Handles command-line argument parsing, command execution, output formatting, and invalid command handling.

### `tests/systemInfo.test.ts`

Contains Vitest tests for the system-information functions and command parser.

## NPM Scripts

### Build

```bash
npm run build
```

Compiles TypeScript into JavaScript.

### Test

```bash
npm test
```

Runs the Vitest test suite.

### Start

```bash
npm start -- <command>
```

Runs the compiled CLI with the specified command.

## Quick Start

After cloning the repository:

```bash
npm install
npm run build
npm test
npm start -- version
npm start -- version --json
```
