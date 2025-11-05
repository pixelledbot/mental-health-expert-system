// Single-question stepper logic adapted for 5 questions per page
const form = document.getElementById("surveyForm");
const card = document.getElementById("card");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const progressEl = document.getElementById("progress");
const stepLabel = document.getElementById("stepLabel");
const finalSubmit = document.getElementById("finalSubmit");

const QUESTIONS_PER_PAGE = 5;

// Friendly question sets
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
  { id: "sleep3", text: "Do you feel rested when you wake up?" },
  { id: "sleep4", text: "Has your sleep quality changed compared to before?" },

  // Daily Lifestyle & Burnout (5)
  { id: "life1", text: "Have you been too busy to take short breaks during the day?" },
  { id: "life2", text: "Do you often skip meals or forget to eat due to tasks?" },
  { id: "life3", text: "Have you been less active or moving less than usual?" },
  { id: "life4", text: "Do you feel drained even after a short rest?" },
  { id: "life5", text: "Do you feel disconnected from people around you?" }
];

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
  const start = step * QUESTIONS_PER_PAGE;
  const end = Math.min(start + QUESTIONS_PER_PAGE, total);
  const pageQuestions = questions.slice(start, end);

  card.innerHTML = pageQuestions.map((q, i) => `
    <div class="card animate">
      <div class="question-title">${q.text}</div>
      <div class="options" data-idx="${start + i}">
        ${options.map(o => `
          <div class="option" data-val="${o.value}">
            <span>${o.label}</span>
          </div>`).join("")}
      </div>
    </div>
  `).join("");

  [...card.querySelectorAll(".options")].forEach(optGroup => {
    const idxOffset = parseInt(optGroup.dataset.idx);
    [...optGroup.querySelectorAll(".option")].forEach(opt => {
      opt.addEventListener("click", () => {
        optGroup.querySelectorAll(".option").forEach(x => x.classList.remove("selected"));
        opt.classList.add("selected");
        answers[idxOffset] = parseInt(opt.dataset.val, 10);
        updateNav();
      });
    });
  });

  const pct = Math.round((end / total) * 100);
  progressEl.style.width = `${pct}%`;
  stepLabel.textContent = `Questions ${start + 1}–${end} of ${total}`;

  backBtn.style.visibility = step === 0 ? "hidden" : "visible";
  nextBtn.textContent = end >= total ? "Finish" : "Next →";

  updateNav();
}

function updateNav() {
  const start = step * QUESTIONS_PER_PAGE;
  const end = Math.min(start + QUESTIONS_PER_PAGE, total);
  const allAnswered = answers.slice(start, end).every(a => a !== null);
  nextBtn.disabled = !allAnswered;
  nextBtn.classList.toggle("ghost", !allAnswered);
}

nextBtn.addEventListener("click", () => {
  const start = step * QUESTIONS_PER_PAGE;
  const end = Math.min(start + QUESTIONS_PER_PAGE, total);
  if (!answers.slice(start, end).every(a => a !== null)) return;
  
  if (end < total) {
    step++;
    renderCard();
  } else {
    buildAndSubmit();
  }
});

backBtn.addEventListener("click", () => {
  if (step > 0) {
    step--;
    renderCard();
  }
});

function buildAndSubmit() {
  const mapping = [
    { prefix: "mood", count: 9 },
    { prefix: "worry", count: 7 },
    { prefix: "stress", count: 6 },
    { prefix: "sleep", count: 4 },
    { prefix: "life", count: 5 }
  ];

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

  form.submit();
}

// initial render
renderCard();
