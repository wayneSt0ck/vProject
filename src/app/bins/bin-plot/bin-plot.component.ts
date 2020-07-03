import { Component, OnInit, Inject, Input, Renderer2, ElementRef} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { NgxChartsModule } from '@swimlane/ngx-charts';
import * as shape from 'd3-shape';


import * as moment from 'moment/moment';
// import { TimeDataArray } from 'src/app/header/header.component';
// import { BinsService } from '../bin.service';

export let lineChartSeries = [
  {
    name: 'Tablets',
    series: [
          {
      name: 'USA',
      value: 50
    },
      {
        value: 80,
        name: 'United Kingdom'
      },
      {
        value: 85,
        name: 'France'
      },
      {
        value: 90,
        name: 'Japan'
      },
      {
        value: 100,
        name: 'China'
      }
    ]
  },
    {
    name: 'Cell Phones',
    series: [
          {
      value: 10,
      name: 'USA'
    },
      {
        value: 20,
        name: 'United Kingdom'
      },
      {
        value: 30,
        name: 'France'
      },
      {
        value: 40,
        name: 'Japan'
      },
      {
        value: 10,
        name: 'China'
      }
    ]
  },
    {
    name: 'Computers',
    series: [
          {
      value: 2,
      name: 'USA',

    },
      {
        value: 4,
        name: 'United Kingdom'
      },
      {
        value: 20,
        name: 'France'
      },
      {
        value: 30,
        name: 'Japan'
      },
      {
        value: 35,
        name: 'China'
      }
    ]
  }
];

export let barChart: any = [
  {
    name: 'USA',
    value: 50000
  },
  {
    name: 'United Kingdom',
    value: 30000
  },
  {
    name: 'France',
    value: 10000
  },
  {
    name: 'Japan',
    value: 5000
  },
  {
    name: 'China',
    value: 500
  }
];

@Component({
  selector: "app-bin-plot",
  templateUrl: "./bin-plot.component.html",
  styleUrls: ["./bin-plot.component.css"]
})

export class BinPlotComponent implements OnInit {

  // view = [500,400];
  // showXAxis = true;
  // showYAxis = true;
  // gradient = false;
  // showLegend = true;
  // legendTitle = 'Legend';
  // legendPosition = 'right';
  // showXAxisLabel = true;
  // xAxisLabel = 'Country';
  // showYAxisLabel = true;
  // yAxisLabel = 'GDP Per Capita';
  // showGridLines = true;
  // innerPadding = '10%';
  // animations: boolean = true;
  // barChart: any[] = barChart;
  // lineChartSeries: any[] = lineChartSeries;
  // lineChartScheme = {
  //   name: 'coolthree',
  //   selectable: true,
  //   group: 'Ordinal',
  //   domain: ['#01579b', '#7aa3e5', '#a8385d', '#00bfa5']
  // };

  // comboBarScheme = {
  //   name: 'singleLightBlue',
  //   selectable: true,
  //   group: 'Ordinal',
  //   domain: ['#01579b']
  // };

  // showRightYAxisLabel: boolean = true;
  // yAxisLabelRight: string = 'Utilization';


  //------------------------------------------------------------------


  multi: any[];

  multi2: any[];
  view: any[] = [1000, 600];

  // options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Time';
  yAxisLabel: string = 'Value';
  timeline: boolean = true;
  curve: any = shape.curveBasis;

  colorScheme = {
    domain: ['#f03b0a', '#0ad1f0', '#7CFC00']
  };


  constructor(private _renderer: Renderer2, private _el: ElementRef, public dialogRef: MatDialogRef<BinPlotComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private _snackBar: MatSnackBar) {
      this.multi2
      this.getData();
    }


  openSnackBar(message: string, action: string) {
    var classType = "";
    console.log(message);
    if (message.includes("Error")) {
      classType = 'red-snackbar';
    } else if (message.includes("Saved")) {
      classType = 'green-snackbar';
    }
    this._snackBar.open(message, action, {
      duration: 4000,
      panelClass: [classType]
    });
  }

  getData() {
    this.multi = this.data.obj2;
    this.multi2 = this.data.obj2;
    console.log(this.multi2);
  }

  onSelect(data): void {
    //console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
    //console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    //console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  ngOnInit() {

    //console.log(this.data.length);
    //console.log(this.data);

  }

  ngAfterViewInit() {
    const line = this._el.nativeElement.querySelectorAll('.line')[0]; //[1];
    this._renderer.setStyle(line, 'stroke-width', '3px');

    const line2 = this._el.nativeElement.querySelectorAll('.line')[1]; //[1];
    this._renderer.setStyle(line2, 'stroke-width', '3px');
  }

  closeDataPop() {
    console.log("Closed Form");
    this.dialogRef.close(this.data);
  }

}
