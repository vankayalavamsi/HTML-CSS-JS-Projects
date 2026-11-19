/* ============================================
   DIGITAL COMPLAINT BOX - Main JavaScript
   Handles all logic for the application.
   Data is stored in localStorage (no backend).
   ============================================ */

// ==========================================
// SECTION 1: Configuration & Constants
// ==========================================

// Valid login credentials for the demo
var CREDENTIALS = {
  student: { username: 'student', password: 'student123', name: 'Student User', id: 'STU2024001' },
  admin:   { username: 'admin',   password: 'admin123',   name: 'Administrator',  id: 'ADM001' }
};

// Available complaint categories
var CATEGORIES = [
  'Academics', 'Faculty', 'Examination',
  'Hostel', 'Library', 'Transport',
  'Infrastructure', 'Other'
];

// Possible complaint statuses
var STATUSES = ['Pending', 'In Progress', 'Resolved'];


// ==========================================
// SECTION 2: Local Storage Helpers
// ==========================================

/**
 * Get data from localStorage by key.
 * Returns null if the key doesn't exist.
 */
function getFromStorage(key) {
  try {
    var data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Save data to localStorage as JSON.
 */
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

/**
 * Remove a key from localStorage.
 */
function removeFromStorage(key) {
  localStorage.removeItem(key);
}


// ==========================================
// SECTION 3: Sample Data Initialization
// ==========================================

/**
 * If this is the first time the app is opened
 * (no complaints in localStorage), create some
 * sample complaints for demonstration purposes.
 */
function initializeSampleData() {
  var complaints = getFromStorage('complaints');

  if (!complaints || complaints.length === 0) {
    var sampleComplaints = [
      {
        id: 'CMP-20250115-001',
        studentName: 'Rahul Sharma',
        studentId: 'STU2024001',
        category: 'Academics',
        title: 'Outdated syllabus for Data Structures course',
        description: 'The current syllabus for the Data Structures course (CS201) has not been updated in three years. Many topics covered are no longer relevant to industry standards, and important modern concepts like advanced tree structures and graph algorithms used in competitive programming are missing. Requesting a revision of the syllabus at the earliest.',
        status: 'In Progress',
        date: '2025-01-15T10:30:00'
      },
      {
        id: 'CMP-20250118-002',
        studentName: 'Priya Patel',
        studentId: 'STU2024015',
        category: 'Hostel',
        title: 'Water supply issue in Block B, Room 204',
        description: 'There has been no water supply in Block B, Room 204 for the past 3 days. The issue has been reported to the hostel warden verbally but no action has been taken yet. This is affecting daily hygiene and routine. Please resolve this urgently.',
        status: 'Pending',
        date: '2025-01-18T08:15:00'
      },
      {
        id: 'CMP-20250120-003',
        studentName: 'Amit Kumar',
        studentId: 'STU2024023',
        category: 'Infrastructure',
        title: 'Broken chairs in Lecture Hall 5',
        description: 'At least 8 chairs in Lecture Hall 5 are broken or unstable. Students are forced to stand or sit on the floor during lectures. This has been an issue for over two weeks. Requesting immediate repair or replacement of the furniture.',
        status: 'Resolved',
        date: '2025-01-20T14:00:00'
      },
      {
        id: 'CMP-20250122-004',
        studentName: 'Sneha Reddy',
        studentId: 'STU2024008',
        category: 'Library',
        title: 'Insufficient copies of reference books',
        description: 'There are only 2 copies of "Introduction to Algorithms" by Cormen available in the library for a batch of 120 students. Many students are unable to access this essential reference book. Requesting the library to procure at least 5 more copies.',
        status: 'Pending',
        date: '2025-01-22T11:45:00'
      },
      {
        id: 'CMP-20250125-005',
        studentName: 'Rahul Sharma',
        studentId: 'STU2024001',
        category: 'Examination',
        title: 'Exam schedule clash between two subjects',
        description: 'The midterm exam for Database Management Systems (CS301) and Operating Systems (CS302) have been scheduled on the same date and time slot (March 15, 10:00 AM). This is impossible for students enrolled in both courses. Requesting the examination cell to reschedule one of the exams.',
        status: 'In Progress',
        date: '2025-01-25T09:00:00'
      },
      {
        id: 'CMP-20250128-006',
        studentName: 'Kavitha Nair',
        studentId: 'STU2024031',
        category: 'Transport',
        title: 'Bus Route 3 not covering new stop',
        description: 'Many students from the newly developed residential area near Sunrise Apartments need to use Bus Route 3, but the bus does not stop there. The nearest stop is 1.5 km away, which is inconvenient especially during monsoon. Requesting the addition of a new stop on Route 3.',
        status: 'Pending',
        date: '2025-01-28T16:20:00'
      }
    ];

    saveToStorage('complaints', sampleComplaints);
  }
}

// Run sample data initialization when this script loads
initializeSampleData();


// ==========================================
// SECTION 4: Authentication Functions
// ==========================================

/**
 * Attempt to log in a user.
 * Returns the user object if credentials match, or null.
 */
function loginUser(role, username, password) {
  var validUser = CREDENTIALS[role];
  if (validUser && validUser.username === username && validUser.password === password) {
    // Save session info to localStorage
    saveToStorage('loggedInUser', {
      role: role,
      username: validUser.username,
      name: validUser.name,
      id: validUser.id
    });
    return validUser;
  }
  return null;
}

/**
 * Log out the current user by removing session data.
 */
function logoutUser() {
  removeFromStorage('loggedInUser');
  window.location.href = 'index.html';
}

/**
 * Check if a user is logged in with the given role.
 * If not, redirect to the appropriate login page.
 */
function requireAuth(requiredRole) {
  var user = getFromStorage('loggedInUser');
  if (!user || user.role !== requiredRole) {
    if (requiredRole === 'student') {
      window.location.href = 'login.html';
    } else {
      window.location.href = 'admin-login.html';
    }
    return null;
  }
  return user;
}

/**
 * Get the currently logged-in user, or null.
 */
function getCurrentUser() {
  return getFromStorage('loggedInUser');
}


// ==========================================
// SECTION 5: Complaint Functions
// ==========================================

/**
 * Get all complaints from localStorage.
 */
function getAllComplaints() {
  return getFromStorage('complaints') || [];
}

/**
 * Get complaints submitted by a specific student ID.
 */
function getComplaintsByStudent(studentId) {
  var all = getAllComplaints();
  return all.filter(function(c) {
    return c.studentId === studentId;
  });
}

/**
 * Generate a unique complaint ID.
 * Format: CMP-YYYYMMDD-XXX
 */
function generateComplaintId() {
  var now = new Date();
  var dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');

  var complaints = getAllComplaints();

  // Find the highest sequence number for today
  var maxNum = 0;
  var prefix = 'CMP-' + dateStr + '-';
  complaints.forEach(function(c) {
    if (c.id && c.id.indexOf(prefix) === 0) {
      var numStr = c.id.replace(prefix, '');
      var num = parseInt(numStr, 10);
      if (num > maxNum) maxNum = num;
    }
  });

  var nextNum = maxNum + 1;
  return prefix + String(nextNum).padStart(3, '0');
}

/**
 * Submit a new complaint and save it.
 */
function submitComplaint(studentName, studentId, category, title, description) {
  var complaints = getAllComplaints();
  var newComplaint = {
    id: generateComplaintId(),
    studentName: studentName,
    studentId: studentId,
    category: category,
    title: title,
    description: description,
    status: 'Pending',
    date: new Date().toISOString()
  };
  complaints.push(newComplaint);
  saveToStorage('complaints', complaints);
  return newComplaint;
}

/**
 * Update the status of a complaint by its ID.
 */
function updateComplaintStatus(complaintId, newStatus) {
  var complaints = getAllComplaints();
  var found = false;
  complaints.forEach(function(c) {
    if (c.id === complaintId) {
      c.status = newStatus;
      found = true;
    }
  });
  if (found) {
    saveToStorage('complaints', complaints);
  }
  return found;
}

/**
 * Delete a complaint by its ID permanently.
 */
function deleteComplaint(complaintId) {
  var complaints = getAllComplaints();
  var filtered = complaints.filter(function(c) {
    return c.id !== complaintId;
  });
  saveToStorage('complaints', filtered);
}

/**
 * Find a single complaint by its ID.
 */
function getComplaintById(complaintId) {
  var complaints = getAllComplaints();
  for (var i = 0; i < complaints.length; i++) {
    if (complaints[i].id === complaintId) {
      return complaints[i];
    }
  }
  return null;
}


// ==========================================
// SECTION 6: UI Utility Functions
// ==========================================

/**
 * Show a toast notification at the top-right.
 * type: 'success', 'error', or 'info'
 */
function showToast(message, type) {
  type = type || 'success';

  // Create the toast container if it doesn't exist
  var container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Create toast element
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;

  // Choose an icon based on type
  var icon = '';
  if (type === 'success') icon = '\u2713 ';
  else if (type === 'error') icon = '\u2717 ';
  else icon = '\u2139 ';

  toast.textContent = icon + message;
  container.appendChild(toast);

  // Remove the toast after 3 seconds with a fade-out
  setTimeout(function() {
    toast.classList.add('toast-out');
    setTimeout(function() {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

/**
 * Format an ISO date string to a readable format.
 * e.g., "2025-01-15T10:30:00" -> "15 Jan 2025, 10:30 AM"
 */
function formatDate(isoString) {
  var d = new Date(isoString);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var day = String(d.getDate()).padStart(2, '0');
  var month = months[d.getMonth()];
  var year = d.getFullYear();
  var hours = d.getHours();
  var minutes = String(d.getMinutes()).padStart(2, '0');
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return day + ' ' + month + ' ' + year + ', ' + hours + ':' + minutes + ' ' + ampm;
}

/**
 * Return the HTML for a status badge.
 */
function getStatusBadge(status) {
  var cls = 'badge ';
  if (status === 'Pending') cls += 'badge-pending';
  else if (status === 'In Progress') cls += 'badge-in-progress';
  else if (status === 'Resolved') cls += 'badge-resolved';
  return '<span class="' + cls + '">' + status + '</span>';
}

/**
 * Return the HTML for a category badge.
 */
function getCategoryBadge(category) {
  return '<span class="badge-category">' + category + '</span>';
}

/**
 * Open the complaint detail modal with the given complaint data.
 */
function openComplaintModal(complaintId) {
  var complaint = getComplaintById(complaintId);
  if (!complaint) return;

  var overlay = document.getElementById('complaint-modal');
  if (!overlay) return;

  // Fill in the modal content
  var body = overlay.querySelector('.modal-body');
  if (body) {
    body.innerHTML =
      '<div class="detail-row">' +
        '<div class="detail-label">Complaint ID</div>' +
        '<div class="detail-value" style="font-family:monospace;font-weight:600;">' + complaint.id + '</div>' +
      '</div>' +
      '<div class="detail-row">' +
        '<div class="detail-label">Student Name</div>' +
        '<div class="detail-value">' + complaint.studentName + '</div>' +
      '</div>' +
      '<div class="detail-row">' +
        '<div class="detail-label">Student ID</div>' +
        '<div class="detail-value">' + complaint.studentId + '</div>' +
      '</div>' +
      '<div class="detail-row">' +
        '<div class="detail-label">Category</div>' +
        '<div class="detail-value">' + getCategoryBadge(complaint.category) + '</div>' +
      '</div>' +
      '<div class="detail-row">' +
        '<div class="detail-label">Title</div>' +
        '<div class="detail-value" style="font-weight:600;">' + complaint.title + '</div>' +
      '</div>' +
      '<div class="detail-row">' +
        '<div class="detail-label">Description</div>' +
        '<div class="detail-value desc">' + complaint.description + '</div>' +
      '</div>' +
      '<div class="detail-row">' +
        '<div class="detail-label">Status</div>' +
        '<div class="detail-value">' + getStatusBadge(complaint.status) + '</div>' +
      '</div>' +
      '<div class="detail-row">' +
        '<div class="detail-label">Submitted On</div>' +
        '<div class="detail-value">' + formatDate(complaint.date) + '</div>' +
      '</div>';
  }

  // Store the complaint ID for the footer buttons
  overlay.setAttribute('data-complaint-id', complaintId);

  // Show the modal
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close the complaint detail modal.
 */
function closeComplaintModal() {
  var overlay = document.getElementById('complaint-modal');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Show the delete confirmation modal.
 */
function showDeleteConfirm(complaintId) {
  var overlay = document.getElementById('delete-modal');
  if (!overlay) return;

  overlay.setAttribute('data-complaint-id', complaintId);
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close the delete confirmation modal.
 */
function closeDeleteConfirm() {
  var overlay = document.getElementById('delete-modal');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Toggle the mobile navigation menu.
 */
function toggleMobileMenu() {
  var links = document.querySelector('.nav-links');
  var hamburger = document.querySelector('.hamburger');
  if (links) links.classList.toggle('open');
  if (hamburger) hamburger.classList.toggle('open');
}

/**
 * Set the active navigation link based on the current page.
 */
function setActiveNavLink() {
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var links = document.querySelectorAll('.nav-links a:not(.btn-logout)');
  links.forEach(function(link) {
    var href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Populate a <select> element with category options.
 */
function populateCategories(selectId) {
  var select = document.getElementById(selectId);
  if (!select) return;
  // Clear existing options except the first placeholder
  while (select.options.length > 1) {
    select.remove(1);
  }
  CATEGORIES.forEach(function(cat) {
    var opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

/**
 * Populate a <select> element with status options.
 */
function populateStatuses(selectId) {
  var select = document.getElementById(selectId);
  if (!select) return;
  while (select.options.length > 1) {
    select.remove(1);
  }
  STATUSES.forEach(function(s) {
    var opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    select.appendChild(opt);
  });
}


// ==========================================
// SECTION 7: Page-Specific Initialization
// ==========================================

/**
 * HOME PAGE - No special logic needed beyond navigation.
 */
function initHomePage() {
  setActiveNavLink();
}

/**
 * STUDENT LOGIN PAGE - Handle login form submission.
 */
function initStudentLoginPage() {
  setActiveNavLink();

  var form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var username = document.getElementById('username').value.trim();
    var password = document.getElementById('password').value.trim();
    var errorEl = document.getElementById('login-error');

    if (!username || !password) {
      errorEl.textContent = 'Please enter both username and password.';
      errorEl.style.display = 'block';
      return;
    }

    var result = loginUser('student', username, password);
    if (result) {
      showToast('Login successful! Welcome, ' + result.name + '.', 'success');
      setTimeout(function() {
        window.location.href = 'student-dashboard.html';
      }, 600);
    } else {
      errorEl.textContent = 'Invalid username or password.';
      errorEl.style.display = 'block';
    }
  });
}

/**
 * ADMIN LOGIN PAGE - Handle login form submission.
 */
function initAdminLoginPage() {
  setActiveNavLink();

  var form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var username = document.getElementById('username').value.trim();
    var password = document.getElementById('password').value.trim();
    var errorEl = document.getElementById('login-error');

    if (!username || !password) {
      errorEl.textContent = 'Please enter both username and password.';
      errorEl.style.display = 'block';
      return;
    }

    var result = loginUser('admin', username, password);
    if (result) {
      showToast('Admin login successful!', 'success');
      setTimeout(function() {
        window.location.href = 'admin-dashboard.html';
      }, 600);
    } else {
      errorEl.textContent = 'Invalid username or password.';
      errorEl.style.display = 'block';
    }
  });
}

/**
 * STUDENT DASHBOARD - Show welcome message and quick links.
 */
function initStudentDashboard() {
  var user = requireAuth('student');
  if (!user) return;
  setActiveNavLink();

  // Set welcome message
  var welcomeEl = document.getElementById('welcome-name');
  if (welcomeEl) welcomeEl.textContent = user.name;

  // Show complaint count for this student
  var myComplaints = getComplaintsByStudent(user.id);
  var countEl = document.getElementById('my-complaint-count');
  if (countEl) countEl.textContent = myComplaints.length;

  // Count pending
  var pendingCount = myComplaints.filter(function(c) { return c.status === 'Pending'; }).length;
  var pendingEl = document.getElementById('pending-count');
  if (pendingEl) pendingEl.textContent = pendingCount;
}

/**
 * SUBMIT COMPLAINT PAGE - Handle complaint form.
 */
function initSubmitComplaintPage() {
  var user = requireAuth('student');
  if (!user) return;
  setActiveNavLink();

  // Pre-fill name and ID
  var nameInput = document.getElementById('student-name');
  var idInput = document.getElementById('student-id');
  if (nameInput) nameInput.value = user.name;
  if (idInput) idInput.value = user.id;

  // Populate category dropdown
  populateCategories('category');

  var form = document.getElementById('complaint-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var name = nameInput.value.trim();
    var sid = idInput.value.trim();
    var category = document.getElementById('category').value;
    var title = document.getElementById('complaint-title').value.trim();
    var desc = document.getElementById('complaint-desc').value.trim();
    var errorEl = document.getElementById('form-error');

    // Validation
    if (!name || !sid) {
      errorEl.textContent = 'Student name and ID are required.';
      errorEl.style.display = 'block';
      return;
    }
    if (!category) {
      errorEl.textContent = 'Please select a category.';
      errorEl.style.display = 'block';
      return;
    }
    if (!title) {
      errorEl.textContent = 'Please enter a complaint title.';
      errorEl.style.display = 'block';
      return;
    }
    if (title.length < 5) {
      errorEl.textContent = 'Title must be at least 5 characters long.';
      errorEl.style.display = 'block';
      return;
    }
    if (!desc) {
      errorEl.textContent = 'Please write a description.';
      errorEl.style.display = 'block';
      return;
    }
    if (desc.length < 20) {
      errorEl.textContent = 'Description must be at least 20 characters long.';
      errorEl.style.display = 'block';
      return;
    }

    // Submit the complaint
    var newComplaint = submitComplaint(name, sid, category, title, desc);

    // Clear the form
    document.getElementById('complaint-title').value = '';
    document.getElementById('complaint-desc').value = '';
    document.getElementById('category').selectedIndex = 0;
    errorEl.style.display = 'none';

    // Show success and display the generated ID
    showToast('Complaint submitted successfully!', 'success');

    var idDisplay = document.getElementById('generated-id');
    if (idDisplay) {
      idDisplay.textContent = newComplaint.id;
      idDisplay.parentElement.style.display = 'block';
    }
  });
}

/**
 * MY COMPLAINTS PAGE (Student) - Display student's complaints.
 */
function initMyComplaintsPage() {
  var user = requireAuth('student');
  if (!user) return;
  setActiveNavLink();

  var complaints = getComplaintsByStudent(user.id);
  var tbody = document.getElementById('complaints-tbody');
  var emptyState = document.getElementById('empty-state');

  if (!tbody) return;

  if (complaints.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  // Sort by date, newest first
  complaints.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  var html = '';
  complaints.forEach(function(c) {
    html +=
      '<tr>' +
        '<td style="font-family:monospace;font-size:0.82rem;">' + c.id + '</td>' +
        '<td>' + getCategoryBadge(c.category) + '</td>' +
        '<td>' + c.title + '</td>' +
        '<td>' + getStatusBadge(c.status) + '</td>' +
        '<td style="font-size:0.82rem;color:var(--text-light);white-space:nowrap;">' + formatDate(c.date) + '</td>' +
        '<td>' +
          '<button class="btn btn-sm btn-outline" onclick="openComplaintModal(\'' + c.id + '\')">View</button>' +
        '</td>' +
      '</tr>';
  });

  tbody.innerHTML = html;
}

/**
 * ADMIN DASHBOARD - Show stats, table, search, filter, and actions.
 */
function initAdminDashboard() {
  var user = requireAuth('admin');
  if (!user) return;
  setActiveNavLink();

  // Populate filter dropdowns
  populateCategories('filter-category');
  populateStatuses('filter-status');

  // Render everything
  renderAdminDashboard();

  // Search input - filter as user types
  var searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      renderAdminDashboard();
    });
  }

  // Category filter
  var catFilter = document.getElementById('filter-category');
  if (catFilter) {
    catFilter.addEventListener('change', function() {
      renderAdminDashboard();
    });
  }

  // Status filter
  var statusFilter = document.getElementById('filter-status');
  if (statusFilter) {
    statusFilter.addEventListener('change', function() {
      renderAdminDashboard();
    });
  }
}

/**
 * Render (or re-render) the admin dashboard stats and table.
 * Reads current filter values from the DOM.
 */
function renderAdminDashboard() {
  var allComplaints = getAllComplaints();

  // ---- Update Summary Stats ----
  var total = allComplaints.length;
  var pending = allComplaints.filter(function(c) { return c.status === 'Pending'; }).length;
  var inProgress = allComplaints.filter(function(c) { return c.status === 'In Progress'; }).length;
  var resolved = allComplaints.filter(function(c) { return c.status === 'Resolved'; }).length;

  var elTotal = document.getElementById('stat-total');
  var elPending = document.getElementById('stat-pending');
  var elInProgress = document.getElementById('stat-in-progress');
  var elResolved = document.getElementById('stat-resolved');

  if (elTotal) elTotal.textContent = total;
  if (elPending) elPending.textContent = pending;
  if (elInProgress) elInProgress.textContent = inProgress;
  if (elResolved) elResolved.textContent = resolved;

  // ---- Apply Filters ----
  var searchTerm = '';
  var searchInput = document.getElementById('search-input');
  if (searchInput) searchTerm = searchInput.value.trim().toLowerCase();

  var filterCat = '';
  var catSelect = document.getElementById('filter-category');
  if (catSelect) filterCat = catSelect.value;

  var filterStatus = '';
  var statusSelect = document.getElementById('filter-status');
  if (statusSelect) filterStatus = statusSelect.value;

  var filtered = allComplaints.filter(function(c) {
    // Search: match against ID, name, title, description
    var matchesSearch = true;
    if (searchTerm) {
      var searchStr = (c.id + ' ' + c.studentName + ' ' + c.studentId + ' ' + c.title + ' ' + c.description).toLowerCase();
      matchesSearch = searchStr.indexOf(searchTerm) !== -1;
    }

    // Category filter
    var matchesCat = true;
    if (filterCat) {
      matchesCat = c.category === filterCat;
    }

    // Status filter
    var matchesStatus = true;
    if (filterStatus) {
      matchesStatus = c.status === filterStatus;
    }

    return matchesSearch && matchesCat && matchesStatus;
  });

  // ---- Render Table ----
  var tbody = document.getElementById('admin-tbody');
  var emptyState = document.getElementById('admin-empty');

  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  // Sort by date, newest first
  filtered.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  var html = '';
  filtered.forEach(function(c) {
    html +=
      '<tr>' +
        '<td style="font-family:monospace;font-size:0.8rem;">' + c.id + '</td>' +
        '<td>' + c.studentName + '</td>' +
        '<td style="font-size:0.82rem;">' + c.studentId + '</td>' +
        '<td>' + getCategoryBadge(c.category) + '</td>' +
        '<td style="max-width:180px;">' + c.title + '</td>' +
        '<td>' + getStatusBadge(c.status) + '</td>' +
        '<td style="font-size:0.8rem;color:var(--text-light);white-space:nowrap;">' + formatDate(c.date) + '</td>' +
        '<td>' +
          '<div class="table-actions">' +
            '<button class="btn btn-sm btn-outline" onclick="openComplaintModal(\'' + c.id + '\')">View</button>' +
            '<button class="btn btn-sm btn-danger" onclick="showDeleteConfirm(\'' + c.id + '\')">Delete</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
  });

  tbody.innerHTML = html;
}


// ==========================================
// SECTION 8: Event Listeners (Global)
// ==========================================

/**
 * This runs when the DOM is fully loaded.
 * It detects which page we're on and runs
 * the appropriate initialization function.
 */
document.addEventListener('DOMContentLoaded', function() {

  // Determine the current page from the filename
  var page = window.location.pathname.split('/').pop() || 'index.html';

  switch (page) {
    case 'index.html':
    case '':
      initHomePage();
      break;
    case 'login.html':
      initStudentLoginPage();
      break;
    case 'student-dashboard.html':
      initStudentDashboard();
      break;
    case 'submit-complaint.html':
      initSubmitComplaintPage();
      break;
    case 'my-complaints.html':
      initMyComplaintsPage();
      break;
    case 'admin-login.html':
      initAdminLoginPage();
      break;
    case 'admin-dashboard.html':
      initAdminDashboard();
      break;
  }

  // ---- Hamburger menu toggle ----
  var hamburgerBtn = document.querySelector('.hamburger');
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMobileMenu);
  }

  // ---- Logout button ----
  var logoutBtns = document.querySelectorAll('.btn-logout');
  logoutBtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      logoutUser();
    });
  });

  // ---- Close complaint modal when clicking overlay or X ----
  var complaintModal = document.getElementById('complaint-modal');
  if (complaintModal) {
    // Close on overlay click (not on modal content)
    complaintModal.addEventListener('click', function(e) {
      if (e.target === complaintModal) {
        closeComplaintModal();
      }
    });

    // Close on X button
    var closeBtn = complaintModal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeComplaintModal);
    }

    // Update status button (admin only)
    var updateBtn = document.getElementById('btn-update-status');
    if (updateBtn) {
      updateBtn.addEventListener('click', function() {
        var cId = complaintModal.getAttribute('data-complaint-id');
        var statusSelect = document.getElementById('modal-status-select');
        if (cId && statusSelect && statusSelect.value) {
          updateComplaintStatus(cId, statusSelect.value);
          showToast('Status updated to "' + statusSelect.value + '"', 'success');
          closeComplaintModal();
          // Re-render admin table if we're on that page
          renderAdminDashboard();
        }
      });
    }
  }

  // ---- Delete confirmation modal ----
  var deleteModal = document.getElementById('delete-modal');
  if (deleteModal) {
    // Close on overlay click
    deleteModal.addEventListener('click', function(e) {
      if (e.target === deleteModal) {
        closeDeleteConfirm();
      }
    });

    // Close on cancel button
    var cancelBtn = deleteModal.querySelector('.btn-cancel-delete');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeDeleteConfirm);
    }

    // Confirm delete button
    var confirmBtn = document.getElementById('btn-confirm-delete');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function() {
        var cId = deleteModal.getAttribute('data-complaint-id');
        if (cId) {
          deleteComplaint(cId);
          showToast('Complaint deleted permanently.', 'info');
          closeDeleteConfirm();
          // Re-render admin table
          renderAdminDashboard();
        }
      });
    }
  }

  // ---- Close modals with Escape key ----
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeComplaintModal();
      closeDeleteConfirm();
    }
  });
});