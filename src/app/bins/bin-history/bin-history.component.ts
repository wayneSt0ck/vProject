import { Component, OnInit, Inject, Input} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

import { BinPlotComponent } from '../bin-plot/bin-plot.component';

import { environment } from "../../../environments/environment";

import * as moment from 'moment/moment';

export interface BinTable {
  id: string;
  name: string;
  sdate: string;
  edate: string;
  pdate: string;
  hamount: string;
  action: string;
}

export interface DateData {
  startDate: string;
  endDate: string;
}


const ELEMENT_DATA: BinTable[] = [
  // {name: 'Bin 1', sdate: '0/0/00', edate: '0/0/00', daysleft: "-", hamount: '0', action: '-'},
];

@Component({
  selector: "app-bin-history",
  templateUrl: "./bin-history.component.html",
  styleUrls: ["./bin-history.component.css"]
})
export class BinHistoryComponent implements OnInit {

  displayedColumns: string[] = ['name', 'sdate', 'edate', 'pdate', 'hamount', 'action'];
  dataSource = ELEMENT_DATA;
  public date;

  binIds = [];

  finishedBool = false;

  @Input() timeInfo: {currentDate: string};

  constructor(public dialogRef: MatDialogRef<BinHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private _snackBar: MatSnackBar, private http: HttpClient, public dialog: MatDialog) {

    }

  openSnackBar(message: string, action: string) {
    var classType = "";
    console.log(message);
    if (message.includes("Error")) {
      classType = 'red-snackbar';
    } else if (message.includes("Saved") || message.includes("Stopped")) {
      classType = 'green-snackbar';
    }
    this._snackBar.open(message, action, {
      duration: 4000,
      panelClass: [classType]
    });
  }

  ngOnInit() {

    console.log(this.data.length);
    console.log(this.data);

    this.binIds = [];

    this.dataSource = [];
    //var localBins = this.binsService.getBinInfo();
    //console.log(localBins);
    this.date = new Date();
    const sf = JSON.stringify(this.date);
    const dob = sf.substring(1, 11);
    //console.log(this.data[0].dayStart, this.data[0].dayEnd, dob);
    for (var x = 0; x < this.data.length; x++) {

      var sd = moment();
      var ed = moment(this.data[x].dayEnd);

      //this.binIds.push(this.data[x]._id);

      //console.log(this.data[x].dayStart, this.data[x].dayEnd, this.data[x].dayEntered);

      this.dataSource.push({
        id: this.data[x]._id,
        name: this.data[x].title,
        sdate: this.data[x].dayStart,
        edate: this.data[x].dayEnd,
        pdate: this.data[x].dayEntered,
        hamount: this.data[x].harvestAmount,
        action: '-'
      });

    }

    //console.log(this.dataSource);
  }

  downloadBinData(binID) {

    const dataArray = [["Time", "Temperature", "Moisture", "Food Type", "Food Amount"]];

    for (var i = 0; i < this.data.length; i++) {
      if (binID == this.data[i]._id) {

        for (var x = 0; x < this.data[i].timestream.length; x++) {

          //goal format
          //["Time", "Temperature", "Moisture", "Food Type", "Food Amount"]
          //["Time1", "Temp1", "Moisture1", "Food Type 1", "Food Amount 1"]
          //etc
          dataArray.push([this.data[i].timestream[x], this.data[i].tempstream[x], this.data[i].moisturestream[x],
            this.data[i].foodstream[x], this.data[i].foodamountstream[x]]);

        }

        let csvContent = "data:text/csv;charset=utf-8,";

        dataArray.forEach(function(rowArray) {
            let row = rowArray.join(",");
            csvContent += row + "\r\n";
        });

        //console.log(csvContent);

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "data.csv");
        document.body.appendChild(link); // Required for FF

        link.click(); // This will download the data file named "my_data.csv".

        this.openSnackBar("Saved Data Successfully", "Close")

        return;
      }
    }
  }

  showHistoryPlotWindow(binID) {

    for (var i = 0; i < this.data.length; i++) {
      if (binID == this.data[i]._id) {

        console.log("Found Matching ID");

        var obj2 = [{
          name: "",
          series: [
            {

            }
          ]

        }]

        // for (var x = 0; x < binData.timestream.length - 1; x++) {
        //   if (x == 0) {
        //     var localFoodAmount = 0;
        //     obj2.push({name: "Moisture", series: []});
        //     obj2.push({name: "Food", series: []});
        //     obj2[0].series[0] = ({value: parseFloat(binData.tempstream[x + 1]), name: new Date(binData.timestream[x + 1])});
        //     obj2[1].series[0] = ({value: parseFloat(binData.moisturestream[x + 1]), name: new Date(binData.timestream[x + 1])});
        //     if (binData.foodamountstream[x + 1] == "") {
        //       localFoodAmount = 0;
        //     } else {
        //       localFoodAmount = parseFloat(binData.foodamountstream[x + 1]);
        //     }
        //     obj2[2].series.push({value: localFoodAmount, name: new Date(binData.timestream[x + 1])});
        //   } else {
        //     obj2[0].series.push({value: parseFloat(binData.tempstream[x + 1]), name: new Date(binData.timestream[x + 1])});
        //     obj2[1].series.push({value: parseFloat(binData.moisturestream[x + 1]), name: new Date(binData.timestream[x + 1])});
        //     if (binData.foodamountstream[x + 1] == "") {
        //       localFoodAmount = 0;
        //     } else {
        //       localFoodAmount = parseFloat(binData.foodamountstream[x + 1]);
        //     }
        //     obj2[2].series.push({value: localFoodAmount, name: new Date(binData.timestream[x + 1])});
        //   }
        // }

        //console.log(this.data[x]);
        console.log(this.data[i].timestream.length - 1);
        obj2[0].name = "Temperature";

        for (var x = 0; x < this.data[i].timestream.length - 1; x++) {
          if (x == 0) {
            var localFoodAmount = 0;
            obj2.push({name: "Moisture", series: []});
            obj2.push({name: "Food", series:[]});
            obj2[0].series[0] = ({value: parseFloat(this.data[i].tempstream[x + 1]), name: new Date(this.data[i].timestream[x + 1])});
            obj2[1].series[0] = ({value: parseFloat(this.data[i].moisturestream[x + 1]), name: new Date(this.data[i].timestream[x + 1])});
            if (this.data[i].foodamountstream[x + 1] == "") {
              localFoodAmount = 0;
            } else {
              localFoodAmount = parseFloat(this.data[i].foodamountstream[x + 1]);
            }
            obj2[2].series[0] = ({value: localFoodAmount, name: new Date(this.data[i].timestream[x + 1])});
          } else {
            obj2[0].series.push({value: parseFloat(this.data[i].tempstream[x + 1]), name: new Date(this.data[i].timestream[x + 1])});
            obj2[1].series.push({value: parseFloat(this.data[i].moisturestream[x + 1]), name: new Date(this.data[i].timestream[x + 1])});
            if (this.data[i].foodamountstream[x + 1] == "") {
              localFoodAmount = 0;
            } else {
              localFoodAmount = parseFloat(this.data[i].foodamountstream[x + 1]);
            }
            obj2[2].series.push({value: localFoodAmount, name: new Date(this.data[i].timestream[x + 1])});
          }
        }

        console.log("JSON Data");
        console.log(obj2);

        //console.log(newData);
        const dialogRef = this.dialog.open(BinPlotComponent, {
          //Combine all data into a easily graphable JSON file

          data: {obj2}
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log('The dialog was closed');
        })

        return;
      }
    }
  }

  closeTimePop() {
    console.log("Closed Form");
    this.dialogRef.close(this.data);
  }
}
