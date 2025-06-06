document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const canvas = document.getElementById('wheel');
  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('start-spin');
  
  // Ensure all elements exist before proceeding
  if (!canvas || !startBtn) {
    console.error('Required DOM elements not found');
    return;
  }
  
  // Setup modal if it exists
  let resultModal = null;
  const modalElement = document.getElementById('resultModal');
  if (modalElement && typeof bootstrap !== 'undefined') {
    resultModal = new bootstrap.Modal(modalElement);
  }
  
  // Check if campaign data is available
  if (typeof campaign === 'undefined' || !campaign) {
    console.error('Campaign data is not available');
    return;
  }
  
  // Check if prizes exist
  if (!campaign.prizes || campaign.prizes.length === 0) {
    console.error('No prizes available for this campaign');
    return;
  }
  
  const prizes = campaign.prizes;
  const canvasW = canvas.width;
  const canvasH = canvas.height;
  const centerX = canvasW / 2;
  const centerY = canvasH / 2;
  const radius = Math.min(centerX, centerY) - 10;
  
  let wheel;
  let wheelSpinning = false;
  
  // Initialize wheel
  function initWheel() {
    try {
      // Check if required libraries are loaded
      if (typeof Winwheel === 'undefined') {
        console.error('Winwheel library not loaded');
        showErrorMessage('Wheel library not loaded. Please reload the page.');
        return;
      }
      
      if (typeof TweenMax === 'undefined') {
        console.error('TweenMax library not loaded');
        showErrorMessage('Animation library not loaded. Please reload the page.');
        return;
      }
      
      // Prepare data for wheel of fortune
      const segments = prizes.map(prize => ({
        text: prize.name,
        fillStyle: prize.color || getRandomColor(prizes.indexOf(prize)),
        textFontSize: 16,
        textFillStyle: getContrastColor(prize.color || getRandomColor(prizes.indexOf(prize)))
      }));
      
      // Create wheel
      wheel = new Winwheel({
        canvasId: 'wheel',
        numSegments: segments.length,
        segments: segments,
        outerRadius: radius,
        innerRadius: 40,
        textAlignment: 'outer',
        textMargin: 10,
        textOrientation: 'curved',
        textDirection: 'reversed',
        lineWidth: 1,
        fillStyle: '#ffffff',
        strokeStyle: '#333333',
        animation: {
          type: 'spinToStop',
          duration: 8,
          spins: 10,
          callbackFinished: onSpinComplete
        }
      });
      
      console.log('Wheel initialized successfully');
      
      // Add decorative elements by drawing on top of the wheel
      addDecorativeElements();
    } catch (err) {
      console.error('Error initializing wheel:', err);
      showErrorMessage('There was a problem initializing the wheel. Please reload the page.');
    }
    const modal = document.getElementById('resultModal');
  if (modal) {
    modal.addEventListener('shown.bs.modal', () => {
      canvas.style.pointerEvents = 'none'; // Tắt tương tác chuột trên canvas
    });
    modal.addEventListener('hidden.bs.modal', () => {
      canvas.style.pointerEvents = 'auto'; // Khôi phục tương tác
    });
  }
  }
  
  function addDecorativeElements() {
    // Draw decorative outer border
    const outerBorder = document.querySelector('.wheel-outer-border');
    if (outerBorder) {
      outerBorder.style.width = (radius * 2 + 30) + 'px';
      outerBorder.style.height = (radius * 2 + 30) + 'px';
      outerBorder.style.left = (-15) + 'px';
      outerBorder.style.top = (-15) + 'px';
    }
    
    // Draw ticker
    const ticker = document.querySelector('.wheel-ticker');
    if (ticker) {
      ticker.style.left = 'calc(50% - 20px)';
      ticker.style.width = '40px';
      ticker.style.height = '40px';
    }
  }
  
  function getRandomColor(index) {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#C9CBCF', '#7CFC00',
      '#FF6347', '#00FFFF'
    ];
    return colors[index % colors.length];
  }
  
  function getContrastColor(hexColor) {
    try {
      // Convert hex to RGB
      let r, g, b;
      
      if (hexColor && hexColor.startsWith('#')) {
        const hex = hexColor.substring(1);
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      } else {
        // Default to black
        return '#000000';
      }
      
      // Calculate brightness
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
      // Return black or white based on brightness
      return brightness > 128 ? '#000000' : '#FFFFFF';
    } catch (err) {
      console.error('Error calculating contrast color:', err);
      return '#000000'; // Default to black
    }
  }
  
  function createConfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;

  // Đảm bảo container hiển thị trước khi thêm confetti
  container.style.display = 'block';
  container.style.opacity = '0'; // Bắt đầu với opacity 0 để tránh nhấp nháy
  container.innerHTML = ''; // Xóa nội dung cũ

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

  // Giảm số lượng confetti để cải thiện hiệu suất
  for (let i = 0; i < 50; i++) { // Giảm từ 100 xuống 50
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.position = 'absolute'; // Đảm bảo vị trí tuyệt đối
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-10px'; // Bắt đầu từ trên cùng
    confetti.style.width = Math.random() * 8 + 4 + 'px';
    confetti.style.height = Math.random() * 8 + 4 + 'px';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + 's'; // Giảm độ trễ
    confetti.style.animationDuration = Math.random() * 2 + 2 + 's'; // Giảm thời gian animation

    // Random shapes
    const shape = Math.floor(Math.random() * 3);
    if (shape === 0) {
      confetti.style.borderRadius = '50%';
    } else if (shape === 1) {
      confetti.style.borderRadius = '0';
    } else {
      confetti.style.width = '6px';
      confetti.style.height = '6px';
      confetti.style.transform = 'rotate(45deg)';
    }

    container.appendChild(confetti);
  }

  // Dùng requestAnimationFrame để đảm bảo animation mượt mà
  requestAnimationFrame(() => {
    container.style.transition = 'opacity 0.5s ease';
    container.style.opacity = '1'; // Fade-in container
  });

  // Ẩn container sau khi animation hoàn tất
  setTimeout(() => {
    container.style.transition = 'opacity 0.5s ease';
    container.style.opacity = '0';
    setTimeout(() => {
      container.style.display = 'none';
    }, 500); // Đợi hiệu ứng fade-out hoàn tất
  }, 5000); // Giảm thời gian hiển thị confetti từ 7s xuống 5s
}
  
  function showErrorMessage(message) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insert after the wheel container
    const wheelContainer = document.querySelector('.wheel-container');
    if (wheelContainer && wheelContainer.parentNode) {
      wheelContainer.parentNode.insertBefore(alertDiv, wheelContainer.nextSibling);
    }
  }
  
  // Prize selection and spinning logic
  let selectedPrizeData = null;
  
  // Updated spinWheel function
  function spinWheel() {
    const requestData = {
      campaignId: campaign._id,
      phone: userPhone,
      name: userName
    };
    
    console.log('Sending data:', requestData);
    
    fetch('/api/spin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    .then(response => {
      console.log('Response status:', response.status);
      return response.json();
    })
    .then(data => {
      if (data.success) {
        selectedPrizeData = data;
        const winningIndex = prizes.findIndex(prize =>
          prize._id === data.prize.id || prize.name === data.prize.name
        );
        if (winningIndex !== -1 && wheel) {
          // SỬA ĐOẠN NÀY:
          const segmentNumber = winningIndex + 1;
          const stopAngle = wheel.getRandomForSegment(segmentNumber);
          wheel.animation.stopAngle = stopAngle;
          wheel.startAnimation();
        } else {
          console.error('Prize not found in prizes array or wheel not initialized');
          wheelSpinning = false;
          startBtn.disabled = false;
          showErrorMessage('Error processing your spin. Please try again.');
        }
      } else {
        wheelSpinning = false;
        startBtn.disabled = false;
        
        // Xử lý các loại lỗi khác nhau
        if (data.errorType === 'SPINS_EXHAUSTED') {
          showSpinsExhaustedMessage(data.spinsUsed, data.maxSpins);
        } else {
          showErrorMessage(data.message || 'An error occurred while spinning.');
        }
      }
    })
    .catch(error => {
      console.error('Error:', error);
      wheelSpinning = false;
      startBtn.disabled = false;
      showErrorMessage('Network error. Please check your connection and try again.');
    });
  }
  
  // Thêm function để hiển thị thông báo hết lượt quay
  function showSpinsExhaustedMessage(spinsUsed, maxSpins) {
    // Tạo modal hoặc alert đặc biệt cho trường hợp hết lượt
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-warning alert-dismissible fade show mt-3';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
      <h5><i class="fas fa-info-circle"></i> All Spins Used!</h5>
      <p>You have used all <strong>${maxSpins}</strong> spin(s) for this campaign.</p>
      <p>Thank you for participating! Check back for new campaigns or view your spin history.</p>
      <div class="mt-3">
        <a href="/campaigns" class="btn btn-primary me-2">
          <i class="fas fa-list"></i> View Other Campaigns
        </a>
        <a href="/user/spin-history" class="btn btn-outline-secondary">
          <i class="fas fa-history"></i> View Spin History
        </a>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insert after the wheel container
    const wheelContainer = document.querySelector('.wheel-container');
    if (wheelContainer && wheelContainer.parentNode) {
      wheelContainer.parentNode.insertBefore(alertDiv, wheelContainer.nextSibling);
    }
    
    // Ẩn nút Spin nếu đã hết lượt
    if (startBtn) {
      startBtn.style.display = 'none';
    }
    
    // Hiển thị thông tin số lượt đã sử dụng
    const spinCountInfo = document.querySelector('.spin-count-info');
    if (spinCountInfo) {
      spinCountInfo.innerHTML = `
        <div class="text-center text-muted">
          <small>Spins used: ${spinsUsed}/${maxSpins}</small>
        </div>
      `;
    }
  }
  
  // Sửa lại function onSpinComplete để cập nhật UI
  function onSpinComplete() {
  wheelSpinning = false;

  if (selectedPrizeData) { // <-- chỉ gọi ở đây

    if (resultModal) {
      // Ẩn thông báo trên bánh xe (nếu tồn tại)
      const wheelCongrats = document.querySelector('.wheel-congratulations');
      if (wheelCongrats) {
        wheelCongrats.style.display = 'none';
      }

      // Cập nhật nội dung modal
      const prizeNameElement = document.getElementById('prize-name');
      if (prizeNameElement) {
        prizeNameElement.textContent = `Congratulations! You've won: ${selectedPrizeData.prize.name}`;
        prizeNameElement.style.color = selectedPrizeData.prize.color || '#ff3e3e';
        prizeNameElement.style.textShadow = '1px 1px 2px rgba(0,0,0,0.2)';
        prizeNameElement.style.opacity = '0';
      }

      const spinInfoElement = document.getElementById('spin-info');
      if (spinInfoElement && selectedPrizeData.spinsUsed && selectedPrizeData.maxSpins) {
        spinInfoElement.innerHTML = `
          <div class="mt-2 text-muted">
            <small>Spins used: ${selectedPrizeData.spinsUsed}/${selectedPrizeData.maxSpins}</small>
          </div>
        `;
        if (selectedPrizeData.spinsUsed >= selectedPrizeData.maxSpins) {
          spinInfoElement.innerHTML += `
            <div class="mt-2 text-warning">
              <small><i class="fas fa-info-circle"></i> You have used all your spins for this campaign.</small>
            </div>
          `;
        }
      }

      const viewResultBtn = document.getElementById('view-result-btn');
      if (viewResultBtn) {
        viewResultBtn.href = `/campaigns/result/${selectedPrizeData.resultId}`;
        viewResultBtn.onclick = function(e) {
          e.preventDefault();
          window.location.href = `/campaigns/result/${selectedPrizeData.resultId}`;
        };
      }

      requestAnimationFrame(() => {
        if (prizeNameElement) {
          prizeNameElement.style.transition = 'opacity 0.5s ease';
          prizeNameElement.style.opacity = '1';
        }
        if (wheel) {
          wheel.stopAnimation(false);
        }
        resultModal.show();
      });

      const modalContent = document.querySelector('#resultModal .modal-content');
      if (modalContent) {
        modalContent.addEventListener('mousemove', (e) => {
          e.stopPropagation();
        });
      }
    } else {
      window.location.href = `/campaigns/result/${selectedPrizeData.resultId}`;
    }
  } else {
    if (startBtn) startBtn.disabled = false;
    showErrorMessage('Something went wrong. Please try again.');
  }
}
  
  // Declare phone and name variables at top level
  let userPhone = '';
  let userName = '';
  window.addEventListener('mousemove', function(e) {
  console.log('Mouse moved:', e.target);
});
  
  // Spin wheel functionality
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      // Check if can spin
      if (typeof canSpin !== 'undefined' && !canSpin) {
        showErrorMessage('You have used all your spins for this campaign.');
        return;
      }
      
      if (wheelSpinning) {
        return;
      }
      
      // Get user phone if not logged in
      if (typeof user === 'undefined' || !user) {
        userPhone = sessionStorage.getItem('userPhone') || '';
        userName = sessionStorage.getItem('userName') || '';
        
        if (!userPhone) {
          window.location.href = `/user/enter-phone?campaign=${campaign._id}`;
          return;
        }
      } else {
        // For logged in users, get from session/user object
        userPhone = user.phone || '';
        userName = user.name || '';
      }
      
      console.log({ campaignId: campaign._id, phone: userPhone, name: userName });
      
      // Disable button while spinning
      startBtn.disabled = true;
      wheelSpinning = true;
      
      // Make API call to determine the prize
      spinWheel();
    });
  }
  
  // Handle window resize
 function handleResize() {
  // Chỉ chạy nếu wheel đã được khởi tạo
  if (wheel && !wheelSpinning) { // Thêm kiểm tra !wheelSpinning để tránh chạy khi đang quay
    const currentWinningSegment = wheel.getIndicatedSegment();
    console.log('Segment:', currentWinningSegment);
    
    // Reinitialize wheel
    initWheel();
    
    // Nếu đang quay, cập nhật lại góc dừng
    if (selectedPrizeData) {
      const winningIndex = prizes.findIndex(prize => 
        prize._id === selectedPrizeData.prize.id || prize.name === selectedPrizeData.prize.name
      );
      
      if (winningIndex !== -1) {
        const segmentSize = 360 / prizes.length;
        const stopAngle = (360 - (winningIndex * segmentSize + segmentSize / 2)) % 360;
        wheel.animation.stopAngle = stopAngle;
      }
    }
  }
}
  
  // Add resize event listener with debounce
  let resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(handleResize, 250);
});

  // Initialize wheel directly since libraries are already loaded via HTML
  setTimeout(() => {
    initWheel();
  }, 1000); // Small delay to ensure all scripts are fully loaded
});