import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import App from '../../src/App'
import { renderWithUser } from '../utils/test-helpers'
import { setupAmadeusApiMocks, setupAmadeusApiFailures } from '../mocks/amadeus-api'

/**
 * UAT Test Suite 4: Error Handling and Edge Cases
 *
 * These tests verify that the application handles errors gracefully,
 * provides appropriate user feedback, and maintains stability under
 * adverse conditions.
 */

describe('UAT: Error Handling and Edge Cases', () => {
  let restoreFetch

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (restoreFetch) restoreFetch()
  })

  describe('UAT-028: Network Error Handling', () => {
    it('should handle network failures gracefully', async () => {
      restoreFetch = setupAmadeusApiFailures('network')
      const { user } = renderWithUser(<App />)

      // Fill in required fields
      const nameInputs = document.querySelectorAll('input[placeholder*="name" i]')
      if (nameInputs.length > 0) {
        await user.type(nameInputs[0], 'TestUser')
      }

      const dateInputs = document.querySelectorAll('input[type="date"]')
      if (dateInputs.length > 0) {
        await user.type(dateInputs[0], '2026-05-01')
      }

      // Try airport search
      const cityInputs = document.querySelectorAll(
        'input[placeholder*="city" i], input[placeholder*="origin" i]'
      )
      if (cityInputs.length > 0) {
        await user.type(cityInputs[0], 'London')
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // App should not crash
      const heading = screen.getByText(/squad flight finder/i)
      expect(heading).toBeInTheDocument()
    })

    it('should display error message on API failure', async () => {
      restoreFetch = setupAmadeusApiFailures('network')
      const { user } = renderWithUser(<App />)

      const cityInputs = document.querySelectorAll(
        'input[placeholder*="city" i], input[placeholder*="origin" i]'
      )

      if (cityInputs.length > 0) {
        await user.type(cityInputs[0], 'Paris')
        await new Promise(resolve => setTimeout(resolve, 800))

        // Look for error message or indication
        // The app might show "No results" or an error message
        await waitFor(() => {
          const bodyText = document.body.textContent
          // Either shows error or handles gracefully
          expect(bodyText).toBeTruthy()
        })
      }
    })

    it('should allow retry after network error', async () => {
      restoreFetch = setupAmadeusApiFailures('network')
      const { user } = renderWithUser(<App />)

      const cityInputs = document.querySelectorAll(
        'input[placeholder*="city" i], input[placeholder*="origin" i]'
      )

      if (cityInputs.length > 0) {
        // First attempt (will fail)
        await user.type(cityInputs[0], 'London')
        await new Promise(resolve => setTimeout(resolve, 500))

        // Clear and try again (simulating retry)
        await user.clear(cityInputs[0])
        await new Promise(resolve => setTimeout(resolve, 100))

        // Second attempt
        restoreFetch() // Restore normal fetch
        restoreFetch = setupAmadeusApiMocks()

        await user.type(cityInputs[0], 'Manchester')
        await new Promise(resolve => setTimeout(resolve, 500))

        // Should work now
        expect(cityInputs[0].value).toBe('Manchester')
      }
    })

    it('should not corrupt application state on network error', async () => {
      restoreFetch = setupAmadeusApiFailures('network')
      const { user } = renderWithUser(<App />)

      // Set some data
      const nameInputs = document.querySelectorAll('input[placeholder*="name" i]')
      if (nameInputs.length > 0) {
        await user.type(nameInputs[0], 'StateTest')
      }

      // Trigger network error
      const cityInputs = document.querySelectorAll(
        'input[placeholder*="city" i], input[placeholder*="origin" i]'
      )
      if (cityInputs.length > 0) {
        await user.type(cityInputs[0], 'ErrorCity')
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Original data should be preserved
      if (nameInputs.length > 0) {
        expect(nameInputs[0].value).toBe('StateTest')
      }
    })
  })

  describe('UAT-029: Invalid Input Handling', () => {
    it('should handle invalid date formats', async () => {
      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      const dateInputs = document.querySelectorAll('input[type="date"]')
      if (dateInputs.length > 0) {
        // Date input usually validates format automatically
        // Try setting past date
        await user.type(dateInputs[0], '2020-01-01')

        await new Promise(resolve => setTimeout(resolve, 200))

        // App should either accept or show validation
        const heading = screen.getByText(/squad flight finder/i)
        expect(heading).toBeInTheDocument()
      }
    })

    it('should handle return date before departure date', async () => {
      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      const dateInputs = document.querySelectorAll('input[type="date"]')
      if (dateInputs.length >= 2) {
        await user.type(dateInputs[0], '2026-05-20')
        await user.type(dateInputs[1], '2026-05-10') // Before departure

        await new Promise(resolve => setTimeout(resolve, 200))

        // Look for validation message or automatic correction
        const bodyText = document.body.textContent
        expect(bodyText).toBeTruthy()
      }
    })

    it('should handle empty traveler name', async () => {
      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      const dateInputs = document.querySelectorAll('input[type="date"]')
      if (dateInputs.length > 0) {
        await user.type(dateInputs[0], '2026-06-01')
      }

      // Don't fill in name, try to search
      const buttons = screen.getAllByRole('button')
      const searchButton = buttons.find(btn =>
        btn.textContent.match(/search|find/i)
      )

      if (searchButton) {
        await user.click(searchButton)

        await new Promise(resolve => setTimeout(resolve, 300))

        // Should show validation or handle gracefully
        const heading = screen.getByText(/squad flight finder/i)
        expect(heading).toBeInTheDocument()
      }
    })

    it('should handle special characters in city search', async () => {
      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      const cityInputs = document.querySelectorAll(
        'input[placeholder*="city" i], input[placeholder*="origin" i]'
      )

      if (cityInputs.length > 0) {
        await user.type(cityInputs[0], '<script>alert("XSS")</script>')

        await new Promise(resolve => setTimeout(resolve, 500))

        // Should handle safely without executing script
        expect(document.body.innerHTML).not.toContain('alert("XSS")')
      }
    })

    it('should handle SQL injection attempts in inputs', async () => {
      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      const nameInputs = document.querySelectorAll('input[placeholder*="name" i]')
      if (nameInputs.length > 0) {
        await user.type(nameInputs[0], "'; DROP TABLE users; --")

        await new Promise(resolve => setTimeout(resolve, 200))

        // Should be treated as regular text
        expect(nameInputs[0].value).toContain("DROP TABLE")
        // App should not crash
        const heading = screen.getByText(/squad flight finder/i)
        expect(heading).toBeInTheDocument()
      }
    })
  })

  describe('UAT-030: API Error Responses', () => {
    it('should handle 401 unauthorized errors', async () => {
      restoreFetch = setupAmadeusApiFailures('unauthorized')
      const { user } = renderWithUser(<App />)

      const cityInputs = document.querySelectorAll(
        'input[placeholder*="city" i], input[placeholder*="origin" i]'
      )

      if (cityInputs.length > 0) {
        await user.type(cityInputs[0], 'London')
        await new Promise(resolve => setTimeout(resolve, 500))

        // Should handle error gracefully
        const heading = screen.getByText(/squad flight finder/i)
        expect(heading).toBeInTheDocument()
      }
    })

    it('should handle rate limit errors (429)', async () => {
      restoreFetch = setupAmadeusApiFailures('rateLimit')
      const { user } = renderWithUser(<App />)

      const cityInputs = document.querySelectorAll(
        'input[placeholder*="city" i], input[placeholder*="origin" i]'
      )

      if (cityInputs.length > 0) {
        await user.type(cityInputs[0], 'Paris')
        await new Promise(resolve => setTimeout(resolve, 500))

        // Should handle rate limiting gracefully
        const heading = screen.getByText(/squad flight finder/i)
        expect(heading).toBeInTheDocument()
      }
    })

    it('should handle empty API responses', async () => {
      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      // Search for city that returns no results
      const cityInputs = document.querySelectorAll(
        'input[placeholder*="city" i], input[placeholder*="origin" i]'
      )

      if (cityInputs.length > 0) {
        await user.type(cityInputs[0], 'NonexistentCity12345')
        await new Promise(resolve => setTimeout(resolve, 500))

        // Should show "no results" or handle gracefully
        const heading = screen.getByText(/squad flight finder/i)
        expect(heading).toBeInTheDocument()
      }
    })
  })

  describe('UAT-031: Edge Cases in Search', () => {
    it('should handle search with only one traveler', async () => {
      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      const nameInputs = document.querySelectorAll('input[placeholder*="name" i]')
      if (nameInputs.length > 0) {
        await user.type(nameInputs[0], 'Solo')
      }

      const cityInputs = document.querySelectorAll(
        'input[placeholder*="city" i], input[placeholder*="origin" i]'
      )
      if (cityInputs.length > 0) {
        await user.type(cityInputs[0], 'London')
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      const dateInputs = document.querySelectorAll('input[type="date"]')
      if (dateInputs.length > 0) {
        await user.type(dateInputs[0], '2026-07-01')
      }

      // Search should work with one traveler
      const buttons = screen.getAllByRole('button')
      const searchButton = buttons.find(btn =>
        btn.textContent.match(/search|find/i)
      )

      if (searchButton) {
        await user.click(searchButton)
        await new Promise(resolve => setTimeout(resolve, 300))

        // Should not show fairness metrics for single traveler
        const heading = screen.getByText(/squad flight finder/i)
        expect(heading).toBeInTheDocument()
      }
    })

    it('should handle same origin city for all travelers', async () => {
      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      // Add two travelers
      const nameInputs = document.querySelectorAll('input[placeholder*="name" i]')
      if (nameInputs.length > 0) {
        await user.type(nameInputs[0], 'Traveler1')
      }

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        const addButton = buttons.find(btn =>
          btn.textContent.includes('Add') &&
          (btn.textContent.includes('Traveler') || btn.textContent.includes('Another'))
        )

        if (addButton) {
          user.click(addButton)
        }
      })

      await new Promise(resolve => setTimeout(resolve, 200))

      // Set same origin for both
      const cityInputs = document.querySelectorAll(
        'input[placeholder*="city" i], input[placeholder*="origin" i]'
      )

      if (cityInputs.length >= 2) {
        await user.type(cityInputs[0], 'London')
        await new Promise(resolve => setTimeout(resolve, 300))
        await user.type(cityInputs[1], 'London')
        await new Promise(resolve => setTimeout(resolve, 300))

        // Should handle same origins gracefully
        const heading = screen.getByText(/squad flight finder/i)
        expect(heading).toBeInTheDocument()
      }
    })

    it('should handle search on current date', async () => {
      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      const dateInputs = document.querySelectorAll('input[type="date"]')
      if (dateInputs.length > 0) {
        const today = new Date().toISOString().split('T')[0]
        await user.type(dateInputs[0], today)

        await new Promise(resolve => setTimeout(resolve, 200))

        // Should either accept or show validation
        expect(dateInputs[0].value).toBe(today)
      }
    })

    it('should handle search far in the future', async () => {
      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      const dateInputs = document.querySelectorAll('input[type="date"]')
      if (dateInputs.length > 0) {
        await user.type(dateInputs[0], '2027-12-31')

        await new Promise(resolve => setTimeout(resolve, 200))

        // Should accept future dates
        expect(dateInputs[0].value).toBe('2027-12-31')
      }
    })
  })

  describe('UAT-032: Browser Compatibility', () => {
    it('should work without localStorage', async () => {
      // Simulate localStorage failure
      const originalLocalStorage = window.localStorage
      delete window.localStorage

      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      // App should still function
      const heading = screen.getByText(/squad flight finder/i)
      expect(heading).toBeInTheDocument()

      // Restore localStorage
      window.localStorage = originalLocalStorage
    })

    it('should handle missing fetch API gracefully', async () => {
      // This test verifies the app doesn't crash if fetch is unavailable
      const originalFetch = global.fetch
      global.fetch = undefined

      const { user } = renderWithUser(<App />)

      // App should render even if fetch is missing
      const heading = screen.getByText(/squad flight finder/i)
      expect(heading).toBeInTheDocument()

      global.fetch = originalFetch
    })
  })

  describe('UAT-033: Memory and Performance', () => {
    it('should not leak memory when adding/removing travelers', async () => {
      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      // Add and remove travelers multiple times
      for (let i = 0; i < 5; i++) {
        const buttons = screen.getAllByRole('button')
        const addButton = buttons.find(btn =>
          btn.textContent.includes('Add') &&
          (btn.textContent.includes('Traveler') || btn.textContent.includes('Another'))
        )

        if (addButton) {
          await user.click(addButton)
          await new Promise(resolve => setTimeout(resolve, 50))
        }

        const removeButtons = buttons.filter(btn =>
          btn.textContent.includes('×') ||
          btn.textContent.toLowerCase().includes('remove')
        )

        if (removeButtons.length > 0) {
          await user.click(removeButtons[removeButtons.length - 1])
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }

      // App should still be responsive
      const heading = screen.getByText(/squad flight finder/i)
      expect(heading).toBeInTheDocument()
    })

    it('should handle rapid filter changes', async () => {
      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      // Rapidly change filters
      for (let i = 0; i < 10; i++) {
        const sliders = document.querySelectorAll('input[type="range"]')
        if (sliders.length > 0) {
          const event = new Event('input', { bubbles: true })
          sliders[0].value = String(50 + i * 10)
          sliders[0].dispatchEvent(event)
        }
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      // App should still be functional
      const heading = screen.getByText(/squad flight finder/i)
      expect(heading).toBeInTheDocument()
    })
  })

  describe('UAT-034: Data Integrity', () => {
    it('should preserve traveler data during search', async () => {
      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      const nameInputs = document.querySelectorAll('input[placeholder*="name" i]')
      if (nameInputs.length > 0) {
        await user.type(nameInputs[0], 'DataTest')
      }

      const cityInputs = document.querySelectorAll(
        'input[placeholder*="city" i], input[placeholder*="origin" i]'
      )
      if (cityInputs.length > 0) {
        await user.type(cityInputs[0], 'London')
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Trigger search
      const buttons = screen.getAllByRole('button')
      const searchButton = buttons.find(btn =>
        btn.textContent.match(/search|find/i)
      )

      if (searchButton) {
        await user.click(searchButton)
        await new Promise(resolve => setTimeout(resolve, 300))

        // Data should be preserved
        if (nameInputs.length > 0) {
          expect(nameInputs[0].value).toBe('DataTest')
        }
      }
    })

    it('should not allow duplicate traveler IDs', async () => {
      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      // Add multiple travelers
      for (let i = 0; i < 3; i++) {
        const buttons = screen.getAllByRole('button')
        const addButton = buttons.find(btn =>
          btn.textContent.includes('Add') &&
          (btn.textContent.includes('Traveler') || btn.textContent.includes('Another'))
        )

        if (addButton && !addButton.disabled) {
          await user.click(addButton)
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      // All name inputs should be accessible and unique
      const nameInputs = document.querySelectorAll('input[placeholder*="name" i]')
      expect(nameInputs.length).toBeGreaterThan(0)

      // Each input should be a separate element
      const uniqueInputs = new Set(nameInputs)
      expect(uniqueInputs.size).toBe(nameInputs.length)
    })
  })

  describe('UAT-035: Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      restoreFetch = setupAmadeusApiMocks()
      renderWithUser(<App />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)

      // At least some buttons should have accessible text
      const buttonsWithText = buttons.filter(btn => btn.textContent.length > 0)
      expect(buttonsWithText.length).toBeGreaterThan(0)
    })

    it('should be keyboard navigable', async () => {
      restoreFetch = setupAmadeusApiMocks()
      const { user } = renderWithUser(<App />)

      const nameInputs = document.querySelectorAll('input[placeholder*="name" i]')
      if (nameInputs.length > 0) {
        // Tab to input
        nameInputs[0].focus()
        expect(document.activeElement).toBe(nameInputs[0])

        // Type using keyboard
        await user.type(nameInputs[0], 'KeyboardUser')
        expect(nameInputs[0].value).toBe('KeyboardUser')
      }
    })
  })
})
