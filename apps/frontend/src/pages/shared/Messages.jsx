import React, { useState } from "react";
import { Send, Search, User as UserIcon, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
export default function Messages() {
  const [activeChat, setActiveChat] = useState(1);
  const [messageText, setMessageText] = useState("");
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return; // API integration needed for sending messages
    setMessageText("");
  };
  return (
    <div className="container-fluid" style={{ height: "calc(100dvh - 120px)" }}>
      {" "}
      <div className="row h-100 g-4">
        {" "}
        {/* Sidebar */}{" "}
        <div className="col-md-4 col-lg-3 h-100">
          {" "}
          <div className="bento-card h-100 d-flex flex-column p-0 overflow-hidden">
            {" "}
            <div
              className="p-4 border-bottom"
              style={{ borderColor: "var(--border) !important" }}
            >
              {" "}
              <h4 className="fw-black mb-3" style={{ color: "var(--text)" }}>
                Messages
              </h4>{" "}
              <div className="input-group">
                {" "}
                <span className="input-group-text ">
                  <Search size={16} />
                </span>{" "}
                <input
                  type="text"
                  className="form-control "
                  placeholder="Search chats..."
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                />{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex-grow-1 overflow-auto p-2">
              {" "}
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className="d-flex align-items-center gap-3 p-3 rounded-3 mb-2 cursor-pointer transition-fast"
                  style={{
                    background:
                      activeChat === chat.id
                        ? "var(--surface-2)"
                        : "transparent",
                    border:
                      activeChat === chat.id
                        ? "1px solid var(--border)"
                        : "1px solid transparent",
                  }}
                >
                  {" "}
                  <div className="position-relative">
                    {" "}
                    <img
                      src={`https://ui-avatars.com/api/?name=${chat.name}&size=48&background=random`}
                      alt={chat.name}
                      className="rounded-circle shadow-sm"
                      width="48"
                      height="48"
                    />{" "}
                    {chat.unread > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm">
                        {" "}
                        {chat.unread}{" "}
                      </span>
                    )}{" "}
                  </div>{" "}
                  <div className="flex-grow-1 overflow-hidden">
                    {" "}
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      {" "}
                      <h6
                        className="fw-bold m-0 text-truncate"
                        style={{ color: "var(--text)" }}
                      >
                        {chat.name}
                      </h6>{" "}
                      <small
                        className="text-muted fw-bold"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {chat.time}
                      </small>{" "}
                    </div>{" "}
                    <p className="m-0 text-muted small text-truncate fw-medium">
                      {chat.lastMessage}
                    </p>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Chat Area */}{" "}
        <div className="col-md-8 col-lg-9 h-100">
          {" "}
          <div className="bento-card h-100 d-flex flex-column p-0">
            {" "}
            {/* Header */}{" "}
            <div
              className="p-4 border-bottom d-flex align-items-center gap-3"
              style={{
                borderColor: "var(--border) !important",
                background: "var(--surface-2)",
              }}
            >
              {" "}
              {activeChat ? (
                <>
                  {" "}
                  <img
                    src={`https://ui-avatars.com/api/?name=User&size=48&background=random`}
                    className="rounded-circle"
                    width="48"
                    height="48"
                    alt="Active Chat"
                  />{" "}
                  <div>
                    {" "}
                    <h5
                      className="fw-black m-0"
                      style={{ color: "var(--text)" }}
                    >
                      User
                    </h5>{" "}
                    <span
                      className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 mt-1 fw-bold"
                      style={{ fontSize: "0.7rem" }}
                    >
                      Unknown
                    </span>{" "}
                  </div>{" "}
                </>
              ) : (
                <div className="w-100 text-center text-muted fw-bold">
                  Select a chat to view messages
                </div>
              )}{" "}
            </div>{" "}
            {/* Messages */}{" "}
            <div className="flex-grow-1 p-4 overflow-auto d-flex flex-column gap-3">
              {" "}
              <div className="text-center mb-4">
                {" "}
                <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-2 fw-bold">
                  Today
                </span>{" "}
              </div>{" "}
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={msg.id}
                  className={`d-flex flex-column ${msg.sender === "me" ? "align-items-end" : "align-items-start"}`}
                >
                  {" "}
                  <div
                    className="p-3 shadow-sm rounded-4 mb-1"
                    style={{
                      maxWidth: "75%",
                      background:
                        msg.sender === "me"
                          ? "linear-gradient(135deg, var(--primary), var(--purple))"
                          : "var(--surface-2)",
                      color: msg.sender === "me" ? "#fff" : "var(--text)",
                      borderBottomRightRadius:
                        msg.sender === "me" ? "4px" : "16px",
                      borderBottomLeftRadius:
                        msg.sender === "them" ? "4px" : "16px",
                    }}
                  >
                    {" "}
                    <p className="m-0 fw-medium">{msg.text}</p>{" "}
                  </div>{" "}
                  <div
                    className="d-flex align-items-center gap-1 text-muted small fw-bold"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {" "}
                    {msg.time}{" "}
                    {msg.sender === "me" && (
                      <CheckCheck size={14} className="text-primary ms-1" />
                    )}{" "}
                  </div>{" "}
                </motion.div>
              ))}{" "}
            </div>{" "}
            {/* Input */}{" "}
            <div
              className="p-4 border-top"
              style={{
                borderColor: "var(--border) !important",
                background: "var(--surface)",
              }}
            >
              {" "}
              <form onSubmit={handleSend} className="d-flex gap-2">
                {" "}
                <input
                  type="text"
                  className="form-control flex-grow-1 p-3 rounded-pill"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                />{" "}
                <button
                  type="submit"
                  className="btn rounded-circle d-flex align-items-center justify-content-center hover-scale shadow-sm"
                  style={{
                    width: "56px",
                    height: "56px",
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  {" "}
                  <Send size={20} className="ms-1" />{" "}
                </button>{" "}
              </form>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
