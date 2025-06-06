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
  
  // Dynamic form fields for prizes
  const addPrizeBtn = document.getElementById('add-prize');
  if (addPrizeBtn) {
    addPrizeBtn.addEventListener('click', function() {
      const prizesContainer = document.getElementById('prizes-container');
      const prizeIndex = document.querySelectorAll('.prize-item').length;
      
      const prizeHtml = `
        <div class="prize-item card mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="card-title mb-0">Prize ${prizeIndex + 1}</h5>
              <button type="button" class="btn btn-sm btn-outline-danger remove-prize">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="row g-3">
              <div class="col-md-6">
                <div class="form-group">
                  <label>Prize Name</label>
                  <input type="text" name="prizes[${prizeIndex}][name]" class="form-control" required>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label>Color</label>
                  <div class="input-group">
                    <span class="input-group-text color-preview" style="background-color: #36A2EB;"></span>
                    <input type="color" name="prizes[${prizeIndex}][color]" class="form-control form-control-color color-picker" value="#36A2EB">
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label>Probability (%)</label>
                  <input type="number" name="prizes[${prizeIndex}][probability]" class="form-control" min="0" max="100" required>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label>Quantity</label>
                  <input type="number" name="prizes[${prizeIndex}][quantity]" class="form-control" min="0" required>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label>Image URL (Optional)</label>
                  <input type="url" name="prizes[${prizeIndex}][image]" class="form-control">
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = prizeHtml;
      prizesContainer.appendChild(tempDiv.firstElementChild);
      
      // Add event listener to new remove button
      const removeButtons = document.querySelectorAll('.remove-prize');
      removeButtons.forEach(button => {
        button.addEventListener('click', function() {
          this.closest('.prize-item').remove();
          updatePrizeNumbers();
        });
      });
      
      // Add event listener to new color picker
      const newColorPicker = prizesContainer.querySelector(`.prize-item:last-child .color-picker`);
      newColorPicker.addEventListener('input', function() {
        const preview = this.parentElement.querySelector('.color-preview');
        if (preview) {
          preview.style.backgroundColor = this.value;
        }
      });
    });
    
    // Function to update prize numbers after removal
    function updatePrizeNumbers() {
      const prizeItems = document.querySelectorAll('.prize-item');
      prizeItems.forEach((item, index) => {
        item.querySelector('.card-title').textContent = `Prize ${index + 1}`;
      });
    }
    
    // Event delegation for remove buttons
    document.addEventListener('click', function(e) {
      if (e.target.closest('.remove-prize')) {
        e.target.closest('.prize-item').remove();
        updatePrizeNumbers();
      }
    });
  }
});
 