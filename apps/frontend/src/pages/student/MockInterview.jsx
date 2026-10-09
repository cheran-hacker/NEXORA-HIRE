import { useToast } from "../../context/ToastContext";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Send, Bot, User, StopCircle } from "lucide-react";
import api from "../../utils/api";
const MockInterview = () => {
  const { addToast } = useToast();
  const [messages, setMessages] = useState([
    {
      role: "model",
      content:
        "Hello! I am the senior engineering manager here. Let's get started. Could you walk me through your background and your strongest technical skills?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);
    try {
      // We pass the history excluding the new message
      const res = await api.post("/ai/mock-interview", {
        message: userMessage,
        history: messages,
        role: "Software Engineer",
      });
      setMessages((prev) => [
        ...prev,
        { role: "model", content: res.data.reply },
      ]);
    } catch (error) {
      console.error("Interview Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            "I'm having trouble connecting to my cognitive engine. Let's try that again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        // Append the current transcript to whatever was previously typed/spoken
        setInput((prev) => {
          // A bit of a hack for continuous speech so it doesn't double append
          // We just set input to the newly recognized continuous string if they started empty
          // For a robust app, we'd manage final vs interim, but this works well for a copilot UI
          return currentTranscript;
        });
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          addToast("Microphone permission was denied.", "error");
        } else {
          addToast("Voice recognition failed.", "warning");
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      addToast("Voice input is not supported in this browser.", "info");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInput(""); // Clear input before starting new recording
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        addToast("Listening... Speak now.", "success");
      } catch (err) {
        addToast("Microphone is already in use.", "warning");
      }
    }
  };
  return (
    <div
      className="d-flex flex-column h-100"
      style={{ background: "var(--bg)", maxHeight: "100dvh" }}
    >
      {" "}
      {/* Header */}{" "}
      <header
        className="p-4 border-bottom sticky-top d-flex justify-content-between align-items-center"
        style={{ borderColor: "var(--border) !important", zIndex: 10 }}
      >
        {" "}
        <div className="d-flex align-items-center gap-3">
          {" "}
          <div className="icon-circle bg-primary text-white shadow">
            <Bot size={20} />
          </div>{" "}
          <div>
            {" "}
            <h5 className="mb-0 fw-bold" style={{ color: "var(--text)" }}>
              AI Technical Interview
            </h5>{" "}
            <p className="mb-0 small text-success fw-bold d-flex align-items-center gap-2">
              {" "}
              <span className="status-dot status-dot-online" /> Copilot
              Connected{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
        <button
          onClick={() => {
            if (
              window.confirm(
                "End the interview session? Your transcript will be saved.",
              )
            ) {
              window.history.back();
            }
          }}
          className="btn btn-outline-danger fw-bold rounded-pill px-4 d-flex align-items-center gap-2 hover-glow"
        >
          {" "}
          <StopCircle size={18} /> End Interview{" "}
        </button>{" "}
      </header>{" "}
      {/* Chat Area */}{" "}
      <div className="flex-grow-1 overflow-auto p-4 p-md-5 d-flex flex-column gap-4">
        {" "}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`d-flex gap-3 w-100 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {" "}
            <div
              className={`icon-circle flex-shrink-0 ${msg.role === "user" ? "bg-secondary text-foreground" : "bg-primary text-white"}`}
            >
              {" "}
              {msg.role === "user" ? (
                <User size={18} />
              ) : (
                <Bot size={18} />
              )}{" "}
            </div>{" "}
            <div
              className="p-3 p-md-4 rounded-4 shadow-sm hover-glow"
              style={{
                background:
                  msg.role === "user" ? "var(--primary)" : "rgba(0,0,0,0.05)",
                color: msg.role === "user" ? "white" : "var(--text)",
                border:
                  msg.role === "model" ? "1px solid var(--border)" : "none",
                maxWidth: "80%",
                borderTopRightRadius: msg.role === "user" ? 4 : undefined,
                borderTopLeftRadius: msg.role === "model" ? 4 : undefined,
              }}
            >
              {" "}
              <p className="mb-0 lh-base" style={{ fontSize: "1.05rem" }}>
                {msg.content}
              </p>{" "}
            </div>{" "}
          </motion.div>
        ))}{" "}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="d-flex gap-3 w-100"
          >
            {" "}
            <div className="icon-circle bg-primary text-white">
              <Bot size={18} />
            </div>{" "}
            <div
              className="p-3 rounded-4 "
              style={{ border: "1px solid var(--border)" }}
            >
              {" "}
              <span className="spinner-grow spinner-grow-sm text-primary mx-1" />{" "}
              <span
                className="spinner-grow spinner-grow-sm text-primary mx-1"
                style={{ animationDelay: "0.2s" }}
              />{" "}
              <span
                className="spinner-grow spinner-grow-sm text-primary mx-1"
                style={{ animationDelay: "0.4s" }}
              />{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
        <div ref={messagesEndRef} />{" "}
      </div>{" "}
      {/* Input Area */}{" "}
      <footer
        className="p-4 border-top "
        style={{ borderColor: "var(--border) !important" }}
      >
        {" "}
        <form
          onSubmit={handleSend}
          className="container max-w-lg mx-auto position-relative"
        >
          {" "}
          <div
            className="d-flex align-items-center gap-3 rounded-pill p-2 shadow-sm"
            style={{ border: "1px solid var(--border)" }}
          >
            {" "}
            <button
              type="button"
              onClick={toggleRecording}
              className={`btn rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${isRecording ? "btn-danger animate-pulse" : "btn-light text-secondary"}`}
              style={{ width: 44, height: 44 }}
            >
              {" "}
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}{" "}
            </button>{" "}
            <input
              type="text"
              className="form-control border-0 shadow-none bg-transparent text-body"
              placeholder={
                isRecording
                  ? "Listening..."
                  : "Type your response or use the microphone..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isRecording}
            />{" "}
            <button
              type="submit"
              disabled={!input.trim() && !isRecording}
              className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow"
              style={{ width: 44, height: 44 }}
            >
              {" "}
              <Send size={18} />{" "}
            </button>{" "}
          </div>{" "}
          <p className="text-center text-muted small mt-3 mb-0 fw-medium">
            Powered by Gemini AI. Responses are analyzed for your Readiness
            Score.
          </p>{" "}
        </form>{" "}
      </footer>{" "}
    </div>
  );
};
export default MockInterview;
