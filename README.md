# @supervaize/n8n-nodes-supervaizer

[![n8n Version](https://img.shields.io/badge/n8n-1.0%2B-orange.svg)](https://n8n.io)
[![Supervaize](https://img.shields.io/badge/Supervaize-Integration-blue.svg)](https://supervaize.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**The official n8n integration for [Supervaize](https://supervaize.com).**

Turn your n8n workflows into powerful AI Agents that are discoverable, observable, and interoperable within the Supervaize ecosystem.

## Description

**n8n-supervaizer** enables seamless integration between n8n and the Supervaize platform. It allows you to:

- 🤖 **Register n8n workflows as Agents**: Make your workflows discoverable and callable by other agents and systems.
- 🚀 **Trigger workflows from Supervaize**: Start n8n jobs directly from the Supervaize platform or via API.
- 📊 **Real-time Observability**: Report detailed progress, status updates, and deliverables back to Supervaize.
- 👤 **Human-in-the-Loop**: Pause workflows to request human approval or input via Supervaize's interface.
- 🔐 **Secure Communication**: Built-in HMAC signature validation for secure webhook interactions.

This package implements the Supervaize Controller protocol for n8n, making your low-code workflows first-class citizens in the Agent-to-Agent (A2A) economy.

## Features

### Core Nodes

| Node                              | Description                                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Supervaize Agent Registration** | Registers your workflow as an Agent. Defines methods (start, stop) and parameters that Supervaize can use to control it.              |
| **Supervaize Trigger**            | The entry point for your agent. Listens for Job Start events from Supervaize, validating security signatures and parsing job context. |
| **Supervaize Event**              | The voice of your agent. Sends `job.start`, `job.progress`, `case.update`, and `job.end` events to keep Supervaize in sync.           |
| **Supervaize Human-in-the-Loop**  | Adds human oversight. Pauses the workflow, sends a form to Supervaize, and resumes only when a human provides the answer.             |
| **Supervaize Command Trigger**    | Listens for control signals like "Stop Job" to gracefully handle cancellations.                                                       |

### Protocol Support

By using these nodes, your n8n workflows automatically participate in:

- **Supervaize Control Protocol**: For job orchestration and monitoring.
- **A2A / ACP**: Indirectly supported via Supervaize's interoperability layer.

## Quick Start

### 1. Installation

In your n8n instance:

1.  Go to **Settings** > **Community Nodes**.
2.  Select **Install**.
3.  Enter `@supervaize/n8n-nodes-supervaizer`.
4.  Agree to the terms and install.

### 2. Setup Credentials

1.  In n8n, create a new Credential type: **Supervaize API**.
2.  Enter your **Base URL** (e.g., `https://app.supervaize.com`).
3.  Enter your **API Key** (from your Supervaize Developer Settings).

### 3. Create Your First Agent

1.  Create a new workflow.
2.  Add a **Supervaize Trigger** node.
3.  Add a **Supervaize Agent Registration** node (connect it to a manual trigger for one-time setup, or keep it separate).
4.  Configure the Registration node with your Agent Name and Slug.
5.  Run the Registration node once to register the agent.
6.  Build your workflow logic! Use **Supervaize Event** nodes to report progress.

## Development

If you want to contribute or modify these nodes:

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/supervaize/n8n-nodes-supervaizer.git
    cd n8n-nodes-supervaizer
    ``` 

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Build the project**:

    ```bash
    npm run build
    ```

    Or use `just build` if you have [Just](https://github.com/casey/just) installed.

4.  **Link to local n8n**:

    ```bash
    npm link
    cd ~/.n8n/nodes
    npm link @supervaize/n8n-nodes-supervaizer
    ```

5.  **Run Tests**:
    ```bash
    npm test
    ```

## Documentation

For full documentation on the Supervaize platform and the Controller protocol, visit [doc.supervaize.com](https://doc.supervaize.com).

## License

MIT
