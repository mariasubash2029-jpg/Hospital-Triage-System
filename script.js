const $ = (id) => document.getElementById(id);

const state = {
  patients: new Map(),
  emergency: [],
  routine: [],
  doctors: [
    { name: "Dr. Arun", patientId: null },
    { name: "Dr. Priya", patientId: null },
    { name: "Dr. Rahul", patientId: null }
  ],
  arrivalCounter: 0
};

const severityLabels = {
  1: "Most urgent", 2: "Very urgent", 3: "Urgent",
  4: "Less urgent", 5: "Least urgent"
};

$("patientType").addEventListener("change", () => {
  $("severityRow").hidden = $("patientType").value !== "emergency";
});
$("patientForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = Number($("patientId").value);
  const name = $("patientName").value.trim();
  const age = Number($("patientAge").value);
  const type = $("patientType").value;
  const severity = Number($("severity").value);

  if (!Number.isInteger(id) || id < 1) return showMessage("Patient ID must be a positive whole number.", true);
  if (state.patients.has(id)) return showMessage("That patient ID is already registered.", true);
  if (!name) return showMessage("Please enter the patient's name.", true);
  if (!Number.isInteger(age) || age < 0 || age > 130) return showMessage("Enter a valid age from 0 to 130.", true);

  const patient = {
    id, name, age, type, severity: type === "emergency" ? severity : null,
    arrivalOrder: state.arrivalCounter++, doctor: null
  };
  state.patients.set(id, patient);
  if (type === "emergency") {
    state.emergency.push(patient);
    sortEmergency();
  } else {
    state.routine.push(patient);
  }
  $("patientForm").reset();
  $("severityRow").hidden = true;
  showMessage(`${name} registered successfully.`, false);
  render();
});

$("assignBtn").addEventListener("click", assignNextPatient);
$("resetBtn").addEventListener("click", () => {
  if (!confirm("Clear all demo patients and reset doctor availability?")) return;
  state.patients.clear();
  state.emergency = [];
  state.routine = [];
  state.doctors.forEach(d => d.patientId = null);
  state.arrivalCounter = 0;
  showMessage("", false);
  render();
});

function showMessage(message, isError) {
  const el = $("formMessage");
  el.textContent = message;
  el.className = `form-message ${message ? (isError ? "error" : "success") : ""}`;
}
function sortEmergency() {
  state.emergency.sort((a, b) => a.severity - b.severity || a.arrivalOrder - b.arrivalOrder);
}
function getAvailableDoctor() {
  return state.doctors.find(doctor => doctor.patientId === null);
}
function assignNextPatient() {
  const doctor = getAvailableDoctor();
  if (!doctor) return alert("All doctors are currently busy.");
  let patient = null;
  if (state.emergency.length) patient = state.emergency.shift();
  else if (state.routine.length) patient = state.routine.shift();
  else return alert("There are no patients waiting.");
  doctor.patientId = patient.id;
  patient.doctor = doctor.name;
  render();
}
function updateSeverity(id) {
  const patient = state.patients.get(id);
  if (!patient || !state.emergency.includes(patient)) return;
  const answer = prompt("Enter new severity score (1 = most urgent, 5 = least urgent):", String(patient.severity));
  if (answer === null) return;
  const score = Number(answer);
  if (!Number.isInteger(score) || score < 1 || score > 5) return alert("Severity must be a whole number from 1 to 5.");
  patient.severity = score;
  sortEmergency();
  render();
}
function removeWaitingPatient(id) {
  const patient = state.patients.get(id);
  if (!patient) return;
  state.emergency = state.emergency.filter(p => p.id !== id);
  state.routine = state.routine.filter(p => p.id !== id);
  state.patients.delete(id);
  render();
}
function completeConsultation(id) {
  const doctor = state.doctors.find(d => d.patientId === id);
  if (!doctor) return;
  doctor.patientId = null;
  const patient = state.patients.get(id);
  if (patient) patient.doctor = null;
  // Remove the completed patient from the active in-memory register.
  state.patients.delete(id);
  render();
}
function patientCard(patient, emergency) {
  const article = document.createElement("article");
  article.className = "patient-card";
  const top = document.createElement("div");
  top.className = "patient-card-top";
  const details = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = patient.name;
  const meta = document.createElement("small");
  meta.textContent = `ID ${patient.id} · Age ${patient.age}`;
  details.append(name, meta);
  top.append(details);
  if (emergency) {
    const tag = document.createElement("span");
    tag.className = `severity-tag sev-${patient.severity}`;
    tag.textContent = `Severity ${patient.severity}`;
    tag.title = severityLabels[patient.severity];
    top.append(tag);
  }
  article.append(top);
  const actions = document.createElement("div");
  actions.className = "card-actions";
  if (emergency) {
    const update = document.createElement("button");
    update.className = "small-btn";
    update.textContent = "Update severity";
    update.addEventListener("click", () => updateSeverity(patient.id));
    actions.append(update);
  }
  const remove = document.createElement("button");
  remove.className = "small-btn danger";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => removeWaitingPatient(patient.id));
  actions.append(remove);
  article.append(actions);
  return article;
}
function renderList(containerId, list, emergency, emptyText) {
  const container = $(containerId);
  container.replaceChildren();
  if (!list.length) {
    container.className = "patient-list empty-state";
    container.textContent = emptyText;
    return;
  }
  container.className = "patient-list";
  list.forEach(p => container.append(patientCard(p, emergency)));
}
function renderDoctors() {
  const list = $("doctorList");
  list.replaceChildren();
  state.doctors.forEach(doctor => {
    const row = document.createElement("div");
    row.className = "doctor-row";
    const avatar = document.createElement("div");
    avatar.className = "doctor-avatar";
    avatar.textContent = doctor.name.replace("Dr. ", "").split(" ").map(x => x[0]).join("");
    const info = document.createElement("div");
    info.className = "doctor-info";
    const name = document.createElement("strong");
    name.textContent = doctor.name;
    const small = document.createElement("small");
    const assignedPatient = doctor.patientId === null ? null : state.patients.get(doctor.patientId);
    small.textContent = assignedPatient ? `With ${assignedPatient.name} · ID ${assignedPatient.id}` : "Ready to receive a patient";
    info.append(name, small);
    const badge = document.createElement("span");
    badge.className = `status ${doctor.patientId === null ? "available" : "busy"}`;
    badge.textContent = doctor.patientId === null ? "AVAILABLE" : "BUSY";
    row.append(avatar, info, badge);
    list.append(row);
  });
}
function renderConsultations() {
  const container = $("consultationList");
  container.replaceChildren();
  const active = state.doctors.filter(d => d.patientId !== null);
  if (!active.length) {
    container.className = "consultation-list empty-state";
    container.textContent = "No active consultations.";
    return;
  }
  container.className = "consultation-list";
  active.forEach(doctor => {
    const patient = state.patients.get(doctor.patientId);
    if (!patient) return;
    const card = document.createElement("div");
    card.className = "consultation-card";
    const info = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = patient.name;
    const meta = document.createElement("small");
    meta.textContent = `${doctor.name} · Patient ID ${patient.id}`;
    info.append(name, meta);
    const button = document.createElement("button");
    button.className = "small-btn";
    button.textContent = "Complete";
    button.addEventListener("click", () => completeConsultation(patient.id));
    card.append(info, button);
    container.append(card);
  });
}
function render() {
  sortEmergency();
  renderList("emergencyQueue", state.emergency, true, "No emergency patients waiting.");
  renderList("routineQueue", state.routine, false, "No routine patients waiting.");
  renderDoctors();
  renderConsultations();
  const waiting = state.emergency.length + state.routine.length;
  const available = state.doctors.filter(d => d.patientId === null).length;
  $("totalWaiting").textContent = waiting;
  $("emergencyCount").textContent = state.emergency.length;
  $("routineCount").textContent = state.routine.length;
  $("availableCount").textContent = available;
  $("busySummary").textContent = `${state.doctors.length - available} currently treating patients`;
  $("emergencyBadge").textContent = state.emergency.length;
  $("routineBadge").textContent = state.routine.length;
  $("assignBtn").disabled = available === 0 || waiting === 0;
}
render();
