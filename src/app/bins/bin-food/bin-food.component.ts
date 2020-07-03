import { Component, OnInit, Inject, Input} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

import { environment } from "../../../environments/environment";

import * as moment from 'moment/moment';
// import { TimeDataArray } from 'src/app/header/header.component';
// import { BinsService } from '../bin.service';

export interface FoodTable {
  date: string;
  ftype: string;
  famount: string;
}

export interface DateData {
  startDate: string;
  endDate: string;
}

interface Food {
  value: string;
  viewValue: string;
}

export interface FoodData {
  foodIndex: string;
  foodAmount: string;
  foodType: string;
}


interface localBin {
  value: string;
  viewValue: string;
}

const ELEMENT_DATA: FoodTable[] = [
  {date: '05/05/20', ftype: 'Compost', famount: '25 lbs'},
];


@Component({
  selector: "app-bin-food",
  templateUrl: "./bin-food.component.html",
  styleUrls: ["./bin-food.component.css"]
})
export class BinFoodComponent implements OnInit {

  selectedBins: string[];
  chosenFood: string;
  chosenFoodAmount: string;

  last: 4;


  public today = new Date();
  public tdate = this.today.toISOString();

  foods: Food[] = [
    {value: 'f1', viewValue: 'Compost'},
    {value: 'f2', viewValue: 'Nutrients'},
    {value: 'f3', viewValue: 'Other'}
  ];

  listOfBins: string[] = [];
  displayedColumns: string[] = ['date', 'ftype', 'famount'];
  dataSource = ELEMENT_DATA;
  public date;

  binIds = [];

  isDisabled = true;

  @Input() timeInfo: {currentDate: string};

  constructor(public dialogRef: MatDialogRef<BinFoodComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private _snackBar: MatSnackBar, private http: HttpClient) {

    }

  ngOnInit() {
    //console.log(this.data);
    this.dataSource = [];
    this.chosenFoodAmount = "0";

    //this.tdate = moment().format("MM/DD/YYYY");

    this.last = this.data.length;

    for (var x = 0; x < this.data.length; x++) {
      this.listOfBins.push(this.data[x].title);
    }
  }

  updateGlobalData(ob: any) {
    //console.log(ob.value);
    let t = moment(ob.value);
    let ut = t.utc();
    //console.log(ut.format());
    this.tdate = ut.format();
  }

  saveFoodData() {
    console.log("Saved Food Data");

    //this.tdate = this.today.format("MM/DD/YYYY");

    let foundIndex = 0;

    //console.log(this.selectedBins, this.chosenFood, this.chosenFoodAmount, moment(this.tdate));


    if (moment(this.tdate) > moment()) {
      //Date chosen is greater than todays today
      this.openSnackBar("Error - Date Must Be <= Today's Date", "Close");
      return;
    }

    if (this.selectedBins == undefined) {
      this.openSnackBar("Error - Please Select Atleast 1 Bin", "Close");
      return;
    }

    if (this.chosenFood == undefined) {
      this.openSnackBar("Error - Please Select Food Type", "Close");
      return;
    }

    if (this.chosenFoodAmount == "0") {
      this.openSnackBar("Error - Food Amount Must Be More Than 0", "Close");
      return;
    }


    //I need to save value in bin array (this.data[x] based on bins selected)
    //I need to take that dai dte index number and save to that index in mongodb
    for (var x = 0; x < this.selectedBins.length; x++) {

      for (var y = 0; y < this.data.length; y++) {
        if (this.data[y].title == this.selectedBins[x]) {
          //Do all fun stuff here
          for (var z = 0; z < this.data[y].timestream.length; z++) {
            var ld1 = moment(this.data[y].timestream[z]);
            var ld2 = moment(this.tdate);

            var startDate = moment(this.data[y].dayStart);

            var dateSub = ld1.diff(ld2, 'days'); //Date diff between today's date and chosen date
            var dateSub2 = ld2.diff(startDate, 'days'); //Date diff between bin start date and chosen date

            //console.log(dateSub, dateSub2);
            //console.log(ld1, ld2, this.selectedBins[x], dateSub);
            if (dateSub2 < -1) {
              this.openSnackBar("Error - Date Chosen Needs to Be After Bin Start Date", "Close");
              return;
            }

            if (this.data[y].daysleft == "Not Started") {
              this.openSnackBar("Error - Bin Not Started Yet", "Close");
              return;
            }

            if (dateSub == 0) {
              foundIndex = z;
              //found the index value
              // console.log(this.data[y].foodstream[])
              // if (this.data[y].foodstream[foundIndex] != "") {
              //   this.openSnackBar("Error - Data Already Found for This Date - Not Saving: " + this.selectedBins[x], "Close");
              //   return;
              // }

              console.log("Found index at " + foundIndex.toString());
              this.data[y].foodstream[foundIndex] = this.chosenFood;
              this.data[y].foodamountstream[foundIndex] = this.chosenFoodAmount;

              //Use this space to also update mongoDB table with index
              const foodStuff: FoodData = {foodIndex: foundIndex.toString(), foodAmount: this.chosenFoodAmount, foodType: this.chosenFood};

              this.http
                .post(environment.apiUrl + "/food/" + this.selectedBins[x], foodStuff)
                .subscribe(response => {
                  console.log(response);
                });
              break;
            }
          }
          break;
        }
      }
    }

    var lStatus = "Saved Food Data";

    this.openSnackBar(lStatus, "Close")

    //this.dialogRef.close();
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

  getBinFeedHistory(ob: any) {

    this.dataSource = [];

    var binName = ob.value;
    console.log(binName);

    for (var x = 0; x < this.data.length; x++) {
      if (this.data[x].title == binName) {
        //console.log(this.data[x].foodstream, this.data[x].foodamountstream, this.data[x].timestream);
        for (var y = 0; y < this.data[x].foodstream.length; y++) {
          if (this.data[x].foodstream[y] != "") {
            if (this.data[x].foodstream[y].toString().includes("00")) {
              //do nothing
              //console.log(this.data[x].foodstream[y].toString());
              //break;
            } else {
              var ld = this.data[x].timestream[y];
              var jd = ld.substring(0, 10);
              this.dataSource.push({
                date: jd,
                ftype: this.data[x].foodstream[y],
                famount: this.data[x].foodamountstream[y]
              });
            }
          }
        }
      }
    }
  }

  closeFoodPop() {
    this.dialogRef.close();
  }


}
