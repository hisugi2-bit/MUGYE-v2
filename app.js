// app.js - MUGYE Gakji custom order landing page logic

document.addEventListener('DOMContentLoaded', () => {
  initScrollEffects();
  initMobileMenu();
  initScrollAnimations();
  initWizard();
  initBGM();
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

// Temporary storage for pending order data
let pendingOrderData = null;

// Handle final form submit (Step 1: Populate and Show Confirmation Modal)
function handleOrderSubmit(event) {
  event.preventDefault();
  
  // Verify validation again
  if (!validateCurrentStep()) return;
  
  const name = document.getElementById('customerName').value.trim();
  const type = document.getElementById('gakjiType').value;
  const material = document.getElementById('gakjiMaterial').value;
  const phone = document.getElementById('customerPhone').value.trim();
  const address = document.getElementById('customerAddress').value.trim();
  const note = document.getElementById('customerNote') ? document.getElementById('customerNote').value.trim() : '';
  const circumference = document.getElementById('circumference') ? document.getElementById('circumference').value : '';
  const thumbWidth = document.getElementById('thumbWidth') ? document.getElementById('thumbWidth').value : '';
  const thumbThickness = document.getElementById('thumbThickness') ? document.getElementById('thumbThickness').value : '';
  
  // Store pending order details
  pendingOrderData = {
    customerName: name,
    customerPhone: phone,
    customerAddress: address,
    customerNote: note,
    gakjiType: type,
    gakjiMaterial: material,
    circumference: circumference,
    thumbWidth: thumbWidth,
    thumbThickness: thumbThickness
  };

  // Populate Confirmation Modal fields
  document.getElementById('confName').innerText = name;
  document.getElementById('confPhone').innerText = phone;
  document.getElementById('confAddress').innerText = address;
  document.getElementById('confType').innerText = type;
  document.getElementById('confMaterial').innerText = material;
  
  // Dimensions string
  let dimsArr = [];
  if (circumference) dimsArr.push(`둘레: ${circumference}mm`);
  if (thumbWidth) dimsArr.push(`너비: ${thumbWidth}mm`);
  if (thumbThickness) dimsArr.push(`두께: ${thumbThickness}mm`);
  document.getElementById('confDimensions').innerText = dimsArr.length > 0 ? dimsArr.join(' / ') : '미입력 (사진 대체)';
  
  document.getElementById('confNote').innerText = note || '요청사항 없음';

  // Also set values in summary box of the final success modal
  document.getElementById('sumName').innerText = name;
  document.getElementById('sumType').innerText = type;
  document.getElementById('sumMaterial').innerText = material;
  document.getElementById('sumPhone').innerText = phone;

  // Open Confirmation Modal
  const confirmModal = document.getElementById('confirmModal');
  confirmModal.classList.add('active');
  document.body.style.overflow = 'hidden'; // lock scrolling
}

// Close Confirmation Modal (Return to editing)
function closeConfirmModal() {
  const confirmModal = document.getElementById('confirmModal');
  if (confirmModal) confirmModal.classList.remove('active');
  document.body.style.overflow = ''; // unlock scroll
}

// Step 2: Execute Final Email Sending after user confirms in modal
async function executeFinalOrderSend() {
  if (!pendingOrderData) return;

  const btnFinalSend = document.getElementById('btnFinalSend');
  if (btnFinalSend) {
    btnFinalSend.innerText = '이메일 발송 중...';
    btnFinalSend.disabled = true;
  }

  const { customerName, customerPhone, customerAddress, customerNote, gakjiType, gakjiMaterial, circumference, thumbWidth, thumbThickness } = pendingOrderData;

  const emailHtml = `
    <div style="font-family: 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #c5a880; border-radius: 8px; padding: 25px; background-color: #121213; color: #e5e5e5;">
      <h2 style="color: #c5a880; border-bottom: 2px solid #c5a880; padding-bottom: 10px; margin-top: 0;">
        [무계 (無界)] 수제 깍지 신규 주문 접수
      </h2>
      <h3 style="color: #ffffff; margin-top: 20px;">1. 주문자 인적사항</h3>
      <p><strong>성명:</strong> ${customerName}</p>
      <p><strong>연락처:</strong> <span style="color: #c5a880; font-weight: bold;">${customerPhone}</span></p>
      <p><strong>배송 주소:</strong> ${customerAddress}</p>
      <h3 style="color: #ffffff; margin-top: 20px;">2. 맞춤 제작 옵션</h3>
      <p><strong>깍지 종류:</strong> <span style="color: #c5a880; font-weight: bold;">${gakjiType}</span></p>
      <p><strong>제작 소재:</strong> ${gakjiMaterial}</p>
      <h3 style="color: #ffffff; margin-top: 20px;">3. 측정 치수</h3>
      <p><strong>마디 둘레:</strong> ${circumference ? circumference + ' mm' : '미입력'}</p>
      <p><strong>마디 너비(좌우):</strong> ${thumbWidth ? thumbWidth + ' mm' : '미입력'}</p>
      <p><strong>마디 두께(상하):</strong> ${thumbThickness ? thumbThickness + ' mm' : '미입력'}</p>
      <h3 style="color: #ffffff; margin-top: 20px;">4. 요청사항</h3>
      <p>${customerNote ? customerNote.replace(/\n/g, '<br>') : '요청사항 없음'}</p>
    </div>
  `;

  // Read API key securely from local env.js (ignored by Git)
  const localKey = (typeof window !== 'undefined' && window.MUGYE_CONFIG && window.MUGYE_CONFIG.RESEND_API_KEY) ? window.MUGYE_CONFIG.RESEND_API_KEY : '';

  const sendPromises = [];

  if (localKey) {
    sendPromises.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localKey}`
        },
        body: JSON.stringify({
          from: 'MUGYE Orders <onboarding@resend.dev>',
          to: ['retrodio1914@gmail.com'],
          subject: `[무계 깍지 주문] ${customerName}님의 수제 맞춤 신청서`,
          html: emailHtml
        })
      }).then(r => r.json()).then(d => console.log('Resend Direct Success:', d)).catch(e => console.error('Resend Direct Error:', e))
    );
  }

  // Also attempt local server endpoint
  sendPromises.push(
    fetch('/api/send-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pendingOrderData)
    }).catch(() => {})
  );

  // Wait for sending attempt
  await Promise.all(sendPromises);

  // Reset button state
  if (btnFinalSend) {
    btnFinalSend.innerText = '이메일로 주문서 전송하기';
    btnFinalSend.disabled = false;
  }

  // Close Confirmation Modal & Open Success Modal
  closeConfirmModal();

  const successModal = document.getElementById('successModal');
  if (successModal) successModal.classList.add('active');
  document.body.style.overflow = 'hidden';
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

/* 6. Background Music (BGM) Control */
function initBGM() {
  const bgmAudio = document.getElementById('bgmAudio');
  const bgmToggleBtn = document.getElementById('bgmToggleBtn');
  const bgmLabel = document.getElementById('bgmLabel');
  
  if (!bgmAudio || !bgmToggleBtn) return;
  
  bgmAudio.volume = 0.35; // Soft ambient background music volume
  let isPlaying = false;
  
  function playBGM() {
    bgmAudio.play().then(() => {
      isPlaying = true;
      bgmToggleBtn.classList.remove('paused');
      bgmToggleBtn.classList.add('playing');
      bgmLabel.innerText = "BGM ON";
    }).catch(err => {
      console.log("Autoplay policy prevented audio, awaiting user interaction.");
      pauseBGM();
    });
  }
  
  function pauseBGM() {
    bgmAudio.pause();
    isPlaying = false;
    bgmToggleBtn.classList.remove('playing');
    bgmToggleBtn.classList.add('paused');
    bgmLabel.innerText = "BGM OFF";
  }
  
  function toggleBGM() {
    if (isPlaying) {
      pauseBGM();
    } else {
      playBGM();
    }
  }
  
  bgmToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleBGM();
  });

  // Attempt user-interaction auto-start on scroll, click, or touch
  function autoStartOnInteraction() {
    if (!isPlaying) {
      playBGM();
    }
    removeInteractionListeners();
  }

  function removeInteractionListeners() {
    window.removeEventListener('scroll', autoStartOnInteraction);
    window.removeEventListener('wheel', autoStartOnInteraction);
    window.removeEventListener('touchmove', autoStartOnInteraction);
    document.removeEventListener('click', autoStartOnInteraction);
    document.removeEventListener('keydown', autoStartOnInteraction);
  }
  
  window.addEventListener('scroll', autoStartOnInteraction, { passive: true });
  window.addEventListener('wheel', autoStartOnInteraction, { passive: true });
  window.addEventListener('touchmove', autoStartOnInteraction, { passive: true });
  document.addEventListener('click', autoStartOnInteraction, { once: true });
  document.addEventListener('keydown', autoStartOnInteraction, { once: true });
}
