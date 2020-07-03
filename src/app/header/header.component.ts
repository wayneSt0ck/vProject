import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs'
import { BinCreateComponent } from '../bins/bin-add/bin-add.component';
import { BinMaxMinComponent } from '../bins/bin-max-min/bin-max-min.component';

import { BinsService } from '../bins/bin.service';

import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../auth/auth.service';

export interface DialogData {
  totalBinCt: string;
  totalName: string;
  controllerName: string;
  currentName: string;
}

export interface MaxMinData {
  minTemp: string;
  maxTemp: string;
  minMoisture: string;
  maxMoisture: string;
}

// export interface TimeDataArray extends Array<TimeData> {}
export interface TimeData {
  binQty: string;
  timeCurrent: string;
}

interface Sort {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit, OnDestroy {

  selected = 'option1';

  constructor(public dialog: MatDialog, public binsService: BinsService, private authService: AuthService){
  };

  userIsAuthenticated = false;
  userIsAdmin = false;
  private binsSub: Subscription;
  private authListenerSubs: Subscription;

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    });

    this.userIsAdmin = this.authService.getUser();
    console.log("User: " + this.userIsAdmin);
  }

  ngOnDestroy() {
    this.binsSub.unsubscribe();
    this.authListenerSubs.unsubscribe();
  }

  openTimeTable(): void {
    this.binsService.getTimeInfo();

  }


  openFoodTable(): void {
    console.log("Calling Bin Service Food Info");
    this.binsService.getFoodInfo();
  }

  openMaxMin(): void {
    this.binsService.getMaxMin(1);
  }

  openDialog(): void {

    //var totalBins = "1";
    //var currentBin = "1";
    var controllerNum = "1";

    var totalBins = this.binsService.getBinQty();
    var currentBin = this.binsService.getBinQty() + 1;

    console.log("Current Bin Number: ");
    console.log(currentBin);

    var binMod = 0;

    binMod = Math.ceil(currentBin / 4);

    console.log(binMod);

    console.log("Testing");
    const dialogRef = this.dialog.open(BinCreateComponent, {
      data: {totalName: "0", currentName: currentBin.toString(), controllerName: binMod.toString()}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);

      if (result.totalName != "0") {
        console.log("Added");

        var cBin = currentBin;

        for (var x = 0; x < parseInt(result.totalName); x++) {
          this.binsService.addBin(cBin.toString(), "test", "test", "T", "M", "TS", "DL")
          //this.binsService.getBins();
          cBin = cBin + 1;
        }
      }

      //this.sortLH();
    });
  }

  dataTest() {
    console.log("Data Test");
    this.binsService.updateData("test", "test");
  }

  deleteLastBin() {
    this.binsService.deleteBin();
  }

  sortChanged(sortValue) {
    console.log(sortValue);
    if (sortValue == "option1") {
      console.log("Sorting Low to High");
      this.binsService.getSort("lh");
    } else if (sortValue == "option2") {
      console.log("Sorting High to Low");
      this.binsService.getSort("hl");
    }
  }

  openBinHistory() {
    this.binsService.openHistory();
  }

  login() {
    // this.oktaAuth.loginRedirect('/profile');
  }

  onLogout() {
    this.authService.logout();
  }

  pushTest() {
    //this.binsService.testData();
    console.log(this.authService.getUser());

  }
}
