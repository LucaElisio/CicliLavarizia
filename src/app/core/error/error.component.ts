import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error',
  imports: [CommonModule],
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: rgb(78, 86, 80); border-radius: 8px; padding: 20px; text-align: center;">
      <h1 style="font-size: 8rem; color: rgb(235, 238, 232); font-weight: bold;">
        {{ errorCode() }}<br>
        L'avarizia ha colpito ancora! 
    <span aria-hidden="true">☹️</span>
      </h1>
    </div>
  `,
  styles: []
})
export class ErrorComponent implements OnInit {
  errorCode = signal<number>(500);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.errorCode.set(+params['code']);
      }
    });
  }
}
