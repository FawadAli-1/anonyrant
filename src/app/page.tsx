"use client"

import { useState, useEffect } from "react"
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

export default function Home() {
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

  const fetchRants = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.rants.getAll(searchParams)
      console.log(response)
      setRants(response.data)
    } catch (error) {
      console.error('Failed to fetch rants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRandomRant = async () => {
    try {
      const response = await apiClient.rants.getRandom()
      setRandomRant(response.data)
      setIsRandomRantOpen(true)
    } catch (error) {
      console.error('Failed to fetch random rant:', error)
    }
  }

  const handleRefresh = () => {
    setSearchParams({
      search: '',
      reactionType: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
    fetchRants()
  }

  useEffect(() => {
    fetchRants()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-blue-100 dark:border-blue-900 transition-all duration-300 hover:bg-white/90 dark:hover:bg-slate-900/90">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={handleRefresh}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent hover:from-blue-500 hover:to-blue-300 transition-all duration-300 hover:scale-105 cursor-pointer select-none"
            >
              Anonyrant
            </button>
            <div className="flex gap-2">
              <Button 
                onClick={() => fetchRandomRant()}
                variant="ghost"
                className="hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-300 hover:scale-105 opacity-90 hover:opacity-100 cursor-pointer"
              >
                🎲 Random Rant
              </Button>
              <Button 
                onClick={() => setIsCreateRantOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white transition-all duration-300 hover:scale-105 opacity-90 hover:opacity-100 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
              >
                Share Anonymously
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        {/* Search and Filter Controls */}
        <div className="mb-8 p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-blue-100 dark:border-blue-900 backdrop-blur-sm transition-all duration-300 hover:bg-white/60 dark:hover:bg-slate-900/60">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search rants..."
              value={searchParams.search}
              onChange={(e) => setSearchParams(prev => ({ ...prev, search: e.target.value }))}
              className="max-w-xs bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 focus:ring-blue-500"
            />
            
            <select
              value={searchParams.reactionType || ''}
              onChange={(e) => setSearchParams(prev => ({ 
                ...prev, 
                reactionType: e.target.value ? e.target.value as ReactionType : undefined 
              }))}
              className="w-[180px] rounded-md border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
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
              className="w-[180px] rounded-md border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
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
              className="w-[180px] rounded-md border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Rants Feed */}
        {isLoading ? (
          <div className="text-center text-blue-600 dark:text-blue-400 animate-pulse">
            Loading rants...
          </div>
        ) : rants.length === 0 ? (
          <div className="text-center">
            <p className="text-blue-600 dark:text-blue-400 mb-2">No rants found.</p>
            <Button 
              onClick={() => setIsCreateRantOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            >
              Be the first to share!
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rants.map(rant => (
              <RantCard 
                key={rant.id} 
                {...rant} 
                onUpdate={fetchRants}
              />
            ))}
          </div>
        )}
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
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-blue-900 dark:text-blue-100">Random Rant</DialogTitle>
            </DialogHeader>
            <RantCard
              {...randomRant}
              onUpdate={fetchRants}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
