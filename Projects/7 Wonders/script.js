// 1. Scroll Reveal Animation
const rows = document.querySelectorAll('[data-animate]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.2 
});

rows.forEach(row => observer.observe(row));


// 2. Read More / Show Less Logic
const readMoreBtns = document.querySelectorAll('.read-more-btn');

readMoreBtns.forEach(button => {
  button.addEventListener('click', () => {
    // Find the details div inside the parent text container
    const detailsDiv = button.closest('.text').querySelector('.more-details');
    
    // Toggle the 'open' class
    const isOpen = detailsDiv.classList.toggle('open');
    
    // Change button text based on state
    button.textContent = isOpen ? 'Show Less' : 'Read More';
  });
});