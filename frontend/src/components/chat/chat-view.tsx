"use client";

/**
 * ChatView — Full ChatGPT-style AI chat interface.
 *
 * Features:
 * - Streaming SSE responses with typing cursor
 * - Markdown rendering with syntax highlighting
 * - Investigation timeline (expandable agent steps)
 * - Approval cards for dangerous actions
 * - Tool execution history
 * - Conversation history sidebar
 * - Example prompts / suggested queries
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Send,
  Square,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Zap,
  GitBranch,
  Box,
  Server,
  Activity,
  Shield,
  FileText,
  Copy,
  Check,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn, formatDuration, copyToClipboard, generateId } from "@/lib/utils";
import { streamChatResponse, approvalsApi, type AgentStep, type Approval } from "@/lib/api";

// ─── Suggested prompts ────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  { icon: AlertTriangle, text: "Why did my production deployment fail?", color: "text-red-400" },
  { icon: Activity,      text: "Show me current CPU and memory metrics",  color: "text-blue-400" },
  { icon: Box,           text: "List all pods in CrashLoopBackOff",       color: "text-yellow-400" },
  { icon: GitBranch,     text: "What changed in the last 5 deployments?", color: "text-purple-400" },
  { icon: Shield,        text: "Run a security scan on my repositories",  color: "text-green-400" },
  { icon: FileText,      text: "Generate an incident report for today",   color: "text-orange-400" },
];

// Chat stays unavailable until the backend has a real authenticated streaming agent.
const AGENT_WORKSPACE_AVAILABLE = false;

// ─── Agent icon mapping ────────────────────────────────────────
const AGENT_ICONS: Record<string, React.ElementType> = {
  github:         GitBranch,
  docker:         Box,
  kubernetes:     Server,
  cloud:          Server,
  monitoring:     Activity,
  security:       Shield,
  documentation:  FileText,
  planner:        Zap,
  supervisor:     Zap,
};

// ─── Types ────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  agentSteps?: AgentStep[];
  pendingApproval?: Approval;
  createdAt: Date;
}

// ─── Sub-components ────────────────────────────────────────────

/** AgentStepCard — shows one agent's investigation step */
function AgentStepCard({ step }: { step: AgentStep }) {
  const [open, setOpen] = useState(false);
  const Icon = AGENT_ICONS[step.agent.toLowerCase()] ?? Zap;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-2
                                     rounded-lg hover:bg-muted/30 transition-colors group">
        {/* Status icon */}
        {step.status === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />}
        {step.status === "error"   && <XCircle      className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
        {step.status === "running" && <Loader2      className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 animate-spin" />}
        {step.status === "pending" && <Clock        className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}

        {/* Agent icon + name */}
        <div className="flex items-center gap-1.5 flex-1">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium capitalize">{step.agent} Agent</span>
          {step.tool && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-3.5 font-mono">
              {step.tool}
            </Badge>
          )}
        </div>

        {/* Duration */}
        {step.duration && (
          <span className="text-[10px] text-muted-foreground/60">
            {formatDuration(step.duration)}
          </span>
        )}

        {/* Expand arrow */}
        {step.result && (
          open ? (
            <ChevronDown className="w-3 h-3 text-muted-foreground/60" />
          ) : (
            <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
          )
        )}
      </CollapsibleTrigger>

      {step.result && (
        <CollapsibleContent>
          <div className="ml-6 mt-1 p-3 rounded-lg bg-muted/20 border border-border/30">
            <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-mono leading-5">
              {step.result}
            </pre>
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

/** ApprovalCard — asks user to confirm/reject a dangerous action */
function ApprovalCard({
  approval,
  onApprove,
  onReject,
}: {
  approval: Approval;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const riskColors = {
    low:      "text-green-400 border-green-400/30 bg-green-400/5",
    medium:   "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
    high:     "text-orange-400 border-orange-400/30 bg-orange-400/5",
    critical: "text-red-400 border-red-400/30 bg-red-400/5",
  };

  const handleApprove = async () => {
    setLoading("approve");
    try {
      await approvalsApi.approve(approval.id);
      onApprove();
      toast.success("Action approved and executing...");
    } catch {
      toast.error("Failed to approve action");
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading("reject");
    try {
      await approvalsApi.reject(approval.id);
      onReject();
      toast.info("Action rejected");
    } catch {
      toast.error("Failed to reject action");
    } finally {
      setLoading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="approval-card mt-4"
      id={`approval-card-${approval.id}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">Action Requires Approval</p>
          <p className="text-xs text-muted-foreground mt-0.5">{approval.description}</p>
        </div>
        <Badge
          variant="outline"
          className={cn("ml-auto text-xs capitalize", riskColors[approval.risk])}
        >
          {approval.risk} risk
        </Badge>
      </div>

      {/* Tool details */}
      <div className="bg-muted/30 rounded-lg p-3 mb-3 font-mono text-xs">
        <div className="text-muted-foreground">
          <span className="text-primary">{approval.toolName}</span>(
          {Object.entries(approval.parameters)
            .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
            .join(", ")}
          )
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleApprove}
          disabled={loading !== null || approval.status !== "pending"}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5"
          id={`approve-btn-${approval.id}`}
        >
          {loading === "approve" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          Approve &amp; Execute
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReject}
          disabled={loading !== null || approval.status !== "pending"}
          className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1.5"
          id={`reject-btn-${approval.id}`}
        >
          {loading === "reject" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <XCircle className="w-3.5 h-3.5" />
          )}
          Reject
        </Button>
      </div>
    </motion.div>
  );
}

/** MessageBubble — renders a single chat message */
function MessageBubble({
  message,
  onApprovalDecision,
}: {
  message: ChatMessage;
  onApprovalDecision: (messageId: string, status: "approved" | "rejected") => void;
}) {
  const [copied, setCopied] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(true);

  const handleCopy = async () => {
    await copyToClipboard(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="chat-message-user max-w-[80%]">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 max-w-[90%]"
    >
      {/* AI avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-blue-500
                      flex items-center justify-center flex-shrink-0 mt-1 glow-sm">
        <Zap className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 space-y-3">
        {/* Investigation steps */}
        {message.agentSteps && message.agentSteps.length > 0 && (
          <Collapsible open={stepsOpen} onOpenChange={setStepsOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-xs
                                           text-muted-foreground hover:text-foreground
                                           transition-colors mb-1">
              {stepsOpen ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              Investigation steps ({message.agentSteps.length})
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="glass rounded-xl p-3 mb-2 space-y-1">
                {message.agentSteps.map((step, i) => (
                  <AgentStepCard key={i} step={step} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Main message content */}
        <div className="chat-message-ai relative group">
          <div className={cn("markdown-body text-sm", message.isStreaming && "typing-cursor")}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const inline = !match;
                  return inline ? (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  ) : (
                    <div className="relative my-3">
                      <div className="flex items-center justify-between px-4 py-2
                                      bg-zinc-800/80 rounded-t-lg border border-zinc-700/50 border-b-0">
                        <span className="text-[11px] text-zinc-400 font-mono">{match[1]}</span>
                        <button
                          onClick={() => copyToClipboard(String(children))}
                          className="text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: "0 0 8px 8px",
                          border: "1px solid rgb(39 39 42 / 0.5)",
                          borderTop: "none",
                          fontSize: "12px",
                        }}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Copy button */}
          {!message.isStreaming && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100
                         transition-opacity p-1.5 rounded-lg hover:bg-muted/50
                         text-muted-foreground hover:text-foreground"
              id={`copy-msg-${message.id}`}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Approval card */}
        {message.pendingApproval && message.pendingApproval.status === "pending" && (
          <ApprovalCard
            approval={message.pendingApproval}
            onApprove={() => {
              onApprovalDecision(message.id, "approved");
            }}
            onReject={() => {
              onApprovalDecision(message.id, "rejected");
            }}
          />
        )}
      </div>
    </motion.div>
  );
}

// ─── Main ChatView ─────────────────────────────────────────────
export function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId] = useState(() => generateId());
  const [isStreaming, setIsStreaming] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { control, register, handleSubmit, reset } = useForm<{ message: string }>();
  const messageValue = useWatch({ control, name: "message", defaultValue: "" });

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [messageValue]);

  const stopStreaming = () => {
    abortController?.abort();
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m) =>
        m.isStreaming ? { ...m, isStreaming: false } : m
      )
    );
  };

  const handleApprovalDecision = useCallback(
    (messageId: string, status: "approved" | "rejected") => {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId && message.pendingApproval
            ? {
                ...message,
                pendingApproval: { ...message.pendingApproval, status },
              }
            : message
        )
      );
    },
    []
  );

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: content.trim(),
      createdAt: new Date(),
    };

    const assistantId = generateId();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
      agentSteps: [],
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    reset();
    setIsStreaming(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      await streamChatResponse(
        sessionId,
        content.trim(),
        // onChunk
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + chunk }
                : m
            )
          );
        },
        // onEvent
        (eventType, data) => {
          if (eventType === "agent_step") {
            const step = data as AgentStep;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, agentSteps: [...(m.agentSteps ?? []), step] }
                  : m
              )
            );
          } else if (eventType === "approval_required") {
            const approval = data as Approval;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, pendingApproval: approval }
                  : m
              )
            );
          }
        },
        // onDone
        () => {
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, isStreaming: false } : m
            )
          );
        },
        // onError
        (err) => {
          if (err.name === "AbortError") return;
          toast.error("Stream error", { description: err.message });
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, isStreaming: false, content: m.content || "An error occurred. Please try again." }
                : m
            )
          );
        },
        controller.signal
      );
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        toast.error("Failed to send message");
        setIsStreaming(false);
      }
    }
  };

  const onSubmit = ({ message }: { message: string }) => {
    sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* ── Messages area ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          /* Welcome / empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-blue-500
                            flex items-center justify-center mb-6 glow-md">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              DevPilot AI workspace
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mb-10">
              AI investigation is not configured yet. Connect the agent backend and its DevOps integrations
              before enabling incident investigation and remediation.
            </p>

            {/* Suggested prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => sendMessage(prompt.text)}
                  disabled={!AGENT_WORKSPACE_AVAILABLE}
                  className="flex items-start gap-3 p-4 text-left rounded-xl glass
                             border border-border/50 hover:border-primary/40
                             hover:bg-primary/5 transition-all group disabled:cursor-not-allowed disabled:opacity-50"
                  id={`suggested-prompt-${i}`}
                >
                  <prompt.icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", prompt.color)} />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground
                                   transition-colors leading-snug">
                    {prompt.text}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Message list */
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onApprovalDecision={handleApprovalDecision}
                />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input area ───────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="relative">
            <div className="glass rounded-2xl border border-border/60 hover:border-primary/40
                            focus-within:border-primary/60 focus-within:glow-sm transition-all">
              <Textarea
                id="chat-input"
                placeholder="AI investigation is not configured yet"
                className="resize-none border-0 bg-transparent shadow-none focus-visible:ring-0
                           rounded-2xl px-5 pt-4 pb-14 text-sm min-h-[56px] max-h-[200px]"
                onKeyDown={handleKeyDown}
                disabled={isStreaming || !AGENT_WORKSPACE_AVAILABLE}
                {...register("message")}
                ref={(el: HTMLTextAreaElement | null) => {
                  (register("message").ref as (el: HTMLTextAreaElement | null) => void)(el);
                  (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
                }}
              />

              {/* Bottom action bar */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="w-3.5 h-3.5" />
                  <span>Press Enter to send · Shift+Enter for new line</span>
                </div>

                <div className="flex items-center gap-2">
                  {isStreaming && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={stopStreaming}
                      className="h-8 gap-1.5 text-xs border-red-500/30 text-red-400
                                 hover:bg-red-500/10"
                      id="stop-streaming-btn"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      Stop
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!AGENT_WORKSPACE_AVAILABLE || !messageValue?.trim() || isStreaming}
                    className="h-8 w-8 p-0 rounded-xl bg-primary hover:bg-primary/90
                               disabled:opacity-40"
                    id="send-message-btn"
                  >
                    {isStreaming ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>

          <p className="text-center text-[11px] text-muted-foreground/60 mt-2">
            DevPilot AI can make mistakes. Always verify critical infrastructure changes before approving.
          </p>
        </div>
      </div>
    </div>
  );
}
