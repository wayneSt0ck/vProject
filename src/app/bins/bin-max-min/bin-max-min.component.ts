import { Component, OnInit, Inject, Input} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaxMinData } from 'src/app/header/header.component';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: "app-bin-max-min",
  templateUrl: "./bin-max-min.component.html",
  styleUrls: ["./bin-max-min.component.css"]
})
export class BinMaxMinComponent implements OnInit {

  autoTicks = false;
  disabled = false;
  invert = false;
  max = 100;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = true;
  value = 0;
  vertical = false;

  @Input() newBin: {minTemp: string, maxTemp: string, minMoisture: string, maxMoisture: string};

  constructor(public dialogRef: MatDialogRef<BinMaxMinComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MaxMinData, private _snackBar: MatSnackBar) {

    }

  ngOnInit() {

  }

  updateMaxMin() {
    this.openSnackBar("Max/Min Data Updated", "Close");
    //return;
    this.dialogRef.close(this.data);
  }

  cancelMaxMin() {
    this.dialogRef.close(this.data);
  }

  openSnackBar(message: string, action: string) {
    var classType = "";
    console.log(message);
    if (message.includes("Error")) {
      classType = 'red-snackbar';
    } else if (message.includes("Updated")) {
      classType = 'green-snackbar';
    }
    this._snackBar.open(message, action, {
      duration: 4000,
      panelClass: [classType]
    });
  }

}



