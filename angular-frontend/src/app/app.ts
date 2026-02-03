import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {

  // =====================
  // USER / NAV STATE
  // =====================
  adminUsers: any[] = [];
  adminBookings: any[] = [];
  currentPage: string| 'login'| 'register'| 'trainers'| 'booking'| 'bookings'| 'trainer'| 'admin' = 'login';
  currentUserRole: string | null = null;
  currentUserId: number | null = null;

  constructor(private api: ApiService) {}

  showPage(page: typeof this.currentPage) {
  this.currentPage = page;
  }

  logout() {
    this.currentUserRole = null;
    this.currentUserId = null;
    this.showPage('login');
  }
  login(role: 'user' | 'trainer' | 'admin') {
  this.currentUserRole = role;
  this.currentUserId = 1;   // DEMO USER TESZTELESHEZ(KESOBB KISZEDNI)
  this.showPage('trainers');
}

  // =====================
  // AUTH — BACKEND
  // =====================

  loginUser(email: string, password: string) {
  this.api.login({ email, password })
    .subscribe((user: any) => {

      this.currentUserRole = user.role;
      this.currentUserId = user.id;

      // saját foglalások betöltése usernél
      if (user.role === 'user') {
        this.loadMyBookings();
        this.showPage('trainers');
      }

      // ADMIN — plusz adatbetöltés
      else if (user.role === 'admin') {
        this.loadAdminData();
        this.showPage('admin');
      }

      else if (user.role === 'trainer') {
        this.showPage('trainer');
      }

    }, () => alert('Hibás belépés'));
}

  registerUser(name: string, email: string, password: string) {
    this.api.register({ name, email, password })
      .subscribe(() => {
        alert('Sikeres regisztráció');
        this.showPage('login');
      });
  }

  // =====================
  // TRAINERS
  // =====================

  trainers = [
    {
      id: 1,
      name: 'John Doe',
      specialty: 'Strength Training',
      image: 'https://i.pravatar.cc/150?img=12'
    },
    {
      id: 2,
      name: 'Jane Smith',
      specialty: 'Yoga',
      image: 'https://i.pravatar.cc/150?img=32'
    }
  ];

  selectedTrainerId: number | null = null;

  selectTrainer(id: number) {
  this.selectedTrainerId = id;

  const schedule = this.trainerSchedules[id];

  if (!schedule) {
    console.error('Nincs schedule trainerhez:', id);
    return;
  }

  this.availableTimes = {
    morning: schedule.morning,
    afternoon: schedule.afternoon,
    evening: schedule.evening
  };

  this.showPage('booking');
  }

  // =====================
  // CALENDAR
  // =====================

  selectedDate: string | null = null;
  selectedTime: string | null = null;

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();

  monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  calendarDays: (number | null)[] = [];

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    this.calendarDays = [];

    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0
    ).getDate();

    const offset = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < offset; i++) {
      this.calendarDays.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      this.calendarDays.push(day);
    }
  }
  //NAP KIVÁLASZTÁSA
  selectDay(day: number) {
  const m = String(this.currentMonth + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');

  this.selectedDate = `${this.currentYear}-${m}-${d}`;
}

  
  // EDZŐ IDŐPONTOK

  trainerSchedules: any = {
    1: {
      morning: ['08:00', '09:00', '10:00', '11:00',],
      afternoon: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00',],
      evening: ['18:00', '19:00', '20:00',]
    },
    2: {
      morning: ['08:00', '09:00', '10:00', '11:00'],
      afternoon: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
      evening: ['18:00', '19:00', '20:00']
    }
  };

  availableTimes = {
    morning: [] as string[],
    afternoon: [] as string[],
    evening: [] as string[]
  };

  selectDateInput(event: any) {
    this.selectedDate = event.target.value;
    this.selectedTime = null;
  }

  selectTime(time: string) {
    this.selectedTime = time;
  }

  // =====================
  // BOOKINGS (FRONTEND MOCK — NEXT STEP BACKEND)
  // =====================

  bookings: any[] = [];
    

  bookAppointment() {

  if (!this.selectedDate || !this.selectedTime || !this.selectedTrainerId || !this.currentUserId) {
    alert('Hiányzó adat!');
    return;
  }
  //ellenorzes hogy mi kap nullt
  console.log({
  date: this.selectedDate,
  time: this.selectedTime,
  trainer: this.selectedTrainerId,
  user: this.currentUserId
  });
  //---------------------------------

  this.api.book({
    userId: this.currentUserId,
    trainerId: this.selectedTrainerId,
    date: this.selectedDate,
    time: this.selectedTime
  })
  .subscribe({
    next: () => {
      alert('Sikeres foglalás');
      this.showPage('bookings');
      this.loadMyBookings();
    },
    error: (err) => {
      alert(err.error?.error || 'Foglalás sikertelen');
    }
  });
  }

  loadMyBookings() {
  if (!this.currentUserId) return;

  this.api.myBookings(this.currentUserId)
    .subscribe((rows: any) => {
      this.bookings = rows.map((r: any) => ({
        id: r.id,
        trainer: r.trainerName,
        date: r.date,
        time: r.time,
        status: r.status
      }));
    });
  }


  cancelBooking(index: number) {
    this.bookings[index].status = 'cancelled';
  }

  cancelBookingBackend(id: number) {
  this.api.cancelBooking(id)
    .subscribe(() => {
      this.loadMyBookings();
    });
  }

  //ADMIN ADATOK BETOLTESE
  
  loadAdminData() {
  this.api.getUsers().subscribe((u:any) => this.adminUsers = u);

  // összes booking — most trainer=1-el kérjük le demóra
  this.api.getAllBookingsForTrainer(1)
    .subscribe((b:any) => this.adminBookings = b);
  }

  //ADMIN TÖRLÉSE
  adminDeleteBooking(id: number) {
  this.api.deleteBooking(id)
    .subscribe(() => this.loadAdminData());
  }


}