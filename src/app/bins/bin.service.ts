import { Bin } from './Bin.model';
import { Limit } from './Limit.model';
import { Stream } from './stream.model';
import { Error } from './error.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, interval, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BinMaxMinComponent } from '../bins/bin-max-min/bin-max-min.component';
import { BinTimeComponent } from '../bins/bin-time/bin-time.component';
import { BinFoodComponent } from '../bins/bin-food/bin-food.component';
import { BinPlotComponent } from '../bins/bin-plot/bin-plot.component';
import { BinHistoryComponent } from '../bins/bin-history/bin-history.component'

import { IMqttMessage, MqttService } from 'ngx-mqtt';

import * as moment from 'moment/moment';
import { ThrowStmt } from '@angular/compiler';
import { HistoryBin } from './historybin.model';

import { environment } from "../../environments/environment";

export interface Mqtt {
  username: string;
  password: string;
}

const BACKEND_URL = environment.apiUrl + "/posts";

@Injectable({providedIn: 'root'})

export class BinsService {

  private bins: Bin[] = [];
  private binsUpdated = new Subject<Bin[]>();

  sub: Subscription;
  intervalID: number;

  private loopCounter = 0;

  private tempArray = [];
  private moistureArray = [];
  private timeStampArray = [];
  private prevTimeStampArray = [];
  private dataPushBools = [];
  private startArray = [];
  private errorStream = [];

  private binIDArray = [];

  private saveBool = false;

  private subscription: Subscription;
  public message: string;
  private espTopic: string;

  topicname: any;
  msg: any;
  isConnected: boolean = false;

  mqttConnection: boolean = false;

  isAuthenticated: boolean;

  //look into adding auth service to check for token authentication bool

  constructor(public dialog: MatDialog, private http: HttpClient, private _mqttService: MqttService){
    console.log("Bin Service Started");
  }

  private maxT = "0";
  private minT = "0";
  private maxM = "0";
  private minM = "0";

  connectToMqtt() {

    this.http.get<{message: string, mqtt: Mqtt[]}>(environment.apiUrl + '/mqtt')
      .subscribe((mqttData) => {

        //console.log(mqttData.mqtt[0].username, mqttData.mqtt[0].password);

        try {
          this._mqttService.connect({username: mqttData.mqtt[0].username, password: mqttData.mqtt[0].password});

          this.subscription = this._mqttService.observe("sensors/#").subscribe((message: IMqttMessage) => {
            //console.log(message.topic);
            this.message = message.payload.toString();
            this.espTopic = message.topic;
            //var obj = JSON.parse(this.message);
            //console.log(obj.t1, obj.t2);
            this.updateData(this.espTopic, this.message);

            this.mqttConnection = true;
          });
        }
        catch (error) {
          console.log(error);
        }
      });
  }


  showPlotWindow(binData: Bin) {


    var obj2 = [{
      name: "",
      series: [
        {

        }
      ]

    }]


    obj2[0].name = "Temperature";

    for (var x = 0; x < binData.timestream.length - 1; x++) {
      if (x == 0) {
        var localFoodAmount = 0;
        obj2.push({name: "Moisture", series: []});
        obj2.push({name: "Food", series: []});
        obj2[0].series[0] = ({value: parseFloat(binData.tempstream[x + 1]), name: new Date(binData.timestream[x + 1])});
        obj2[1].series[0] = ({value: parseFloat(binData.moisturestream[x + 1]), name: new Date(binData.timestream[x + 1])});
        if (binData.foodamountstream[x + 1] == "") {
          localFoodAmount = 0;
        } else {
          localFoodAmount = parseFloat(binData.foodamountstream[x + 1]);
        }
        obj2[2].series[0] = ({value: localFoodAmount, name: new Date(binData.timestream[x + 1])});
      } else {
        obj2[0].series.push({value: parseFloat(binData.tempstream[x + 1]), name: new Date(binData.timestream[x + 1])});
        obj2[1].series.push({value: parseFloat(binData.moisturestream[x + 1]), name: new Date(binData.timestream[x + 1])});
        if (binData.foodamountstream[x + 1] == "") {
          localFoodAmount = 0;
        } else {
          localFoodAmount = parseFloat(binData.foodamountstream[x + 1]);
        }
        obj2[2].series.push({value: localFoodAmount, name: new Date(binData.timestream[x + 1])});
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
  }

  openHistory() {
    //console.log(this.bins);

    //Get all data from finished bins table
    this.http.get<{message: string, history: HistoryBin[]}>(environment.apiUrl + '/gethistory')
      .subscribe((historyData) => {
        // if (binData.results == undefined) {
        //   return;
        // }
        //console.log(historyData);
        //console.log(historyData.history);

        const dialogRef = this.dialog.open(BinHistoryComponent, {
          data: historyData.history //{binInfo: this.bins}
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log('The dialog was closed');
          console.log(result);
          // console.log(result);
          //this.updateMaxMin(result.minTemp, result.maxTemp, result.minMoisture, result.maxMoisture);
        })
        // return;
      });
  }

  addBin(qty: string, title: string, status: string, temp: string, moisture: string, timestamp: string, daysleft: string) {

    var binNum = this.bins.length;
    //console.log(this.bins);
    //var binNum2 = qty.toString() + binNum;
    var binName = "Bin " + qty.toString();
    var status1 = "#ff6500";
    var temp1 = "100";
    var moisture1 = "100";
    var timestamp1 = "Not Connected";
    var daysleft1 = "Not Connected";
    var dayStart1 = null;
    var dayEnd1 = null;

    const bin: Bin = {id: qty.toString(), title: binName, status: status1, temp: temp1, moisture: moisture1, timestamp: timestamp1, daysleft: daysleft1,
    dayStart: dayStart1, dayEnd: dayEnd1, errorstream: "", tempstream: "", moisturestream: "", foodstream: "", foodamountstream: "", timestream: ""};

    this.http.post<{message: string}>(environment.apiUrl + '/posts', bin)
    .subscribe((responseData) => {
      console.log(responseData);

      this.bins.push(bin);
      this.binsUpdated.next([...this.bins]);
      console.log(this.bins);

      this.tempArray.push("0");
      this.moistureArray.push("0");
      this.startArray.push("0");
      this.timeStampArray.push("0");
      this.dataPushBools.push("0");
      this.prevTimeStampArray.push("0");
      //binNum = this.bins.length;
      this.getSort("lh");
    });

    //this.getSort("lh");
  }

  testData() {
    console.log(this.bins);
    // this.http.get<{message: string, mqtt: Mqtt[]}>('http://localhost:3000/api/mqtt')
    //   .subscribe((mqttData) => {
    //     console.log(mqttData.mqtt[0].username, mqttData.mqtt[0].password);
    //   });


  }


  streamData() {
    console.log("Stream Data Test");

    // if (this.isAuthenticated) {
    //   console.log("Still Authenticated - Continue")
    // } else {
    //   console.log("Not Authentication Token Found - Not Saving Data");
    //   return;
    // }

    for (var x = 0; x < this.bins.length; x++) {

      //console.log(this.startArray[x]);
      //if (this.startArray[x] == "0")
      if (parseInt(this.dataPushBools[x]) > 100) {
        console.log("Bin Data Not Saved - Sensor Connection Has Been Interupted")
      }
      if ((this.bins[x].dayStart != null) && (parseInt(this.dataPushBools[x]) <= 100) && (this.bins[x].daysleft != "Finished Bin")) {
        const lt = this.tempArray[x];
        const lm = this.moistureArray[x];0
        var today = new Date();
        const stream: Stream = {temperature: lt, moisture: lm, food: "", foodamount: "", timestamp: today.toISOString()};

        //this.bins[x].tempstream = this.bins[x].tempstream + ", " + lt;
        //this.bins[x].moisturestream = this.bins[x].moisturestream = " ," + lm;

        var newX = x + 1;
        const binN = "Bin " + newX.toString();
        console.log(binN);

        this.http
          .post(environment.apiUrl + "/posts/" + binN, stream)
          .subscribe(response => {
            console.log(response);
          })
      }
    }

  }

  updateBinInfo(startDate: string, endDate: string) {

  }

  deleteBin() {

    var lastBin = "Bin " + this.bins.length.toString();

    console.log(lastBin);

    this.http.delete(environment.apiUrl + '/posts/' + lastBin)
    .subscribe(() => {
      console.log('Deleted!');
      this.bins.pop();
      this.binsUpdated.next([...this.bins]);

      this.startArray.pop();
      this.tempArray.pop();
      this.moistureArray.pop();
      this.timeStampArray.pop();
      this.dataPushBools.pop();
      this.prevTimeStampArray.pop();
    })

    //console.log(this.bins);
  }

  getBinUpdateListener() {
    return this.binsUpdated.asObservable();
  }

  getBins() {
    // if (!this.isAuthenticated) {
    //   console.log("Not Authenticated");
    //   return;
    // }
    //console.log(this.isAuthenticated);

    //Check here to after getting bins, to connect to mqtt server

    this.http.get<{message: string, bins: Bin[]}>(environment.apiUrl + '/posts')
      .subscribe((binData) => {
        if (binData.bins == undefined) {
          return;
        }
        console.log(binData.bins);
        this.bins = binData.bins;
        this.binsUpdated.next([...this.bins]);

        for (var x = 0; x < this.bins.length; x++) {
          this.tempArray.push("0");
          this.moistureArray.push("0");
          this.startArray.push("0");
          this.timeStampArray.push("0");
          this.dataPushBools.push("0");
          this.prevTimeStampArray.push("0");
        }


        //Use this area to connect to mqtt services

        this.getMaxMin(0);
        this.getSort("lh");
        const source = interval(10000); //Loop every 10 seconds
        this.sub = source.subscribe(val => this.startTimer());
      });
  }

  startTimer() {
    //console.log(this.tempArray, this.moistureArray, this.timeStampArray, this.daysLeftArray);
    //console.log(this.tempArray, this.tempArray.length);
    // console.log(this.isAuthenticated);


    if (!this.mqttConnection) {
      this.connectToMqtt();
    }

    for (var x = 0; x < this.bins.length; x++) {

      this.bins[x].temp = this.tempArray[x];
      this.bins[x].moisture = this.moistureArray[x];
      this.bins[x].timestamp = this.timeStampArray[x];
      //Check to see if previous timestamp is equal to newest timestamp
        //If they are the same - data stream has stopped - emit error

      if (this.bins[x].dayStart == null) {
        //checking to see if bin start bool as been checked
        this.bins[x].daysleft = "Not Started"
      } else {
        var sd = moment();
        var ed = moment(this.bins[x].dayEnd);
        var d = ed.diff(sd, 'days').toString();
        //console.log("Days Left: " + d);
        if (parseInt(d) == 0) {
          //console.log("Finished Bin");
          this.bins[x].daysleft = "Finished Bin";
        } else {
          this.bins[x].daysleft = d + " Days";
        }
      }

      var lt = parseInt(this.bins[x].temp);
      var lm = parseInt(this.bins[x].moisture);

      var mmax = parseInt(this.maxM);
      var mmin = parseInt(this.minM);

      var tmax = parseInt(this.maxT);
      var tmin = parseInt(this.minT);

      var errName = [];

      if (lt > tmax) {
        //Temp too high
        errName.push("High T");
      } else if (lt < tmin) {
        //temp too low
        errName.push("Low T");
      }

      if (lm > mmax) {
        //Moisture too high
        errName.push("High M")
      } else if (lm < mmin) {
        //Moisture too low
        errName.push("Low M");
      }

      //Checking to see if current timestamp is the same as previous timestamp (shouldn't happen)
      //If it does, push error and flag to stop data logging

      if (this.bins[x].timestamp == this.prevTimeStampArray[x]) {
        var ct = parseInt(this.dataPushBools[x]) + 1;
        this.dataPushBools[x] = ct.toString();
        //console.log("Number of Same Time Count: " + ct.toString());
        if (ct > 25) {
          console.log("Timer Error - Times Have Matched for Too Long");
          errName.push("Time Error");
        }
      } else {
        this.dataPushBools[x] = "0";
        //console.log("Update Ct Reset to 0");
      }

      //console.log(errName);

      if (errName.length > 0) {
        var mcheck = false;
        var tcheck = false;
        var timecheck = false;
        for (var z = 0; z < errName.length; z++) {

          if (errName[z].includes("M")) {
            mcheck = true;
          }
          if (errName[z].includes("T")) {
            tcheck = true;
          }
          if (errName[z].includes("Time")) {
            timecheck = true;
          }
        }

        var errorString = "";

        if (timecheck) {
          //Come up with a way to only save this once
          this.bins[x].status = "purple";
          errorString = "Time Mismatch: " + moment().toString();

        } else if (mcheck && tcheck) {
          this.bins[x].status = "red";
          errorString = "Temperature and Moisture Error: " + moment().toString();
          this.saveBool = false;
        } else if (mcheck && !tcheck) {
          this.bins[x].status = "cyan";
          errorString = "Moisture Error: " + moment().toString();
          this.saveBool = false;
        } else if (!mcheck && tcheck) {
          this.bins[x].status = "red-orange";
          errorString = "Temperature Error: " + moment().toString();
          this.saveBool = false;
        }

        var binN = "Bin " + (x + 1).toString();

        const error: Error = {errorstring: errorString};

        if (!this.saveBool) {
          this.http
          .post(environment.apiUrl + "/error/" + binN, error)
          .subscribe(response => {
            console.log(response);
          });
        }

        if (timecheck) {
          this.saveBool = true;
        }


      } else {
        this.bins[x].status = "green";
      }

      //Saving existing timestamp to a previous time stamp array to compare to next incoming timestamp
      this.prevTimeStampArray[x] = this.bins[x].timestamp;

    }

    this.loopCounter = this.loopCounter + 1;

    //console.log(this.loopCounter);
    //loopCounter == 360 is 360 * 10 = 3600 seconds = 1 hour
    if (this.loopCounter == 360) {
      this.streamData();
      this.loopCounter = 0;
    }
  }

  getSort(sortType) {
    console.log("Sorting Low to High");
    if (sortType == "hl") {
      //sort high to low
      this.bins.sort(function(a, b) {
        return parseInt(b.id) - parseInt(a.id);
      })
    } else if (sortType == "lh") {
      //sort low to high
      this.bins.sort(function(a, b) {
        return parseInt(a.id) - parseInt(b.id);
      })
      //console.log(this.bins);
    }

    this.binsUpdated.next([...this.bins]);

  }

  getBinQty() {
    return this.bins.length;
  }

  updateData(binData: string, sensorData: string) {

      if (binData.includes("pi")) {
        //do nothing with pi modules for now
        return;
      }

      //"sensors/esp1"
      var espNum = parseInt(binData.substring(binData.length - 1, binData.length));
      var startNum = (espNum * 4) - 4;
      var endNum = espNum * 4;
      var obj = JSON.parse(sensorData);

      //console.log(binData, espNum, sensorData);

      var lx = 1;

      //Check bool for sorting function
      if (true) {
        //sorting is flipped
      }

      for (var x = startNum; x < endNum; x++) {

        var lti = 0;
        var lmi = 0;

        if (lx == 1) {
          lti = obj.t1;
          lmi = obj.m1;
        } else if (lx == 2) {
          lti = obj.t2;
          lmi = obj.m2;
        } else if (lx == 3) {
          lti = obj.t3;
          lmi = obj.m3;
        } else if (lx == 4) {
          lti = obj.t4;
          lmi = obj.m4;
        }

        lti = lti * (9 / 5) + 32;

        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+ " " +today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();;


        this.tempArray[x] = lti.toFixed(2).toString();
        this.moistureArray[x] = lmi.toFixed(2).toString();
        this.timeStampArray[x] = date;

        lx = lx + 1;
      }

      //console.log(this.tempArray, this.moistureArray);
  }

  updateMaxMin(minT: string, maxT: string, minM: string, maxM: string) {
    const limit: Limit = {tempmin: minT, tempmax: maxT, moisturemin: minM, moisturemax: maxM};
    this.http
      .put(environment.apiUrl + "/limits", limit)
      .subscribe(response => {
        console.log(response);
        this.minT = minT;
        this.maxT = maxT;
        this.minM = minM;
        this.maxM = maxM;
      })
  }

  getFoodInfo() {
    console.log("Getting Food Data");
    const dialogRef = this.dialog.open(BinFoodComponent, {
      data: this.bins //{binInfo: this.bins}
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      // console.log(result);
      //this.updateMaxMin(result.minTemp, result.maxTemp, result.minMoisture, result.maxMoisture);
    })
  }

  getTimeInfo() {

    //console.log(this.bins);

    const dialogRef = this.dialog.open(BinTimeComponent, {
      data: this.bins //{binInfo: this.bins}
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      // console.log(result);
      //this.updateMaxMin(result.minTemp, result.maxTemp, result.minMoisture, result.maxMoisture);
    })
  }

  getMaxMin(pathWay) {
    this.http.get<{message: string, limits: Limit[]}>(environment.apiUrl + '/limits')
      .subscribe((limitData) => {
        console.log(limitData);
        var maxmins = limitData.limits[0];

        if (pathWay == 0) {
          //This path is for initializing
          this.minT = maxmins.tempmin;
          this.maxT = maxmins.tempmax;
          this.minM = maxmins.moisturemin;
          this.maxM = maxmins.moisturemax;

        } else {
          const dialogRef = this.dialog.open(BinMaxMinComponent, {
            data: {minTemp: maxmins.tempmin, maxTemp: maxmins.tempmax, minMoisture: maxmins.moisturemin, maxMoisture: maxmins.moisturemax}
          });
          dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            if (result != null) {
              this.updateMaxMin(result.minTemp, result.maxTemp, result.minMoisture, result.maxMoisture);
            }
          })
        }
      });
  }
}
