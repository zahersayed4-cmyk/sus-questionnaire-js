// Likert options
const likertScaleJsonArray = [
  { id: "sd", label: "Strongly Disagree", value: 1 },
  { id: "d",  label: "Disagree",          value: 2 },
  { id: "n",  label: "Neutral",           value: 3 },
  { id: "a",  label: "Agree",             value: 4 },
  { id: "sa", label: "Strongly Agree",    value: 5 }
];

// SUS items
const susQuestionnaireJsonArray = [
  { id:  1, statement: "I think that I would like to use this system frequently" },
  { id:  2, statement: "I found the system unnecessarily complex" },
  { id:  3, statement: "I thought the system was easy to use" },
  { id:  4, statement: "I think that I would need the support of a technical person to be able to use this system" },
  { id:  5, statement: "I found the various functions in this system were well integrated" },
  { id:  6, statement: "I thought there was too much inconsistency in this system" },
  { id:  7, statement: "I would imagine that most people would learn to use this system very quickly" },
  { id:  8, statement: "I found the system very cumbersome to use" },
  { id:  9, statement: "I felt very confident using the system" },
  { id: 10, statement: "I needed to learn a lot of things before I could get going with this system" }
];

// Shuffle (Fisher–Yates) -> return NEW array (بدون تخريب الأصل)
function getRandomizedSusQuestionnaireJsonArray() {
  const arr = [...susQuestionnaireJsonArray];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

// SUS score: odd items -> value - 1, even items -> 5 - value
// (هذه صيغة مكافئة للتي في الدرس)
function calculateScore(resultJsonArray) {
  let sumOdd = 0;
  let sumEven = 0;

  for (let i = 0; i < resultJsonArray.length; i++) {
    const item = resultJsonArray[i];
    if (item.value == null) return null;
    if (item.id % 2 === 0) sumEven += item.value;
    else sumOdd += item.value;
  }

  const x = sumOdd - 5;
  const y = 25 - sumEven;
  return (x + y) * 2.5;
}

// زر Generate
function generateQuestionnaire() {
  const webpageURL = new URL(document.URL);
  const isRandomized = webpageURL.searchParams.get("random") == "true";

  const susContainerElement = document.getElementById("sus-questionnaire-container");

  if (isRandomized) createSusQuestionnaire(susContainerElement, getRandomizedSusQuestionnaireJsonArray(), false);
  else createSusQuestionnaire(susContainerElement, susQuestionnaireJsonArray, true);

  // امسح نتيجة قديمة
  const result = document.getElementById("sus-result");
  if (result) result.innerHTML = "";
}

// Likert option div
function createLikertOptionDiv(susItemId, likertOptionJson) {
  const divContainer = document.createElement("div");
  divContainer.className = "likert-flex-item";

  const inputElement = document.createElement("input");
  inputElement.type = "radio";

  // مهم: اسم المجموعة لازم يكون ثابت لكل سؤال عشان الراديو يشتغل صح
  // نخليه مثل الدرس: "1-scale", "2-scale", ...
  inputElement.name = susItemId + "-scale";
  inputElement.id = inputElement.name + "-" + likertOptionJson.id;
  inputElement.value = likertOptionJson.value;

  const labelElement = document.createElement("label");
  labelElement.htmlFor = inputElement.id;
  labelElement.appendChild(document.createTextNode(likertOptionJson.label));

  divContainer.appendChild(inputElement);
  divContainer.appendChild(labelElement);

  return divContainer;
}

// Likert scale div (5 خيارات)
function createLikertScaleDiv(susItemId) {
  const divContainer = document.createElement("div");
  divContainer.className = "likert-flexbox-container";

  for (let i = 0; i < likertScaleJsonArray.length; i++) {
    divContainer.appendChild(createLikertOptionDiv(susItemId, likertScaleJsonArray[i]));
  }
  return divContainer;
}

// SUS item div (سطر واحد: رقم + نص + Likert)
function createSusItemDiv(susItemJson, isLabelDisplayed) {
  const divContainer = document.createElement("div");
  divContainer.className = "sus-item";

  const pNumber = document.createElement("p");
  pNumber.className = "sus-number";

  // نخلي الرقم bold مثل كودك القديم
  const strong = document.createElement("strong");
  if (isLabelDisplayed) strong.appendChild(document.createTextNode(String(susItemJson.id)));
  pNumber.appendChild(strong);

  const pText = document.createElement("p");
  pText.className = "sus-text";
  pText.appendChild(document.createTextNode(susItemJson.statement));

  const likert = createLikertScaleDiv(susItemJson.id);

  divContainer.appendChild(pNumber);
  divContainer.appendChild(pText);
  divContainer.appendChild(likert);

  return divContainer;
}

// توليد الاستبيان كامل + تنظيف القديم
function createSusQuestionnaire(parentContainer, questionnaireJsonArray, isLabelDisplayed) {
  // امسح كل شيء داخل container ما عدا أول عنصر (h2)
  while (parentContainer.lastElementChild !== parentContainer.firstElementChild) {
    parentContainer.removeChild(parentContainer.lastChild);
  }

  // لا نستخدم <hr> لأن CSS عندك يسوي خط تحت كل سؤال
  for (let i = 0; i < questionnaireJsonArray.length; i++) {
    parentContainer.appendChild(createSusItemDiv(questionnaireJsonArray[i], isLabelDisplayed));
  }
}


// زر Submit
function submitQuestionnaire() {
  const results = [];

  for (let i = 0; i < susQuestionnaireJsonArray.length; i++) {
    const id = susQuestionnaireJsonArray[i].id;
    results.push({ id: id, value: getSubmittedValueForSusItem(id) });
  }

  const score = calculateScore(results);
  const out = document.getElementById("sus-result");

  if (score == null) out.innerHTML = "Invalid: Not all items were answered.";
  else out.innerHTML = "SUS Score = " + score;
}

// استخراج قيمة الراديو المختار لسؤال معيّن
function getSubmittedValueForSusItem(susItemId) {
  const groupName = susItemId + "-scale";
  const radios = document.getElementsByName(groupName);

  let result = null;
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) result = Number(radios[i].value);
  }
  return result;
}
