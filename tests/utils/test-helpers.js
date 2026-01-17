import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Custom render function that includes userEvent setup
 */
export function renderWithUser(ui, options = {}) {
  return {
    user: userEvent.setup(),
    ...render(ui, options),
  }
}

/**
 * Wait for a condition to be true with timeout
 */
export async function waitForCondition(condition, timeout = 5000, interval = 100) {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  throw new Error('Condition not met within timeout')
}

/**
 * Helper to fill in traveler details
 */
export async function addTraveler(user, getByLabelText, getByText, travelerData) {
  const { name, origin } = travelerData

  // Click add traveler button if it's not the first traveler
  const addButtons = document.querySelectorAll('button')
  const addTravelerButton = Array.from(addButtons).find(btn =>
    btn.textContent.includes('Add Traveler') || btn.textContent.includes('Add Another')
  )
  if (addTravelerButton) {
    await user.click(addTravelerButton)
  }

  // Wait a bit for the form to appear
  await new Promise(resolve => setTimeout(resolve, 100))

  // Find all name inputs and use the last one (newly added)
  const nameInputs = document.querySelectorAll('input[placeholder*="name" i]')
  if (nameInputs.length > 0) {
    const nameInput = nameInputs[nameInputs.length - 1]
    await user.clear(nameInput)
    await user.type(nameInput, name)
  }

  // Find all origin inputs and use the last one (newly added)
  const originInputs = document.querySelectorAll('input[placeholder*="city" i], input[placeholder*="origin" i]')
  if (originInputs.length > 0) {
    const originInput = originInputs[originInputs.length - 1]
    await user.clear(originInput)
    await user.type(originInput, origin)

    // Wait for autocomplete suggestions
    await new Promise(resolve => setTimeout(resolve, 500))

    // Try to click the first suggestion if it appears
    const suggestions = document.querySelectorAll('[role="option"], .suggestion, .autocomplete-item')
    if (suggestions.length > 0) {
      await user.click(suggestions[0])
    }
  }
}

/**
 * Helper to set date inputs
 */
export async function setDate(user, input, dateString) {
  await user.clear(input)
  await user.type(input, dateString)
}

/**
 * Helper to set budget slider
 */
export async function setBudget(input, value) {
  // Trigger change event on range input
  const event = new Event('input', { bubbles: true })
  input.value = value
  input.dispatchEvent(event)
}

/**
 * Mock localStorage for testing
 */
export function setupLocalStorage() {
  const localStorageMock = {
    store: {},
    getItem(key) {
      return this.store[key] || null
    },
    setItem(key, value) {
      this.store[key] = value.toString()
    },
    removeItem(key) {
      delete this.store[key]
    },
    clear() {
      this.store = {}
    },
  }

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })

  return localStorageMock
}

/**
 * Wait for loading to complete
 */
export async function waitForLoadingToFinish(queryByText) {
  // Wait for any loading indicators to disappear
  let loadingAttempts = 0
  const maxAttempts = 50

  while (loadingAttempts < maxAttempts) {
    const loading = queryByText(/loading|searching/i)
    if (!loading) {
      break
    }
    await new Promise(resolve => setTimeout(resolve, 100))
    loadingAttempts++
  }
}

/**
 * Get all buttons containing specific text
 */
export function getButtonByText(text) {
  const buttons = document.querySelectorAll('button')
  return Array.from(buttons).find(btn =>
    btn.textContent.toLowerCase().includes(text.toLowerCase())
  )
}

/**
 * Get input by placeholder
 */
export function getInputByPlaceholder(placeholder) {
  return document.querySelector(`input[placeholder*="${placeholder}" i]`)
}

/**
 * Simulate API delay
 */
export async function simulateApiDelay(ms = 100) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock successful flight search
 */
export function getMockFlightSearchResults() {
  return {
    destination: 'Barcelona',
    averagePrice: 67.83,
    deviation: 22.00,
    travelers: [
      { name: 'Alice', price: 89.99, color: '#3b82f6' },
      { name: 'Bob', price: 45.99, color: '#ef4444' },
    ],
    flights: [
      {
        carrier: 'BA',
        departureTime: '08:00',
        arrivalTime: '11:15',
        duration: '2h 15m',
        stops: 0,
      },
    ],
  }
}

/**
 * Check if element is visible
 */
export function isVisible(element) {
  if (!element) return false
  return element.offsetWidth > 0 && element.offsetHeight > 0
}

/**
 * Wait for element to appear
 */
export async function waitForElement(selector, timeout = 5000) {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector)
    if (element && isVisible(element)) {
      return element
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error(`Element ${selector} not found within timeout`)
}
