| 📄 Document  | N8N Supervaizer Requirements                                             |
| ------------ | ------------------------------------------------------------------------ |
| 🏢 Project   | n8n-supervaizer                                                          |
| ✍️ Author    | ALP + AI Assistant                                                       |
| 🗓️ Date      | 2025-11-27                                                               |
| 🏷️ Version   | v1.0                                                                     |
| 🛠️ Status    | Quick Summary                                                            |
| 📚 Reference | [N8N Community Nodes](https://docs.n8n.io/integrations/community-nodes/) |
|              | [Supervaize Application](../../supervaize)                               |
|              | [Python Supervaizer](../../supervaizer)                                  |

# N8N Integration - Quick Summary

## Overview

The **@supervaize/n8n-nodes-supervaizer** package enables n8n workflows to function as AI agents within the Supervaize platform. This creates a powerful integration where:

- 🤖 **N8N workflows = Supervaize agents**
- 🚀 **Supervaize jobs = N8N workflow executions**
- 📊 **Real-time progress tracking** via events
- 👤 **Human-in-the-loop** support for approvals
- 🔐 **Secure webhook-based communication**

---

## Core Nodes

### 1. **Supervaize Agent Registration** (Action Node)

**Purpose**: Register the n8n workflow as an agent in Supervaize

**Key Features**:

- Configure agent name, description, and metadata
- Define job start/stop/status methods
- Set up agent parameters (optional, managed in Supervaize)
- Receive webhook URL and secret for job triggers

**Outputs**: `agentId`, `webhookUrl`, `webhookSecret`

---

### 2. **Supervaize Trigger** (Webhook Trigger)

**Purpose**: Start the workflow when Supervaize initiates a job

**Key Features**:

- Secure webhook with HMAC signature validation
- Receives job variables and parameters
- Provides mission context and files
- Auto-responds with 202 Accepted

**Outputs**: Full job payload including `job_id`, `job_variables`, `parameters`, `context`

---

### 3. **Supervaize Event** (Action Node)

**Purpose**: Send progress events to Supervaize

**Supported Events**:

- `job.start.confirmation` - Confirm job started
- `job.progress` - Report job progress
- `job.end` - Job completed
- `job.failed` - Job failed
- `case.start` - New case started
- `case.update` - Case progress update (also used for human-in-the-loop with `supervaizer_form`)
- `case.end` - Case completed

**Key Features**:

- Auto-includes job_id from context
- Support for deliverables (files/data)
- Cost tracking per event
- Case step indexing

---

### 4. **Supervaize Human-in-Loop** (Wait Node)

**Purpose**: Pause workflow and wait for human input from Supervaize

**Key Features**:

- Define custom form fields
- Send question to Supervaize
- Pause workflow execution
- Resume when user provides answer
- Configurable timeout

**Outputs**: User's response data, answeredBy, answeredAt

---

## Typical Workflow Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  1. SETUP (One-time)                                            │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Supervaize Agent Registration                       │       │
│  │  - Configure agent details                           │       │
│  │  - Define methods and parameters                     │       │
│  │  - Get webhook URL                                   │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  2. JOB EXECUTION (Triggered by Supervaize)                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Supervaize Trigger (Webhook)                        │       │
│  │  - Receives job from Supervaize                      │       │
│  │  - Validates signature                               │       │
│  │  - Starts workflow                                   │       │
│  └────────────────┬─────────────────────────────────────┘       │
│                   │                                             │
│                   ▼                                             │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Supervaize Event: job.start.confirmation            │       │
│  └────────────────┬─────────────────────────────────────┘       │
│                   │                                             │
│                   ▼                                             │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Process Data / Business Logic                       │       │
│  └────────────────┬─────────────────────────────────────┘       │
│                   │                                             │
│                   ▼                                             │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Loop: For each item                                 │       │
│  │  ┌────────────────────────────────────────────────┐  │       │
│  │  │  Supervaize Event: case.start                  │  │       │
│  │  └──────────────┬─────────────────────────────────┘  │       │
│  │                 │                                    │       │
│  │                 ▼                                    │       │
│  │  ┌────────────────────────────────────────────────┐  │       │
│  │  │  Process Item                                  │  │       │
│  │  └──────────────┬─────────────────────────────────┘  │       │
│  │                 │                                    │       │
│  │                 ▼                                    │       │
│  │  ┌────────────────────────────────────────────────┐  │       │
│  │  │  Supervaize Human-in-Loop (if needed)          │  │       │
│  │  │  - Send approval request                       │  │       │
│  │  │  - Wait for user response                      │  │       │
│  │  │  - Resume with answer                          │  │       │
│  │  └──────────────┬─────────────────────────────────┘  │       │
│  │                 │                                    │       │
│  │                 ▼                                    │       │
│  │  ┌────────────────────────────────────────────────┐  │       │
│  │  │  Supervaize Event: case.end                    │  │       │
│  │  └────────────────────────────────────────────────┘  │       │
│  └──────────────────────────────────────────────–───────┘       │
│                   │                                             │
│                   ▼                                             │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Supervaize Event: job.end                           │       │
│  │  - Include summary and deliverables                  │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key API Endpoints

All events use the unified endpoint: `POST /w/{team_slug}/api/v1/ctrl-events/`

- **Agent Registration**: `server.register` event type
- **Job Events**: `agent.job.start.confirmation`, `agent.job.end`, `agent.job.failed`
- **Case Events**: `agent.case.start`, `agent.case.update`, `agent.case.end`
- **Webhooks**: Supervaize → N8N (job trigger, HITL callback) with HMAC signature validation

---

## Security

- **Webhook Signatures**: HMAC-SHA256 validation on all incoming webhooks
- **API Keys**: Stored encrypted in n8n credentials, workspace-scoped
- **HTTPS**: All communications over HTTPS

---

## Human-in-the-Loop Pattern

### Flow

1. **N8N sends question** via `Supervaize Event` node using `case.update` event type with `supervaizer_form` in the payload
2. **Workflow pauses** using `Supervaize Human-in-Loop` node (Wait Node)
3. **Supervaize notifies user** via configured channels (Slack, Email, Web)
4. **User provides answer** in Supervaize UI
5. **Supervaize sends callback** to N8N webhook (via Command Trigger)
6. **Workflow resumes** with user's response data

### Form Definition (in case.update payload)

The `supervaizer_form` is included in the `case.update` event payload:

```json
{
  "supervaizer_form": {
    "question": "Approve Customer Onboarding?",
    "answer": {
      "fields": [
        {
          "name": "approved",
          "type": "boolean",
          "field_type": "BooleanField",
          "required": true
        },
        {
          "name": "notes",
          "type": "string",
          "field_type": "TextField",
          "required": false
        }
      ]
    }
  }
}
```

---

## Implementation Phases

See [full requirements](./n8n_integration_requirements.md#implementation-phases) for detailed checklist:

- **Phase 1**: Core nodes (Registration, Trigger, Event)
- **Phase 2**: Human-in-the-Loop support
- **Phase 3**: Advanced features (job stop, deliverables, cost tracking)
- **Phase 4**: Release preparation

---

## Example Workflow

```
[Supervaize Trigger] → [Event: job.start.confirmation]
  ↓
[Process Data] → [Event: case.start]
  ↓
[Human-in-Loop: Approval Request]
  ↓ (waits for answer)
[Process Answer] → [Event: case.end]
  ↓
[Event: job.end]
```

See [full requirements](./n8n_integration_requirements.md#example-usage-in-workflow) for detailed examples.

---

## Testing

See [full requirements](./n8n_integration_requirements.md#testing-requirements) for detailed testing strategy including unit tests, integration tests, and example workflows.

---

## Resources

- **Full Requirements**: [n8n_integration_requirements.md](./n8n_integration_requirements.md)
- **Supervaize Data Model**: [datamodel.md](./datamodel.md)
- **General Flows**: [general_flows.md](./general_flows.md)
- **N8N Docs**: https://docs.n8n.io/integrations/creating-nodes/

---

## Quick Start

1. Clone n8n nodes starter template: `git clone https://github.com/n8n-io/n8n-nodes-starter.git n8n-nodes-supervaizer`
2. Install dependencies: `npm install`
3. Create credentials and nodes (see [full requirements](./n8n_integration_requirements.md#n8n-node-creation-guide))
4. Build and test: `npm run build && npm test`
5. Link for local testing: `npm link` then `cd ~/.n8n/nodes && npm link @supervaize/n8n-nodes-supervaizer`

---

**For detailed specifications, API reference, data models, and implementation guides, see the [full requirements document](./n8n_integration_requirements.md).**
