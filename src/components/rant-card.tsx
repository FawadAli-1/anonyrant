"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { apiClient, ReactionType } from "@/lib/api"
import { Heart, MessageCircle, ThumbsUp, ThumbsDown, Smile, Frown } from "lucide-react"

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
  onUpdate: () => void
}

const reactionIcons = {
  [ReactionType.EMPATHY]: <Heart className="w-4 h-4" />,
  [ReactionType.SUPPORT]: <ThumbsUp className="w-4 h-4" />,
  [ReactionType.HUG]: <Smile className="w-4 h-4" />,
  [ReactionType.ANGRY]: <ThumbsDown className="w-4 h-4" />,
  [ReactionType.SAD]: <Frown className="w-4 h-4" />,
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears}y ago`
}

export function RantCard({ id, title, content, createdAt, comments, reactions, onUpdate }: RantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReaction = async (type: ReactionType) => {
    try {
      await apiClient.reactions.toggle({
        type,
        rantId: id,
        anonymousId: localStorage.getItem('anonymousId') || `user_${Math.random().toString(36).slice(2)}`
      })
      onUpdate()
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  const handleComment = async () => {
    if (!newComment.trim()) return

    try {
      setIsSubmitting(true)
      setError(null)
      await apiClient.comments.create({
        content: newComment,
        rantId: id,
        anonymousId: localStorage.getItem('anonymousId') || `user_${Math.random().toString(36).slice(2)}`
      })
      setNewComment("")
      onUpdate()
    } catch (error) {
      setError("Failed to add comment")
      console.error('Failed to add comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1
    return acc
  }, {} as Record<ReactionType, number>)

  const hasReacted = (type: ReactionType) => {
    const anonymousId = localStorage.getItem('anonymousId')
    return reactions.some(r => r.type === type && r.anonymousId === anonymousId)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900 overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-lg sm:text-xl font-semibold text-blue-900 dark:text-blue-100 line-clamp-2">
            {title}
          </h3>
          <span className="text-sm text-blue-600 dark:text-blue-400 whitespace-nowrap">
            {formatRelativeTime(createdAt)}
          </span>
        </div>
        
        <p className="mt-2 text-blue-800 dark:text-blue-200 line-clamp-3 sm:line-clamp-none">
          {content}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.values(ReactionType).map((type) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              onClick={() => handleReaction(type)}
              className={`flex items-center gap-1.5 px-2 py-1 text-sm rounded-full transition-all duration-200 ${
                hasReacted(type)
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-blue-50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400'
              }`}
            >
              {reactionIcons[type]}
              <span>{reactionCounts[type] || 0}</span>
            </Button>
          ))}
        </div>

        <div className="mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3"
                >
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {comment.content}
                  </p>
                  <span className="text-xs text-blue-600 dark:text-blue-400 mt-1 block">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] bg-white dark:bg-slate-700 border-blue-200 dark:border-blue-800 focus:ring-blue-500"
              />
              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              )}
              <Button
                onClick={handleComment}
                disabled={isSubmitting || !newComment.trim()}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 