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

  const seatNumber = normalizeDigits(input.value.trim());
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

input.addEventListener("input", () => {
  input.value = toArabicDigits(normalizeDigits(input.value));
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
  const accent = passed ? "var(--green)" : "var(--gold)";

  ui.pill.textContent = passed ? "ناجح" : caseDescription || "نتيجة";
  ui.pill.classList.toggle("pass", passed);
  ui.seat.textContent = `رقم الجلوس: ${formatSeatNumber(seatNumber)}`;
  ui.name.textContent = name;
  ui.success.hidden = !passed;
  ui.total.textContent = formatNumber(totalDegree);
  ui.max.textContent = formatNumber(320);
  ui.percentage.textContent = `${formatNumber(safePercentage)}٪`;
  ui.percentageText.textContent = `${formatNumber(safePercentage)}٪`;
  ui.caseDescription.textContent = caseDescription || "غير محدد";
  ui.bar.style.width = `${safePercentage}%`;
  ui.circle.style.background = `conic-gradient(${accent} ${safePercentage * 3.6}deg, #e7e0d5 0deg)`;

  resultBox.hidden = false;
  resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setLoading(isLoading) {
  button.disabled = isLoading;
  button.textContent = isLoading ? "جاري البحث..." : "استعلام";
}

function showMessage(text) {
  message.textContent = text;
}

function normalizeDigits(value) {
  return value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, "");
}

function toArabicDigits(value) {
  return String(value).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
}

function formatSeatNumber(value) {
  return toArabicDigits(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat("ar-EG-u-nu-arab", {
    maximumFractionDigits: 2
  }).format(value);
}
