"use client";

import { useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/copilot/chat-interface";
import {
  ConversationSidebar,
  Conversation,
} from "@/components/copilot/conversation-sidebar";
import { InsightCards, defaultInsights } from "@/components/copilot/insight-cards";

// Mock data - in production, fetch from database
const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "Resumen de ventas",
    preview: "¿Cuánto he vendido este mes?",
    date: new Date(),
    messageCount: 4,
  },
  {
    id: "2",
    title: "Productos con stock bajo",
    preview: "¿Qué productos necesitan reabastecer?",
    date: new Date(Date.now() - 86400000),
    messageCount: 6,
  },
  {
    id: "3",
    title: "Análisis de clientes",
    preview: "¿Quiénes son mis clientes con deuda?",
    date: new Date(Date.now() - 172800000),
    messageCount: 3,
  },
];

export default function CopilotPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [showInsights, setShowInsights] = useState(true);

  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: "Nueva conversación",
      preview: "",
      date: new Date(),
      messageCount: 0,
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(undefined);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <div className="hidden md:block w-80 shrink-0">
        <ConversationSidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={setActiveConversationId}
          onNew={handleNewConversation}
          onDelete={handleDeleteConversation}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Insights banner */}
        {showInsights && (
          <div className="border-b bg-muted/30">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Sugerencias inteligentes</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowInsights(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="px-4 pb-4">
              <InsightCards insights={defaultInsights} />
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="flex-1 min-h-0">
          <ChatInterface
            conversationId={activeConversationId}
            conversationTitle={activeConversation?.title || "Nueva conversación"}
          />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm hidden">
        <div className="w-80 h-full">
          <ConversationSidebar
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
            onNew={handleNewConversation}
            onDelete={handleDeleteConversation}
          />
        </div>
      </div>
    </div>
  );
}
