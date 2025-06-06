//  Store user phone from session storage if available
document.addEventListener('DOMContentLoaded', function() {
  const userPhone = sessionStorage.getItem('userPhone');
  
  if (userPhone) {
    // Add phone to spin form if it exists
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) {
      phoneInput.value = userPhone;
    }
  }
});
 