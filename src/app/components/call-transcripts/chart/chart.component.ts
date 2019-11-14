import {Component, OnInit, ElementRef, ViewChild, Input, OnChanges} from '@angular/core';
import * as Chart from 'chart.js';
import {DataService} from '../../../shared/data.service';


@Component({
  selector: 'si-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, OnChanges {
  @Input() confidenceArray: any[];
  @Input() durationArray: any[];
  @ViewChild('line') line: ElementRef;
  confidencelevels: any[] = [];
  durations: any[] = [];

  constructor(private _dataService: DataService) {
  }

  ngOnChanges() {
    this.confidencelevels = this.confidenceArray;
    this.durations = this.durationArray;
  }

  ngOnInit() {
    const lineCtx = this.line.nativeElement.getContext('2d');
    const myChart = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: this.durationArray,
        datasets: [{
          label: 'Confidence',
          fill: false,
          backgroundColor: 'azure',
          borderColor: '#0E4473',
          data: this.confidenceArray,
          borderWidth: 1,
          pointRadius: 0
        }]
      },
      options: {
        legend: {
          display: true,
          position: 'bottom',
        },
        responsive: true,
        // title: {
        //   display: true,
        //   text: 'Confidence Chart',
        //   fontSize: 20
        // },
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Duration'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Confidence level'
            }
          }]
        }
      }
    });
  }
}
