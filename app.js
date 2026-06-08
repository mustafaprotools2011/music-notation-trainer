/* ═══════════════════════════════════════════════════════════
   Musical Notation Trainer  —  Improved v2
   Fixes: accurate staff positioning, dynamic distractors,
   expanded question banks, correct interval drawing
   ═══════════════════════════════════════════════════════════ */

/* ─── Constants ─────────────────────────────────────────── */

// Treble clef: staff lines from bottom = E4 G4 B4 D5 F5
// Staff line 0 (top) = F5, line 4 (bottom) = E4
// SVG staff lines at y = 80, 104, 128, 152, 176  (gap = 24px)
const STAFF  = { top: 80, gap: 24 };   // staff top y, space between lines
const MID_Y  = STAFF.top + 2 * STAFF.gap; // y=128, middle line (B4) — stem direction pivot

// Convert pitch step to y coordinate
// step 0 = E4 (bottom line), step increases upward
// Each half-step on the diatonic scale = 12px (half a staff space)
function pitchToY(step) {
  // Bottom line (E4) = staff line index 4 = y 176
  return STAFF.top + (4 * STAFF.gap) - step * (STAFF.gap / 2);
}

// Helper: draw the 5 staff lines
function staffSVG(x1 = 60, x2 = 580) {
  return Array.from({ length: 5 }, (_, i) => {
    const y = STAFF.top + i * STAFF.gap;
    return `<line class="notation-line" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>`;
  }).join('');
}

// Helper: filled note head — stem up when below middle line, down when above
function noteHeadFilled(x, y) {
  const up = y >= MID_Y;
  const sx = up ? x + 15 : x - 15;
  const [sy1, sy2] = up ? [y - 2, y - 62] : [y + 2, y + 62];
  return `<ellipse class="note-head" cx="${x}" cy="${y}" rx="16" ry="11" transform="rotate(-18 ${x} ${y})"/>
  <line class="stem" x1="${sx}" y1="${sy1}" x2="${sx}" y2="${sy2}"/>`;
}

// Helper: open (hollow) note head — same stem direction logic
function noteHeadOpen(x, y) {
  const up = y >= MID_Y;
  const sx = up ? x + 15 : x - 15;
  const [sy1, sy2] = up ? [y - 2, y - 62] : [y + 2, y + 62];
  return `<ellipse class="note-open" cx="${x}" cy="${y}" rx="16" ry="11" transform="rotate(-18 ${x} ${y})"/>
  <line class="stem" x1="${sx}" y1="${sy1}" x2="${sx}" y2="${sy2}"/>`;
}

// Helper: whole note (no stem)
function noteWhole(x, y) {
  return `<ellipse class="note-open" cx="${x}" cy="${y}" rx="19" ry="13" transform="rotate(-15 ${x} ${y})"/>
  <ellipse fill="white" cx="${x + 2}" cy="${y - 1}" rx="10" ry="7" transform="rotate(-15 ${x} ${y})"/>`;
}

// Ledger lines when note is outside staff
function ledgerLines(x, y) {
  const lines = [];
  const bottomLine = STAFF.top + 4 * STAFF.gap; // 176
  const topLine = STAFF.top;                     // 80
  // Below staff
  let ly = bottomLine + STAFF.gap;
  while (ly <= y + 1) {
    lines.push(`<line class="ledger-line" x1="${x - 22}" y1="${ly}" x2="${x + 22}" y2="${ly}"/>`);
    ly += STAFF.gap;
  }
  // Above staff
  ly = topLine - STAFF.gap;
  while (ly >= y - 1) {
    lines.push(`<line class="ledger-line" x1="${x - 22}" y1="${ly}" x2="${x + 22}" y2="${ly}"/>`);
    ly -= STAFF.gap;
  }
  return lines.join('');
}

/* ─── Treble clef SVG path (accurate) ───────────────────── */
// We use a scaled Unicode char as before but position it precisely
function trebleClef() {
  // Spiral wraps around line 2 from bottom (G4, y=152)
  return `<text x="62" y="240" font-size="112" class="clef" direction="ltr" style="font-family:serif">𝄞</text>`;
}

function bassClef() {
  // Body sits on F line (4th from bottom, y=104); dots built into the glyph
  return `<text x="65" y="148" font-size="76" class="clef" direction="ltr" style="font-family:serif">𝄢</text>`;
}

/* ─── Module definitions ─────────────────────────────────── */
const modules = [
  {
    id: 'notes',
    title: 'أسماء النغمات',
    short: 'المدرج الكبير — مفتاح صول وفا',
    label: 'حدد اسم النغمة على المدرج',
    difficulty: 'مستوى تمهيدي',
    tag: 'الفكرة الأساسية',
    concept: 'كل نغمة لها موضع ثابت',
    text: 'اقرأ النغمة من موضعها على الخط أو الفراغ، ثم اربطها باسمها. كرر التدريب حتى تصبح القراءة فورية.',
    facts: [
      ['مفتاح صول — خطوط', 'من الأسفل للأعلى: E G B D F (جملة: Every Good Boy Does Fine)'],
      ['مفتاح صول — فراغات', 'F A C E (كلمة FACE)'],
      ['مفتاح فا — خطوط', 'من الأسفل للأعلى: G B D F A (Good Boys Do Fine Always)'],
      ['مفتاح فا — فراغات', 'A C E G (All Cows Eat Grass)']
    ],
    refs: 'notes'
  },
  {
    id: 'rhythm',
    title: 'القيم الزمنية والسكتات',
    short: 'نبضة، ميزان، نوار، كروش',
    label: 'اقرأ قيمة الرمز الزمني',
    difficulty: 'أساس الإيقاع',
    tag: 'الفكرة الأساسية',
    concept: 'كل رمز يساوي عدداً من النبضات',
    text: 'ربط شكل النوتة أو السكتة بعدد النبضات أساس الإيقاع. الهدف أن يرى الطالب الرمز فيقول مدته فوراً.',
    facts: [
      ['Whole note', 'تساوي 4 نبضات في ميزان 4/4'],
      ['Half note', 'تساوي 2 نبضة'],
      ['Quarter note', 'تساوي 1 نبضة — مرجع العد الأكثر استخداماً'],
      ['Eighth note', 'تساوي نصف نبضة — كروش']
    ],
    refs: 'rhythm'
  },
  {
    id: 'accidentals',
    title: 'العلامات العارضة',
    short: 'Sharp ♯ · Flat ♭ · Natural ♮',
    label: 'تعرف على أثر العلامة على النغمة',
    difficulty: 'قبل السلالم',
    tag: 'الفكرة الأساسية',
    concept: 'العلامة تغير ارتفاع النغمة نصف درجة',
    text: 'الدييز يرفع نصف خطوة، البيمول يخفض نصف خطوة، الناتشورال يلغي تأثير العلامة السابقة ضمن المازورة.',
    facts: [
      ['Sharp ♯', 'يرفع النغمة نصف خطوة كرومية'],
      ['Flat ♭', 'يخفض النغمة نصف خطوة كرومية'],
      ['Natural ♮', 'يلغي أثر الدييز أو البيمول'],
      ['Double sharp ×', 'يرفع النغمة خطوة كاملة (نادر، موجود في بعض سلالم الـ harmonic)']
    ],
    refs: 'accidentals'
  },
  {
    id: 'scales',
    title: 'السلالم الموسيقية',
    short: 'Major · Minor · Chromatic',
    label: 'اكتشف نوع السلم أو نمطه',
    difficulty: 'بناء السلالم',
    tag: 'الفكرة الأساسية',
    concept: 'السلم نمط ثابت من أنصاف الخطوات والخطوات الكاملة',
    text: 'السلم الكبير له نمط W W H W W W H. هذه الخريطة تسهّل الكتابة وتساعد على التعرف على المفتاح.',
    facts: [
      ['Major', 'W W H W W W H'],
      ['Natural minor', 'W H W W H W W'],
      ['Harmonic minor', 'W H W W H A H  (A = augmented 2nd)'],
      ['Chromatic', 'حركة متتالية بأنصاف خطوات — 12 نغمة في الأوكتاف']
    ],
    refs: 'scales'
  },
  {
    id: 'intervals',
    title: 'المسافات الموسيقية',
    short: 'Major · Minor · Perfect',
    label: 'احسب المسافة بين نغمتين',
    difficulty: 'تدريب متوسط',
    tag: 'الفكرة الأساسية',
    concept: 'المسافة = رقم الدرجة + نوع الجودة',
    text: 'نعد أسماء النغمات أولاً لمعرفة الرقم (الثانية، الثالثة…)، ثم نحسب أنصاف الخطوات لنحدد الجودة: كبير، صغير، تام، زائد، ناقص.',
    facts: [
      ['Perfect unison/4th/5th/8th', 'لا تقبل "كبير" أو "صغير"، فقط تام/زائد/ناقص'],
      ['Major 3rd', '4 أنصاف خطوات'],
      ['Minor 3rd', '3 أنصاف خطوات'],
      ['Perfect 5th', '7 أنصاف خطوات'],
      ['Tritone (dim 5 / aug 4)', '6 أنصاف خطوات — "شيطان الموسيقى" تاريخياً']
    ],
    refs: 'intervals'
  },
  {
    id: 'terms',
    title: 'مصطلحات الأداء',
    short: 'Tempo · Dynamics · Expression',
    label: 'اربط المصطلح بمعناه',
    difficulty: 'حفظ عملي',
    tag: 'الفكرة الأساسية',
    concept: 'المصطلح يخبر العازف كيف يؤدي لا ماذا يعزف فقط',
    text: 'هذه المصطلحات مستقاة من الإيطالية في معظمها. تشمل السرعة (Tempo)، الديناميك، والطابع التعبيري.',
    facts: [
      ['Tempo', 'السرعة: Grave → Largo → Adagio → Andante → Moderato → Allegro → Presto'],
      ['Dynamics', 'القوة: ppp → pp → p → mp → mf → f → ff → fff'],
      ['Articulation', 'طريقة النطق: legato، staccato، accent، tenuto'],
      ['Expression', 'كـ dolce (ناعم) أو espressivo (معبّر) أو agitato (مضطرب)']
    ],
    refs: 'terms'
  }
];

/* ─── Reference tables ───────────────────────────────────── */
const references = {
  notes: [
    ['Treble lines (↑)', 'E  G  B  D  F  — Every Good Boy Does Fine'],
    ['Treble spaces (↑)', 'F  A  C  E  — FACE'],
    ['Bass lines (↑)', 'G  B  D  F  A  — Good Boys Do Fine Always'],
    ['Bass spaces (↑)', 'A  C  E  G  — All Cows Eat Grass']
  ],
  rhythm: [
    ['Whole note', '4 beats   𝅝'],
    ['Half note', '2 beats   𝅗𝅥'],
    ['Quarter note', '1 beat   ♩'],
    ['Eighth note', '½ beat   ♪'],
    ['Dotted half', '3 beats'],
    ['Dotted quarter', '1½ beats']
  ],
  accidentals: [
    ['♯ Sharp', 'Raises pitch by 1 half step'],
    ['♭ Flat', 'Lowers pitch by 1 half step'],
    ['♮ Natural', 'Cancels sharp or flat'],
    ['× Double sharp', 'Raises pitch by 1 whole step'],
    ['𝄫 Double flat', 'Lowers pitch by 1 whole step'],
    ['Enharmonic', 'C♯ = D♭  |  F♯ = G♭  |  B = C♭']
  ],
  scales: [
    ['Major', 'W W H W W H → W'],
    ['Natural minor', 'W H W W H W W'],
    ['Harmonic minor', 'W H W W H A H'],
    ['Melodic minor ↑', 'W H W W W W H'],
    ['Chromatic', 'H H H H H H H H H H H H'],
    ['Whole tone', 'W W W W W W']
  ],
  intervals: [
    ['m2', '1 half step'],
    ['M2', '2 half steps'],
    ['m3', '3 half steps'],
    ['M3', '4 half steps'],
    ['P4', '5 half steps'],
    ['TT', '6 half steps (tritone)'],
    ['P5', '7 half steps'],
    ['m6', '8 half steps'],
    ['M6', '9 half steps'],
    ['m7', '10 half steps'],
    ['M7', '11 half steps'],
    ['P8', '12 half steps']
  ],
  terms: [
    ['Largo', 'Very slow, broad (~40–60 bpm)'],
    ['Adagio', 'Slow, at ease (~66–76 bpm)'],
    ['Andante', 'Walking pace (~76–108 bpm)'],
    ['Moderato', 'Moderate (~108–120 bpm)'],
    ['Allegro', 'Fast, lively (~120–168 bpm)'],
    ['Presto', 'Very fast (~168–200 bpm)'],
    ['Forte (f)', 'Loud'],
    ['Piano (p)', 'Soft'],
    ['Crescendo', 'Gradually louder'],
    ['Diminuendo', 'Gradually softer'],
    ['Legato', 'Smoothly connected'],
    ['Staccato', 'Short, detached']
  ]
};

/* ─── Question banks ─────────────────────────────────────── */

// Treble clef notes: step = diatonic steps above E4 (bottom staff line)
// 0=E4, 1=F4, 2=G4, 3=A4, 4=B4, 5=C5, 6=D5, 7=E5, 8=F5
// Below staff: -2=C4 (middle C, one ledger line below)
const trebleNotes = [
  { name:'C4', step:-2, hint:'Middle C — خط إضافي أسفل المدرج' },
  { name:'D4', step:-1, hint:'أسفل الخط الأول مباشرة في مفتاح صول' },
  { name:'E4', step:0,  hint:'الخط الأول (السفلي) في مفتاح صول' },
  { name:'F4', step:1,  hint:'الفراغ الأول' },
  { name:'G4', step:2,  hint:'الخط الثاني — نقطة التفاف مفتاح صول' },
  { name:'A4', step:3,  hint:'الفراغ الثاني' },
  { name:'B4', step:4,  hint:'الخط الثالث' },
  { name:'C5', step:5,  hint:'الفراغ الثالث' },
  { name:'D5', step:6,  hint:'الخط الرابع' },
  { name:'E5', step:7,  hint:'الفراغ الرابع (الأعلى)' },
  { name:'F5', step:8,  hint:'الخط الخامس (العلوي)' }
];

// Bass clef notes: step relative to G2 (bottom staff line in bass)
// 0=G2, 1=A2, 2=B2, 3=C3, 4=D3, 5=E3, 6=F3, 7=G3, 8=A3
const bassNotes = [
  { name:'G2', step:0,  hint:'الخط الأول (السفلي) في مفتاح فا', clef:'bass' },
  { name:'A2', step:1,  hint:'الفراغ الأول في مفتاح فا', clef:'bass' },
  { name:'B2', step:2,  hint:'الخط الثاني في مفتاح فا', clef:'bass' },
  { name:'C3', step:3,  hint:'الفراغ الثاني في مفتاح فا', clef:'bass' },
  { name:'D3', step:4,  hint:'الخط الثالث في مفتاح فا', clef:'bass' },
  { name:'E3', step:5,  hint:'الفراغ الثالث في مفتاح فا', clef:'bass' },
  { name:'F3', step:6,  hint:'الخط الرابع في مفتاح فا', clef:'bass' },
  { name:'G3', step:7,  hint:'الفراغ الرابع في مفتاح فا', clef:'bass' },
  { name:'A3', step:8,  hint:'الخط الخامس (العلوي) في مفتاح فا', clef:'bass' }
];

const rhythmBank = [
  { symbol:'whole',   answer:'4 نبضات',   prompt:'كم تساوي النوتة الكاملة (Whole note)؟',     distractors:['2 نبضة','1 نبضة','نصف نبضة','3 نبضات'] },
  { symbol:'half',    answer:'2 نبضة',    prompt:'كم تساوي النوتة البيضاء (Half note)؟',     distractors:['4 نبضات','1 نبضة','نصف نبضة','3 نبضات'] },
  { symbol:'quarter', answer:'1 نبضة',   prompt:'كم تساوي النوتة السوداء (Quarter note)؟', distractors:['4 نبضات','2 نبضة','نصف نبضة','3 نبضات'] },
  { symbol:'eighth',  answer:'نصف نبضة', prompt:'كم تساوي الكروش (Eighth note)؟',          distractors:['4 نبضات','2 نبضة','1 نبضة','3 نبضات'] }
];

const accidentalsBank = [
  { symbol:'♯', caption:'Sharp',   answer:'يرفع نصف درجة',    prompt:'ما وظيفة علامة Sharp ♯؟',    distractors:['يخفض نصف درجة','يلغي العلامة','يضيف نبضة','يرفع درجة كاملة'] },
  { symbol:'♭', caption:'Flat',    answer:'يخفض نصف درجة',    prompt:'ما وظيفة علامة Flat ♭؟',     distractors:['يرفع نصف درجة','يلغي العلامة','يضيف نبضة','يرفع درجة كاملة'] },
  { symbol:'♮', caption:'Natural', answer:'يلغي العلامة السابقة', prompt:'ما وظيفة علامة Natural ♮؟', distractors:['يرفع نصف درجة','يخفض نصف درجة','يضيف نبضة','يرفع درجة كاملة'] }
];

const scalesBank = [
  { pattern:'W  W  H  W  W  W  H', answer:'Major scale',       prompt:'أي سلم يستخدم هذا النمط؟', distractors:['Natural minor','Harmonic minor','Chromatic scale'] },
  { pattern:'W  H  W  W  H  W  W', answer:'Natural minor',     prompt:'أي سلم يستخدم هذا النمط؟', distractors:['Major scale','Harmonic minor','Melodic minor'] },
  { pattern:'W  H  W  W  H  A  H', answer:'Harmonic minor',    prompt:'أي سلم يحتوي على ثانية زائدة (Augmented 2nd)؟', distractors:['Major scale','Natural minor','Melodic minor'] },
  { pattern:'أنصاف خطوات متتالية × 12', answer:'Chromatic scale', prompt:'ما اسم السلم الذي يتحرك بأنصاف خطوات متتالية؟', distractors:['Major scale','Natural minor','Whole tone scale'] }
];

// Intervals: defined by half-steps count and displayed note pair
const intervalsBank = [
  { lower:'C', upper:'D',  halfSteps:2,  answer:'Major 2nd  (M2)', prompt:'ما المسافة من C إلى D؟',  distractors:['Minor 2nd','Major 3rd','Perfect 4th'] },
  { lower:'C', upper:'Eb', halfSteps:3,  answer:'Minor 3rd  (m3)', prompt:'ما المسافة من C إلى E♭؟', distractors:['Major 3rd','Major 2nd','Perfect 4th'] },
  { lower:'C', upper:'E',  halfSteps:4,  answer:'Major 3rd  (M3)', prompt:'ما المسافة من C إلى E؟',  distractors:['Minor 3rd','Perfect 4th','Major 2nd'] },
  { lower:'C', upper:'F',  halfSteps:5,  answer:'Perfect 4th (P4)', prompt:'ما المسافة من C إلى F؟',  distractors:['Major 3rd','Tritone','Perfect 5th'] },
  { lower:'C', upper:'F#', halfSteps:6,  answer:'Tritone  (A4/d5)', prompt:'ما المسافة من C إلى F♯؟', distractors:['Perfect 4th','Perfect 5th','Minor 6th'] },
  { lower:'C', upper:'G',  halfSteps:7,  answer:'Perfect 5th (P5)', prompt:'ما المسافة من C إلى G؟',  distractors:['Minor 6th','Tritone','Major 6th'] },
  { lower:'C', upper:'A',  halfSteps:9,  answer:'Major 6th  (M6)', prompt:'ما المسافة من C إلى A؟',  distractors:['Minor 6th','Perfect 5th','Minor 7th'] },
  { lower:'C', upper:'Bb', halfSteps:10, answer:'Minor 7th  (m7)', prompt:'ما المسافة من C إلى B♭؟', distractors:['Major 7th','Major 6th','Perfect 8th'] }
];

const termsBank = [
  { term:'Allegro',    answer:'سريع وحيوي',        prompt:'ما معنى Allegro؟',    distractors:['بطيء جداً','سرعة مشي','عزف خافت','متوسط السرعة'] },
  { term:'Piano',      answer:'عزف خافت',           prompt:'ما معنى Piano (p)؟',  distractors:['سريع وحيوي','قوي جداً','بطيء','تدرج في القوة'] },
  { term:'Forte',      answer:'عزف قوي',            prompt:'ما معنى Forte (f)؟',  distractors:['خافت جداً','بطيء','سريع وحيوي','عزف خافت'] },
  { term:'Crescendo',  answer:'يزداد تدريجياً',     prompt:'ما معنى Crescendo؟',  distractors:['يخفت تدريجياً','بطيء جداً','سريع','عزف خافت'] },
  { term:'Andante',    answer:'سرعة مشي هادئة',     prompt:'ما معنى Andante؟',    distractors:['سريع جداً','بطيء جداً','قوي','خافت'] },
  { term:'Legato',     answer:'متصل وسلس',          prompt:'ما معنى Legato؟',     distractors:['منفصل ومقتطع','سريع','بطيء','قوي'] },
  { term:'Staccato',   answer:'مقتطع ومنفصل',       prompt:'ما معنى Staccato؟',   distractors:['متصل وسلس','بطيء','سريع','خافت'] },
  { term:'Ritardando', answer:'تباطؤ تدريجي',        prompt:'ما معنى Ritardando؟', distractors:['تسارع تدريجي','عزف قوي','عزف خافت','سرعة ثابتة'] }
];

/* ─── State ──────────────────────────────────────────────── */
const state = {
  moduleId: 'notes',
  activeTab: 'notes',
  score: JSON.parse(localStorage.getItem('notationScore_v2') || '{"correct":0,"attempts":0}')
};

/* ─── DOM refs ───────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const moduleList       = $('moduleList');
const moduleTitle      = $('moduleTitle');
const stageLabel       = $('stageLabel');
const difficultyLabel  = $('difficultyLabel');
const conceptTag       = $('conceptTag');
const conceptTitle     = $('conceptTitle');
const conceptText      = $('conceptText');
const quickFacts       = $('quickFacts');
const canvas           = $('notationCanvas');
const questionText     = $('questionText');
const questionType     = $('questionType');
const answersEl        = $('answers');
const feedback         = $('feedback');
const scoreText        = $('scoreText');
const masteryText      = $('masteryText');
const masteryBar       = $('masteryBar');
const progressCopy     = $('progressCopy');
const tabs             = $('tabs');
const referenceContent = $('referenceContent');

/* ─── Utilities ──────────────────────────────────────────── */
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function saveScore() {
  localStorage.setItem('notationScore_v2', JSON.stringify(state.score));
}

function updateScore() {
  const { correct, attempts } = state.score;
  scoreText.textContent = `${correct} صحيحة / ${attempts} محاولة`;
  const pct = attempts ? Math.round((correct / attempts) * 100) : 0;
  masteryText.textContent = `${pct}%`;
  masteryBar.style.width = `${pct}%`;
  progressCopy.textContent =
    pct >= 80 ? 'ممتاز — الطالب جاهز لأسئلة أسرع وأقل تلميحاً.' :
    pct >= 50 ? 'تقدم جيد — كرر الأسئلة الخاطئة مع شرح بصري.' :
                'ابدأ ببطء، واطلب من الطالب أن يشرح سبب اختياره.';
}

/* ─── Render modules ─────────────────────────────────────── */
function renderModules() {
  moduleList.innerHTML = '';
  modules.forEach(m => {
    const btn = document.createElement('button');
    btn.className = 'module-button' + (m.id === state.moduleId ? ' active' : '');
    btn.textContent = m.title;
    btn.addEventListener('click', () => { state.moduleId = m.id; state.activeTab = m.refs; renderApp(); });
    moduleList.appendChild(btn);
  });
}

function renderConcept(m) {
  moduleTitle.textContent = m.title;
  stageLabel.textContent  = m.label;
  difficultyLabel.textContent = m.difficulty;
  conceptTag.textContent  = m.tag;
  conceptTitle.textContent = m.concept;
  conceptText.textContent = m.text;
  quickFacts.innerHTML = m.facts
    .map(([l, b]) => `<div class="fact"><strong>${l}</strong><span>${b}</span></div>`)
    .join('');
}

function renderTabs() {
  tabs.innerHTML = '';
  modules.forEach(m => {
    const btn = document.createElement('button');
    btn.className = 'tab-button' + (m.refs === state.activeTab ? ' active' : '');
    btn.textContent = m.title;
    btn.addEventListener('click', () => { state.activeTab = m.refs; renderReference(); });
    tabs.appendChild(btn);
  });
  renderReference();
}

function renderReference() {
  referenceContent.innerHTML = references[state.activeTab]
    .map(([l, b]) => `<div class="reference-row"><strong>${l}</strong><span>${b}</span></div>`)
    .join('');
  [...tabs.children].forEach((btn, i) => btn.classList.toggle('active', modules[i].refs === state.activeTab));
}

/* ─── Answer buttons ─────────────────────────────────────── */
function setAnswers(correct, distractors, explanation) {
  answersEl.innerHTML = '';
  // Pick 3 distractors from the list (shuffle and slice)
  const choices = shuffle([correct, ...shuffle(distractors).slice(0, 3)]);
  choices.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'answer-button';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      const ok = opt === correct;
      state.score.attempts++;
      if (ok) state.score.correct++;
      saveScore(); updateScore();
      [...answersEl.children].forEach(b => {
        b.disabled = true;
        if (b.textContent === correct) b.classList.add('correct');
      });
      if (!ok) btn.classList.add('wrong');
      feedback.className = `feedback ${ok ? 'good' : 'retry'}`;
      feedback.textContent = ok
        ? `✓ صحيح. ${explanation}`
        : `✗ الإجابة الصحيحة: ${correct}. ${explanation}`;
    });
    answersEl.appendChild(btn);
  });
}

/* ─── Drawing functions ──────────────────────────────────── */

// Draw a note on the treble staff at a given diatonic step
// step 0 = bottom line (E4), step 8 = top line (F5)
function drawNoteOnTrebleStaff(note, cx = 330) {
  const y = pitchToY(note.step);
  const svgH = 270;
  return `<svg id="notationCanvas" viewBox="0 0 640 ${svgH}" role="img" aria-label="نغمة على مفتاح صول">
    ${staffSVG()}
    ${trebleClef()}
    ${ledgerLines(cx, y)}
    ${noteHeadFilled(cx, y)}
    <text class="soft-label" x="70" y="${svgH - 12}" direction="ltr">Treble clef</text>
  </svg>`;
}

function drawNoteOnBassStaff(note, cx = 330) {
  const y = pitchToY(note.step);
  const svgH = 270;
  return `<svg id="notationCanvas" viewBox="0 0 640 ${svgH}" role="img" aria-label="نغمة على مفتاح فا">
    ${staffSVG()}
    ${bassClef()}
    ${ledgerLines(cx, y)}
    ${noteHeadFilled(cx, y)}
    <text class="soft-label" x="70" y="${svgH - 12}" direction="ltr">Bass clef</text>
  </svg>`;
}

function drawRhythm(symbol) {
  const cx = 320, cy = pitchToY(4); // B4 = middle of staff
  const shapes = {
    whole:   noteWhole(cx, cy),
    half:    noteHeadOpen(cx, cy),
    quarter: noteHeadFilled(cx, cy),
    eighth:  noteHeadFilled(cx, cy) +
      `<path d="M${cx+15} ${cy-62} C${cx+58} ${cy-52} ${cx+52} ${cy-24} ${cx+18} ${cy-22}"
             fill="none" stroke="#151a21" stroke-width="4" stroke-linecap="round"/>`
  };
  const labels = { whole:'Whole note', half:'Half note', quarter:'Quarter note', eighth:'Eighth note' };
  return `<svg id="notationCanvas" viewBox="0 0 640 270" role="img" aria-label="قيمة زمنية">
    ${staffSVG()}
    ${trebleClef()}
    ${shapes[symbol]}
    <text class="soft-label" x="70" y="258" direction="ltr">${labels[symbol]}</text>
  </svg>`;
}

function drawAccidental(symbol, caption) {
  // Draw a note with the accidental to the left of it
  const cx = 350, cy = pitchToY(4);
  return `<svg id="notationCanvas" viewBox="0 0 640 270" role="img" aria-label="علامة عارضة">
    ${staffSVG()}
    ${trebleClef()}
    <text x="${cx - 52}" y="${cy + 16}" font-size="68" class="accidental">${symbol}</text>
    ${noteHeadFilled(cx, cy)}
    <text class="soft-label" x="70" y="258" direction="ltr">${caption}</text>
  </svg>`;
}

function drawScalePattern(pattern) {
  // C major scale: C4 D4 E4 F4 G4 A4 B4 C5 (steps relative to E4 bottom line)
  const steps = [-2, -1, 0, 1, 2, 3, 4, 5]; // C4 D4 E4 F4 G4 A4 B4 C5
  const xs = [140, 192, 244, 296, 348, 400, 452, 504];
  const notes = steps.map((s, i) => {
    const y = pitchToY(s);
    return ledgerLines(xs[i], y) + noteHeadFilled(xs[i], y);
  });
  const barY1 = STAFF.top, barY2 = STAFF.top + 4 * STAFF.gap;
  return `<svg id="notationCanvas" viewBox="0 0 640 285" role="img" aria-label="نمط السلم">
    ${staffSVG(60, 530)}
    ${trebleClef()}
    ${notes.join('')}
    <line class="bar-line" x1="520" y1="${barY1}" x2="520" y2="${barY2}"/>
    <text x="70" y="265" font-size="15" font-weight="700" fill="#126b61" direction="ltr">${pattern}</text>
  </svg>`;
}

// Draw two notes showing an interval
function drawInterval(item) {
  const cx1 = 260, cx2 = 380;
  // Lower note: C5 = step 5 in treble
  const y1 = pitchToY(5);
  // Upper note: derive by half steps (approximate diatonic position)
  const halfStepToDiatonicOffset = { 2:1, 3:2, 4:2, 5:3, 6:3, 7:4, 9:5, 10:6, 11:6 };
  const dOffset = halfStepToDiatonicOffset[item.halfSteps] ?? 2;
  const y2 = pitchToY(5 + dOffset);

  const accMap = { 'Eb':true, 'F#':true, 'Bb':true };
  const upperAcc = accMap[item.upper]
    ? (item.upper.includes('b') ? '♭' : '♯')
    : '';

  return `<svg id="notationCanvas" viewBox="0 0 640 270" role="img" aria-label="مسافة موسيقية">
    ${staffSVG()}
    ${trebleClef()}
    ${ledgerLines(cx1, y1)}
    ${ledgerLines(cx2, y2)}
    ${noteHeadFilled(cx1, y1)}
    ${noteHeadFilled(cx2, y2)}
    ${upperAcc ? `<text x="${cx2 - 50}" y="${y2 + 14}" font-size="44" class="accidental" direction="ltr">${upperAcc}</text>` : ''}
    <line stroke="#126b61" stroke-width="1.5" stroke-dasharray="5,4"
          x1="${cx1 + 18}" y1="${y1 - 55}" x2="${cx2 - 6}" y2="${y2 - 55}"/>
    <text x="${(cx1 + cx2) / 2}" y="${Math.min(y1, y2) - 68}" text-anchor="middle"
          font-size="15" font-weight="700" fill="#126b61" direction="ltr">${item.halfSteps} half steps</text>
    <text class="soft-label" x="70" y="258" direction="ltr">${item.lower}  →  ${item.upper}</text>
  </svg>`;
}

function drawTerm(term) {
  return `<svg id="notationCanvas" viewBox="0 0 640 270" role="img" aria-label="مصطلح موسيقي">
    ${staffSVG()}
    ${trebleClef()}
    <text x="320" y="148" text-anchor="middle" font-size="52" font-weight="800"
          font-family="serif" fill="#18202a" direction="ltr">${term}</text>
    <text class="soft-label" x="70" y="258" direction="ltr">Performance term</text>
  </svg>`;
}

/* ─── Replace canvas SVG ─────────────────────────────────── */
function setCanvas(svgHTML) {
  document.getElementById('notationCanvas').outerHTML = svgHTML;
}

/* ─── New question ───────────────────────────────────────── */
function newQuestion() {
  const m = modules.find(x => x.id === state.moduleId);
  feedback.className = 'feedback';
  feedback.textContent = 'اختر الإجابة، ثم اقرأ سبب التصحيح بصوت واضح للطالب.';
  questionType.textContent = m.title;

  if (state.moduleId === 'notes') {
    // 50% chance treble, 50% bass
    const pool = Math.random() > 0.5 ? trebleNotes : bassNotes;
    const note = pick(pool);
    questionText.textContent = 'ما اسم النغمة المعروضة؟';
    const isBass = note.clef === 'bass';
    setCanvas(isBass ? drawNoteOnBassStaff(note) : drawNoteOnTrebleStaff(note));
    const allNames = ['C','D','E','F','G','A','B'];
    const distractors = allNames.filter(n => n !== note.name[0]);
    setAnswers(note.name[0], distractors, note.hint);
  }

  else if (state.moduleId === 'rhythm') {
    const item = pick(rhythmBank);
    questionText.textContent = item.prompt;
    setCanvas(drawRhythm(item.symbol));
    setAnswers(item.answer, item.distractors, 'اربط شكل النوتة بعدد النبضات قبل الأداء.');
  }

  else if (state.moduleId === 'accidentals') {
    const item = pick(accidentalsBank);
    questionText.textContent = item.prompt;
    setCanvas(drawAccidental(item.symbol, item.caption));
    setAnswers(item.answer, item.distractors, 'العلامات العارضة تؤثر في درجة الصوت لا في مدته الزمنية.');
  }

  else if (state.moduleId === 'scales') {
    const item = pick(scalesBank);
    questionText.textContent = item.prompt;
    setCanvas(drawScalePattern(item.pattern));
    setAnswers(item.answer, item.distractors, 'احفظ نمط الخطوات كخريطة — هذا يوفر الوقت كثيراً في التدريس.');
  }

  else if (state.moduleId === 'intervals') {
    const item = pick(intervalsBank);
    questionText.textContent = item.prompt;
    setCanvas(drawInterval(item));
    setAnswers(item.answer, item.distractors, `عدد أنصاف الخطوات: ${item.halfSteps}. احسب الدرجات أولاً ثم الـ quality.`);
  }

  else if (state.moduleId === 'terms') {
    const item = pick(termsBank);
    questionText.textContent = item.prompt;
    setCanvas(drawTerm(item.term));
    setAnswers(item.answer, item.distractors, 'مصطلحات الأداء تصف الكيف لا الماذا — السرعة، القوة، الطابع.');
  }
}

/* ─── Render app ─────────────────────────────────────────── */
function renderApp() {
  const m = modules.find(x => x.id === state.moduleId);
  renderModules();
  renderConcept(m);
  renderTabs();
  newQuestion();
  updateScore();
}

/* ─── Event listeners ────────────────────────────────────── */
$('newQuestion').addEventListener('click', newQuestion);
$('resetProgress').addEventListener('click', () => {
  state.score = { correct:0, attempts:0 };
  saveScore(); updateScore();
  feedback.className = 'feedback';
  feedback.textContent = 'تم مسح التقدم. يمكنك بدء تدريب جديد.';
});

renderApp();
