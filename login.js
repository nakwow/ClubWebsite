/**
 * Lancaster University Society Dashboard App
 */

// --- 1. Initial Application State ---
const state = {
  currentPage: 'dashboard',
  isLoggedIn: JSON.parse(localStorage.getItem('lu_logged_in')) || false,
  user: JSON.parse(localStorage.getItem('lu_user')) || {
    name: 'Jane Doe',
    college: 'Bowland College',
    email: 'j.doe1@lancaster.ac.uk'
  },
  societies: JSON.parse(localStorage.getItem('lu_societies')) || [
    { id: '1', name: 'Computer Science Society', role: 'Executive Member', members: 340, joined: true },
    { id: '2', name: 'Rowing Club', role: 'General Member', members: 120, joined: true },
    { id: '3', name: 'Debating Society', role: 'General Member', members: 85, joined: true },
    { id: '4', name: 'Hiking Society', role: 'Member', members: 210, joined: false }
  ],
  events: JSON.parse(localStorage.getItem('lu_events')) || [
    { id: '101', title: 'CS Welcome Pizza Night', club: 'Computer Science Society', date: '2026-10-06', day: '06', month: 'OCT', location: 'Bowland Main Hall' },
    { id: '102', title: 'Rowing Club Term Briefing', club: 'Rowing Club', date: '2026-10-09', day: '09', month: 'OCT', location: 'Sports Centre Rm 2' },
    { id: '103', title: '24-Hour Autumn Hackathon', club: 'Computer Science Society', date: '2026-10-14', day: '14', month: 'OCT', location: 'InfoLab21' }
  ],
  announcements: [
    { id: '201', title: 'Freshers Fair Registration Open', club: 'Students Union', body: 'Ensure your society desk is booked before the end of week 1.', date: '2026-10-01' },
    { id: '202', title: 'Safety Briefing Requirement', club: 'Sports Centre', body: 'All sports clubs must submit risk assessments by Friday.', date: '2026-10-03' }
  ]
};

function syncStorage() {
  localStorage.setItem('lu_logged_in', JSON.stringify(state.isLoggedIn));
  localStorage.setItem('lu_user', JSON.stringify(state.user));
  localStorage.setItem('lu_societies', JSON.stringify(state.societies));
  localStorage.setItem('lu_events', JSON.stringify(state.events));
}

// --- 2. Auth Flow Engine ---

function switchAuthTab(tab) {
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
}

function handleLogin(email) {
  state.isLoggedIn = true;
  if (email) state.user.email = email;
  syncStorage();
  checkAuthAndRender();
}

function handleSignup(name, email, college) {
  state.isLoggedIn = true;
  state.user = { name, email, college };
  syncStorage();
  checkAuthAndRender();
}

function handleLogout() {
  state.isLoggedIn = false;
  syncStorage();
  checkAuthAndRender();
}

function checkAuthAndRender() {
  const authScreen = document.getElementById('authScreen');
  const appContainer = document.getElementById('appContainer');

  if (state.isLoggedIn) {
    authScreen.style.display = 'none';
    appContainer.style.display = 'flex';
    updateUserHeader();
    navigateTo(state.currentPage);
  } else {
    authScreen.style.display = 'flex';
    appContainer.style.display = 'none';
  }
}

// --- 3. HTML Helpers ---

function getEventListHTML(eventsArray) {
  if (eventsArray.length === 0) {
    return '<li style="font-size: 0.85rem; color: var(--text-muted); list-style: none;">No events found.</li>';
  }
  return eventsArray.map(function(ev) {
    return '<li class="event-item">' +
      '<div class="event-date-box">' +
        '<span class="date-num">' + ev.day + '</span>' +
        '<span class="date-month">' + ev.month + '</span>' +
      '</div>' +
      '<div class="event-details">' +
        '<span class="event-title" style="font-weight: 600; font-size: 0.9rem;">' + ev.title + '</span>' +
        '<span class="event-meta" style="font-size: 0.75rem; color: var(--text-muted);">' + ev.club + ' • ' + ev.location + '</span>' +
      '</div>' +
    '</li>';
  }).join('');
}

function getCalendarGridHTML() {
  var daysInMonth = 31;
  var html = '<div class="calendar-grid">' +
    '<div class="day-label">Sun</div><div class="day-label">Mon</div><div class="day-label">Tue</div>' +
    '<div class="day-label">Wed</div><div class="day-label">Thu</div><div class="day-label">Fri</div><div class="day-label">Sat</div>' +
    '<div class="day cell-disabled">27</div><div class="day cell-disabled">28</div><div class="day cell-disabled">29</div><div class="day cell-disabled">30</div>';

  for (var d = 1; d <= daysInMonth; d++) {
    var dayStr = String(d).padStart(2, '0');
    var matchedEvents = state.events.filter(function(e) { return e.date.endsWith('-' + dayStr); });
    var isToday = d === 12;

    var tagsHtml = matchedEvents.map(function(ev) {
      return '<span class="event-tag">' + ev.title + '</span>';
    }).join('');

    html += '<div class="day ' + (isToday ? 'today' : '') + '" onclick="filterEventsByDay(\'' + dayStr + '\')">' +
      '<span class="day-number">' + d + '</span>' +
      tagsHtml +
    '</div>';
  }

  html += '</div>';
  return html;
}

// --- 4. Page Rendering Logic ---

function renderDashboard() {
  var joinedCount = state.societies.filter(function(s) { return s.joined; }).length;

  return '<section class="metrics-row">' +
    '<div class="card metric-card">' +
      '<span class="metric-title">Joined Clubs</span>' +
      '<span class="metric-value">' + joinedCount + '</span>' +
    '</div>' +
    '<div class="card metric-card">' +
      '<span class="metric-title">Upcoming Events</span>' +
      '<span class="metric-value">' + state.events.length + '</span>' +
    '</div>' +
    '<div class="card metric-card">' +
      '<span class="metric-title">Announcements</span>' +
      '<span class="metric-value">' + state.announcements.length + '</span>' +
    '</div>' +
  '</section>' +
  '<section class="content-split">' +
    '<div class="card">' +
      '<h3 style="margin-bottom: 1rem;">October 2026</h3>' +
      getCalendarGridHTML() +
    '</div>' +
    '<div class="card">' +
      '<h3 style="margin-bottom: 1rem;">Upcoming Activities</h3>' +
      '<ul class="event-list" id="dashboardEventList">' +
        getEventListHTML(state.events) +
      '</ul>' +
    '</div>' +
  '</section>';
}

function renderCalendar() {
  return '<div class="card">' +
    '<h2 style="margin-bottom: 1.5rem;">October 2026 Calendar</h2>' +
    getCalendarGridHTML() +
  '</div>';
}

function renderSocieties() {
  var cardsHtml = state.societies.map(function(soc) {
    var btnText = soc.joined ? 'Leave Club' : 'Join Club';
    var btnClass = soc.joined ? 'btn-outline' : 'btn-primary';
    
    return '<div class="card society-card">' +
      '<span class="badge">' + soc.role + '</span>' +
      '<h3 style="margin-top: 0.5rem;">' + soc.name + '</h3>' +
      '<p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">Active Members: ' + soc.members + '</p>' +
      '<button class="btn ' + btnClass + '" onclick="toggleSociety(\'' + soc.id + '\')">' + btnText + '</button>' +
    '</div>';
  }).join('');

  return '<div class="grid-3">' + cardsHtml + '</div>';
}

function renderAnnouncements() {
  var listHtml = state.announcements.map(function(ann) {
    return '<div class="card announcement-card">' +
      '<h3>' + ann.title + '</h3>' +
      '<span class="badge" style="margin-top: 0.5rem;">' + ann.club + '</span>' +
      '<p style="margin-top: 0.75rem; font-size: 0.9rem;">' + ann.body + '</p>' +
      '<div class="announcement-meta">Posted on ' + ann.date + '</div>' +
    '</div>';
  }).join('');

  return '<div class="stack-layout">' + listHtml + '</div>';
}

function renderSettings() {
  return '<div class="card" style="max-width: 500px;">' +
    '<h2 style="margin-bottom: 1.5rem;">User Settings</h2>' +
    '<form id="settingsForm">' +
      '<div class="form-group">' +
        '<label>Full Name</label>' +
        '<input type="text" id="settingName" value="' + state.user.name + '" required>' +
      '</div>' +
      '<div class="form-group">' +
        '<label>Email Address</label>' +
        '<input type="email" id="settingEmail" value="' + state.user.email + '" required>' +
      '</div>' +
      '<div class="form-group">' +
        '<label>College</label>' +
        '<input type="text" id="settingCollege" value="' + state.user.college + '" required>' +
      '</div>' +
      '<br>' +
      '<button type="submit" class="btn btn-primary">Save Settings</button>' +
    '</form>' +
  '</div>';
}

// --- 5. Navigation Router ---

function navigateTo(pageKey) {
  state.currentPage = pageKey;

  var navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(function(item) {
    if (item.dataset.page === pageKey) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  var container = document.getElementById('pageContainer');
  if (pageKey === 'dashboard') {
    container.innerHTML = renderDashboard();
  } else if (pageKey === 'calendar') {
    container.innerHTML = renderCalendar();
  } else if (pageKey === 'societies') {
    container.innerHTML = renderSocieties();
  } else if (pageKey === 'announcements') {
    container.innerHTML = renderAnnouncements();
  } else if (pageKey === 'settings') {
    container.innerHTML = renderSettings();
    bindSettingsForm();
  }
}

// --- 6. Event Handlers ---

window.toggleSociety = function(socId) {
  var soc = state.societies.find(function(s) { return s.id === socId; });
  if (soc) {
    soc.joined = !soc.joined;
    syncStorage();
    navigateTo('societies');
  }
};

window.filterEventsByDay = function(dayStr) {
  if (state.currentPage !== 'dashboard') return;
  var filtered = state.events.filter(function(ev) { return ev.day === dayStr; });
  var listContainer = document.getElementById('dashboardEventList');
  if (listContainer) {
    listContainer.innerHTML = getEventListHTML(filtered);
  }
};

function updateUserHeader() {
  document.getElementById('profileName').textContent = state.user.name;
  document.getElementById('profileCollege').textContent = state.user.college;
  var initials = state.user.name ? state.user.name.split(' ').map(function(n) { return n[0]; }).join('') : 'LU';
  document.getElementById('userAvatar').textContent = initials;
}

function bindSettingsForm() {
  var form = document.getElementById('settingsForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      state.user.name = document.getElementById('settingName').value;
      state.user.email = document.getElementById('settingEmail').value;
      state.user.college = document.getElementById('settingCollege').value;
      
      syncStorage();
      updateUserHeader();
      alert('Settings updated successfully!');
    });
  }
}

// Global Event Binds
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var email = document.getElementById('loginEmail').value;
  handleLogin(email);
});

document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var name = document.getElementById('signupName').value;
  var email = document.getElementById('signupEmail').value;
  var college = document.getElementById('signupCollege').value;
  handleSignup(name, email, college);
});

document.getElementById('logoutBtn').addEventListener('click', handleLogout);

document.getElementById('globalSearch').addEventListener('input', function(e) {
  var query = e.target.value.toLowerCase();
  if (state.currentPage === 'dashboard') {
    var filtered = state.events.filter(function(ev) { 
      return ev.title.toLowerCase().includes(query) || ev.club.toLowerCase().includes(query);
    });
    var listContainer = document.getElementById('dashboardEventList');
    if (listContainer) {
      listContainer.innerHTML = getEventListHTML(filtered);
    }
  }
});

// Modal Setup
var modal = document.getElementById('eventModal');
var openModalBtn = document.getElementById('openModalBtn');
var closeModalBtn = document.getElementById('closeModal');
var eventForm = document.getElementById('eventForm');

openModalBtn.addEventListener('click', function() { modal.style.display = 'flex'; });
closeModalBtn.addEventListener('click', function() { modal.style.display = 'none'; });

eventForm.addEventListener('submit', function(e) {
  e.preventDefault();
  var title = document.getElementById('eventTitleInput').value;
  var club = document.getElementById('eventClubInput').value;
  var dateVal = document.getElementById('eventDateInput').value;
  var location = document.getElementById('eventLocationInput').value;

  var dateObj = new Date(dateVal);
  var day = String(dateObj.getDate()).padStart(2, '0');
  var monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  var month = monthNames[dateObj.getMonth()];

  state.events.push({
    id: String(Date.now()),
    title: title,
    club: club,
    date: dateVal,
    day: day,
    month: month,
    location: location
  });

  syncStorage();
  modal.style.display = 'none';
  eventForm.reset();
  navigateTo(state.currentPage);
});

document.getElementById('navMenu').addEventListener('click', function(e) {
  if (e.target.classList.contains('nav-item')) {
    e.preventDefault();
    var page = e.target.dataset.page;
    navigateTo(page);
  }
});

// Initialize Portal View State
document.addEventListener('DOMContentLoaded', function() {
  checkAuthAndRender();
});