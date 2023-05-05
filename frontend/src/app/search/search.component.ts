import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, tap, switchMap, finalize, distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})

export class SearchComponent implements OnInit {
  ngOnInit(): void {
    this.keywordCtrl.valueChanges
      .pipe(
        filter(res => {
          return res !== null && res.length >= this.minLengthTerm
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.yelpAutoResult = [];
          this.isLoading = true;
        }),
        switchMap(value => this.http.get('https://search12pattern.wl.r.appspot.com/autocomplete?term=' + value)
          .pipe(
            finalize(() => {
              this.isLoading = false;
            }),
          )
        )
      )
      .subscribe((data: any) => {
        var cat = data['categories'];
        for(const i in cat){
          this.yelpAutoResult.push(cat[i]['title']);
        }
        var ter = (data['terms']);
        for(const i in ter){
          this.yelpAutoResult.push(ter[i]['text']);
        }
      });
  }

  public userForm: FormGroup;
  keyword: string = "";
  cat: string = "Default";
  location: string = "";
  check: string = "";
  lat: string = "";
  long: string = "";
  temp: string[];
  tabData: any[];
  bname: string = "";
  baddr: string = "";
  bcat: string = "";
  bphone: string = "";
  bprice: string = "";
  bstat: string = "";
  bmore: string = "";
  bimg1: string = "";
  bimg2: string = "";
  bimg3: string = "";
  fblink: string = "";
  twlink: string = "";
  revData: any[];
  mapOptions: google.maps.MapOptions;
  marker: any;
  hours: number[];
  mins: string[];
  modalForm: FormGroup;
  eml: string = "";
  date: string = "";
  time: string = "";
  min: string = "";
  today: string = "";
  keywordCtrl = new FormControl();
  yelpAutoResult: string[];
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 1;
  yelpAuto: any = "";

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.userForm = this.fb.group({
      keyword: '',
      cat: 'Default',
      location: '',
      check: ''
    });
    this.modalForm = this.fb.group({
      eml: ['', [Validators.required, Validators.email]],
      date: '',
      time: '',
      min: ''
    });
    this.lat = '';
    this.long = '';
    this.temp = [];
    this.tabData = [];
    this.bname = '';
    this.baddr = '';
    this.bcat = '';
    this.bphone = '';
    this.bprice = '';
    this.bstat = '';
    this.bmore = '';
    this.bimg1 = '';
    this.bimg2 = '';
    this.bimg3 = '';
    this.fblink = '';
    this.twlink = '';
    this.revData = [];
    this.mapOptions = {};
    this.marker = {};
    this.hours = [10, 11, 12, 13, 14, 15, 16, 17];
    this.mins = ['00', '15', '30', '45'];
    var tdy = new Date();
    var tdy2 = tdy.toLocaleDateString();
    var tdy3 = tdy2.split("/");
    this.today = tdy3[2] + '-' + tdy3[1] + '-' + tdy3[0];
    this.yelpAutoResult = [];
  }

  captureFormData() {
    var cardTab = <HTMLInputElement>document.getElementById('cres');
    cardTab.classList.add("nodis");
    this.keyword = this.userForm.get('keyword') ?.value;
    var dst = <HTMLInputElement>document.getElementById('dst');
    var distance = dst.value;
    if (distance == '') {
      distance = '10';
    }
    var meters = Math.round(Number(distance) * 1609.344);
    var category = this.userForm.get('cat') ?.value;
    var categoryMap = new Map();
    categoryMap.set('Default', 'All');
    categoryMap.set('Arts & Entertainment', 'arts');
    categoryMap.set('Health & Medical', 'health');
    categoryMap.set('Food', 'food');
    categoryMap.set('Hotels & Travel', 'hotelstravel');
    categoryMap.set('Professional Services', 'professional');
    this.cat = categoryMap.get(category);
    this.location = this.userForm.get('location') ?.value;
    this.check = this.userForm.get('check') ?.value;
    if (this.location == '') {
      this.temp = this.lat.split(',');
      var re = /"loc"/gi;
      for (var i = 0; i < this.temp.length; i++) {
        if (this.temp[i].search(re) != -1) {
          var data = [];
          data = this.temp[i].split(':');
          this.lat = data[1].replace('"', '');
          this.long = this.temp[i + 1].replace('"', '');
          break;
        }
      }
    }

    var node_url1 = 'https://search12pattern.wl.r.appspot.com/bizsearch?keyword=' + this.keyword + '&category=' + this.cat + '&lat=' + this.lat + '&long=' + this.long + '&location=' + this.location + '&distance=' + meters;
    var bizresult = this.http.get(node_url1);
    bizresult.subscribe(response => {
      this.prepare_table(response);
    });
  }

  disable_loc(event: any) {
    var location = <HTMLInputElement>document.getElementById('loc');
    if (event.target.checked) {
      location.setAttribute('disabled', '');
      location.required = false;
      this.userForm.get('location') ?.setValue("");
      var req = this.http.get('https://ipinfo.io/json?token=e33cdfd60a0c2e');
      req.subscribe(response => {
        this.lat = JSON.stringify(response);
      });
    } else {
      location.removeAttribute('disabled');
      location.required = true;
    }
  }

  formClear() {
    this.userForm.get('keyword') ?.setValue("");
    this.userForm.get('cat') ?.setValue("Default");
    this.userForm.get('location') ?.setValue("");
    this.userForm.get('check') ?.setValue(false);
    var d = <HTMLInputElement>document.getElementById('dst');
    d.value = '';
    var l = <HTMLInputElement>document.getElementById('loc');
    l.removeAttribute('disabled');
    l.required = true;
    var tab = <HTMLInputElement>document.getElementById('sres');
    tab.classList.add("nodis");
    var ntab = <HTMLInputElement>document.getElementById('nres');
    ntab.classList.add("nodis");
    var cardTab = <HTMLInputElement>document.getElementById('cres');
    cardTab.classList.add("nodis");
  }

  prepare_table(response: Object) {
    this.tabData = [];
    for (var k in Object.entries(response)) {
      var line = new Map();
      line.set('row', Number(k) + 1);
      line.set('id', Object.entries(response)[k][1]['id']);
      line.set('name', Object.entries(response)[k][1]['name']);
      line.set('image_url', Object.entries(response)[k][1]['image_url']);
      line.set('rating', Object.entries(response)[k][1]['rating']);
      line.set('distance', Math.round(Object.entries(response)[k][1]['distance'] / 1609.344));
      this.tabData.push(line);
    }
    var tab = <HTMLInputElement>document.getElementById('sres');
    var ntab = <HTMLInputElement>document.getElementById('nres');
    if (this.tabData.length == 0) {
      tab.classList.add("nodis");
      ntab.classList.remove("nodis");
    } else {
      tab.classList.remove("nodis");
      ntab.classList.add("nodis");
    }
  }

  reserveNow(bname: string) {
    this.eml = this.modalForm.get('eml') ?.value;
    this.date = this.modalForm.get('date') ?.value;
    this.time = this.modalForm.get('time') ?.value;
    this.min = this.modalForm.get('min') ?.value;
    if (this.eml != '' && this.date != '' && this.time != '' && this.min != '') {
      var resDetails = bname + '|' + this.eml + '|' + this.date + '|' + this.time + '|' + this.min;
      localStorage.setItem(bname, resDetails);
      alert("Reservation created!");
      var end = <HTMLInputElement>document.getElementById('cls');
      end.click();
      var st = <HTMLInputElement>document.getElementById('start');
      var ed = <HTMLInputElement>document.getElementById('end');
      if (st != null) {
        st.classList.add("nodis");
      }
      if (ed != null) {
        ed.classList.remove("nodis");
      }
      this.modalForm.get('eml') ?.setValue("");
      this.modalForm.get('date') ?.setValue("");
      this.modalForm.get('time') ?.setValue("");
      this.modalForm.get('min') ?.setValue("");
      this.modalForm.get('eml') ?.markAsUntouched();
      this.modalForm.get('date') ?.markAsUntouched();
      this.modalForm.get('time') ?.markAsUntouched();
      this.modalForm.get('min') ?.markAsUntouched();
    } else {
      this.modalForm.markAllAsTouched();
    }
  }

  switchTab() {
    var sresTab = <HTMLInputElement>document.getElementById('sres');
    sresTab.classList.remove("nodis");
    var cardTab = <HTMLInputElement>document.getElementById('cres');
    cardTab.classList.add("nodis");
  }

  clearVariables() {
    this.bname = "";
    this.baddr = "";
    this.bcat = "";
    this.bphone = "";
    this.bprice = "";
    this.bstat = "";
    this.bmore = "";
    this.twlink = "";
    this.fblink = "";
    this.bimg1 = '';
    this.bimg2 = '';
    this.bimg3 = '';
    this.revData = [];
    this.mapOptions = {};
    this.marker = {};
  }

  cancelReservation(bname: string) {
    localStorage.removeItem(bname);
    alert("Reservation cancelled!");
    var st = <HTMLInputElement>document.getElementById('start');
    var ed = <HTMLInputElement>document.getElementById('end');
    if (st != null) {
      st.classList.remove("nodis");
    }
    if (ed != null) {
      ed.classList.add("nodis");
    }
  }

  getBizDetails(line: any) {
    var img1 = <HTMLInputElement>document.getElementById('img1');
    var img2 = <HTMLInputElement>document.getElementById('img2');
    var img3 = <HTMLInputElement>document.getElementById('img3');
    var statcode = <HTMLInputElement>document.getElementById('statcode');
    var st = <HTMLInputElement>document.getElementById('start');
    var ed = <HTMLInputElement>document.getElementById('end');

    var sresTab = <HTMLInputElement>document.getElementById('sres');
    sresTab.classList.add("nodis");
    var cardTab = <HTMLInputElement>document.getElementById('cres');
    cardTab.classList.remove("nodis");
    cardTab.scrollIntoView(true);

    this.clearVariables();

    var node_url3 = 'https://search12pattern.wl.r.appspot.com/bizdetail?id=' + line.get('id');
    var bizdetail = this.http.get(node_url3);
    bizdetail.subscribe(response => {
      var bizres = Object.entries(response);
      for (var i in bizres) {
        if (bizres[i][0] == "name") {
          this.bname = bizres[i][1];
          var hit = localStorage.getItem(this.bname);
          if (hit == undefined || hit == null || hit == '') {
            if (st != null) {
              st.classList.remove("nodis");
            }
            if (ed != null) {
              ed.classList.add("nodis");
            }
          } else {
            if (st != null) {
              st.classList.add("nodis");
            }
            if (ed != null) {
              ed.classList.remove("nodis");
            }
          }
        } else if (bizres[i][0] == "location") {
          var adrTab = bizres[i][1]['display_address'];
          for (var j in adrTab) {
            this.baddr = this.baddr + " " + adrTab[j];
          }
        } else if (bizres[i][0] == "categories") {
          var catTab = bizres[i][1];
          if (catTab != undefined) {
            for (var j in catTab) {
              if (j == '0') {
                this.bcat = catTab[j]['title'];
              } else {
                this.bcat = this.bcat + ' | ' + catTab[j]['title'];
              }
            }
          } else {
            this.bcat = 'N/A';
          }
        } else if (bizres[i][0] == "display_phone") {
          this.bphone = bizres[i][1];
          if (this.bphone == '') {
            this.bphone = 'N/A'
          }
        } else if (bizres[i][0] == "price") {
          this.bprice = bizres[i][1];
          if (this.bprice == '[object Object]') {
            this.bprice = 'N/A';
          }
        } else if (bizres[i][0] == "hours") {
          var isOpen = bizres[i][1][0];
          if (isOpen != undefined) {
            if (isOpen['is_open_now'] == true) {
              this.bstat = 'Open Now';
              if (statcode != null) {
                statcode.classList.add("text-success");
                statcode.classList.remove("text-danger");
              }
            } else if (isOpen['is_open_now'] == false) {
              this.bstat = 'Closed';
              if (statcode != null) {
                statcode.classList.add("text-danger");
                statcode.classList.remove("text-success");
              }
            }
          } else {
            this.bstat = 'N/A';
            if (statcode != null) {
              statcode.classList.remove("text-success");
              statcode.classList.remove("text-danger");
            }
          }
        } else if (bizres[i][0] == "url") {
          this.bmore = bizres[i][1];
          if (this.bmore != '') {
            this.fblink = 'https://www.facebook.com/sharer/sharer.php?u=' + this.bmore;
            this.twlink = 'https://twitter.com/intent/tweet?url=' + this.bmore + '&text=Check out ' + this.bname.replace('&', 'and') + ' on @yelp';
          }
        } else if (bizres[i][0] == "photos") {
          var imgTab = bizres[i][1];
          for (var j in imgTab) {
            if (j == '0') {
              this.bimg1 = imgTab[j];
            } else if (j == '1') {
              this.bimg2 = imgTab[j];
            } else {
              this.bimg3 = imgTab[j]
            }
          }
          if (this.bimg1 == '') {
            if (img1 != null) {
              img1.classList.add("nodis");
            }
          } else {
            if (img1 != null) {
              img1.classList.remove("nodis");
            }
          }
          if (this.bimg2 == '') {
            if (img2 != null) {
              img2.classList.add("nodis");
            }
          } else {
            if (img2 != null) {
              img2.classList.remove("nodis");
            }
          }
          if (this.bimg3 == '') {
            if (img3 != null) {
              img3.classList.add("nodis");
            }
          } else {
            if (img3 != null) {
              img3.classList.remove("nodis");
            }
          }
        } else if (bizres[i][0] == "reviews") {
          var rTab = bizres[i][1];
          if (rTab != undefined) {
            for (var j in rTab) {
              var rev = new Map();
              rev.set('rating', rTab[j]['rating']);
              rev.set('revName', rTab[j]['user']['name']);
              rev.set('review', rTab[j]['text']);
              var dat = rTab[j]['time_created'];
              rev.set('date', dat.substr(0, 10));
              this.revData.push(rev);
            }
          }
        } else if (bizres[i][0] == "coordinates") {
          var lati = Number(bizres[i][1]['latitude']);
          var long = Number(bizres[i][1]['longitude']);
          var newmap = {
            center: new google.maps.LatLng(lati, long),
            zoom: 10,
          };
          this.mapOptions = newmap;
          var pin = new google.maps.LatLng(lati, long);
          var newmark = {
            position: pin,
          };
          this.marker = new google.maps.Marker(newmark);
        }
      }
    });
  }

}
