
import { useState } from "react";
import "./Chatbot.css";

const SUGGESTED_QUESTIONS = [
  "Show my pending requests",
  "Show my approved requests",
  "Show requests above 50000",
  "How many purchase requests do I have?"
];

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! 👋 Welcome to Purchase Request Support. How can I help you today?"
    }
  ]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(message) {
    const userQuestion = message.trim();

    if (!userQuestion || loading) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setMessages(previous => [
        ...previous,
        {
          role: "assistant",
          text: "Your session has expired. Please login again."
        }
      ]);
      return;
    }

    setMessages(previous => [
      ...previous,
      { role: "user", text: userQuestion }
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ question: userQuestion })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 504) {
          throw new Error(
            "Unable to fetch your query. Please try again."
          );
        }

        if (response.status === 401) {
          throw new Error(
            "Your session has expired. Please login again."
          );
        }

        throw new Error(
          data.message || data.error ||
          "Something went wrong. Please try again."
        );
      }

      setMessages(previous => [
        ...previous,
        {
          role: "assistant",
          text: data.answer || "No response received."
        }
      ]);

    } catch (error) {
      setMessages(previous => [
        ...previous,
        {
          role: "assistant",
          text: error.message ||
            "Unable to connect to the server. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(question);
  }

  return (
    <>
      {!isOpen && (
        <button
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Chat with us"
        >
          <span>✦</span>
          <span>Chat with us</span>
        </button>
      )}

      {isOpen && (
        <section className="chatbot-window">
          <header className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">✦</div>

              <div>
                <h3>Chat with us</h3>
                <p className="chatbot-status">
                  <span className="chatbot-status-dot"></span>
                  Online · AI Purchase Assistant
                </p>
              </div>
            </div>

            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </header>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.role}`}
              >
                <div className="chat-message-bubble">
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message assistant">
                <div className="chat-message-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                  <small>Thinking...</small>
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="chatbot-suggestions">
                <p>How can I help you?</p>

                {SUGGESTED_QUESTIONS.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="chatbot-input-area"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder="Ask about your requests..."
              value={question}
              onChange={event => setQuestion(event.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !question.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>
        </section>
      )}
    </>
  );
}

export default Chatbot;
