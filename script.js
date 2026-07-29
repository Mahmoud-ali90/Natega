const form = document.querySelector("#search-form");
const input = document.querySelector("#seat-number");
const button = document.querySelector("#search-button");
const message = document.querySelector("#message");
const resultBox = document.querySelector("#result");

const ui = {
  pill: document.querySelector("#status-pill"),
  seat: document.querySelector("#seat-label"),
  name: document.querySelector("#student-name"),
  success: document.querySelector("#success-panel"),
  total: document.querySelector("#total-degree"),
  max: document.querySelector("#max-degree"),
  percentage: document.querySelector("#percentage"),
  percentageText: document.querySelector("#percentage-text"),
  caseDescription: document.querySelector("#case-description"),
  bar: document.querySelector("#bar-fill"),
  circle: document.querySelector(".circle")
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const seatNumber = input.value.trim();
  if (!/^\d+$/.test(seatNumber)) {
    showMessage("اكتب رقم جلوس صحيح.");
    return;
  }

  setLoading(true);
  showMessage("");
  resultBox.hidden = true;

  try {
    const student = await getStudent(seatNumber);
    if (!student) {
      showMessage("لم يتم العثور على نتيجة بهذا الرقم.");
      return;
    }

    renderStudent(seatNumber, student);
  } catch {
    showMessage("حصلت مشكلة في تحميل البيانات. حاول مرة أخرى.");
  } finally {
    setLoading(false);
  }
});

async function getStudent(seatNumber) {
  const shard = seatNumber.slice(0, 3);
  const response = await fetch(`data/shards/${shard}.json`, { cache: "force-cache" });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data[seatNumber] || null;
}

function renderStudent(seatNumber, row) {
  const [name, totalDegree, percentage, caseDescription] = row;
  const passed = String(caseDescription).includes("ناجح");
  const safePercentage = Math.max(0, Math.min(100, Number(percentage) || 0));

  ui.pill.textContent = passed ? "ناجح" : caseDescription || "نتيجة";
  ui.pill.classList.toggle("pass", passed);
  ui.seat.textContent = `رقم الجلوس: ${seatNumber}`;
  ui.name.textContent = name;
  ui.success.hidden = !passed;
  ui.total.textContent = formatNumber(totalDegree);
  ui.max.textContent = "320";
  ui.percentage.textContent = `${formatNumber(safePercentage)}%`;
  ui.percentageText.textContent = `${formatNumber(safePercentage)}%`;
  ui.caseDescription.textContent = caseDescription || "غير محدد";
  ui.bar.style.width = `${safePercentage}%`;
  ui.circle.style.background = `conic-gradient(${passed ? "var(--green)" : "var(--gold)"} ${safePercentage * 3.6}deg, #e7e0d5 0deg)`;

  resultBox.hidden = false;
}

function setLoading(isLoading) {
  button.disabled = isLoading;
  button.textContent = isLoading ? "جاري البحث..." : "استعلام";
}

function showMessage(text) {
  message.textContent = text;
}

function formatNumber(value) {
  return new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 2
  }).format(value);
}
