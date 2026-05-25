import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
  standalone: false
})
export class LoaderComponent {
  @Input() type: 'spinner' | 'skeleton' | 'both' = 'both';
  @Input() message: string = 'Loading background verification records...';
  @Input() rows: number = 5;
  @Input() cols: number = 5;

  get rowArray(): number[] {
    return Array(this.rows).fill(0);
  }

  get colArray(): number[] {
    return Array(this.cols).fill(0);
  }
}
