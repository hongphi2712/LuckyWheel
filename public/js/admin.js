document.addEventListener('DOMContentLoaded',  function() {
  // Toggle sidebar on mobile
  const sidebarToggle = document.getElementById('sidebarToggleTop');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
      document.querySelector('.sidebar').classList.toggle('toggled');
      document.querySelector('.content-wrapper').classList.toggle('sidebar-toggled');
    });
  }
  
  // Highlight active sidebar item
  const currentPath = window.location.pathname;
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  
  sidebarItems.forEach(item => {
    const itemPath = item.getAttribute('href');
    if (currentPath.startsWith(itemPath) && itemPath !== '/') {
      item.classList.add('active');
    }
  });
  
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Initialize popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
  
  // Add confirm dialog to delete buttons
  const deleteButtons = document.querySelectorAll('.btn-delete');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        e.preventDefault();
      }
    });
  });
  
  // Color picker for prize colors
  const colorPickers = document.querySelectorAll('.color-picker');
  colorPickers.forEach(picker => {
    picker.addEventListener('input', function() {
      const preview = this.parentElement.querySelector('.color-preview');
      if (preview) {
        preview.style.backgroundColor = this.value;
      }
    });
  });
  
});