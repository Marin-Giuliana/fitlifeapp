"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  IconMessageCircle,
  IconX,
  IconSend,
  IconLoader2,
} from "@tabler/icons-react";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Bună! Sunt asistentul virtual FitLife Club. Cum te pot ajuta astăzi?",
      isBot: true,
      timestamp: new Date(),
    },
    {
      id: "2",
      content:
        "Îți pot oferi informații despre abonamente, clase de grup, antrenori sau orice întrebări legate de sala noastră de fitness!",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage,
          conversationHistory: messages.map((msg) => ({
            role: msg.isBot ? "assistant" : "user",
            content: msg.content,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Ne pare rău, am întâmpinat o problemă. Te rog să încerci din nou.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 p-0"
        >
          <IconMessageCircle className="!h-8 !w-8" />
        </Button>
      )}

      {isOpen && (
        <Card
          className="fixed bottom-20 right-6 w-80 sm:w-96 h-[400px] sm:h-[500px] shadow-xl border-2 z-50 flex flex-col animate-in slide-in-from-bottom-4 slide-in-from-right-4 duration-300 overflow-hidden py-0 pt-4"
          style={{
            maxHeight: "calc(100vh - 140px)",
            maxWidth: "calc(100vw - 48px)",
          }}
        >
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <IconMessageCircle className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  FitLife Assistant
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              >
                <IconX className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-s text-muted-foreground mt-1">
              Întreabă-mă orice despre FitLife Club!
            </p>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isBot ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        message.isBot
                          ? "bg-muted/60 text-foreground border"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          message.isBot
                            ? "text-muted-foreground/70"
                            : "text-primary-foreground/70"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted/60 text-foreground rounded-2xl px-4 py-3 text-sm border shadow-sm">
                      <div className="flex items-center space-x-2">
                        <IconLoader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Scriu...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 pb-2 border-t flex-shrink-0">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Scrie un mesaj..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl border-2 focus:border-primary/50 transition-colors"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  size="icon"
                  className="rounded-xl w-10 h-10 shrink-0"
                >
                  <IconSend className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Apasă Enter pentru a trimite
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
