import { Component, OnInit, Inject, Input} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'src/app/header/header.component';


@Component({
  selector: "app-bin-add",
  templateUrl: "./bin-add.component.html",
  styleUrls: ["./bin-add.component.css"]
})
export class BinCreateComponent implements OnInit {

  //binTotal = "3";
  //nextBin = "4";
  //calcESP = "1";
  tempCheck = true;
  moistureCheck = true;
  dbCheck = true;

  @Input() newBin: {binNum: string, espNum: string, trackT: string, trackM: string, dbSetup: string};

  constructor(public dialogRef: MatDialogRef<BinCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {

    }

  ngOnInit() {

  }

  addBin() {
    this.dialogRef.close(this.data);
  }

  cancelBin() {
    this.dialogRef.close(this.data);
  }

}



