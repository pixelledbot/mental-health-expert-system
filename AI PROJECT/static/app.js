// Single-question stepper logic (friendly language, calm UI)
// This file renders questions, captures choices, updates progress, and posts result.

const form = document.getElementById("surveyForm");
const card = document.getElementById("card");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const progressEl = document.getElementById("progress");
const stepLabel = document.getElementById("stepLabel");
const finalSubmit = document.getElementById("finalSubmit");

// Friendly question sets (simple plain language)
const questions = [
  // Mood & Interest (9)
  { id: "mood1", text: "Lately, have you lost interest in doing things you usually enjoy?" },
  { id: "mood2", text: "Have you been feeling down or sad more often?" },
  { id: "mood3", text: "Do you feel tired or low on energy?" },
  { id: "mood4", text: "Have you noticed changes in appetite or weight?" },
  { id: "mood5", text: "Do you find it hard to feel pleasure in small things?" },
  { id: "mood6", text: "Have you been feeling bad about yourself or like you're failing?" },
  { id: "mood7", text: "Do you find it hard to concentrate on tasks?" },
  { id: "mood8", text: "Have others noticed you moving or speaking more slowly (or more fidgety)?" },
  { id: "mood9", text: "Have you had thoughts that you'd be better off not alive?" },

  // Worry & Restlessness (7)
  { id: "worry1", text: "Have you felt nervous or on edge lately?" },
  { id: "worry2", text: "Do you find it hard to control your worrying?" },
  { id: "worry3", text: "Do you worry too much about different things?" },
  { id: "worry4", text: "Have you had trouble relaxing?" },
  { id: "worry5", text: "Do you feel restless or unable to sit still?" },
  { id: "worry6", text: "Have you been more easily annoyed or irritable?" },
  { id: "worry7", text: "Do you feel fearful that something awful might happen?" },

  // Stress Levels (6)
  { id: "stress1", text: "Have you felt overwhelmed by small daily tasks?" },
  { id: "stress2", text: "Have you had trouble coping with unexpected problems?" },
  { id: "stress3", text: "Do you feel things have been piling up and it's hard to keep up?" },
  { id: "stress4", text: "Have you felt tense or wound up frequently?" },
  { id: "stress5", text: "Do you find it hard to find time to rest?" },
  { id: "stress6", text: "Have you noticed feeling more short-tempered under pressure?" },

  // Sleep Quality (4)
  { id: "sleep1", text: "Have you had trouble falling asleep?" },
  { id: "sleep2", text: "Do you wake up during the night and find it hard to fall back asleep?" },
  { id: "sleep3", text: "Do you feel rested when you wake up?" }, // reversed in mind: we'll interpret lower = worse
  { id: "sleep4", text: "Has your sleep quality changed compared to before?" },

  // Daily Lifestyle & Burnout (5)
  { id: "life1", text: "Have you been too busy to take short breaks during the day?" },
  { id: "life2", text: "Do you often skip meals or forget to eat due to tasks?" },
  { id: "life3", text: "Have you been less active or moving less than usual?" },
  { id: "life4", text: "Do you feel drained even after a short rest?" },
  { id: "life5", text: "Do you feel disconnected from people around you?" }
];

// Options used for all questions (friendly)
const options = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" }
];

let step = 0;
const total = questions.length;
const answers = new Array(total).fill(null);

function renderCard() {
  const q = questions[step];
  card.innerHTML = `
    <div class="card animate">
      <div class="question-title">${q.text}</div>
      <div class="options" id="options">${options.map(o => `
        <div class="option" data-val="${o.value}">
          <span>${o.label}</span>
        </div>`).join("")}</div>
    </div>
  `;

  // mark selected if previously answered
  const opts = [...card.querySelectorAll(".option")];
  opts.forEach(opt => {
    opt.addEventListener("click", () => {
      // visually select
      opts.forEach(x => x.classList.remove("selected"));
      opt.classList.add("selected");
      // save answer
      answers[step] = parseInt(opt.dataset.val, 10);
      updateNav();
    });
  });

  // if already answered, mark it
  if (answers[step] !== null) {
    const sel = opts.find(o => parseInt(o.dataset.val,10) === answers[step]);
    if (sel) sel.classList.add("selected");
  }

  // update progress
  const pct = Math.round(((step) / total) * 100);
  progressEl.style.width = `${pct}%`;
  stepLabel.textContent = `Question ${step + 1} of ${total}`;
  // show/hide nav buttons
  backBtn.style.visibility = step === 0 ? "hidden" : "visible";
  nextBtn.textContent = step === total - 1 ? "Finish" : "Next →";
}

function updateNav() {
  // enable next only if current answered
  if (answers[step] !== null) {
    nextBtn.disabled = false;
    nextBtn.classList.remove("ghost");
  } else {
    nextBtn.disabled = true;
    nextBtn.classList.add("ghost");
  }
}

nextBtn.addEventListener("click", () => {
  if (answers[step] === null) return; // safety
  if (step < total - 1) {
    step++;
    renderCard();
    updateNav();
  } else {
    // final - build hidden inputs and submit
    buildAndSubmit();
  }
});

backBtn.addEventListener("click", () => {
  if (step > 0) {
    step--;
    renderCard();
    updateNav();
  }
});

function buildAndSubmit() {
  // Build hidden inputs in the form using expected prefixes/counts:
  // mood1..mood9, worry1..worry7, stress1..stress6, sleep1..sleep4, life1..life5
  const mapping = [
    { prefix: "mood", count: 9 },
    { prefix: "worry", count: 7 },
    { prefix: "stress", count: 6 },
    { prefix: "sleep", count: 4 },
    { prefix: "life", count: 5 }
  ];

  // clear any existing hidden inputs
  [...form.querySelectorAll("input[type=hidden]")].forEach(n => n.remove());

  let idx = 0;
  mapping.forEach(group => {
    for (let i = 1; i <= group.count; i++) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = `${group.prefix}${i}`;
      input.value = answers[idx] !== null ? answers[idx] : 0;
      form.appendChild(input);
      idx++;
    }
  });

  // submit the form
  form.submit();
}

// initial render
renderCard();
updateNav();
