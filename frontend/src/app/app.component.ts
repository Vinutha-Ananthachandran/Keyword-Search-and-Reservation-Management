import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';

  setBorder(nb:number){
    const s = <HTMLInputElement>document.getElementById('srch');
    const b = <HTMLInputElement>document.getElementById('book');
    if (nb == 1){
      s.classList.add("border");
      s.classList.add("border-2");
      s.classList.add("rounded");
      s.classList.add("px-2");
      s.classList.add("border-dark");
      b.classList.remove("border");
      b.classList.remove("border-2");
      b.classList.remove("rounded");
      b.classList.remove("px-2");
      b.classList.remove("border-dark");
    }else{
      b.classList.add("border");
      b.classList.add("border-2");
      b.classList.add("rounded");
      b.classList.add("px-2");
      b.classList.add("border-dark");
      s.classList.remove("border");
      s.classList.remove("border-2");
      s.classList.remove("rounded");
      s.classList.remove("px-2");
      s.classList.remove("border-dark");
    }
    return true;
  }
}
