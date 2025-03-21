import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function Chat() {
    const [message, setMessage] = useState(localStorage.getItem("draftMessage") || "");
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState("");

    useEffect(() => {
        let storedUsername = sessionStorage.getItem("username");
        if (!storedUsername) {
            const userInput = prompt("Enter your name:");
            sessionStorage.setItem("username", userInput);
            storedUsername = userInput;
        }
        setUsername(storedUsername);

        const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
        setMessages(savedMessages);
    }, []);


    useEffect(() => {
        if (messages.length > 0) { 
            localStorage.setItem("chatMessages", JSON.stringify(messages));
        }
    }, [messages]);
    
    useEffect(() => {
        localStorage.setItem("draftMessage", message);
    }, [message]);

    //incoming messages
    useEffect(() => {
        socket.on("receiveMessage", (msg) => {
            setMessages((prev) => {
                const isDuplicate = prev.some(m => m.id === msg.id);
                if (!isDuplicate) {
                    return [...prev, msg];
                }
                return prev;
            });
        });

        return () => socket.off("receiveMessage");
    }, []);

    useEffect(() => {
        const sendQueuedMessages = () => {
            const unsentMessages = JSON.parse(localStorage.getItem("unsentMessages")) || [];
            if (unsentMessages.length > 0) {
                unsentMessages.forEach((msg) => {
                    socket.emit("sendMessage", msg, (response) => {
                        if (response.success) {
                            setMessages((prev) =>
                                prev.map((m) =>
                                    m.id === msg.id ? { ...m, status: "sent" } : m
                                )
                            );
                        }
                    });
                });
                localStorage.removeItem("unsentMessages"); // Clear queue after sending
            }
        };
    
        window.addEventListener("online", sendQueuedMessages);
        return () => window.removeEventListener("online", sendQueuedMessages);
    }, []);
    
    // Send Message
    const sendMessage = () => {
        if (!message.trim() || !username) return;
    
        const newMessage = {
            id: Date.now(),
            text: message,
            sender: username,
            timestamp: new Date().toISOString(),
            status: navigator.onLine ? "pending" : "queued", // Check network status
        };
    
        setMessages((prev) => [...prev, newMessage]);
    
        if (navigator.onLine) {
            // Send to server only if online
            socket.emit("sendMessage", newMessage, (response) => {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === newMessage.id
                            ? { ...m, status: response.success ? "sent" : "failed" }
                            : m
                    )
                );
            });
        } else {
            // Store unsent messages
            const unsentMessages = JSON.parse(localStorage.getItem("unsentMessages")) || [];
            unsentMessages.push(newMessage);
            localStorage.setItem("unsentMessages", JSON.stringify(unsentMessages));
        }
    
        setMessage(""); // Clear input
    };
    

    // Retry Failed Message
    const retryMessage = (msg) => {
        setMessages((prev) => prev.map(m => (m.id === msg.id ? { ...m, status: "pending" } : m)));
        socket.emit("sendMessage", msg, (response) => {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === msg.id ? { ...m, status: response.success ? "sent" : "failed" } : m
                )
            );
        });
    };

    // sorting messages
    const sortedMessages = [...messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return (
        <div className="flex flex-col h-screen justify-center items-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-[80vh]">
                <div className="bg-blue-500 text-white text-center py-3 font-semibold">
                    FlytBase Chat Room
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {sortedMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === username ? "justify-end" : "justify-start"}`}>
                            <div className={`p-3 rounded-lg text-white shadow-md break-words max-w-[70%] 
                                ${msg.sender === username ? "bg-blue-500" : "bg-gray-500"}`}>
                                <strong className="text-xs block">{msg.sender}</strong>
                                <span className="break-words">{msg.text}</span>
                                <div className="text-xs mt-1">
                                    {msg.status === "queued" && <span className="text-yellow-400">⏳ Sending...</span>}
                                    {msg.status === "pending" && <span className="text-yellow-400">⏳ Sending...</span>}
                                    {msg.status === "sent" && <span className="text-green-400">✅ Sent</span>}
                                    {msg.status === "delivered" && <span className="text-blue-400">📩 Delivered</span>}
                                    {msg.status === "failed" && (
                                        <span className="text-red-500 cursor-pointer" onClick={() => retryMessage(msg)}>
                                            ❌ Failed (Retry)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-3 border-t flex">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border rounded-lg p-2 outline-none"
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-blue-500 text-white px-4 py-2 ml-2 rounded-lg hover:bg-blue-600"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;
