"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"

interface CreateRantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRantCreated?: () => void
}

// Initial reactions for new rants
const initialReactions = [
  { type: "empathy", count: 0, reacted: false },
  { type: "support", count: 0, reacted: false },
  { type: "hug", count: 0, reacted: false },
  { type: "angry", count: 0, reacted: false },
  { type: "sad", count: 0, reacted: false }
] as const

export function CreateRantDialog({ open, onOpenChange, onRantCreated }: CreateRantDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    try {
      setError("")
      setIsSubmitting(true)

      // Generate or get anonymousId (you might want to store this in localStorage or similar)
      const anonymousId = localStorage.getItem('anonymousId') ||
        `user_${Math.random().toString(36).slice(2)}`
      localStorage.setItem('anonymousId', anonymousId)

      await apiClient.rants.create({
        title,
        content,
        anonymousId,
      })

      // Reset form and close dialog
      setTitle("")
      setContent("")
      onOpenChange(false)
      onRantCreated?.()
    } catch (err: unknown) {
      setError(
        (err instanceof Error) ? err.message
          : "Failed to create rant"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-blue-100 dark:border-blue-900">
        <DialogHeader>
          <DialogTitle className="text-blue-900 dark:text-blue-100">Share Your Rant</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 focus:ring-blue-500"
            />
          </div>
          <div>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/50 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
          >
            {isSubmitting ? "Posting..." : "Post Rant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 