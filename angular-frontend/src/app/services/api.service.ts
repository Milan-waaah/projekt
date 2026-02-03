import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  login(data: any) {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  getUsers() {
    return this.http.get(`${this.baseUrl}/users`);
  }

  book(data: any) {
    return this.http.post(`${this.baseUrl}/book`, data);
  }

  myBookings(id: number) {
    return this.http.get(`${this.baseUrl}/my-bookings/${id}`);
  }
  
  cancelBooking(id: number) {
  return this.http.post(`${this.baseUrl}/cancel-booking/${id}`, {});
  }

  getAllBookingsForTrainer(id: number) {
  return this.http.get(`${this.baseUrl}/trainer-bookings/${id}`);
  }

  deleteBooking(id: number) {
  return this.http.delete(`${this.baseUrl}/booking/${id}`);
  }
}