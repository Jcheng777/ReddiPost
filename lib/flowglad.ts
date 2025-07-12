// flowglad.ts
import { FlowgladServer } from '@flowglad/nextjs/server'
import { getSession } from '@/lib/auth'
import { redditAPI } from '@/lib/reddit-api'

export const flowgladServer = new FlowgladServer({
  getRequestingCustomer: async () => {
    // Get the current Reddit session
    const session = await getSession()
    if (!session) {
      throw new Error('No session found')
    }

    // Get Reddit user info
    try {
      const redditUser = await redditAPI.getUser()
      return {
        externalId: redditUser.name, // Reddit username as customer ID
        email: redditUser.name + '@reddit.user', // Placeholder email
        name: redditUser.name,
      }
    } catch (error) {
      console.error('Error getting Reddit user for Flowglad:', error)
      throw new Error('Error getting Reddit user for Flowglad')
    }
  }
})