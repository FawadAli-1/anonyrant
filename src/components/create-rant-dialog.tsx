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
// const initialReactions = [
//   { type: "empathy", count: 0, reacted: false },
//   { type: "support", count: 0, reacted: false },
//   { type: "hug", count: 0, reacted: false },
//   { type: "angry", count: 0, reacted: false },
//   { type: "sad", count: 0, reacted: false }
// ] as const

export function CreateRantDialog({ open, onOpenChange, onRantCreated }: CreateRantDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return

    try {
      setIsSubmitting(true)
      setError(null)
      await apiClient.rants.create({ title, content })
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
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-blue-100 dark:border-blue-900">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
            Share Your Rant
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="text-sm font-medium text-blue-900 dark:text-blue-100"
            >
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your rant a title..."
              className="bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 focus:ring-blue-500"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="content"
              className="text-sm font-medium text-blue-900 dark:text-blue-100"
            >
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[150px] bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 focus:ring-blue-500"
              maxLength={1000}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white"
          >
            {isSubmitting ? "Posting..." : "Post Rant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 