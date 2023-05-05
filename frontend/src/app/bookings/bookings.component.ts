import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {

  public localData: any[];

  constructor() {
    this.localData = [];
    for(var i in localStorage){
      if(typeof i != typeof localStorage[i]){
        break;
      }
      var line = localStorage[i].split('|');
      var resDat = new Map();
      resDat.set('bname',line[0]);
      resDat.set('email',line[1]);
      resDat.set('date',line[2]);
      resDat.set('time',line[3]+":"+line[4]);
      this.localData.push(resDat);
    }
  }

  delRow(bname: string){
    localStorage.removeItem(bname);
    for(var i in this.localData){
      var popItem = this.localData[i].get('bname');
      if(popItem == bname){
        this.localData.splice(Number(i),1);
        break;
      }
    }
    alert("Reservation cancelled!");
  }

  ngOnInit(): void {
  }



}
