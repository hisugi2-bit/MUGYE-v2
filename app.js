// app.js - MUGYE Gakji custom order landing page logic

document.addEventListener('DOMContentLoaded', () => {
  initScrollEffects();
  initMobileMenu();
  initScrollAnimations();
  initWizard();
});

/* 1. Header scroll and active navigation highlighting */
function initScrollEffects() {
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    // Scroll background change
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll Spy: highlight active menu link
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 150; // offset

    sections.forEach(sec => {
      const secTop = sec.offsetTop;
      const secHeight = sec.offsetHeight;
      if (scrollPosition >= secTop && scrollPosition < secTop + secHeight) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* 2. Mobile navigation drawer */
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navMenuBg = document.getElementById('navMenuBg');
  const navLinks = document.querySelectorAll('.nav-link');

  function toggleMenu() {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    navMenuBg.classList.toggle('active');
    
    // Toggle body scroll
    if (navMenu.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  menuToggle.addEventListener('click', toggleMenu);
  navMenuBg.addEventListener('click', toggleMenu);

  // Close menu when clicking links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        toggleMenu();
      }
    });
  });
}

/* 3. Reveal animations using Intersection Observer */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-in-up');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve once animated
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));
}

/* 4. Product Tab Switching */
function switchTab(event, tabId) {
  // Deactivate all tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(btn => btn.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  // Activate selected tab
  event.currentTarget.classList.add('active');
  document.getElementById(tabId).classList.add('active');
  
  // Re-observe animations in the active tab
  const newActiveElements = document.getElementById(tabId).querySelectorAll('.fade-in-up');
  newActiveElements.forEach(el => el.classList.add('active'));
}

/* 5. Custom Order Form Wizard Logic */
let currentStep = 1;
const totalSteps = 4;

function initWizard() {
  updateWizardUI();
}

// Select cards inside step 1 & step 2
function selectOption(category, value, element) {
  // Find container
  const parentGrid = element.parentElement;
  // Unselect all other cards in the same grid
  const cards = parentGrid.querySelectorAll('.option-card');
  cards.forEach(card => card.classList.remove('selected'));
  
  // Select current card
  element.classList.add('selected');
  
  // Set hidden input value
  if (category === 'type') {
    document.getElementById('gakjiType').value = value;
  } else if (category === 'material') {
    document.getElementById('gakjiMaterial').value = value;
  }
}

// Display uploaded file name
function handleFileChange(input) {
  const fileNamePreview = document.getElementById('fileNamePreview');
  if (input.files && input.files[0]) {
    const file = input.files[0];
    fileNamePreview.innerText = `선택된 파일: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    fileNamePreview.style.display = 'block';
  } else {
    fileNamePreview.innerText = '선택된 파일: 없음';
    fileNamePreview.style.display = 'none';
  }
}

// Step navigation
function navigateStep(direction) {
  // Validate step before proceeding
  if (direction === 1 && !validateCurrentStep()) {
    return;
  }
  
  // If moving forward on the final step, submit the form instead
  if (currentStep === totalSteps && direction === 1) {
    // Form is valid, trigger submit manually
    const form = document.getElementById('orderForm');
    // Dispatch submit event
    form.requestSubmit();
    return;
  }
  
  currentStep += direction;
  
  // Clamp boundaries
  if (currentStep < 1) currentStep = 1;
  if (currentStep > totalSteps) currentStep = totalSteps;
  
  updateWizardUI();
  
  // Scroll wizard container into view for a smoother user experience
  document.querySelector('.wizard-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Validate inputs of the current step before advancing
function validateCurrentStep() {
  if (currentStep === 1) {
    const type = document.getElementById('gakjiType').value;
    if (!type) {
      alert("깍지 형태를 하나 선택해 주세요.");
      return false;
    }
  }
  
  if (currentStep === 2) {
    const material = document.getElementById('gakjiMaterial').value;
    if (!material) {
      alert("제작 소재를 하나 선택해 주세요.");
      return false;
    }
  }
  
  if (currentStep === 3) {
    // Measurements are optional, but if entered, they should be valid numbers
    const circ = document.getElementById('circumference').value;
    const width = document.getElementById('thumbWidth').value;
    const thick = document.getElementById('thumbThickness').value;
    
    if (circ && (circ < 30 || circ > 100)) {
      alert("올바른 둘레(30mm ~ 100mm)를 입력해 주세요.");
      return false;
    }
    if (width && (width < 10 || width > 40)) {
      alert("올바른 마디 너비(10mm ~ 40mm)를 입력해 주세요.");
      return false;
    }
    if (thick && (thick < 10 || thick > 40)) {
      alert("올바른 마디 두께(10mm ~ 40mm)를 입력해 주세요.");
      return false;
    }
  }
  
  if (currentStep === 4) {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    
    if (!name) {
      alert("성명을 입력해 주세요.");
      return false;
    }
    if (!phone) {
      alert("연락처를 입력해 주세요.");
      return false;
    }
    if (!address) {
      alert("배송 주소를 입력해 주세요.");
      return false;
    }
  }
  
  return true;
}

// Sync step indices, progress bar, active steps content, and navigation buttons text
function updateWizardUI() {
  // Update step contents
  const steps = document.querySelectorAll('.wizard-step');
  steps.forEach((step, idx) => {
    if (idx + 1 === currentStep) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });

  // Update progress indicators
  const progressSteps = document.querySelectorAll('.progress-step');
  progressSteps.forEach((step, idx) => {
    const stepNum = idx + 1;
    step.classList.remove('active', 'completed');
    if (stepNum === currentStep) {
      step.classList.add('active');
    } else if (stepNum < currentStep) {
      step.classList.add('completed');
    }
  });

  // Update progress line width
  const progressLine = document.getElementById('progressLine');
  const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
  progressLine.style.width = `${percent}%`;

  // Update navigation buttons
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');

  // Prev button visibility
  if (currentStep === 1) {
    btnPrev.classList.remove('visible');
  } else {
    btnPrev.classList.add('visible');
  }

  // Next button text
  if (currentStep === totalSteps) {
    btnNext.innerText = "주문서 제출하기";
  } else {
    btnNext.innerText = "다음 단계";
  }
}

// Handle final form submit
function handleOrderSubmit(event) {
  event.preventDefault();
  
  // Verify validation again
  if (!validateCurrentStep()) return;
  
  const name = document.getElementById('customerName').value.trim();
  const type = document.getElementById('gakjiType').value;
  const material = document.getElementById('gakjiMaterial').value;
  const phone = document.getElementById('customerPhone').value.trim();
  
  // Set values in summary box of the modal
  document.getElementById('sumName').innerText = name;
  document.getElementById('sumType').innerText = type;
  document.getElementById('sumMaterial').innerText = material;
  document.getElementById('sumPhone').innerText = phone;
  
  // Show Success Modal
  const successModal = document.getElementById('successModal');
  successModal.classList.add('active');
  document.body.style.overflow = 'hidden'; // lock scrolling
}

// Reset and Close Modal
function closeSuccessModal() {
  const successModal = document.getElementById('successModal');
  successModal.classList.remove('active');
  document.body.style.overflow = ''; // unlock scroll
  
  // Reset Form
  document.getElementById('orderForm').reset();
  
  // Reset file upload label
  document.getElementById('fileNamePreview').style.display = 'none';
  document.getElementById('fileNamePreview').innerText = '선택된 파일: 없음';
  
  // Reset Option Card Selections to defaults
  // Step 1 default: 숫깍지
  const typeCards = document.querySelectorAll('#step1 .option-card');
  typeCards.forEach((c, idx) => {
    if (idx === 0) c.classList.add('selected');
    else c.classList.remove('selected');
  });
  document.getElementById('gakjiType').value = '숫깍지';
  
  // Step 2 default: 아프리카 흑단
  const materialCards = document.querySelectorAll('#step2 .option-card');
  materialCards.forEach((c, idx) => {
    if (idx === 0) c.classList.add('selected');
    else c.classList.remove('selected');
  });
  document.getElementById('gakjiMaterial').value = '아프리카 흑단';
  
  // Return to step 1
  currentStep = 1;
  updateWizardUI();
  
  // Scroll to hero top
  document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
}
