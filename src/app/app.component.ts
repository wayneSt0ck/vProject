import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { Bin } from './bins/bin.model';
import { BinsService } from './bins/bin.service';
import { AuthService } from './auth/auth.service';
import { HttpClient } from '@angular/common/http';

export interface Mqtt {
  username: string;
  password: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  public message: string;
  private espTopic: string;

  title = 'okta-app';
  isAuthenticated: boolean;

  topicname: any;
  msg: any;
  isConnected: boolean = false;

  constructor(private _mqttService: MqttService, public binsService: BinsService, private authService: AuthService, private http: HttpClient) {

    // this.http.get<{message: string, mqtt: Mqtt[]}>('http://localhost:3000/api/mqtt')
    //   .subscribe((mqttData) => {
    //     console.log(mqttData.mqtt[0].username, mqttData.mqtt[0].password);
    //   });

    //_mqttService.connect({username: 'gajzxcyc', password: 'CzrpNiG1yMvC'});

  }

  public unsafePublish(topic: string, message: string): void {
    this._mqttService.unsafePublish(topic, message, {qos: 1, retain: true});
  }

  async ngOnInit() {

    this.authService.autoAuthUser();
    //console.log("Got Here 1");

    this.binsService.connectToMqtt();

    // this.http.get<{message: string, mqtt: Mqtt[]}>('http://localhost:3000/api/mqtt')
    //   .subscribe((mqttData) => {

    //     console.log(mqttData.mqtt[0].username, mqttData.mqtt[0].password);

    //     try {
    //       this._mqttService.connect({username: mqttData.mqtt[0].username, password: mqttData.mqtt[0].password});

    //       this.subscription = this._mqttService.observe("sensors/#").subscribe((message: IMqttMessage) => {
    //         //console.log(message.topic);
    //         this.message = message.payload.toString();
    //         this.espTopic = message.topic;
    //         //var obj = JSON.parse(this.message);
    //         //console.log(obj.t1, obj.t2);
    //         this.binsService.updateData(this.espTopic, this.message);
    //       });
    //     }
    //     catch (error) {
    //       console.log(error);
    //     }
    //   });
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}

