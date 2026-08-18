// --- Application Data ---
var user = {
  name: 'Jane Doe',
  college: 'Lancaster University'
};

var societies = [
  { id: '1', name: 'Computer Science Society', role: 'Executive Member', members: 340, joined: true },
  { id: '2', name: 'Rowing Club', role: 'General Member', members: 120, joined: true },
  { id: '3', name: 'Debating Society', role: 'General Member', members: 85, joined: true },
  { id: '4', name: 'Hiking Society', role: 'Member', members: 210, joined: false }
];

var events = [
  { id: '101', title: 'CS Welcome Pizza Night', club: 'Computer Science Society', day: '06', month: 'OCT', location: 'Bowland Main Hall' },
  { id: '102', title: 'Rowing Club Term Briefing', club: 'Rowing Club', day: '09', month: 'OCT', location: 'Sports Centre Rm 2' },
  { id: '103', title: '24-Hour Autumn Hackathon', club: 'Computer Science Society', day: '14', month: 'OCT', location: 'InfoLab21' }
];

var announcements = [
  { title: 'Freshers Fair Registration Open', club: 'Students Union', body: 'Ensure your society desk is booked before week 1.', date: '2026-10-01' },
  { title: 'Safety Briefing Requirement', club: 'Sports Centre', body: 'All sports clubs must submit risk assessments by Friday.', date: '2026-10-03' }
];

// --- Helper Functions ---
function buildEventList(eventArray) {
  if (!eventArray || eventArray.length === 0) {
    return '<p style="color: var(--text-muted); font-size: 0.85rem;">No events found.</p>';
  }
  var html = '<ul class="event-list">';
  for (var i = 0; i < eventArray.length; i++) {
    var ev = eventArray[i];
    html += '<li class="event-item">' +
      '<div class="event-date-box">' +
        '<span class="date-num">' + ev.day + '</span>' +
        '<span class="date-month">' + ev.month + '</span>' +
      '</div>' +
      '<div class="event-details">' +
        '<span class="event-title" style="font-weight:600;">' + ev.title + '</span>' +
        '<span class="event-meta">' + ev.club + ' • ' + ev.location + '</span>' +
      '</div>' +
    '</li>';
  }
  html += '</ul>';
  return html;
}

function buildCalendarGrid() {
  var html = '<div class="calendar-grid">' +
    '<div class="day-label">Sun</div><div class="day-label">Mon</div><div class="day-label">Tue</div>' +
    '<div class="day-label">Wed</div><div class="day-label">Thu</div><div class="day-label">Fri</div><div class="day-label">Sat</div>' +
    '<div class="day cell-disabled">27</div><div class="day cell-disabled">28</div>' +
    '<div class="day cell-disabled">29</div><div class="day cell-disabled">30</div>';

  for (var d = 1; d <= 31; d++) {
    var dayStr = String(d).padStart(2, '0');
    var hasEvent = (d === 6 || d === 9 || d === 14);
    var isToday = (d === 12);
    
    html += '<div class="day ' + (isToday ? 'today' : '') + '">' +
      '<span class="day-number">' + d + '</span>' +
      (hasEvent ? '<span class="event-tag">Event</span>' : '') +
    '</div>';
  }
  html += '</div>';
  return html;
}

// --- Page Renderers ---
function renderDashboard() {
  var joinedCount = societies.filter(function(s) { return s.joined; }).length;

  return '<div class="metrics-row">' +
    '<div class="card metric-card"><span class="metric-title">Joined Clubs</span><span class="metric-value">' + joinedCount + '</span></div>' +
    '<div class="card metric-card"><span class="metric-title">Upcoming Events</span><span class="metric-value">' + events.length + '</span></div>' +
    '<div class="card metric-card"><span class="metric-title">Announcements</span><span class="metric-value">' + announcements.length + '</span></div>' +
  '</div>' +
  '<div class="content-split">' +
    '<div class="card"><h3>October 2026</h3><br>' + buildCalendarGrid() + '</div>' +
    '<div class="card"><h3>Upcoming Activities</h3><br><div id="dashboardEvents">' + buildEventList(events) + '</div></div>' +
  '</div>';
}

function renderCalendar() {
  return '<div class="card"><h2>October 2026 Calendar</h2><br>' + buildCalendarGrid() + '</div>';
}

function renderSocieties() {
  var html = '<div class="grid-3">';
  for (var i = 0; i < societies.length; i++) {
    var s = societies[i];
    html += '<div class="card society-card">' +
      '<span class="badge">' + s.role + '</span>' +
      '<h3 style="margin-top:0.5rem;">' + s.name + '</h3>' +
      '<p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1rem;">Members: ' + s.members + '</p>' +
      '<button class="btn ' + (s.joined ? 'btn-outline' : 'btn-primary') + '" onclick="toggleJoin(' + i + ')">' +
        (s.joined ? 'Leave Club' : 'Join Club') +
      '</button>' +
    '</div>';
  }
  html += '</div>';
  return html;
}

function renderAnnouncements() {
  var html = '<div class="stack-layout">';
  for (var i = 0; i < announcements.length; i++) {
    var a = announcements[i];
    html += '<div class="card announcement-card">' +
      '<h3>' + a.title + '</h3>' +
      '<span class="badge" style="margin-top:0.5rem;">' + a.club + '</span>' +
      '<p style="margin-top:0.75rem;">' + a.body + '</p>' +
      '<div class="announcement-meta">Posted on ' + a.date + '</div>' +
    '</div>';
  }
  html += '</div>';
  return html;
}

function renderSettings() {
  return '<div class="card" style="max-width:500px;">' +
    '<h2>User Settings</h2><br>' +
    '<div class="form-group"><label>Full Name</label><input type="text" id="setName" value="' + user.name + '"></div>' +
    '<div class="form-group"><label>College</label><input type="text" id="setCollege" value="' + user.college + '"></div>' +
    '<br><button class="btn btn-primary" onclick="saveSettings()">Save Settings</button>' +
  '</div>';
}

// --- Navigation Logic ---
function navigateTo(page) {
  var container = document.getElementById('pageContainer');
  if (!container) return;

  // Update Nav Active Styling
  var navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(function(item) {
    if (item.getAttribute('data-page') === page) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Switch View Content
  if (page === 'dashboard') container.innerHTML = renderDashboard();
  else if (page === 'calendar') container.innerHTML = renderCalendar();
  else if (page === 'societies') container.innerHTML = renderSocieties();
  else if (page === 'announcements') container.innerHTML = renderAnnouncements();
  else if (page === 'settings') container.innerHTML = renderSettings();
}

// --- Interactive Handlers ---
window.toggleJoin = function(index) {
  societies[index].joined = !societies[index].joined;
  navigateTo('societies');
};

window.saveSettings = function() {
  user.name = document.getElementById('setName').value;
  user.college = document.getElementById('setCollege').value;
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileCollege').textContent = user.college;
  alert('Settings saved!');
};

// Search Bar Listener
document.getElementById('globalSearch').addEventListener('input', function(e) {
  var query = e.target.value.toLowerCase();
  var filtered = events.filter(function(ev) {
    return ev.title.toLowerCase().indexOf(query) !== -1 || ev.club.toLowerCase().indexOf(query) !== -1;
  });
  var eventBox = document.getElementById('dashboardEvents');
  if (eventBox) eventBox.innerHTML = buildEventList(filtered);
});

// Modal Dialog Controls
var modal = document.getElementById('eventModal');
document.getElementById('openModalBtn').addEventListener('click', function() { modal.style.display = 'flex'; });
document.getElementById('closeModal').addEventListener('click', function() { modal.style.display = 'none'; });

document.getElementById('eventForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var title = document.getElementById('eventTitleInput').value;
  var club = document.getElementById('eventClubInput').value;
  
  events.push({
    id: String(Date.now()),
    title: title,
    club: club,
    day: '18',
    month: 'OCT',
    location: 'Campus'
  });

  modal.style.display = 'none';
  this.reset();
  navigateTo('dashboard');
});

// Sidebar Click Listener
document.getElementById('navMenu').addEventListener('click', function(e) {
  if (e.target.classList.contains('nav-item')) {
    e.preventDefault();
    var page = e.target.getAttribute('data-page');
    navigateTo(page);
  }
});

// --- Boot Application ---
// Run immediately once file loads
navigateTo('dashboard');