"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateRantDialog } from "@/components/create-rant-dialog"
import { RantCard } from "@/components/rant-card"
import { apiClient, ReactionType, SearchRantsParams } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Rant {
  id: string
  title: string
  content: string
  createdAt: string
  anonymousId: string
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
}

export default function Page() {
  const [isCreateRantOpen, setIsCreateRantOpen] = useState(false)
  const [isRandomRantOpen, setIsRandomRantOpen] = useState(false)
  const [randomRant, setRandomRant] = useState<Rant | null>(null)
  const [rants, setRants] = useState<Rant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchParams, setSearchParams] = useState<SearchRantsParams>({
    search: '',
    reactionType: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const fetchRants = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.rants.getAll(searchParams)
      setRants(response.data)
    } catch (error) {
      console.error('Failed to fetch rants:', error)
    } finally {
      setIsLoading(false)
    }
  }, [searchParams])

  const fetchRandomRant = async () => {
    try {
      const response = await apiClient.rants.getRandom()
      setRandomRant(response.data)
      setIsRandomRantOpen(true)
    } catch (error) {
      console.error('Failed to fetch random rant:', error)
    }
  }

  // const handleRefresh = () => {
  //   setSearchParams({
  //     search: '',
  //     reactionType: undefined,
  //     sortBy: 'createdAt',
  //     sortOrder: 'desc',
  //   })
  //   fetchRants()
  // }

  useEffect(() => {
    fetchRants()
  }, [fetchRants])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-blue-100 dark:border-blue-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
              Anonyrant
            </h1>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
              <Button
                onClick={() => setIsCreateRantOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                Share Your Rant
              </Button>
              <Button
                onClick={fetchRandomRant}
                variant="outline"
                className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/50"
              >
                Random Rant
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* Search and Filter Controls */}
        <div className="mb-8 p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-blue-100 dark:border-blue-900 backdrop-blur-sm transition-all duration-300 hover:bg-white/60 dark:hover:bg-slate-900/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search rants..."
              value={searchParams.search}
              onChange={(e) => setSearchParams(prev => ({ ...prev, search: e.target.value }))}
              className="w-full bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 focus:ring-blue-500"
            />
            
            <select
              value={searchParams.reactionType || ''}
              onChange={(e) => setSearchParams(prev => ({ 
                ...prev, 
                reactionType: e.target.value ? e.target.value as ReactionType : undefined 
              }))}
              className="w-full rounded-md border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="">All reactions</option>
              {Object.values(ReactionType).map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            <select
              value={searchParams.sortBy || 'createdAt'}
              onChange={(e) => setSearchParams(prev => ({ 
                ...prev, 
                sortBy: e.target.value as 'createdAt' | 'reactions' | 'comments'
              }))}
              className="w-full rounded-md border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="createdAt">Date</option>
              <option value="reactions">Reactions</option>
              <option value="comments">Comments</option>
            </select>

            <select
              value={searchParams.sortOrder || 'desc'}
              onChange={(e) => setSearchParams(prev => ({ 
                ...prev, 
                sortOrder: e.target.value as 'asc' | 'desc'
              }))}
              className="w-full rounded-md border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Rants Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-blue-900 dark:text-blue-100">Loading rants...</p>
            </div>
          ) : rants.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-blue-900 dark:text-blue-100">No rants found. Be the first to share!</p>
            </div>
          ) : (
            rants.map((rant) => (
              <RantCard
                key={rant.id}
                id={rant.id}
                title={rant.title}
                content={rant.content}
                createdAt={rant.createdAt}
                comments={rant.comments}
                reactions={rant.reactions}
                onUpdate={fetchRants}
              />
            ))
          )}
        </div>
      </main>

      {/* Create Rant Dialog */}
      <CreateRantDialog
        open={isCreateRantOpen}
        onOpenChange={setIsCreateRantOpen}
        onRantCreated={fetchRants}
      />

      {/* Random Rant Dialog */}
      {randomRant && (
        <Dialog open={isRandomRantOpen} onOpenChange={setIsRandomRantOpen}>
          <DialogContent className="max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-blue-100 dark:border-blue-900">
            <DialogHeader>
              <DialogTitle className="text-blue-900 dark:text-blue-100">Random Rant</DialogTitle>
            </DialogHeader>
            <RantCard
              id={randomRant.id}
              title={randomRant.title}
              content={randomRant.content}
              createdAt={randomRant.createdAt}
              comments={randomRant.comments}
              reactions={randomRant.reactions}
              onUpdate={fetchRants}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
