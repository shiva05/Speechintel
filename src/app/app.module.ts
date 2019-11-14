import { BrowserModule} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, enableProdMode} from '@angular/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { Ng2OrderModule } from 'ng2-order-pipe';
import { Ng5SliderModule } from 'ng5-slider';
import { RoundProgressModule } from 'angular-svg-round-progressbar';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { TokenInterceptor } from './shared/token.interceptor';
import { Ng2FileSizeModule } from 'ng2-file-size';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { SearchComponent } from './components/search/search.component';
import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { UserDetailsComponent } from './components/side-nav/user-details/user-details.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

//components
import { ProfileComponent } from './components/profile/profile.component';
import { CustomerSatisfactionComponent } from './components/customer-satisfaction/customer-satisfaction.component';
import { RedAlertsComponent } from './components/red-alerts/red-alerts.component';
import {ProfileInfoComponent} from './components/profile/profile-information/profile-info.component';
import {CompanyInfoComponent} from './components/profile/company-info/company-info.component';
import {PḥotoUploadComponent} from './components/profile/photo-upload/photo-upload.component';
import {StoreModule} from '@ngrx/store';
import { setDataReducer} from '../app.reducer';
import { CallIngestionComponent } from './components/call-ingestion/call-ingestion.component';
import { CallTranscriptsComponent } from './components/call-transcripts/call-transcripts.component';
import { AgentPerformanceComponent } from './components/agent-performance/agent-performance.component';
import {SpinnerComponent} from './shared/spinner/spinner.component';
import {SelectlistComponent} from './components/call-recordings/selectlist/selectlist.component';
import {CallRecordingsComponent} from './components/call-recordings/call-recording.component';
import {NotFoundComponent} from './components/not-found/not-found.component';
import {ChartComponent} from './components/call-transcripts/chart/chart.component';
import {SideBarComponent} from './components/call-transcripts/side-bar/side-bar.component';
import { TranscriptionTextComponent } from './components/call-transcripts/transcription-text/transcription-text.component';
import { TranscriptionComponent } from './components/call-transcripts/transcription/transcription.component';
import { AudioFileComponent } from './components/audio-file/audio-file.component';

//services
import { AuthorizationService} from '../app/shared/authorization.service';
import { AuthGuardService } from './shared/auth-guard.service';
import {ProfileService} from './components/profile/shared/profile.service';
import {DataService} from './shared/data.service';
import {LambdaTriggerService} from './shared/lambda-trigger.service';
import {PreventLogInService} from './shared/prevent-log-in.service';
import {UploadService} from './shared/upload.service';
import {TranscriptionTimetrackerService} from './shared/transcription-timetracker-service';
import {SessionService} from './shared/session.service';
import {RoleGuardService} from './shared/roleGuard.service';
import {TranscriptService} from './components/call-transcripts/shared/transcript.service';
import { FileInfoService } from './components/call-recordings/shared/file-info.service';
import { QuestionnairService } from './components/settings/shared/questionnair.service';
import { AgentPerformanceService } from './components/agent-performance/shared/agent-performance.service';
import { RedAlertService } from './components/red-alerts/shared/red-alert.service';
import { CustomerSatisfactionService } from './components/customer-satisfaction/shared/customer-satisfaction.service';
import { AudioFileService } from './components/audio-file/shared/audio-file.service';
import { FilterDropdownService } from './components/filter-dropdown/shared/filter-dropdown.service';
import { SideNavService } from './components/side-nav/side-nav.service';
import { DisputeCallsService } from './components/dispute-calls/shared/dispute-calls.service';
//sort and serch pipe
import {SortPipe} from './components/call-recordings/shared/filter/sort.pipe';
import {SearchPipe} from './components/call-recordings/shared/filter/search.pipe';
import {FileDropModule} from 'ngx-file-drop';
import { RightClickDirective } from './components/call-transcripts/transcription/rightClick.directive';
import { SettingsComponent } from './components/settings/settings.component';
import { QuestionaryComponent } from './components/settings/questionary/questionary.component';
import { DatefilterComponent } from './components/datefilter/datefilter.component';
import { UploadDatefilterComponent } from './components/uploadDateFilter/uploadDateFilter.component';
import { SortByDatePipe } from './shared/pipe/sort-by-date.pipe';
import { AgentPerformanceReportComponent } from './components/agent-performance-report/agent-performance-report.component';
import { Report1Component } from './components/report1/report1.component';
import { Report2Component } from './components/report2/report2.component';
import { Report3Component } from './components/report3/report3.component';
import { Report4Component } from './components/report4/report4.component';
import { ViewTranscriptComponent } from './components/call-transcripts/view-transcript/view-transcript.component';
import { ViewTranscriptTextComponent } from './components/call-transcripts/view-transcript-text/view-transcript-text.component';
import { ViewTranscriptDataComponent } from './components/call-transcripts/view-transcript-data/view-transcript-data.component';
import { Report5Component } from './components/report5/report5.component';
import { DashboardMainComponent } from './components/dashboard-main/dashboard-main.component';
import { FilterDropdownComponent } from './components/filter-dropdown/filter-dropdown.component';
import { LiveAudioComponent } from './components/live-audio/live-audio.component';
import { DisputeCallsComponent } from './components/dispute-calls/dispute-calls.component';


enableProdMode();
 const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
export function gettoken() {
  return localStorage.getItem('token');
};

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    DashboardComponent,
    ProfileComponent,
    HeaderComponent,
    SideNavComponent,
    FooterComponent,
    SearchComponent,
    UserDetailsComponent,
    CustomerSatisfactionComponent,
    RedAlertsComponent,
    ProfileInfoComponent,
    CompanyInfoComponent,
    PḥotoUploadComponent,
    CallIngestionComponent,
    CallTranscriptsComponent,
    AgentPerformanceComponent,
    SpinnerComponent,
    NotFoundComponent,
    SortPipe,
    SearchPipe,
    SelectlistComponent,
    ChartComponent,
    SideBarComponent,
    CallRecordingsComponent,
    SpinnerComponent,
    TranscriptionTextComponent,
    TranscriptionComponent,
    RightClickDirective,
    SettingsComponent,
    QuestionaryComponent,
    DatefilterComponent,
    UploadDatefilterComponent,
    SortByDatePipe,
    AgentPerformanceReportComponent,
    Report1Component,
    Report2Component,
    Report3Component,
    Report4Component,
    ViewTranscriptComponent,
    ViewTranscriptTextComponent,
    ViewTranscriptDataComponent,
    Report5Component,
    AudioFileComponent,
    DashboardMainComponent,
    FilterDropdownComponent,
    LiveAudioComponent,
    DisputeCallsComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    Ng2FileSizeModule,
    FileDropModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    PerfectScrollbarModule,
    Ng2OrderModule,
    Ng5SliderModule,
    ToastModule.forRoot(),
    RoundProgressModule,
    NgbModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    StoreModule.forRoot({ setData: setDataReducer}),
    JwtModule.forRoot({
      config: {
        tokenGetter: gettoken,
        whitelistedDomains: ['localhost:4200', 'https://d3codgzuy94wwm.cloudfront.net', 'https://d1542gx2ogz2qv.cloudfront.net']
      }
    }),
  ],
  providers: [AuthorizationService, { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }, {
    provide: PERFECT_SCROLLBAR_CONFIG,
    useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
  },  AuthGuardService,
    ProfileService,
    DataService,
    LambdaTriggerService,
    RoleGuardService,
    PreventLogInService,
    SessionService,
    TranscriptionTimetrackerService,
    UploadService,
    FileInfoService,
    TranscriptService,
    QuestionnairService,
    AgentPerformanceService,
    RedAlertService,
    CustomerSatisfactionService,
    AudioFileService,
    SideNavService,
    FilterDropdownService,
    DisputeCallsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
