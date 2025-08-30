
<p align="center">    
  <img src="./github/kiba.svg">
</p> 



A **simple alerting system for Kibana**.  
You can create multiple *alerters* for each rule defined in Kibana.  

⚠️ This project is still under development (i'm more an Ops than a Dev and this is my first real project 🎉).  
It uses **NestJS** for the backend, **NextJS** for the frontend, and **Elasticsearch** as the storage layer.  

This is a early stage of the project, so there are still bugs and issues. 



---


## ✅ Current Features

- 🔔 **Discord Alerters**  ([Discord Bot](https://discord.com/developers/docs/quick-start/overview-of-apps)) 
- 💬 **Slack Alerters**  ([Slack App](https://api.slack.com/apps))
- 📧 **Email Alerters**  (SMTP)
- 🚨 **Teams Alerters** ([Webhook](https://learn.microsoft.com/fr-fr/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook?tabs=newteams%2Cdotnet) & [AdaptiveCards](https://adaptivecards.microsoft.com/designer))
- 😱 **Emoji & placeholders** 
- 🖍️ **Rule selection**
- ⏱️ **Start/Pause/Stop notifications globally**

<p align="center" >
  <img src="https://github.com/user-attachments/assets/678a0251-0bae-4513-bb2b-86bd5e774756" width="800" />
  <img src="https://github.com/user-attachments/assets/0bbd0033-762f-4967-a7e6-67578cfec08f" width="800" />
  <img src="https://github.com/user-attachments/assets/d0f6b7e8-93f9-4e47-a41c-1b03025d2666" width="800" />
</p>




 
---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Lucasp381/kib.A.git
cd kib.A
```

### 2. Start Elasticsearch & Kibana locally

```bash
curl -fsSL https://elastic.co/start-local | sh
```

Create API Key with enought privileges : 

Dev Tools:
```
POST /_security/api_key
{
  "name": "read-only-key",
  "role_descriptors": {
    "read-only-role": {
      "cluster": [
        "monitor"
      ],
      "indices": [
        {
          "names": [ "*alerts*" ],
          "privileges": [ "read" ],
          "allow_restricted_indices": false
        },
        {
          "names": [ "kiba*" ],
          "privileges": [ "all" ],
          "allow_restricted_indices": false
        }
      ],
      "applications": [
        {
          "application": "kibana-.kibana",
          "privileges": [ "read" ],
          "resources": [ "space:default" ]
        }
      ],
      "run_as": [],
      "metadata": {},
      "transient_metadata": {
        "enabled": true
      }
    }
  }
}

```
change `"names": [ "kiba*" ],` with your custom index prefix
Kib.A creates 4 index: 
- {prefix}-variables
- {prefix}-alerters
- {prefix}-settings
- {prefix}-history

### 3. Create `.env` files

#### 📂 .env
```env
KIBANA_URL="http://host.docker.internal:5601" # URL for Kibana instance
ELASTIC_URL="http://host.docker.internal:9200" # Elasticsearch node URL
ELASTIC_API_KEY='API-KEY-HERE' # Replace with your actual API key
KIBA_INDEX_PREFIX="kiba" # Prefix for Kib.A indices allow multiple instances
POLL_EVERY=10 # Time in seconds to poll Elasticsearch for new alerts
ENCRYPTION_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=" # Encryption key for sensitive data ( openssl  rand -base64 32 )

# Insecure option, not recommended in production :
ELASTIC_TLS_REJECT_UNAUTHORIZED=false
NODE_TLS_REJECT_UNAUTHORIZED=0
```


### 4. Start Kiba

```bash
docker compose up --build
```

### 5. Access WebUI

first run, init elasticsearch indexes : `http://localhost:8080/api/internal/init`

```bash
http://localhost:8080
```

### 6. Create alerters

**Discord**: 
- Require a Discord Bot Token
- Channel ID

**Slack**:
- Require Slack Apps token
- Permissions:
  - Public channels:     
    - channels:read
    - chat:write
    - chat:write.public
  - Privates channels:
    - groups:write
    - groups:read
      
**Teams**:
- Webook url

**Email**:
- Require SMTP server 
- username & password

## Tips
- You can add `KIBANA_URL` variable in settings > Variables to be able to double click on alerts and rules in the Dashboard
- You can pause programatically the notifications :
```curl
curl 'http://127.0.0.1:3000/api/backend/worker/pause' \
  -H 'Content-Type: application/json' \
  --data-raw '{"minutes":5}'
```
## 🛠 Tech Stack

- [NestJS](https://nestjs.com/) – Backend  
- [NextJS](https://nextjs.org/) – Frontend  
- [Elasticsearch](https://www.elastic.co/elasticsearch/) – Storage  

---

## 📌 Roadmap

- [x] UI for managing alerters  
- [x] Add Microsoft Teams integration  
- [X] Dockerized deployment
- [X] Add Telegram 
- [ ] Add Custom alerters
- [ ] Scheduled mute windows
- [ ] Secure connection

---

## Screenshots
|                                                        |                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| ![](./github/dashboard.png)                                 | ![](./github/dashboard-d.png)|
| ![](./github/alerters-discord.png)                          | ![](./github/alerters-teams.png  )|
| ![](./github/teams-alert.png)                            | ![](./github/discord-alert.png)|




