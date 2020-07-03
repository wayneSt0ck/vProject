import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from 'rxjs'

import { Bin } from '../bin.model';
import { BinsService } from '../bin.service';

@Component({
  selector: "app-bin-show",
  templateUrl: "./bin-show.component.html",
  styleUrls: ["./bin-show.component.css"]
})
export class BinListComponent implements OnInit, OnDestroy {

  // bins: Bin[] = [
  //   {id: "test1", title: "Bin 1", status: "T1", temp: "75F", moisture: "49%", timestamp: "12:44:12 April 16", daysleft: "10"},
  //   {id: "test2", title: "Bin 2", status: "T2", temp: "75F", moisture: "49%", timestamp: "12:44:12 April 16", daysleft: "10"},
  //   {id: "test3", title: "Bin 3", status: "T3", temp: "75F", moisture: "49%", timestamp: "12:44:12 April 16", daysleft: "10"}
  // ];

  bins: Bin[] = [];
  private binsSub: Subscription;

  constructor(public binsService: BinsService) {}

  getBinData(bin: Bin) {
    this.binsService.showPlotWindow(bin);
  }

  ngOnInit() {
    this.binsService.getBins();
    this.binsSub = this.binsService.getBinUpdateListener().subscribe((bins: Bin[]) => {
      this.bins = bins;
    });
  }

    ngOnDestroy() {
      this.binsSub.unsubscribe();
    }
}
