# CareQueue — Hospital Triage Website

A front-end academic demo inspired by the abstract "Real-Time Hospital Patient Triage & Appointment Queue Using Java Data Structures."

## Files
- `index.html` — page structure
- `style.css` — responsive dashboard design
- `script.js` — patient queue and doctor assignment logic

## Run it
1. Keep all three files in the same folder.
2. Open `index.html` in a modern browser, or upload the files to an online HTML/CSS/JS editor such as CodePen or Replit.
3. Register sample patients and test the queues.

## Features
- Register emergency and routine patients
- Prevent duplicate patient IDs in the current page session
- Emergency patients sorted by severity (1 is most urgent), then arrival order
- Routine patients processed FIFO
- Update emergency severity
- Assign the next patient to an available doctor
- Mark consultations complete and release doctors
- Responsive layout for mobile and desktop

## Important
This is a browser-only demo. It uses JavaScript arrays and a `Map` for in-memory state; it does not execute Java's `PriorityQueue`, `LinkedList`, or `HashSet` classes. It does not have a backend, secure database, login, or persistent medical records. Do not use it for real clinical decisions.
