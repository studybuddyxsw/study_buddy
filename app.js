/**
 * StudyBuddy (ผู้ช่วยวางแผนอ่านหนังสือก่อนสอบ) - Core JavaScript Application
 * Features:
 * 1. D-Day Exam Countdown & Smart Roadmap
 * 2. Pomodoro Focus Timer with Web Audio API Ambient Synthesizer
 * 3. Daily Study Checklist & Study Hours Logger
 * 4. Smart Study Splitter Calculator
 * 5. Subject Confidence Matrix (1-5 Stars)
 * 6. Mini Flashcards with 3D Flip & Self-Evaluation
 * 7. Study Room Community Feed with Reaction Stickers
 * 8. Study Streak & Gamification Badges
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  /* ==========================================================================
     1. Web Audio API Ambient Synthesizer & Sound FX
     ========================================================================== */
  let audioCtx = null;
  let ambientSource = null;
  let ambientGain = null;
  let isAmbientPlaying = false;
  let currentAmbientType = 'none';

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playChimeSound() {
    try {
      initAudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.log('Audio error:', e);
    }
  }

  function stopAmbientSound() {
    if (ambientSource) {
      try {
        ambientSource.stop();
        ambientSource.disconnect();
      } catch (e) {}
      ambientSource = null;
    }
    if (ambientGain) {
      ambientGain.disconnect();
      ambientGain = null;
    }
    isAmbientPlaying = false;
    updateAmbientUI();
  }

  function startAmbientSound(type) {
    initAudioContext();
    stopAmbientSound();

    if (type === 'none') {
      currentAmbientType = 'none';
      updateAmbientUI();
      return;
    }

    currentAmbientType = type;
    const bufferSize = audioCtx.sampleRate * 3;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    ambientGain = audioCtx.createGain();

    if (type === 'white') {
      // White noise generator
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      ambientGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    } else if (type === 'pink') {
      // Pink / Soft Rain noise
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.1;
        b6 = white * 0.115926;
      }
      ambientGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    } else if (type === 'lofi') {
      // Lo-fi soothing resonant hum (432Hz focus vibe)
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(216, audioCtx.currentTime); // Low A
      osc2.frequency.setValueAtTime(432, audioCtx.currentTime); // 432 Hz focus tone
      
      ambientGain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      osc1.connect(ambientGain);
      osc2.connect(ambientGain);
      ambientGain.connect(audioCtx.destination);
      
      osc1.start();
      osc2.start();
      ambientSource = {
        stop: () => {
          osc1.stop();
          osc2.stop();
          osc1.disconnect();
          osc2.disconnect();
        },
        disconnect: () => {}
      };
      isAmbientPlaying = true;
      updateAmbientUI();
      return;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Soft lowpass filter to make noise gentle on ears
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);

    noiseSource.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(audioCtx.destination);

    noiseSource.start();
    ambientSource = noiseSource;
    isAmbientPlaying = true;
    updateAmbientUI();
  }

  function updateAmbientUI() {
    const btnToggle = document.getElementById('btn-toggle-ambient');
    const textStatus = document.getElementById('text-ambient-status');
    const chips = document.querySelectorAll('.sound-chip');

    chips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.soundType === currentAmbientType);
    });

    if (currentAmbientType !== 'none') {
      btnToggle.classList.add('playing');
      const labelMap = {
        white: 'White Noise',
        pink: 'Pink / ฝนตก',
        lofi: 'Lo-fi Hum'
      };
      textStatus.textContent = `เสียงสมาธิ: ${labelMap[currentAmbientType] || 'เปิดอยู่'}`;
    } else {
      btnToggle.classList.remove('playing');
      textStatus.textContent = 'เสียงสมาธิ: ปิด';
    }
  }

  // Header Ambient Button Toggle
  document.getElementById('btn-toggle-ambient').addEventListener('click', () => {
    if (currentAmbientType === 'none') {
      startAmbientSound('pink');
      showToast('เปิดคลื่นเสียง Pink Noise (เสียงฝนตกเบาๆ) ช่วยโฟกัส');
    } else {
      stopAmbientSound();
      showToast('ปิดเสียงคลื่นสมาธิแล้ว');
    }
  });

  // Sound chips selector
  document.querySelectorAll('.sound-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const type = chip.dataset.soundType;
      startAmbientSound(type);
      if (type !== 'none') {
        showToast(`เปิดโหมดเสียง: ${chip.textContent}`);
      }
    });
  });

  /* ==========================================================================
     2. Tab Navigation System
     ========================================================================== */
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const tabViews = document.querySelectorAll('.tab-view');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabViews.forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      const targetView = document.getElementById(targetTabId);
      if (targetView) {
        targetView.classList.add('active');
      }

      if (window.lucide) {
        lucide.createIcons();
      }
    });
  });

  /* ==========================================================================
     3. Daily Motivation Quotes Banner
     ========================================================================== */
  const motivationQuotes = [
    { quote: "ก้าวเล็กๆ ในการอ่านหนังสือทุกวัน รวมกันเป็นความสำเร็จที่ยิ่งใหญ่ในห้องสอบ", author: "เทคนิคพิชิตฝัน" },
    { quote: "วินัยไม่ใช่การบังคับตัวเอง แต่คือการเลือกว่าสิ่งไหนสำคัญที่สุดสำหรับอนาคตเรา", author: "StudyBuddy Wisdom" },
    { quote: "ข้อสอบไม่ได้วัดว่าใครฉลาดที่สุด แต่วัดว่าใครเตรียมตัวมาอย่างมีแบบแผนที่สุด", author: "กุญแจสู่คะแนนสอบ" },
    { quote: "อ่านวันละ 25 นาทีดีกว่าอดนอนอ่านวันละ 10 ชั่วโมงตอนคืนก่อนสอบ", author: "กฎแห่งความสม่ำเสมอ" },
    { quote: "ทุกหน้าที่เราพลิกอ่าน คือทุกคะแนนที่เราสะสมไว้ล่วงหน้า", author: "สมาคมชาวสอบ" },
    { quote: "อย่ากลัวข้อสอบที่ยาก จงมั่นใจในความพยายามที่ผ่านมาของเรา", author: "พลังใจวัยเรียน" }
  ];

  let currentQuoteIndex = 0;
  const quoteTextEl = document.getElementById('motivation-quote-text');
  const quoteAuthorEl = document.getElementById('motivation-quote-author');
  const btnRefreshQuote = document.getElementById('btn-refresh-quote');

  btnRefreshQuote.addEventListener('click', () => {
    currentQuoteIndex = (currentQuoteIndex + 1) % motivationQuotes.length;
    quoteTextEl.style.opacity = 0;
    quoteAuthorEl.style.opacity = 0;

    setTimeout(() => {
      quoteTextEl.textContent = `"${motivationQuotes[currentQuoteIndex].quote}"`;
      quoteAuthorEl.textContent = `— ${motivationQuotes[currentQuoteIndex].author}`;
      quoteTextEl.style.opacity = 1;
      quoteAuthorEl.style.opacity = 1;
    }, 150);
  });

  /* ==========================================================================
     4. Pillar 1: D-Day Countdown & Exams Roadmap
     ========================================================================== */
  const UNIVERSITY_COURSE_PRESETS = {
    // 5 Active Final Exam Courses (Current Semester)
    '761311': {
      code: '761311-166B',
      titleEn: 'BUSINESS INVESTMENT',
      titleTh: 'การลงทุนทางธุรกิจ',
      schedule: 'FINAL1 Lec | อาคาร ห้อง 27 ต.ค. 2569 13:00 - 16:00',
      date: '2026-10-27',
      readiness: 70
    },
    '761361': {
      code: '761361-166B',
      titleEn: 'CUSTOMER RELATIONSHIP MANAGEMENT',
      titleTh: 'การบริหารจัดการความสัมพันธ์ลูกค้า',
      schedule: 'FINAL1 Lec | อาคาร ห้อง 28 ต.ค. 2569 13:00 - 16:00',
      date: '2026-10-28',
      readiness: 65
    },
    '761314': {
      code: '761314-166B',
      titleEn: 'OPERATION MANAGEMENT INNOVATIONS',
      titleTh: 'นวัตกรรมการจัดการดำเนินงาน',
      schedule: 'FINAL1 Lec | อาคาร ห้อง 03 พ.ย. 2569 09:00 - 12:00',
      date: '2026-11-03',
      readiness: 55
    },
    '761312': {
      code: '761312-166B',
      titleEn: 'SUSTAINABLE LOGISTICS',
      titleTh: 'โลจิสติกส์เพื่อความอย่างยั่งยืน',
      schedule: 'FINAL1 Lec | อาคาร ห้อง 05 พ.ย. 2569 13:00 - 16:00',
      date: '2026-11-05',
      readiness: 60
    },
    '761313': {
      code: '761313-166B',
      titleEn: 'STATISTICS FOR RESEARCH',
      titleTh: 'สถิติสำหรับการวิจัย',
      schedule: 'FINAL1 Lec | อาคาร ห้อง 06 พ.ย. 2569 09:00 - 12:00',
      date: '2026-11-06',
      readiness: 45
    },
    // หมวดวิชาแกนธุรกิจ (Business Core Courses)
    '761101': { code: '761101', titleEn: 'BASIC ACCOUNTING', titleTh: 'หลักบัญชีเบื้องต้น', schedule: 'Lec 3(3-0-6)', date: '2026-11-10', readiness: 50 },
    '761111': { code: '761111', titleEn: 'FINANCIAL ACCOUNTING', titleTh: 'การบัญชีการเงิน', schedule: 'Lec 3(3-0-6)', date: '2026-11-10', readiness: 50 },
    '761102': { code: '761102', titleEn: 'BASIC ECONOMICS', titleTh: 'เศรษฐศาสตร์เบื้องต้น', schedule: 'Lec 3(3-0-6)', date: '2026-11-11', readiness: 50 },
    '761112': { code: '761112', titleEn: 'DIGITAL ECONOMICS', titleTh: 'เศรษฐศาสตร์ดิจิทัล', schedule: 'Lec 3(3-0-6)', date: '2026-11-11', readiness: 50 },
    '761201': { code: '761201', titleEn: 'ORGANIZATION AND MANAGEMENT', titleTh: 'องค์การและการจัดการ', schedule: 'Lec 3(3-0-6)', date: '2026-11-12', readiness: 55 },
    '761202': { code: '761202', titleEn: 'BUSINESS FINANCE', titleTh: 'การเงินธุรกิจ', schedule: 'Lec 3(3-0-6)', date: '2026-11-12', readiness: 50 },
    '761203': { code: '761203', titleEn: 'PRINCIPLES OF MARKETING', titleTh: 'หลักการตลาด', schedule: 'Lec 3(3-0-6)', date: '2026-11-13', readiness: 60 },
    '761204': { code: '761204', titleEn: 'HUMAN RESOURCE MANAGEMENT', titleTh: 'การจัดการทรัพยากรมนุษย์', schedule: 'Lec 3(3-0-6)', date: '2026-11-13', readiness: 55 },
    '761205': { code: '761205', titleEn: 'BUSINESS LAW AND TAXATION', titleTh: 'กฎหมายธุรกิจและภาษีอากร', schedule: 'Lec 3(3-0-6)', date: '2026-11-14', readiness: 45 },
    '761206': { code: '761206', titleEn: 'MANAGEMENT INFORMATION SYSTEMS', titleTh: 'ระบบสารสนเทศเพื่อการจัดการ', schedule: 'Lec 3(3-0-6)', date: '2026-11-14', readiness: 55 },
    '761211': { code: '761211', titleEn: 'BUSINESS ENGLISH SKILLS DEVELOPMENT', titleTh: 'การพัฒนาทักษะภาษาอังกฤษเพื่อธุรกิจ', schedule: 'Lec 3(3-0-6)', date: '2026-11-15', readiness: 60 },
    // หมวดวิชาเอกนวัตกรรมทางธุรกิจ (BIM Major Courses)
    '761219': { code: '761219', titleEn: 'CREATIVITY & BUSINESS INNOVATION MANAGEMENT', titleTh: 'ความคิดสร้างสรรค์และการจัดการนวัตกรรมทางธุรกิจ', schedule: 'Lec 3(3-0-6)', date: '2026-11-15', readiness: 65 },
    '761212': { code: '761212', titleEn: 'ENTREPRENEURIAL FINANCE & FINANCIAL INNOVATION', titleTh: 'การเงินผู้ประกอบการและนวัตกรรมทางการเงิน', schedule: 'Lec 3(3-0-6)', date: '2026-11-16', readiness: 50 },
    '761321': { code: '761321', titleEn: 'DIGITAL MARKETING INNOVATION', titleTh: 'นวัตกรรมการตลาดดิจิทัล', schedule: 'Lec 3(3-0-6)', date: '2026-11-16', readiness: 60 },
    '761322': { code: '761322', titleEn: 'MARKETING PLANNING AND OPERATIONS', titleTh: 'การวางแผนและการดำเนินการทางการตลาด', schedule: 'Lec 3(3-0-6)', date: '2026-11-17', readiness: 55 },
    '761323': { code: '761323', titleEn: 'STORYTELLING TECHNIQUES', titleTh: 'เทคนิคการเล่าเรื่องเพื่อธุรกิจ', schedule: 'Lec 3(3-0-6)', date: '2026-11-17', readiness: 65 },
    '761324': { code: '761324', titleEn: 'BUSINESS RISK MANAGEMENT AND INSURANCE', titleTh: 'การจัดการความเสี่ยงทางธุรกิจและการประกันภัย', schedule: 'Lec 3(3-0-6)', date: '2026-11-18', readiness: 50 },
    '761325': { code: '761325', titleEn: 'BUSINESS FORECASTING', titleTh: 'การพยากรณ์ทางธุรกิจ', schedule: 'Lec 3(3-0-6)', date: '2026-11-18', readiness: 45 },
    '761326': { code: '761326', titleEn: 'DIGITAL CONSUMER BEHAVIOR', titleTh: 'พฤติกรรมผู้บริโภคยุคดิจิทัล', schedule: 'Lec 3(3-0-6)', date: '2026-11-19', readiness: 60 },
    '761327': { code: '761327', titleEn: 'STARTUP AND NEW VENTURE MANAGEMENT', titleTh: 'การจัดการสตาร์ทอัพและธุรกิจเกิดใหม่', schedule: 'Lec 3(3-0-6)', date: '2026-11-19', readiness: 65 },
    '761401': { code: '761401', titleEn: 'STRATEGIC MANAGEMENT', titleTh: 'การจัดการเชิงกลยุทธ์', schedule: 'Lec 3(3-0-6)', date: '2026-11-20', readiness: 60 },
    '761491': { code: '761491', titleEn: 'SEMINAR IN BUSINESS INNOVATION MANAGEMENT', titleTh: 'สัมมนาประเด็นการจัดการนวัตกรรมทางธุรกิจ', schedule: 'Lec 3(3-0-6)', date: '2026-11-21', readiness: 50 },
    '761492': { code: '761492', titleEn: 'BUSINESS INNOVATION PROJECT', titleTh: 'โครงงานนวัตกรรมทางธุรกิจ', schedule: 'Proj 3(0-6-3)', date: '2026-11-22', readiness: 50 }
  };

  const activeFinalCourseKeys = ['761311', '761361', '761314', '761312', '761313'];
  const defaultUniversityExams = activeFinalCourseKeys.map((k, idx) => {
    const item = UNIVERSITY_COURSE_PRESETS[k];
    return {
      id: idx + 1,
      code: item.code,
      titleEn: item.titleEn,
      titleTh: item.titleTh,
      schedule: item.schedule,
      date: item.date,
      readiness: item.readiness
    };
  });

  // Reset or load university exams
  let savedExams = JSON.parse(localStorage.getItem('studybuddy_exams_uni'));
  if (!savedExams) {
    savedExams = defaultUniversityExams;
    localStorage.setItem('studybuddy_exams_uni', JSON.stringify(savedExams));
  }
  let exams = savedExams;

  function renderExams() {
    const container = document.getElementById('dday-exams-container');
    if (!container) return;
    container.innerHTML = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    exams.forEach(item => {
      const examDate = new Date(item.date);
      examDate.setHours(0, 0, 0, 0);
      const diffTime = examDate - today;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isUrgent = daysLeft <= 16 && daysLeft >= 0;
      let daysDisplay = daysLeft > 0 ? `D-${daysLeft}` : (daysLeft === 0 ? "D-Day วันนี้!" : `เลยกำหนด`);
      let progressColor = item.readiness >= 70 ? 'mint' : (item.readiness >= 45 ? 'indigo' : 'rose');

      const el = document.createElement('div');
      el.className = `dday-item ${isUrgent ? 'urgent' : ''}`;
      el.innerHTML = `
        <div class="dday-info">
          <div class="course-header-row">
            <span class="course-code-badge">${escapeHtml(item.code || 'COURSE')}</span>
            <span class="course-name-en">${escapeHtml(item.titleEn || item.subject || '')}</span>
          </div>
          <span class="course-name-th">${escapeHtml(item.titleTh || '')}</span>
          <div class="dday-meta" style="margin-top: 0.25rem;">
            <span class="course-meta-tag"><i data-lucide="clock" style="width: 13px; height: 13px; display: inline-block; vertical-align: middle;"></i> ${escapeHtml(item.schedule || '')}</span>
          </div>
          <div class="dday-readiness-row">
            <div class="progress-track">
              <div class="progress-fill ${progressColor}" style="width: ${item.readiness}%;"></div>
            </div>
            <span class="readiness-label">${item.readiness}%</span>
            <div class="readiness-stepper-group">
              <button type="button" class="readiness-stepper-btn" data-exam-id="${item.id}" data-delta="-10" title="ลดความพร้อม 10%">-</button>
              <button type="button" class="readiness-stepper-btn" data-exam-id="${item.id}" data-delta="10" title="เพิ่มความพร้อม 10%">+</button>
            </div>
          </div>
        </div>
        <div class="dday-badge-counter">
          <span class="dday-count-prefix">${daysLeft >= 0 ? 'เหลือ' : 'ผ่านมา'}</span>
          <span class="dday-count-number mono-num">${daysLeft >= 0 ? daysLeft : Math.abs(daysLeft)}</span>
          <span class="dday-count-prefix">วัน</span>
        </div>
      `;
      container.appendChild(el);
    });

    if (window.lucide) lucide.createIcons();
  }

  // 1-Click Readiness Adjuster Delegation
  const ddayExamsContainer = document.getElementById('dday-exams-container');
  if (ddayExamsContainer) {
    ddayExamsContainer.addEventListener('click', (e) => {
      const stepperBtn = e.target.closest('.readiness-stepper-btn');
      if (stepperBtn) {
        e.stopPropagation();
        const examId = parseInt(stepperBtn.dataset.examId, 10);
        const delta = parseInt(stepperBtn.dataset.delta, 10);
        const exam = exams.find(x => x.id === examId);
        if (exam) {
          exam.readiness = Math.max(0, Math.min(100, (exam.readiness || 50) + delta));
          localStorage.setItem('studybuddy_exams_uni', JSON.stringify(exams));
          renderExams();
          playChimeSound();
          showToast(`ปรับความพร้อม ${exam.code} เป็น ${exam.readiness}%`);
        }
      }
    });
  }

  renderExams();

  // Add Exam Modal logic with 1-click Preset Chips
  const modalAddExam = document.getElementById('modal-add-exam');
  const btnOpenAddExam = document.getElementById('btn-open-add-exam-modal');
  const btnCloseAddExam = document.getElementById('btn-close-exam-modal');
  const btnCancelAddExam = document.getElementById('btn-cancel-exam-modal');
  const formAddExam = document.getElementById('form-add-exam');
  const selectPresetCourse = document.getElementById('select-preset-course');
  const dropdownPresetCourse = document.getElementById('dropdown-preset-course');
  const btnDropdownPresetCourse = document.getElementById('btn-dropdown-preset-course');
  const labelSelectedPresetCourse = document.getElementById('label-selected-preset-course');
  const presetCourseOptItems = document.querySelectorAll('#popover-preset-course-list .dropdown-opt-item');
  const btnToggleCustomFields = document.getElementById('btn-toggle-custom-fields');
  const manualExamFields = document.getElementById('manual-exam-fields');

  // Function to auto-populate exam form fields from preset courses
  function fillExamFields(key) {
    if (UNIVERSITY_COURSE_PRESETS[key]) {
      const p = UNIVERSITY_COURSE_PRESETS[key];
      const codeInput = document.getElementById('input-exam-code');
      const titleEnInput = document.getElementById('input-exam-title-en');
      const titleThInput = document.getElementById('input-exam-title-th');
      const scheduleInput = document.getElementById('input-exam-schedule');
      const dateInput = document.getElementById('input-exam-date');
      const readinessInput = document.getElementById('input-exam-readiness');

      if (codeInput) codeInput.value = p.code;
      if (titleEnInput) titleEnInput.value = p.titleEn;
      if (titleThInput) titleThInput.value = p.titleTh || '';
      if (scheduleInput) scheduleInput.value = p.schedule || '';
      if (dateInput) dateInput.value = p.date || '';
      if (readinessInput) readinessInput.value = p.readiness || 50;

      if (labelSelectedPresetCourse) {
        labelSelectedPresetCourse.textContent = `${p.code} ${p.titleEn}`;
      }
      if (selectPresetCourse) {
        selectPresetCourse.value = key;
      }
    }
  }


  // Custom Dropdown Popover Logic for Add Exam Modal
  if (btnDropdownPresetCourse && dropdownPresetCourse) {
    btnDropdownPresetCourse.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdownPresetCourse.classList.toggle('open');
      btnDropdownPresetCourse.setAttribute('aria-expanded', String(isOpen));
    });

    presetCourseOptItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = item.dataset.value;
        const text = item.querySelector('span')?.textContent || value;

        dropdownPresetCourse.classList.remove('open');
        btnDropdownPresetCourse.setAttribute('aria-expanded', 'false');

        if (value && value !== 'custom') {
          fillExamFields(value);
        } else if (value === 'custom') {
          document.getElementById('input-exam-code').value = '';
          document.getElementById('input-exam-title-en').value = '';
          document.getElementById('input-exam-title-th').value = '';
          document.getElementById('input-exam-schedule').value = '';
          document.getElementById('input-exam-date').value = '';
          document.getElementById('input-exam-readiness').value = 50;
          if (labelSelectedPresetCourse) labelSelectedPresetCourse.textContent = '-- กรอกวิชาและวันสอบเอง --';
          document.getElementById('input-exam-code').focus();
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!dropdownPresetCourse.contains(e.target)) {
        dropdownPresetCourse.classList.remove('open');
        btnDropdownPresetCourse.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdownPresetCourse.classList.contains('open')) {
        dropdownPresetCourse.classList.remove('open');
        btnDropdownPresetCourse.setAttribute('aria-expanded', 'false');
        btnDropdownPresetCourse.focus();
      }
    });
  }

  btnOpenAddExam.addEventListener('click', () => {
    modalAddExam.classList.add('open');
    // Pre-populate with default preset if fields are empty
    if (!document.getElementById('input-exam-code').value) {
      fillExamFields('761311');
    }
  });

  const btnCancelExamModal = document.getElementById('btn-cancel-exam-modal');
  [btnCloseAddExam, btnCancelExamModal].forEach(btn => {
    if (btn) btn.addEventListener('click', () => modalAddExam.classList.remove('open'));
  });

  formAddExam.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('input-exam-code').value.trim() || 'COURSE';
    const titleEn = document.getElementById('input-exam-title-en').value.trim();
    const titleTh = document.getElementById('input-exam-title-th').value.trim();
    const schedule = document.getElementById('input-exam-schedule').value.trim();
    const date = document.getElementById('input-exam-date').value;
    const readiness = parseInt(document.getElementById('input-exam-readiness').value, 10) || 50;

    if (titleEn && date) {
      const exists = exams.some(ex => ex.code === code || (ex.titleEn && ex.titleEn.toLowerCase() === titleEn.toLowerCase()));
      if (exists) {
        showToast(`วิชา "${code} ${titleEn}" มีอยู่ในตารางสอบแล้ว`);
        modalAddExam.classList.remove('open');
        return;
      }

      exams.unshift({
        id: Date.now(),
        code,
        titleEn,
        titleTh,
        schedule,
        date,
        readiness
      });
      localStorage.setItem('studybuddy_exams_uni', JSON.stringify(exams));
      renderExams();
      modalAddExam.classList.remove('open');
      formAddExam.reset();
      playChimeSound();
      showToast(`เพิ่มวันสอบ "${code} ${titleEn}" เรียบร้อยแล้ว`);
    } else {
      showToast('กรุณาระบุชื่อวิชาและวันสอบจริง');
    }
  });

  /* ==========================================================================
     5. Pillar 2: Pomodoro Focus Timer
     ========================================================================== */
  const POMO_MODES = {
    'focus': { minutes: 25, label: 'ช่วงโฟกัสอ่านหนังสือ' },
    'short-break': { minutes: 5, label: 'ช่วงพักสายตา 5 นาที' },
    'long-break': { minutes: 15, label: 'ช่วงพักผ่อนเต็มอิ่ม 15 นาที' }
  };

  let activePomoMode = 'focus';
  let pomoTotalSeconds = 25 * 60;
  let pomoRemainingSeconds = 25 * 60;
  let pomoTimerInterval = null;
  let isPomoRunning = false;
  const CIRCLE_CIRCUMFERENCE = 552.92; // 2 * PI * 88

  const pomoDisplayDigits = document.getElementById('pomodoro-time-display');
  const pomoStatusText = document.getElementById('pomodoro-status-text');
  const pomoProgressCircle = document.getElementById('timer-progress-circle');
  const btnPomoToggle = document.getElementById('btn-pomo-toggle');
  const iconPomoToggle = document.getElementById('icon-pomo-toggle');
  const textPomoToggle = document.getElementById('text-pomo-toggle');
  const btnPomoReset = document.getElementById('btn-pomo-reset');

  function updatePomoDisplay() {
    const mins = Math.floor(pomoRemainingSeconds / 60);
    const secs = pomoRemainingSeconds % 60;
    pomoDisplayDigits.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // SVG Circle offset
    const fraction = pomoRemainingSeconds / pomoTotalSeconds;
    const offset = CIRCLE_CIRCUMFERENCE * (1 - fraction);
    pomoProgressCircle.style.strokeDashoffset = offset;
  }

  function startPomoTimer() {
    if (isPomoRunning) return;
    initAudioContext();
    isPomoRunning = true;
    textPomoToggle.textContent = 'หยุดชั่วคราว';
    pomoStatusText.textContent = 'กำลังลุยอ่าน... สมาธิเต็มร้อย!';

    pomoTimerInterval = setInterval(() => {
      if (pomoRemainingSeconds > 0) {
        pomoRemainingSeconds--;
        updatePomoDisplay();
      } else {
        clearInterval(pomoTimerInterval);
        isPomoRunning = false;
        textPomoToggle.textContent = 'เริ่มจับเวลา';
        playChimeSound();

        if (activePomoMode === 'focus') {
          showToast('ยอดเยี่ยมมาก! จบรอบโฟกัส 25 นาทีแล้ว พักผ่อนสักครู่');
          addStudyMinutes(25);
          unlockBadge('pomodoro_10');
        } else {
          showToast('หมดเวลาพักแล้ว พร้อมลุยอ่านรอบต่อไป!');
        }

        pomoStatusText.textContent = 'ครบกำหนดเวลา!';
      }
    }, 1000);
  }

  function pausePomoTimer() {
    if (!isPomoRunning) return;
    clearInterval(pomoTimerInterval);
    isPomoRunning = false;
    textPomoToggle.textContent = 'อ่านต่อ';
    pomoStatusText.textContent = 'หยุดชั่วคราว';
  }

  function resetPomoTimer() {
    clearInterval(pomoTimerInterval);
    isPomoRunning = false;
    pomoRemainingSeconds = pomoTotalSeconds;
    textPomoToggle.textContent = 'เริ่มจับเวลา';
    pomoStatusText.textContent = POMO_MODES[activePomoMode].label;
    updatePomoDisplay();
  }

  btnPomoToggle.addEventListener('click', () => {
    if (isPomoRunning) {
      pausePomoTimer();
    } else {
      startPomoTimer();
    }
  });

  btnPomoReset.addEventListener('click', resetPomoTimer);

  document.querySelectorAll('.pomo-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pomo-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activePomoMode = btn.dataset.pomoMode;
      pomoTotalSeconds = POMO_MODES[activePomoMode].minutes * 60;
      resetPomoTimer();
    });
  });

  updatePomoDisplay();

  /* ==========================================================================
     6. Pillar 2: Daily Study Checklist
     ========================================================================== */
  const defaultChecklist = [
    { id: 1, text: "761311 สรุปแนวคิด NPV, IRR และ WACC การลงทุนทางธุรกิจ", category: "761311 การลงทุน", completed: true },
    { id: 2, text: "761361 ทบทวน Customer Lifetime Value & โมเดล CRM เชิงกลยุทธ์", category: "761361 CRM ลูกค้าสัมพันธ์", completed: true },
    { id: 3, text: "761314 วิเคราะห์นวัตกรรม Lean Six Sigma & Value Stream Mapping", category: "761314 การจัดการดำเนินงาน", completed: false },
    { id: 4, text: "761312 เจาะลึก Green Logistics & Circular Economy เพื่อความยั่งยืน", category: "761312 โลจิสติกส์ยั่งยืน", completed: false },
    { id: 5, text: "761313 ฝึกทำโจทย์ Multiple Regression & ตรวจสอบสมมติฐานการวิจัย", category: "761313 สถิติวิจัย", completed: false }
  ];

  let savedTasks = JSON.parse(localStorage.getItem('studybuddy_tasks_uni'));
  if (!savedTasks) {
    savedTasks = defaultChecklist;
    localStorage.setItem('studybuddy_tasks_uni', JSON.stringify(savedTasks));
  }
  let checklistTasks = savedTasks;

  function renderChecklist() {
    const listContainer = document.getElementById('daily-checklist-items');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const completedCount = checklistTasks.filter(t => t.completed).length;
    const totalCount = checklistTasks.length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    document.getElementById('checklist-progress-text').textContent = `เสร็จ ${completedCount}/${totalCount} รายการ (${percent}%)`;
    document.getElementById('checklist-progress-fill').style.width = `${percent}%`;

    checklistTasks.forEach(task => {
      const itemEl = document.createElement('div');
      itemEl.className = `task-item ${task.completed ? 'completed' : ''}`;
      itemEl.innerHTML = `
        <button type="button" class="task-checkbox-custom" data-id="${task.id}" aria-label="${task.completed ? 'ทำเสร็จแล้ว' : 'ติ๊กเพื่อจบงาน'}">
          ${task.completed ? '<i data-lucide="check" style="width: 15px; height: 15px;"></i>' : ''}
        </button>
        <div class="task-content-block">
          <span class="task-text">${escapeHtml(task.text)}</span>
          <div class="task-meta-row">
            <span class="task-category-tag">${escapeHtml(task.category)}</span>
          </div>
        </div>
        <button type="button" class="task-delete-btn" data-id="${task.id}" aria-label="ลบรายการ">
          <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
        </button>
      `;
      listContainer.appendChild(itemEl);
    });

    if (window.lucide) lucide.createIcons();
  }

  // Toggle or Delete Checklist Task
  document.getElementById('daily-checklist-items').addEventListener('click', (e) => {
    const checkBtn = e.target.closest('.task-checkbox-custom');
    const deleteBtn = e.target.closest('.task-delete-btn');

    if (checkBtn) {
      const id = parseInt(checkBtn.dataset.id, 10);
      const task = checklistTasks.find(t => t.id === id);
      if (task) {
        task.completed = !task.completed;
        localStorage.setItem('studybuddy_tasks_uni', JSON.stringify(checklistTasks));
        renderChecklist();
        if (task.completed) {
          playChimeSound();
          showToast(`ยอดเยี่ยม! อ่านจบ "${task.text}" แล้ว`);
        }
      }
    } else if (deleteBtn) {
      const id = parseInt(deleteBtn.dataset.id, 10);
      checklistTasks = checklistTasks.filter(t => t.id !== id);
      localStorage.setItem('studybuddy_tasks_uni', JSON.stringify(checklistTasks));
      renderChecklist();
    }
  });

  // Add new checklist task (typing optional)
  document.getElementById('form-add-checklist-task').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('input-task-text');
    const category = document.getElementById('select-task-category').value;
    let text = input.value.trim();

    // If user does not type, automatically generate title from chosen category
    if (!text) {
      text = `ทบทวนเนื้อหา ${category}`;
    }

    checklistTasks.unshift({
      id: Date.now(),
      text,
      category,
      completed: false
    });
    localStorage.setItem('studybuddy_tasks_uni', JSON.stringify(checklistTasks));
    renderChecklist();
    input.value = '';
    playChimeSound();
    showToast(`เพิ่มงานอ่าน: "${text}" เรียบร้อยแล้ว`);
  });


  // Custom Accessible Dropdown for Checklist Category
  const dropdownTaskCategory = document.getElementById('dropdown-task-category');
  const btnDropdownCategory = document.getElementById('btn-dropdown-category');
  const labelSelectedCategory = document.getElementById('label-selected-category');
  const selectTaskCategory = document.getElementById('select-task-category');
  const dropdownOptItems = document.querySelectorAll('#popover-category-list .dropdown-opt-item');

  if (btnDropdownCategory && dropdownTaskCategory) {
    btnDropdownCategory.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdownTaskCategory.classList.toggle('open');
      btnDropdownCategory.setAttribute('aria-expanded', String(isOpen));
    });

    dropdownOptItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = item.dataset.value;
        if (selectTaskCategory) selectTaskCategory.value = value;
        if (labelSelectedCategory) labelSelectedCategory.textContent = value;

        dropdownOptItems.forEach(i => {
          const isSelected = i === item;
          i.classList.toggle('selected', isSelected);
          i.setAttribute('aria-selected', String(isSelected));
        });

        dropdownTaskCategory.classList.remove('open');
        btnDropdownCategory.setAttribute('aria-expanded', 'false');
        btnDropdownCategory.focus();
      });
    });

    document.addEventListener('click', (e) => {
      if (!dropdownTaskCategory.contains(e.target)) {
        dropdownTaskCategory.classList.remove('open');
        btnDropdownCategory.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdownTaskCategory.classList.contains('open')) {
        dropdownTaskCategory.classList.remove('open');
        btnDropdownCategory.setAttribute('aria-expanded', 'false');
        btnDropdownCategory.focus();
      }
    });
  }

  renderChecklist();

  /* ==========================================================================
     7. Study Hours Logger & Weekly Analytics Chart
     ========================================================================== */
  let loggedMinutesToday = parseInt(localStorage.getItem('studybuddy_today_minutes') || '210', 10); // 3.5 hrs default
  const targetMinutesToday = 240; // 4.0 hrs

  function updateHoursDisplay() {
    const hrs = (loggedMinutesToday / 60).toFixed(1);
    const targetHrs = (targetMinutesToday / 60).toFixed(1);
    document.getElementById('today-logged-hours').textContent = `${hrs} ชม.`;
    document.getElementById('today-target-hours').textContent = `${targetHrs} ชม.`;
  }

  function addStudyMinutes(mins) {
    loggedMinutesToday += mins;
    localStorage.setItem('studybuddy_today_minutes', loggedMinutesToday);
    updateHoursDisplay();
    renderWeeklyChart();
  }

  updateHoursDisplay();

  // 1-Tap Instant Hours Logger Controls
  let currentInstantCourse = '761311 การลงทุน';
  const instantCourseChips = document.querySelectorAll('#instant-course-selector .quick-action-chip');
  instantCourseChips.forEach(chip => {
    chip.addEventListener('click', () => {
      instantCourseChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentInstantCourse = chip.textContent.trim();
      showToast(`เลือกวิชาสำหรับบันทึกเวลา: ${currentInstantCourse}`);
    });
  });

  document.querySelectorAll('.btn-instant-time').forEach(btn => {
    btn.addEventListener('click', () => {
      const mins = parseInt(btn.dataset.addMins, 10) || 30;
      addStudyMinutes(mins);
      playChimeSound();
      showToast(`บันทึกเวลา +${mins} นาที (${currentInstantCourse}) สำเร็จ!`);
    });
  });

  // Weekly study hours data (Mon - Sun)
  const weeklyData = [
    { day: 'จันทร์', hours: 3.2 },
    { day: 'อังคาร', hours: 4.0 },
    { day: 'พุธ', hours: 2.8 },
    { day: 'พฤหัส', hours: 4.5 },
    { day: 'ศุกร์', hours: 3.5 },
    { day: 'เสาร์', hours: 5.0 },
    { day: 'อาทิตย์ (วันนี้)', hours: 3.5, current: true }
  ];

  function renderWeeklyChart() {
    const chartWrapper = document.getElementById('weekly-analytics-chart');
    if (!chartWrapper) return;
    chartWrapper.innerHTML = '';

    const maxHours = 6.0;
    let total = 0;

    weeklyData.forEach(d => {
      if (d.current) {
        d.hours = parseFloat((loggedMinutesToday / 60).toFixed(1));
      }
      total += d.hours;

      const heightPercent = Math.min(100, Math.round((d.hours / maxHours) * 100));

      const col = document.createElement('div');
      col.className = 'chart-bar-col';
      col.innerHTML = `
        <div class="chart-bar ${d.current ? 'current-day' : ''}" style="height: ${heightPercent}%;">
          <span class="chart-bar-val mono-num">${d.hours}h</span>
        </div>
        <span class="chart-day-label">${d.day.split(' ')[0]}</span>
      `;
      chartWrapper.appendChild(col);
    });

    document.getElementById('weekly-total-hours').textContent = `${total.toFixed(1)} ชม.`;
    document.getElementById('weekly-avg-hours').textContent = `${(total / 7).toFixed(1)} ชม.`;
  }

  renderWeeklyChart();

  // Modal Log Study Hours with 1-click Direct Action
  const modalLogHours = document.getElementById('modal-log-hours');
  const btnOpenLogHours = document.getElementById('btn-open-log-hours-modal');
  const btnCloseLogHours = document.getElementById('btn-close-log-modal');
  const btnToggleCustomLog = document.getElementById('btn-toggle-custom-log');
  const manualLogFields = document.getElementById('manual-log-fields');
  const formLogHours = document.getElementById('form-log-study-hours');

  // Toggle manual entry fields in Log Hours modal
  if (btnToggleCustomLog && manualLogFields) {
    btnToggleCustomLog.addEventListener('click', () => {
      manualLogFields.classList.toggle('show');
      if (manualLogFields.classList.contains('show')) {
        document.getElementById('input-log-hours')?.focus();
      }
    });
  }

  // Modal subject preset chips
  document.querySelectorAll('#modal-log-course-chips .quick-action-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#modal-log-course-chips .quick-action-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const val = chip.dataset.subject;
      if (val) {
        const inputSubject = document.getElementById('input-log-subject-name');
        if (inputSubject) inputSubject.value = val;
      }
    });
  });

  // Modal hour buttons: updates input value and active state
  document.querySelectorAll('#modal-log-hour-chips button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#modal-log-hour-chips button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const hrs = parseFloat(btn.dataset.hours) || 1.0;
      const inputHours = document.getElementById('input-log-hours');
      if (inputHours) inputHours.value = hrs;
    });
  });

  if (btnOpenLogHours && modalLogHours) {
    btnOpenLogHours.addEventListener('click', () => {
      modalLogHours.classList.add('open');
    });
  }

  const btnCancelLogHours = document.getElementById('btn-cancel-log-modal');
  [btnCloseLogHours, btnCancelLogHours].forEach(btn => {
    if (btn) btn.addEventListener('click', () => modalLogHours.classList.remove('open'));
  });

  if (formLogHours) {
    formLogHours.addEventListener('submit', (e) => {
      e.preventDefault();
      const hrs = parseFloat(document.getElementById('input-log-hours').value) || 1;
      const subject = document.getElementById('input-log-subject-name').value || 'ทบทวนวิชา';

      addStudyMinutes(Math.round(hrs * 60));
      playChimeSound();
      if (modalLogHours) modalLogHours.classList.remove('open');
      showToast(`บันทึกเวลาอ่าน ${hrs} ชม. (${subject}) สำเร็จแล้ว!`);
    });
  }

  /* ==========================================================================
     8. Pillar 1: Smart Study Splitter (1-Click Interactive Selector & Steppers)
     ========================================================================== */
  const splitterTotalPages = document.getElementById('splitter-total-pages');
  const splitterDaysLeft = document.getElementById('splitter-days-left');
  const splitterBufferDays = document.getElementById('splitter-buffer-days');
  const splitterResultText = document.getElementById('splitter-result-text');
  const splitterStatDaily = document.getElementById('splitter-stat-daily');
  const displaySplitterPages = document.getElementById('display-splitter-pages');
  const displaySplitterDays = document.getElementById('display-splitter-days');
  const displaySplitterBuffer = document.getElementById('display-splitter-buffer');

  function calculateStudySplitter() {
    const total = parseInt(splitterTotalPages.value, 10) || 200;
    const days = parseInt(splitterDaysLeft.value, 10) || 15;
    const buffer = parseInt(splitterBufferDays.value, 10) || 3;

    const actualStudyDays = Math.max(1, days - buffer);
    const pagesPerDay = Math.ceil(total / actualStudyDays);
    const estHours = (pagesPerDay * 5 / 60).toFixed(1);

    if (splitterStatDaily) {
      splitterStatDaily.textContent = `${pagesPerDay} หน้า / วัน`;
    }
    if (splitterResultText) {
      splitterResultText.innerHTML = `
        ควรอ่านวันละ <strong>${pagesPerDay} หน้า</strong> เป็นเวลา ${actualStudyDays} วันแรก และเหลือ <strong>${buffer} วันสุดท้าย</strong> ไว้ทำข้อสอบ Final & เก็งจุดผิด
      `;
    }
  }

  function setSplitterPages(val) {
    val = Math.max(20, Math.min(1000, val));
    if (splitterTotalPages) splitterTotalPages.value = val;
    if (displaySplitterPages) displaySplitterPages.textContent = val;
    document.querySelectorAll('#splitter-pages-presets .quick-action-chip').forEach(c => {
      c.classList.toggle('active', parseInt(c.dataset.pages, 10) === val);
    });
  }

  function setSplitterDays(val) {
    val = Math.max(1, Math.min(90, val));
    if (splitterDaysLeft) splitterDaysLeft.value = val;
    if (displaySplitterDays) displaySplitterDays.textContent = val;
  }

  function setSplitterBuffer(val) {
    val = Math.max(0, Math.min(30, val));
    if (splitterBufferDays) splitterBufferDays.value = val;
    if (displaySplitterBuffer) displaySplitterBuffer.textContent = val;
    document.querySelectorAll('#splitter-buffer-presets .quick-action-chip').forEach(c => {
      c.classList.toggle('active', parseInt(c.dataset.buffer, 10) === val);
    });
  }

  // 1-Click Course Selection for Splitter
  document.querySelectorAll('#splitter-course-chips .quick-action-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#splitter-course-chips .quick-action-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const examDateStr = chip.dataset.examDate;
      const coursePages = parseInt(chip.dataset.pages, 10) || 200;

      // Real days calculation
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const exDate = new Date(examDateStr);
      exDate.setHours(0, 0, 0, 0);
      const diffTime = exDate - today;
      const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      setSplitterPages(coursePages);
      setSplitterDays(daysLeft);
      calculateStudySplitter();
      showToast(`เลือกวิชา ${chip.textContent.trim()} (เหลือ ${daysLeft} วัน)`);
    });
  });

  // Pages Stepper & Presets
  document.getElementById('btn-splitter-pages-minus')?.addEventListener('click', () => {
    const cur = parseInt(splitterTotalPages.value, 10) || 200;
    setSplitterPages(cur - 20);
    calculateStudySplitter();
  });
  document.getElementById('btn-splitter-pages-plus')?.addEventListener('click', () => {
    const cur = parseInt(splitterTotalPages.value, 10) || 200;
    setSplitterPages(cur + 20);
    calculateStudySplitter();
  });
  document.querySelectorAll('#splitter-pages-presets .quick-action-chip').forEach(c => {
    c.addEventListener('click', () => {
      setSplitterPages(parseInt(c.dataset.pages, 10));
      calculateStudySplitter();
    });
  });

  // Days Stepper
  document.getElementById('btn-splitter-days-minus')?.addEventListener('click', () => {
    const cur = parseInt(splitterDaysLeft.value, 10) || 15;
    setSplitterDays(cur - 1);
    calculateStudySplitter();
  });
  document.getElementById('btn-splitter-days-plus')?.addEventListener('click', () => {
    const cur = parseInt(splitterDaysLeft.value, 10) || 15;
    setSplitterDays(cur + 1);
    calculateStudySplitter();
  });

  // Buffer Stepper & Presets
  document.getElementById('btn-splitter-buffer-minus')?.addEventListener('click', () => {
    const cur = parseInt(splitterBufferDays.value, 10) || 3;
    setSplitterBuffer(cur - 1);
    calculateStudySplitter();
  });
  document.getElementById('btn-splitter-buffer-plus')?.addEventListener('click', () => {
    const cur = parseInt(splitterBufferDays.value, 10) || 3;
    setSplitterBuffer(cur + 1);
    calculateStudySplitter();
  });
  document.querySelectorAll('#splitter-buffer-presets .quick-action-chip').forEach(c => {
    c.addEventListener('click', () => {
      setSplitterBuffer(parseInt(c.dataset.buffer, 10));
      calculateStudySplitter();
    });
  });

  calculateStudySplitter();

  /* ==========================================================================
     9. Pillar 1: Subject Confidence Matrix (ประเมินความมั่นใจ 1-5 ดาว)
     ========================================================================== */
  const confidenceSubjects = [
    { id: 1, name: "761311 BUSINESS INVESTMENT (การลงทุนทางธุรกิจ)", stars: 4 },
    { id: 2, name: "761361 CUSTOMER RELATIONSHIP MANAGEMENT (CRM)", stars: 3 },
    { id: 3, name: "761314 OPERATION MANAGEMENT INNOVATIONS (นวัตกรรม)", stars: 3 },
    { id: 4, name: "761312 SUSTAINABLE LOGISTICS (โลจิสติกส์ยั่งยืน)", stars: 4 },
    { id: 5, name: "761313 STATISTICS FOR RESEARCH (สถิติวิจัย)", stars: 2 }
  ];

  function renderConfidenceMatrix() {
    const tbody = document.getElementById('confidence-matrix-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    confidenceSubjects.forEach(sub => {
      let statusTag = '';
      if (sub.stars <= 2) {
        statusTag = '<span class="weakness-tag urgent"><i data-lucide="alert-triangle" style="width: 12px; height: 12px;"></i> ต้องทบทวนด่วน (จุดอ่อน)</span>';
      } else if (sub.stars === 3) {
        statusTag = '<span class="weakness-tag" style="background: var(--amber-50); color: var(--amber-700); border: 1px solid var(--amber-100);"><i data-lucide="clock" style="width: 12px; height: 12px;"></i> พอทำได้ ทวนเพิ่มอีกนิด</span>';
      } else {
        statusTag = '<span class="weakness-tag good"><i data-lucide="check-check" style="width: 12px; height: 12px;"></i> มั่นใจมาก พร้อมทำโจทย์</span>';
      }

      let starsHtml = '';
      for (let s = 1; s <= 5; s++) {
        const isFilled = s <= sub.stars;
        starsHtml += `<button class="star-btn ${isFilled ? 'filled' : ''}" data-subject-id="${sub.id}" data-rating="${s}">★</button>`;
      }

      const tr = document.createElement('tr');
      tr.className = 'confidence-row';
      tr.innerHTML = `
        <td>${escapeHtml(sub.name)}</td>
        <td><div class="confidence-stars">${starsHtml}</div></td>
        <td>${statusTag}</td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) lucide.createIcons();
  }

  document.getElementById('confidence-matrix-body').addEventListener('click', (e) => {
    const starBtn = e.target.closest('.star-btn');
    if (starBtn) {
      const subId = parseInt(starBtn.dataset.subjectId, 10);
      const rating = parseInt(starBtn.dataset.rating, 10);
      const sub = confidenceSubjects.find(s => s.id === subId);
      if (sub) {
        sub.stars = rating;
        renderConfidenceMatrix();
        showToast(`อัปเดตความมั่นใจ "${sub.name}" เป็น ${rating} ดาวแล้ว`);
      }
    }
  });

  renderConfidenceMatrix();

  /* ==========================================================================
     10. Gamification: Study Streak & Badges
     ========================================================================== */
  const badgesData = [
    { id: 'streak_7', name: 'อ่านครบ 7 วันรวด', desc: 'มีวินัยสม่ำเสมอต่อเนื่อง', icon: '🔥', unlocked: true },
    { id: 'night_owl', name: 'จอมขยันยามดึก', desc: 'ลุยอ่านหลัง 22:00 น.', icon: '🦉', unlocked: true },
    { id: 'pomodoro_10', name: 'เซียน Pomodoro', desc: 'จบ 10 รอบโฟกัสเต็มที่', icon: '⏱️', unlocked: true },
    { id: 'exam_ready', name: 'พร้อมสอบ Final A+', desc: 'ความพร้อมแตะ 70%+', icon: '🎓', unlocked: true }
  ];

  function renderBadges() {
    const container = document.getElementById('dashboard-badges-container');
    if (!container) return;
    container.innerHTML = '';

    badgesData.forEach(badge => {
      const el = document.createElement('div');
      el.className = `badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`;
      el.innerHTML = `
        <div class="badge-icon-box" style="${badge.unlocked ? 'background: var(--amber-100);' : 'background: var(--bg-card-subtle);'}">
          ${badge.icon}
        </div>
        <span class="badge-name">${badge.name}</span>
        <span class="badge-desc">${badge.desc}</span>
      `;
      container.appendChild(el);
    });
  }

  function unlockBadge(badgeId) {
    const badge = badgesData.find(b => b.id === badgeId);
    if (badge && !badge.unlocked) {
      badge.unlocked = true;
      renderBadges();
      showToast(`🎉 ปลดล็อกเหรียญตราใหม่: "${badge.name}"!`);
    }
  }

  renderBadges();

  /* ==========================================================================
     11. Toast Notification Helper
     ========================================================================== */
  let toastTimeout = null;
  function showToast(message) {
    const toast = document.getElementById('app-toast-notice');
    const textEl = document.getElementById('toast-message-text');
    if (!toast || !textEl) return;

    textEl.textContent = message;
    toast.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  /* Utility: Escape HTML */
  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

});
