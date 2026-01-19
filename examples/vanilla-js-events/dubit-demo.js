const token = import.meta.env.VITE_DUBIT_API_KEY;

let eventCounts = {
  'app-message': 0,
  'participant-joined': 0,
  'participant-left': 0,
  'remote-participants-audio-level': 0,
}

let activeFilters = {
  'app-message': true,
  'participant-joined': true,
  'participant-left': true,
  'remote-participants-audio-level': true,
  system: true,
}



const joinRoomBtn = document.getElementById('startCall')
const leaveRoomBtn = document.getElementById('leaveRoom')
const roomUrlInput = document.getElementById('roomUrl')
const logDisplay = document.getElementById('log')

const eventFilters = document.getElementById('event-filters')
const filterAppMessage = document.getElementById('filter-app-message')
const filterParticipantJoined = document.getElementById('filter-participant-joined')
const filterParticipantLeft = document.getElementById('filter-participant-left')
const filterAudioLevel = document.getElementById('filter-audio-level')
const filterSystem = document.getElementById('filter-system')
const selectAllFilters = document.getElementById('select-all-filters')
const clearAllFilters = document.getElementById('clear-all-filters')

joinRoomBtn.addEventListener('click', joinRoom)
leaveRoomBtn.addEventListener('click', leaveRoom)

filterAppMessage.addEventListener('change', updateFilters)
filterParticipantJoined.addEventListener('change', updateFilters)
filterParticipantLeft.addEventListener('change', updateFilters)
filterAudioLevel.addEventListener('change', updateFilters)
filterSystem.addEventListener('change', updateFilters)
selectAllFilters.addEventListener('click', selectAllFiltersHandler)
clearAllFilters.addEventListener('click', clearAllFiltersHandler)

async function joinRoom() {
  const roomUrl = roomUrlInput.value.trim()

  if (!roomUrl) {
    alert('Please enter a valid Dubit room URL')
    return
  }

  try {
    joinRoomBtn.disabled = true
    joinRoomBtn.textContent = 'Joining...'

    clearEvents()

    const dubitInstance = await Dubit.createNewInstance({ 
      token: token,
      roomUrl: roomUrl,
      enableEventListener: true,
     })

    window._dubit = dubitInstance

    setupEventListeners()

    joinRoomBtn.classList.add('hidden')
    leaveRoomBtn.classList.remove('hidden')

    eventFilters.classList.remove('hidden')

    addEvent('system', 'Successfully joined room', { roomUrl })
  } catch (error) {
    console.error('Error joining room:', error)
    alert(`Failed to join room: ${error.message}`)

    joinRoomBtn.disabled = false
    joinRoomBtn.textContent = 'Join Call'
  }
}

async function leaveRoom() {
  
  if(window._dubit) {
    await window._dubit.destroyEventListener()
  }

  joinRoomBtn.disabled = false
  joinRoomBtn.textContent = 'Join Call'
  joinRoomBtn.classList.remove('hidden')
  leaveRoomBtn.classList.add('hidden')

  eventFilters.classList.add('hidden')

  clearEvents()

  addEvent('system', 'Left room', {})
}

function setupEventListeners() {
  if (!window._dubit) return


  window._dubit.on('app-message', (event) => {
    eventCounts['app-message']++
    addEvent('app-message', 'App message received', event)
  })

  window._dubit.on('participant-joined', (event) => {
    eventCounts['participant-joined']++
    addEvent(
      'participant-joined',
      `Participant joined: ${event.participant?.user_name || 'Unknown'}`,
      event,
    )
  })

  window._dubit.on('participant-left', (event) => {
    eventCounts['participant-left']++
    addEvent(
      'participant-left',
      `Participant left: ${event.participant?.user_name || 'Unknown'}`,
      event,
    )
  })

  window._dubit.on('remote-participants-audio-level', (event) => {
    console.log(event['participantsAudioLevel'])
    eventCounts['remote-participants-audio-level']++
    addEvent('remote-participants-audio-level', 'Audio level update', event)
  })
}

function addEvent(type, message, data) {
  const timestamp = new Date().toLocaleTimeString()
  const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const eventElement = document.createElement('div')
  eventElement.id = eventId
  eventElement.className = 'p-3 bg-gray-50 rounded-lg border-l-4 border-indigo-500'

  const header = document.createElement('div')
  header.className = 'flex items-center justify-between mb-2'

  const typeBadge = document.createElement('span')
  typeBadge.className = 'px-2 py-1 text-xs font-medium rounded-full'

  switch (type) {
    case 'app-message':
      typeBadge.className += ' bg-blue-100 text-blue-800'
      break
    case 'participant-joined':
      typeBadge.className += ' bg-green-100 text-green-800'
      break
    case 'participant-left':
      typeBadge.className += ' bg-red-100 text-red-800'
      break
    case 'remote-participants-audio-level':
      typeBadge.className += ' bg-yellow-100 text-yellow-800'
      break
    case 'system':
      typeBadge.className += ' bg-gray-100 text-gray-800'
      break
    default:
      typeBadge.className += ' bg-gray-100 text-gray-800'
  }

  typeBadge.textContent = type

  const timeStamp = document.createElement('span')
  timeStamp.className = 'text-xs text-gray-500'
  timeStamp.textContent = timestamp

  header.appendChild(typeBadge)
  header.appendChild(timeStamp)

  const messageDiv = document.createElement('div')
  messageDiv.className = 'text-sm font-medium text-gray-800 mb-2'
  messageDiv.textContent = message

  let dataSection = ''
  if (data && Object.keys(data).length > 0) {
    dataSection = `
      <details class="mt-2">
        <summary class="text-xs text-blue-600 cursor-pointer hover:text-blue-800">View Data</summary>
        <div class="mt-2 p-2 bg-white border border-gray-200 rounded text-xs">
          <pre class="whitespace-pre-wrap text-gray-700">${JSON.stringify(data, null, 2)}</pre>
        </div>
      </details>
    `
  }

  eventElement.innerHTML = `
    ${header.outerHTML}
    ${messageDiv.outerHTML}
    ${dataSection}
  `

  if (activeFilters[type]) {
    logDisplay.insertBefore(eventElement, logDisplay.firstChild)
  }

  const maxEvents = type === 'app-message' ? 50 : 20

  if (logDisplay.children.length > maxEvents) {
    let eventToRemove = null
    for (let i = logDisplay.children.length - 1; i >= 0; i--) {
      const child = logDisplay.children[i]
      const childType = getEventTypeFromElement(child)
      if (childType !== 'app-message') {
        eventToRemove = child
        break
      }
    }

    if (!eventToRemove) {
      eventToRemove = logDisplay.lastChild
    }
    if (eventToRemove) {
      logDisplay.removeChild(eventToRemove)
    }
  }
}

function clearEvents() {
  logDisplay.innerHTML =
    '<div class="text-gray-500 text-center py-8">Join a room to see events</div>'

  eventCounts = {
    'app-message': 0,
    'participant-joined': 0,
    'participant-left': 0,
    'remote-participants-audio-level': 0,
  }

  activeFilters = {
    'app-message': true,
    'participant-joined': true,
    'participant-left': true,
    'remote-participants-audio-level': true,
    system: true,
  }

  filterAppMessage.checked = true
  filterParticipantJoined.checked = true
  filterParticipantLeft.checked = true
  filterAudioLevel.checked = true
  filterSystem.checked = true
}

function updateFilters() {
  activeFilters['app-message'] = filterAppMessage.checked
  activeFilters['participant-joined'] = filterParticipantJoined.checked
  activeFilters['participant-left'] = filterParticipantLeft.checked
  activeFilters['remote-participants-audio-level'] = filterAudioLevel.checked
  activeFilters['system'] = filterSystem.checked

  const allEvents = logDisplay.querySelectorAll('[id^="event-"]')
  allEvents.forEach((eventElement) => {
    const eventType = getEventTypeFromElement(eventElement)
    if (activeFilters[eventType]) {
      eventElement.style.display = 'block'
    } else {
      eventElement.style.display = 'none'
    }
  })
}

function getEventTypeFromElement(eventElement) {
  const typeBadge = eventElement.querySelector('span[class*="bg-"]')
  if (typeBadge) {
    return typeBadge.textContent.trim()
  }
  return 'system' // fallback
}

function selectAllFiltersHandler() {
  filterAppMessage.checked = true
  filterParticipantJoined.checked = true
  filterParticipantLeft.checked = true
  filterAudioLevel.checked = true
  filterSystem.checked = true

  Object.keys(activeFilters).forEach((key) => {
    activeFilters[key] = true
  })

  const allEvents = logDisplay.querySelectorAll('[id^="event-"]')
  allEvents.forEach((eventElement) => {
    eventElement.style.display = 'block'
  })
}

function clearAllFiltersHandler() {
  filterAppMessage.checked = false
  filterParticipantJoined.checked = false
  filterParticipantLeft.checked = false
  filterAudioLevel.checked = false
  filterSystem.checked = false

  Object.keys(activeFilters).forEach((key) => {
    activeFilters[key] = false
  })

  const allEvents = logDisplay.querySelectorAll('[id^="event-"]')
  allEvents.forEach((eventElement) => {
    eventElement.style.display = 'none'
  })
}

document.addEventListener('DOMContentLoaded', () => {
  addEvent(
    'system',
    'Page loaded. Enter a Dubit room URL and click "Join Call" to join call and listen for events.',
    {},
  )
})
