/**
 * Lancaster University Society Dashboard App
 * Full Authentication Engine with Account Creation
 */

// --- 1. Global Application State ---
const state = {
  currentPage: 'dashboard',
  // Database of registered user accounts stored in browser memory
  accounts: JSON.parse(localStorage.getItem('lu_accounts')) || [],
  // Current active session state
  isLoggedIn: JSON.parse(localStorage.getItem('lu_logged_in')) || false,
  currentUser: JSON.parse(localStorage.getItem('lu_current_user')) || null,
  
  societies: JSON.parse(localStorage.getItem('lu_societies')) || [
    { id: '1', name: 'Computer Science Society', role: 'Member', members: 340, joined: true },
    { id: '2', name: 'Rowing Club', role: 'Member', members: 120, joined: false },
    { id: '3', name: 'Debating Society', role: 'Member', members: 85, joined: true },
    { id: '4', name: 'Hiking Society', role: 'Member', members: 210, joined: false }
  ],
  events: JSON.parse(localStorage.getItem('lu_events')) || [
    { id: '101', title: 'Lancaster Tech Social', club: 'Computer Science Society', date: '2026-10-06', day: '06', month: 'OCT', location: 'Great Hall' },
    { id: '102', title: 'Rowing Club Term Briefing', club: 'Rowing Club', date: '2026-10-09', day: '09', month: 'OCT', location: 'Sports Centre' }
  ],
  announcements: [
    { id: '201', title: 'Campus Societies Fair', club: 'Lancaster University', body: 'Welcome to the new academic year! Visit the main square for society stands.', date: '2026-10-01' }
  ]
};

// Sync app data to persistent storage
function syncStorage() {
  localStorage.setItem('lu_accounts', JSON.stringify(state.accounts));
  localStorage.setItem('lu_logged_in', JSON.stringify(state.isLoggedIn));
  localStorage.setItem('lu_current_user', JSON.stringify(state.currentUser));
  localStorage.setItem('lu_societies', JSON.stringify(state.societies));
  localStorage.setItem('lu_events', JSON.stringify(state.events));
}

// --- 2. Real Account Creation & Login Functions ---

// Switch Login/Signup Tab
window.switchAuthTab = function(tab) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');

  if (tab === 'login') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    tabLogin.classList.remove('active');
    tabSignup.classList.add('active');
  }
};

// 1. SIGN UP: Register a new account
function createAccount(name, email, college, password) {
  // Check if account already exists
  const existingUser = state.accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    alert('An account with this email already exists! Please log in.');
    return;
  }

  // Save new user profile
  const newUser = { name, email, college, password };
  state.accounts.push(newUser);
  state.currentUser = newUser;
  state.isLoggedIn = true;

  syncStorage();
  checkAuthAndRender();
}

// 2. LOG IN: Authenticate against created accounts
function loginUser(email, password) {
  const account = state.accounts.find(
    acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
  );

  if (account) {
    state.currentUser = account;
    state.isLoggedIn = true;
    syncStorage();
    checkAuthAndRender();
  } else {
    alert('Invalid email or password. If you do not have an account, please sign up first!');
  }
}

// 3. LOG OUT: Clear session
function logoutUser() {
  state.isLoggedIn = false;
  state.currentUser = null;
  syncStorage();
  checkAuthAndRender();
}

// Check session state and toggle view
function checkAuthAndRender() {
  const authScreen = document.getElementById('authScreen');
  const appContainer = document.getElementById('appContainer');

  if (state.isLoggedIn && state.currentUser) {
    authScreen.style.display = 'none';
    appContainer.style.display = 'flex';
    updateProfileUI();
    navigateTo(state.currentPage);
  } else {
    authScreen.style.display = 'flex';
    appContainer.style.display = 'none';
  }
}

function updateProfileUI() {
  if (!state.currentUser) return;
  document.getElementById('profileName').textContent = state.currentUser.name;
  document.getElementById('profileCollege').textContent = state.currentUser.college || 'Lancaster University';

  // Compute Initials
  const nameParts = state.currentUser.name.trim().split(' ');
  const initials = nameParts.length > 1 
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : nameParts[0].substring(0, 2).toUpperCase();
  
  document.getElementById('userAvatar').textContent = initials;
}

// --- 3. Dashboard UI Views ---

function getEventListHTML(eventsArray) {
  if (eventsArray.length === 0) {
    return '<li style="font-size: 0.85rem; color: var(--text-muted); list-style: none;">No events found.</li>';
  }
  return eventsArray.map(ev => `
    <li class="event-item">
      <div class="event-date-box">
        <span class="date-num">${ev.day}</span>
        <span class="date-month">${ev.month}</span>
      </div>
      <div class="event-details">
        <span class="event-title" style="font-weight: 600; font-size: 0.9rem;">${ev.title}</span>
        <span class="event-meta" style="font-size: 0.75rem; color: var(--text-muted);">${ev.club} • ${ev.location}</span>
      </div>
    </li>
  `).join('');
}

function getCalendarGridHTML() {
  const daysInMonth = 31;
  let html = `<div class="calendar-grid">
    <div class="day-label">Sun</div><div class="day-label">Mon</div><div class="day-label">Tue</div>
    <div class="day-label">Wed</div><div class="day-label">Thu</div><div class="day-label">Fri</div><div class="day-label">Sat</div>
    <div class="day cell-disabled">27</div><div class="day cell-disabled">28</div><div class="day cell-disabled">29</div><div class="day cell-disabled">30</div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const matchedEvents = state.events.filter(e => e.date.endsWith('-' + dayStr));
    const isToday = d === 12;

    const tagsHtml = matchedEvents.map(ev => `<span class="event-tag">${ev.title}</span>`).join('');

    html += `
      <div class="day ${isToday ? 'today' : ''}" onclick="filterEventsByDay('${dayStr}')">
        <span class="day-number">${d}</span>
        ${tagsHtml}
      </div>`;
  }

  html += '</div>';
  return html;
}

function renderDashboard() {
  const joinedCount = state.societies.filter(s => s.joined).length;

  return `
    <section class="metrics-row">
      <div class="card metric-card">
        <span class="metric-title">My Societies</span>
        <span class="metric-value">${joinedCount}</span>
      </div>
      <div class="card metric-card">
        <span class="metric-title">Upcoming Events</span>
        <span class="metric-value">${state.events.length}</span>
      </div>
      <div class="card metric-card">
        <span class="metric-title">Announcements</span>
        <span class="metric-value">${state.announcements.length}</span>
      </div>
    </section>
    <section class="content-split">
      <div class="card">
        <h3 style="margin-bottom: 1rem;">October 2026</h3>
        ${getCalendarGridHTML()}
      </div>
      <div class="card">
        <h3 style="margin-bottom: 1rem;">Upcoming Activities</h3>
        <ul class="event-list" id="dashboardEventList">
          ${getEventListHTML(state.events)}
        </ul>
      </div>
    </section>`;
}

function renderCalendar() {
  return `<div class="card"><h2 style="margin-bottom: 1.5rem;">October 2026 Calendar</h2>${getCalendarGridHTML()}</div>`;
}

function renderSocieties() {
  const cardsHtml = state.societies.map(soc => `
    <div class="card society-card">
      <span class="badge">${soc.role}</span>
      <h3 style="margin-top: 0.5rem;">${soc.name}</h3>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">Active Members: ${soc.members}</p>
      <button class="btn ${soc.joined ? 'btn-outline' : 'btn-primary'}" onclick="toggleSociety('${soc.id}')">
        ${soc.joined ? 'Leave Club' : 'Join Club'}
      </button>
    </div>
  `).join('');

  return `<div class="grid-3">${cardsHtml}</div>`;
}

function renderAnnouncements() {
  const listHtml = state.announcements.map(ann => `
    <div class="card announcement-card">
      <h3>${ann.title}</h3>
      <span class="badge" style="margin-top: 0.5rem;">${ann.club}</span>
      <p style="margin-top: 0.75rem; font-size: 0.9rem;">${ann.body}</p>
      <div class="announcement-meta">Posted on ${ann.date}</div>
    </div>
  `).join('');

  return `<div class="stack-layout">${listHtml}</div>`;
}

function renderSettings() {
  return `
    <div class="card" style="max-width: 500px;">
      <h2 style="margin-bottom: 1.5rem;">User Settings</h2>
      <form id="settingsForm">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" id="settingName" value="${state.currentUser ? state.currentUser.name : ''}" required>
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="settingEmail" value="${state.currentUser ? state.currentUser.email : ''}" disabled>
        </div>
        <div class="form-group">
          <label>Affiliation / College</label>
          <input type="text" id="settingCollege" value="${state.currentUser ? state.currentUser.college : ''}" required>
        </div>
        <br>
        <button type="submit" class="btn btn-primary">Save Settings</button>
      </form>
    </div>`;
}

// --- 4. Navigation Controller ---

function navigateTo(pageKey) {
  state.currentPage = pageKey;

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageKey);
  });

  const container = document.getElementById('pageContainer');
  if (pageKey === 'dashboard') container.innerHTML = renderDashboard();
  else if (pageKey === 'calendar') container.innerHTML = renderCalendar();
  else if (pageKey === 'societies') container.innerHTML = renderSocieties();
  else if (pageKey === 'announcements') container.innerHTML = renderAnnouncements();
  else if (pageKey === 'settings') {
    container.innerHTML = renderSettings();
    bindSettingsForm();
  }
}

// --- 5. Event Binding ---

// Login Submit
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  loginUser(email, password);
});

// Sign Up Submit
document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const college = document.getElementById('signupCollege').value;
  const password = document.getElementById('signupPassword').value;
  createAccount(name, email, college, password);
});

// Logout Button
document.getElementById('logoutBtn').addEventListener('click', logoutUser);

// Interactive Helpers
window.toggleSociety = function(socId) {
  const soc = state.societies.find(s => s.id === socId);
  if (soc) {
    soc.joined = !soc.joined;
    syncStorage();
    navigateTo('societies');
  }
};

window.filterEventsByDay = function(dayStr) {
  if (state.currentPage !== 'dashboard') return;
  const filtered = state.events.filter(ev => ev.day === dayStr);
  const listContainer = document.getElementById('dashboardEventList');
  if (listContainer) listContainer.innerHTML = getEventListHTML(filtered);
};

function bindSettingsForm() {
  const form = document.getElementById('settingsForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      state.currentUser.name = document.getElementById('settingName').value;
      state.currentUser.college = document.getElementById('settingCollege').value;
      
      syncStorage();
      updateProfileUI();
      alert('Settings updated!');
    });
  }
}

// Nav Clicks
document.getElementById('navMenu').addEventListener('click', function(e) {
  if (e.target.classList.contains('nav-item')) {
    e.preventDefault();
    navigateTo(e.target.dataset.page);
  }
});

// Modal Logic
const modal = document.getElementById('eventModal');
document.getElementById('openModalBtn').addEventListener('click', () => modal.style.display = 'flex');
document.getElementById('closeModal').addEventListener('click', () => modal.style.display = 'none');

document.getElementById('eventForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const dateVal = document.getElementById('eventDateInput').value;
  const dateObj = new Date(dateVal);
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  state.events.push({
    id: String(Date.now()),
    title: document.getElementById('eventTitleInput').value,
    club: document.getElementById('eventClubInput').value,
    date: dateVal,
    day: String(dateObj.getDate()).padStart(2, '0'),
    month: monthNames[dateObj.getMonth()],
    location: document.getElementById('eventLocationInput').value
  });

  syncStorage();
  modal.style.display = 'none';
  this.reset();
  navigateTo(state.currentPage);
});

// Bootstrap App
document.addEventListener('DOMContentLoaded', checkAuthAndRender);