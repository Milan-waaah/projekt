let currentUser = null;
let trainers = [
  {
    id: 1,
    name: "Kiss Márk",
    img: "https://hips.hearstapps.com/hmg-prod/images/mh-trainer-2-1533576998.png?resize=640:*",
  },
  {
    id: 2,
    name: "Nagy Anna",
    img: "https://images.ctfassets.net/qw8ps43tg2ux/1LPfI8kPATAzojZMBalhli/7dbdddba786444110a762b75977a8fd8/how-it-works-issa-certified-personal-trainer.webp?fm=webp&w=1440&q=75",
  },
  {
    id: 3,
    name: "Balazs uramsz",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmPmvoP3rR_bCmkyqY3wGolW526w7KbUKvgg&s",
  },
  {
    id: 3,
    name: "Szeli barát",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX8_Aip3bgIbT4QxFK9vYE1kirKKJE6Vinng&s",
  },
  {
    id: 3,
    name: "A Medve",
    img: "https://people.com/thmb/tTtMRM08l3o7p3uU0KRzuNW70fM=/4000x0/filters:no_upscale():max_bytes(150000):strip_icc():focal(749x0:751x2)/eve-bear-transformation-120224-3-c2a535c359504684bf3d4d00fae07963.jpg",
  },
];
let bookings = [];

function showPage(p) {
  document
    .querySelectorAll(
      "#page-login, #page-register, #page-trainers, #page-booking, #page-bookings"
    )
    .forEach((d) => d.classList.add("hidden"));

  document.getElementById("page-" + p).classList.remove("hidden");
}

function registerUser() {
  alert("Regisztráció sikeres!");
  showPage("login");
}

function login() {
  const roleSelect = document.getElementById("roleSelect");
  const role = roleSelect ? roleSelect.value : "user";
  currentUser = { email: email.value, role: role };
  showPage("trainers");
  loadTrainers();
}

function logout() {
  currentUser = null;
  showPage("login");
  alert("Sikeresen kijelentkeztél!");
}

function loadTrainers() {
  let trainersDiv = document.getElementById("trainers");
  trainersDiv.innerHTML = trainers
    .map(
      (t) => `<div class="bg-white shadow rounded p-4 w-60 text-center">
      <img src="${t.img}" class="w-32 h-32 object-cover rounded-full mx-auto mb-3 border-2 border-gray-600">
      <p class="font-semibold text-white-700 mb-2">${t.name}</p>
      <button onclick="selectTrainer(${t.id})"
        class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition">
        Foglalás
      </button>
    </div>`
    )
    .join("");
}

function selectTrainer(id) {
  currentUser.selected = id;
  showPage("booking");
}

function book() {
  const date = document.getElementById("date").value;
  const timeStart = document.getElementById("timeStart").value;
  const timeEnd = document.getElementById("timeEnd").value;

  if (!date || !timeStart || !timeEnd) {
    alert("Kérlek add meg a dátumot és a kezdő/vég időt is!");
    return;
  }

  if (timeStart >= timeEnd) {
    alert("A kezdési időnek kisebbnek kell lennie, mint a befejezési időnek.");
    return;
  }

  if (!currentUser || !currentUser.selected) {
    alert("Kérlek válassz edzőt a foglaláshoz!");
    showPage("trainers");
    return;
  }

  bookings.push({
    trainer: currentUser.selected,
    date: date,
    timeStart: timeStart,
    timeEnd: timeEnd,
  });
  alert("Foglalva!");
  showMyBookings();
  showPage("bookings");
}

// Edző nevet irja ki
function showMyBookings() {
  const myBookings = document.getElementById("myBookings");
  myBookings.innerHTML = bookings
    .map((b) => {
      const trainer = trainers.find((t) => t.id === b.trainer) || {};
      const trainerName = trainer.name || "Ismeretlen edző";
      return `<div class="bg-white p-3 rounded shadow">
        Edző neve: ${trainerName} <br>
        Edző ID: ${b.trainer} <br>
        Dátum: ${b.date} <br>
        Kezdés: ${b.timeStart} - Vége: ${b.timeEnd}
      </div>`;
    })
    .join("");
}