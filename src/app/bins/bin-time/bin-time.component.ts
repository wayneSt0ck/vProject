import { Component, OnInit, Inject, Input} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TimeData } from 'src/app/header/header.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as moment from 'moment/moment';
// import { TimeDataArray } from 'src/app/header/header.component';
// import { BinsService } from '../bin.service';
import { HistoryBin } from '../historybin.model';
import { Bin } from '../bin.model';

export interface BinTable {
  name: string;
  sdate: string;
  edate: string;
  daysleft: string;
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
  selector: "app-bin-time",
  templateUrl: "./bin-time.component.html",
  styleUrls: ["./bin-time.component.css"]
})
export class BinTimeComponent implements OnInit {

  displayedColumns: string[] = ['name', 'sdate', 'edate', 'daysleft', 'hamount', 'action'];
  dataSource = ELEMENT_DATA;
  public date;

  binIds = [];

  finishedBool = false;

  @Input() timeInfo: {currentDate: string};

  constructor(public dialogRef: MatDialogRef<BinTimeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private _snackBar: MatSnackBar, private http: HttpClient) {

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

    //this.binIds = [];

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
      var d = ed.diff(sd, 'days').toString();

      if (this.data[x].dayStart == null) {
        d = "Not Started";
      }

      if (parseInt(d) <= 0) {
        d = "Finished Bin";
      }

      console.log(this.data[x].dayStart, this.data[x].dayEnd);

      this.dataSource.push({
        name: this.data[x].title,
        sdate: this.data[x].dayStart,
        edate: this.data[x].dayEnd,
        daysleft: d,
        hamount: '0',
        action: '-'
      });

      //this.dataSource[x].sdate = "2020-05-14";

      //console.log(this.dataSource[x].sdate);
      //this.binIds.push(this.data[x]._id);

      if (this.data[x].dayStart == null) {
        this.dataSource[x].sdate = dob;
      }

      //console.log("Test");

      //console.log(this.data);
      //console.log(this.data[x].daysleft);
      console.log(d);

      if (this.data[x].daysleft != "Not Connected") {
        if (d != "Finished Bin") {
          this.dataSource[x].daysleft = this.dataSource[x].daysleft + " Days";
        }
      }

    }
  }

  logFinishedBin(binName, daysleft, hamount) {
    console.log(binName, daysleft);
    if (daysleft != "Finished Bin") {
      this.openSnackBar("Error - This Bin Is NOT Done", "Close")
      return;
    } else {
      if (parseInt(hamount) <= 0) {
        this.openSnackBar("Error - Harvest Amount Needs to Be Greater Than 0", "Close")
        return;
      }

      const historyData: HistoryBin = {title: "", harvestamount: "", dayStart: "", dayEnd: "", dayEntered: "", errorstream: "", tempstream: "",
        moisturestream: "", foodstream: "", foodamountstream: "", timestream: ""};

      for (var x = 0; x < this.data.length; x++) {
        if (this.data[x].title == binName) {
          console.log("Found The Correct Bin Data: " + binName);
          //got to the correct data
          historyData.title = this.data[x].title;
          historyData.harvestamount = hamount;
          historyData.dayStart = this.data[x].dayStart;
          historyData.dayEnd = this.data[x].dayEnd;
          historyData.dayEntered = moment().toString();
          historyData.errorstream = this.data[x].errorstream;
          historyData.tempstream = this.data[x].tempstream;
          historyData.moisturestream = this.data[x].moisturestream;
          historyData.foodstream = this.data[x].foodstream;
          historyData.foodamountstream = this.data[x].foodamountstream;
          historyData.timestream = this.data[x].timestream;

          //console.log(historyData);

          //console.log("Here 1");

          this.http
          .post("http://localhost:3000/api/history/", historyData)
          .subscribe(response => {
            console.log(response);

            //this.openSnackBar("Saved Bin Data to History", "Close")

            this.date = new Date();
            const sf = JSON.stringify(this.date);
            const dob = sf.substring(1, 11);

            this.dataSource[x].sdate = dob;
            this.dataSource[x].edate = "";
            this.dataSource[x].daysleft = "Not Started";
          })

          const bin: Bin = {id: (x + 1).toString(), title: binName, status: "#ff6500", temp: "100", moisture: "100", timestamp: "Not Connected", daysleft: "Not Connected",
            dayStart: null, dayEnd: null, errorstream: "", tempstream: "", moisturestream: "", foodstream: "", foodamountstream: "", timestream: ""};

          this.http
          .put("http://localhost:3000/api/reset/" + binName, bin)
          .subscribe(response => {
            console.log(response);
            this.openSnackBar("Saved Bin Data to History", "Close")

            //reset local (data) bin information here
            this.data[x].status = "#ff6500";
            this.data[x].temp = "100";
            this.data[x].moisture = "100";
            this.data[x].timestamp = "Not Connected";
            this.data[x].daysleft = "Not Connected";
            this.data[x].dayStart = null;
            this.data[x].dayEnd = null;
            this.data[x].errorstream = "";
            this.data[x].tempstream = "";
            this.data[x].moisturestream = "";
            this.data[x].foodstream = "";
            this.data[x].foodamountstream = "";
            this.data[x].timestream = "";
          })

          // const limit: Limit = {tempmin: minT, tempmax: maxT, moisturemin: minM, moisturemax: maxM};
          // this.http
          //   .put("http://localhost:3000/api/limits", limit)
          //   .subscribe(response => {
          //     console.log(response);
          //     this.minT = minT;
          //     this.maxT = maxT;
          //     this.minM = minM;
          //     this.maxM = maxM;
          //   })
          return;
        }
      }
      //This section is to take harvest amount and log all data into new table
      //Bin Name
      //Bin Start Date
      //Bin End Date
      //Bin Harvest Amount
      //Bin Harvest Time?
      //All Temp Data
      //All Moisture Data
      //All Food Type Data
      //All Food Amount Data
      //All Time Data

      console.log(binName, hamount);
    }
  }

  closeTimePop() {
    console.log("Closed Form");
    this.dialogRef.close(this.data);
  }

  stopBinData(binName) {
    console.log(binName);

    var id = binName.toString().substring(4, binName.length);
    //var dbID = this.binIds[id - 1];
    var idNum = parseInt(id);

    const dateStuff: DateData = {startDate: null, endDate: null};

    this.http
      .put("http://localhost:3000/api/posts/" + binName, dateStuff)
      .subscribe(response => {
        console.log(response);

        this.data[idNum - 1].dayStart = null;
        this.data[idNum - 1].dayEnd = null;
        this.data[idNum - 1].daysleft = "Not Started";

        //this.dataSource[idNum - 1].sdate = null;
        this.dataSource[idNum - 1].edate = null;

        this.dataSource[idNum - 1].daysleft = "Not Started";

        this.openSnackBar("Stopped Bin Stream", "Close")
      })

  }

  saveBinData(binName, startDate, endDate) {
    console.log(binName, startDate, endDate);

    if (binName == "") {
      console.log("Something is Wrong");
      return;
    }

    var id = binName.toString().substring(4, binName.length);

    var dbID = this.binIds[id - 1];

    var idNum = parseInt(id);

    var nowD = moment();
    var sd = moment(startDate);
    var ed = moment(endDate);

    //Do date handling here with snackbar output
    var lStatus = "";
    if ((endDate == null) || (endDate == "")) {
      lStatus = "Error - Please Enter End Date";
    }
    if (ed < sd) {
      lStatus = "Error - End Date Needs To Be After Start Date";
    }
    if (ed > sd) {
      lStatus = "Saved Bin Data Successfully";
      var d = ed.diff(nowD, 'days');
      console.log(d);

      if (d == 0) {
        this.dataSource[idNum - 1].daysleft = "Finished Bin";
      } else {
        this.dataSource[idNum - 1].daysleft = d.toString() + " Days";
      }


      console.log(binName);

      this.data[id - 1].dayStart = moment(sd).format('YYYY-MM-DD');
      this.data[id - 1].dayEnd = moment(ed).format('YYYY-MM-DD');


      const dateStuff: DateData = {startDate: moment(sd).format('YYYY-MM-DD'), endDate: moment(ed).format('YYYY-MM-DD')};

      this.http
        .put("http://localhost:3000/api/posts/" + binName, dateStuff)
        .subscribe(response => {
          console.log(response);
        })
    }

    this.openSnackBar(lStatus, "Close")
    //console.log(this.data);
  }

  changeStartDateVal(binName, date) {
    //console.log(binName, date.value);

    const sf = JSON.stringify(date.value);
    const dob = sf.substring(1, 11);

    //console.log(dob);

    for (var x = 0; x < this.dataSource.length; x++) {
      console.log(this.dataSource[x].name);
      if (this.dataSource[x].name == binName) {
        this.dataSource[x].sdate = dob;
      }
    }
  }

  changeEndDateVal(binName, date) {
    const sf = JSON.stringify(date.value);
    const dob = sf.substring(1, 11);

    //console.log(dob);

    for (var x = 0; x < this.dataSource.length; x++) {
      //console.log(this.dataSource[x].name);
      if (this.dataSource[x].name == binName) {
        this.dataSource[x].edate = dob;
      }
    }
  }
}
