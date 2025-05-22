"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { apiClient, ReactionType } from "@/lib/api"

interface Comment {
  id: string
  content: string
  createdAt: string
}

interface Reaction {
  id: string
  type: ReactionType
  anonymousId: string
}

interface RantCardProps {
  id: string
  title: string
  content: string
  createdAt: string
  comments: Array<{
    id: string
    content: string
    createdAt: string
  }>
  reactions: Array<{
    id: string
    type: ReactionType
    anonymousId: string
  }>
  onUpdate?: () => void
}

const reactionStyles = {
  [ReactionType.EMPATHY]: {
    active: "bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300",
    icon: "❤️"
  },
  [ReactionType.SUPPORT]: {
    active: "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
    icon: "💪"
  },
  [ReactionType.HUG]: {
    active: "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
    icon: "🤗"
  },
  [ReactionType.ANGRY]: {
    active: "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300",
    icon: "😡"
  },
  [ReactionType.SAD]: {
    active: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900/30 dark:text-slate-300",
    icon: "😢"
  }
} as const

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `Today at ${hours}:${minutes}`;
  }
}

export function RantCard({ id, title, content, createdAt, comments: initialComments, reactions: initialReactions, onUpdate }: RantCardProps) {
  const [isCommenting, setIsCommenting] = useState(false)
  const [commentContent, setCommentContent] = useState("")
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions)
  const [showComments, setShowComments] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const anonymousId = typeof window !== 'undefined' ?
    localStorage.getItem('anonymousId') ||
    `user_${Math.random().toString(36).slice(2)}` : ''

  if (typeof window !== 'undefined') {
    localStorage.setItem('anonymousId', anonymousId)
  }

  const handleReaction = async (type: ReactionType) => {
    try {
      setError("")

      // Optimistically update the UI
      const hasReactionAlready = reactions.some(r => r.type === type && r.anonymousId === anonymousId)

      if (hasReactionAlready) {
        // Remove the reaction optimistically
        setReactions(prev => prev.filter(r => !(r.type === type && r.anonymousId === anonymousId)))
      } else {
        // Add the reaction optimistically
        const newReaction: Reaction = {
          id: `temp_${Date.now()}`, // Temporary ID
          type,
          anonymousId
        }
        setReactions(prev => [...prev, newReaction])
      }

      // Make API call
      await apiClient.reactions.toggle({
        type,
        anonymousId,
        rantId: id,
      })

      // No need to call onUpdate since we've already updated the UI
    } catch (err: unknown) {
      setError(
        (err instanceof Error) ? err.message
          : "Failed to update reaction"
      )
      onUpdate?.()
    }
  }

  const handleComment = async () => {
    if (!commentContent.trim()) return

    try {
      setError("")
      setIsSubmitting(true)

      // Create a temporary comment for optimistic update
      const tempComment: Comment = {
        id: `temp_${Date.now()}`,
        content: commentContent,
        createdAt: new Date().toISOString()
      }

      // Update UI optimistically
      setComments(prev => [tempComment, ...prev])
      setCommentContent("")
      setIsCommenting(false)

      // Make API call
      await apiClient.comments.create({
        content: tempComment.content,
        anonymousId,
        rantId: id,
      })

      // Fetch latest comments to get the real comment ID and any other updates
      const response = await apiClient.comments.getByRantId(id)
      setComments(response.data)
    } catch (err: unknown) {
      setError(
        (err instanceof Error) ? err.message
          : "Failed to post comment"
      )
      onUpdate?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  const getReactionCount = (type: ReactionType) => {
    return reactions.filter(r => r.type === type).length
  }

  const hasReacted = (type: ReactionType) => {
    return reactions.some(r => r.type === type && r.anonymousId === anonymousId)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-blue-100 dark:border-blue-900">
      <CardHeader>
        <CardTitle className="text-lg text-blue-900 dark:text-blue-100">{title}</CardTitle>
        <CardDescription className="text-blue-600 dark:text-blue-400">{formatRelativeTime(createdAt)}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 dark:text-slate-300">{content}</p>

        {showComments && comments.length > 0 && (
          <div className="mt-4 space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="bg-blue-50/50 dark:bg-blue-950/50 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                <p className="text-sm text-slate-600 dark:text-slate-300">{comment.content}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {formatRelativeTime(comment.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex justify-between w-full">
          <div className="flex gap-2 flex-wrap">
            {Object.values(ReactionType).map((type) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => handleReaction(type)}
                className={cn(
                  "transition-colors duration-200 cursor-pointer",
                  hasReacted(type) ? reactionStyles[type].active : "hover:bg-blue-50 dark:hover:bg-blue-900/50"
                )}
              >
                <span className="mr-1">{reactionStyles[type].icon}</span>
                <span className={cn(
                  "font-medium",
                  hasReacted(type) && "animate-bounce"
                )}>{getReactionCount(type)}</span>
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className={cn(
              "hover:bg-blue-50 dark:hover:bg-blue-900/50 cursor-pointer",
              showComments && "bg-blue-50 dark:bg-blue-900/50"
            )}
          >
            💭 {comments.length} Comments
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 cursor-pointer"
          onClick={() => setIsCommenting(true)}
        >
          Add a comment
        </Button>
      </CardFooter>

      <Dialog open={isCommenting} onOpenChange={setIsCommenting}>
        <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-blue-100 dark:border-blue-900">
          <DialogHeader>
            <DialogTitle className="text-blue-900 dark:text-blue-100">Add Your Comment</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Share your thoughts..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            className="min-h-[100px] mt-2 bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 focus:ring-blue-500"
          />
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCommenting(false)}
              disabled={isSubmitting}
              className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/50 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleComment}
              disabled={isSubmitting || !commentContent.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 