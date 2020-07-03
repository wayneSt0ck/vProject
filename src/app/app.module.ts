import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { AppComponent } from './app.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { HeaderComponent } from './header/header.component';
import { PostListComponent } from './posts/post-list/post-list.component';
import { AppRoutingModule } from './app.routing.module';
import { Routes, RouterModule } from '@angular/router';

import { BinCreateComponent } from './bins/bin-add/bin-add.component';
import { BinListComponent } from './bins/bin-show/bin-show.component';
import { BinMaxMinComponent } from './bins/bin-max-min/bin-max-min.component';
import { BinTimeComponent } from './bins/bin-time/bin-time.component';
import { BinFoodComponent } from './bins/bin-food/bin-food.component';
import { BinPlotComponent } from './bins/bin-plot/bin-plot.component';
import { BinHistoryComponent } from './bins/bin-history/bin-history.component';

import { LoginComponent } from './auth/login/login.component';

import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { Ng5SliderModule } from 'ng5-slider';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';

import { MqttModule, IMqttServiceOptions } from "ngx-mqtt";
import { Observable } from 'rxjs';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthInterceptor } from './auth/auth-interceptor';

import { NgxChartsModule } from '@swimlane/ngx-charts';

import { ComboChartComponent, ComboSeriesVerticalComponent } from './bins/bin-plot/combo-chart';



export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: 'postman.cloudmqtt.com',
  port: 37562,
  protocol: 'wss',
  path: '/mqtt'
}

@NgModule({
  declarations: [
    AppComponent,
    PostCreateComponent,
    HeaderComponent,
    PostListComponent,
    BinCreateComponent,
    BinListComponent,
    BinMaxMinComponent,
    BinTimeComponent,
    BinHistoryComponent,
    BinFoodComponent,
    BinPlotComponent,
    LoginComponent,
    SignupComponent,
    ComboChartComponent,
    ComboSeriesVerticalComponent
  ],
  imports: [
    // OktaAuthModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    MatTabsModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatListModule,
    MatDialogModule,
    MatCheckboxModule,
    RoundProgressModule,
    Ng5SliderModule,
    MatSliderModule,
    MatSelectModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatSnackBarModule,
    NgxChartsModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS)

  ],
  entryComponents: [
    BinCreateComponent,
    BinMaxMinComponent,
    BinTimeComponent,
    BinFoodComponent,
    BinPlotComponent,
    BinHistoryComponent
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


