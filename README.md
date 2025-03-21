# FlytBase Full-Stack Development Assignment

## Overview
This project is a real-time web chat application that enables two users to exchange text messages. It is designed to handle network failures, maintain message order, and provide a seamless user experience.

## Features
- **Real-time messaging** with Socket.io
- **Network failure handling** (offline message queueing and retries)
- **Message ordering** to ensure correct delivery sequence
- **State recovery** after browser refresh
- **Tailwind CSS** for styling

## Tech Stack
- **Frontend:** React (JavaScript, JSX, Tailwind CSS)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Real-time communication:** Socket.io

## Project Setup

### 1. Clone the Repository
```sh
git clone <repo-url>
cd flytbase-chat
```

### 2. Backend Setup
```sh
cd backend
npm install
```

#### Create a `.env` file and add:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

#### Run the Server
```sh
node server.js
```

### 3. Frontend Setup
```sh
cd ../frontend
npm install
```

#### Run the React App
```sh
npm run dev
```

## Design Decisions
- **WebSockets over HTTP Polling** for better real-time performance.
- **MongoDB for flexibility in message storage.**
- **LocalStorage for message drafts and offline recovery.**
- **Tailwind CSS for fast UI development.**

## Testing Scenarios

### **Test 1: Offline Message Queuing & Retry**
**Steps:**
1. Disable network (DevTools > Network > Offline).
2. Send 3 text messages.
3. Re-enable network.

**Expected Result:** Messages should send automatically once the connection is restored.

### **Test 2: Message Order Correction**
**Steps:**
1. Simulate packet loss (introduce delays in backend processing).
2. Send multiple messages rapidly.

**Expected Result:** Messages should appear in correct order on the recipient's side.

### **Test 3: State Recovery After Browser Refresh**
**Steps:**
1. Type a draft message without sending.
2. Refresh the browser.

**Expected Result:** The unsent message should persist.
